# backend/kanban.py

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from database import db_manager
import os
from dotenv import load_dotenv

# --- AGENTIC IMPORTS ---
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

# Initialize the "Career Coach" Agent
try:
    llm = ChatGroq(
        temperature=0.4, 
        model_name="llama-3.3-70b-versatile",
        groq_api_key=os.getenv("GROQ_API_KEY")
    )
    AGENT_ACTIVE = True
except:
    AGENT_ACTIVE = False
    print("Kanban Agent Offline: Check GROQ_API_KEY")

# --- DATA MODELS ---

class Application(BaseModel):
    role_title: str
    company_name: str
    status: str = "Wishlist" # Wishlist, Applied, Interview, Offer, Rejected
    salary_range: Optional[str] = "Unknown"
    notes: Optional[str] = ""

class RejectionAnalysis(BaseModel):
    role_title: str
    company: str
    likely_reason: str = Field(..., description="The AI's best guess on why they rejected you.")
    recovery_plan: str = Field(..., description="A concrete project or topic to learn next.")
    phoenix_task_title: str = Field(..., description="Title for a new 'Recovery' Kanban card.")

# --- CORE FUNCTIONS ---

def add_application(app: Application):
    if not db_manager.enabled:
        return {"error": "Database offline"}
    try:
        # Check if table exists/is accessible
        data = db_manager.supabase.table("applications").insert(app.dict()).execute()
        return data.data
    except Exception as e:
        return {"error": str(e)}

def get_applications():
    if not db_manager.enabled:
        return []
    try:
        data = db_manager.supabase.table("applications").select("*").execute()
        return data.data
    except Exception as e:
        # Fallback for empty DB or connection error
        print(f"Kanban Fetch Error: {e}")
        return []

def update_status(app_id: str, new_status: str):
    if not db_manager.enabled: return
    try:
        db_manager.supabase.table("applications").update({"status": new_status}).eq("id", app_id).execute()
        return {"status": "success", "new_state": new_status}
    except Exception as e:
        return {"error": str(e)}

# --- THE AGENTIC LOOP: REJECTION RECOVERY ---

def analyze_rejection(app_id: str, rejection_feedback: str = ""):
    """
    Triggered when a user gets rejected.
    1. Fetches the job details.
    2. Uses LLM to analyze the rejection (or lack thereof).
    3. Adds a 'Phoenix Task' (Recovery Card) to the board.
    """
    if not db_manager.enabled or not AGENT_ACTIVE:
        return {"error": "Services unavailable"}

    # 1. Get Context
    try:
        response = db_manager.supabase.table("applications").select("*").eq("id", app_id).execute()
        if not response.data:
            return {"error": "Application not found"}
        
        app_data = response.data[0]
        role = app_data.get("role_title", "Unknown Role")
        company = app_data.get("company_name", "Unknown Company")
        
    except Exception as e:
        return {"error": str(e)}

    # 2. The "Post-Mortem" Prompt
    prompt = (
        f"You are a Career Strategy Expert. "
        f"User applied for '{role}' at '{company}' and was REJECTED. "
        f"Rejection Context/Feedback provided: '{rejection_feedback if rejection_feedback else 'No specific feedback provided (Ghosted/Generic Email)'}'. "
        f"Task: "
        f"1. Analyze the likely reason (if generic, assume skill gap based on role difficulty). "
        f"2. Generate a 'Phoenix Task' - a specific, actionable project or study topic to ensure this doesn't happen again. "
        f"3. Keep the task title short and punchy."
    )

    structured_llm = llm.with_structured_output(RejectionAnalysis)
    
    try:
        analysis = structured_llm.invoke([SystemMessage(content=prompt)])
        
        # 3. Create the "Phoenix Task" Card
        new_task = Application(
            role_title=f"🔥 RECOVERY: {analysis.phoenix_task_title}",
            company_name="Self-Improvement",
            status="Todo", # Puts it back in the pipeline
            notes=f"Generated from rejection at {company}.\nReason: {analysis.likely_reason}\nPlan: {analysis.recovery_plan}",
            salary_range="N/A"
        )
        
        # Save to DB
        add_application(new_task)
        
        # Update original rejection notes
        original_notes = app_data.get("notes", "") or ""
        updated_notes = original_notes + f"\n\n[AI POST-MORTEM]: {analysis.likely_reason}"
        db_manager.supabase.table("applications").update({"notes": updated_notes}).eq("id", app_id).execute()

        return analysis.dict()
        
    except Exception as e:
        print(f"Rejection Analysis Failed: {e}")
        return {"error": str(e)}