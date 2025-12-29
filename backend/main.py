from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import os
import shutil
import uuid
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

# --- SECURITY: Presidio Imports ---
# (Handles PII Redaction)
try:
    from presidio_analyzer import AnalyzerEngine
    from presidio_anonymizer import AnonymizerEngine
    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine()
    SECURITY_ACTIVE = True
except Exception as e:
    print(f"Security Warning: Presidio not loaded ({e}). PII redaction disabled.")
    SECURITY_ACTIVE = False

# --- IMPORTS ---
from auditor import GitHubAuditor
from graph import app_graph
from resume_parser import analyze_resume
from database import db_manager
# from sentinel import analyze_persona_gap # Uncomment if you implemented Phase 1 Sentinel

load_dotenv()

app = FastAPI(title="CareerForge API", version="2.4.0 (Unified)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auditor_agent = GitHubAuditor()

# --- DATA MODELS (Unified) ---
class ChatRequest(BaseModel):
    # Core Chat
    message: str
    history: List[Dict[str, str]]
    topic: str = "General Engineering"
    difficulty: str = "Standard" # Changed to str to match "Hardcore" mode
    session_id: Optional[str] = None
    
    # New Telemetry (Cognitive Forensics)
    keystroke_velocity: float = 0.0
    paste_detected: bool = False
    time_taken_ms: int = 0

class ChatResponse(BaseModel):
    reply: str
    trust_score: int
    red_team_flag: str
    pivot_triggered: bool
    difficulty: str
    session_id: str

# In-Memory Session Storage (For Graph State Persistence)
SESSION_STORAGE = {}

# --- HELPER FUNCTIONS ---
def sanitize_input(text: str) -> str:
    """PII FIREWALL: Redacts sensitive data before processing."""
    if not SECURITY_ACTIVE: return text
    try:
        results = analyzer.analyze(
            text=text,
            entities=["EMAIL_ADDRESS", "PHONE_NUMBER", "IP_ADDRESS", "US_SSN"],
            language="en"
        )
        return anonymizer.anonymize(text=text, analyzer_results=results).text
    except Exception as e:
        print(f"PII Redaction Error: {e}")
        return text

# --- ROUTES ---

@app.get("/")
async def health_check():
    return {
        "status": "active", 
        "system": "CareerForge PI Engine", 
        "features": {
            "security_pii": SECURITY_ACTIVE,
            "memory_db": db_manager.enabled,
            "mode": "Hackathon Demo"
        }
    }

# --- 1. EXISTING: GitHub Audit ---
@app.get("/api/audit/{username}")
async def audit_user(username: str):
    print(f"Auditing user: {username}...")
    result = auditor_agent.calculate_trust_score(username)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

# --- 2. EXISTING: Resume Upload (OCR) ---
@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        analysis = analyze_resume(file_location)
        os.remove(file_location)
        
        return {"filename": file.filename, "analysis": analysis}
    except Exception as e:
        print(f"Resume Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. UPDATED: The 6-Engine Chat Loop ---
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        session_id = request.session_id or str(uuid.uuid4())
        clean_message = sanitize_input(request.message)

        # Retrieve or Initialize State
        if session_id not in SESSION_STORAGE:
            SESSION_STORAGE[session_id] = {
                "messages": [],
                "trust_score": 50,
                "difficulty_level": request.difficulty,
                "behavioral_metrics": {},
                "topic": request.topic
            }
        
        current_state = SESSION_STORAGE[session_id]

        # Update Telemetry (Engine 2)
        current_state["behavioral_metrics"] = {
            "velocity": request.keystroke_velocity,
            "paste_detected": request.paste_detected,
            "ttr": request.time_taken_ms
        }
        
        # Reconstruct History if provided (optional sync)
        if not current_state["messages"] and request.history:
             for msg in request.history:
                role_class = HumanMessage if msg["role"] == "user" else AIMessage
                current_state["messages"].append(role_class(content=msg["content"]))

        # Add New Message
        current_state["messages"].append(HumanMessage(content=clean_message))

        # EXECUTE GRAPH (Engines 1-4)
        final_state = app_graph.invoke(current_state)
        
        # Extract Results
        ai_response = final_state["messages"][-1].content
        trust_score = final_state.get("trust_score", 50)
        critique = final_state.get("shadow_critique", "None")
        
        # Save State
        SESSION_STORAGE[session_id] = final_state

        # Log to Database (Engine 5)
        if db_manager.enabled:
            db_manager.log_interaction(
                session_id=session_id,
                topic=request.topic,
                user_input=clean_message,
                ai_response=ai_response,
                critique=critique
            )
        
        return {
            "reply": ai_response,
            "trust_score": trust_score,
            "red_team_flag": final_state.get("red_team_flag", "None"),
            "pivot_triggered": final_state.get("pivot_triggered", False),
            "difficulty": final_state.get("difficulty_level", "Standard"),
            "session_id": session_id
        }

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. NEW: Digital Twin Chat (Engine 6) ---
@app.post("/twin-chat")
async def twin_chat(query: str, session_id: str):
    """
    Recruiters talk to the 'Digital Twin' of the candidate.
    Uses the verified session history as context.
    """
    state = SESSION_STORAGE.get(session_id)
    if not state:
        return {"reply": "Candidate has not completed an interview yet."}
    
    # Context Construction
    history_text = "\n".join([f"{m.type.upper()}: {m.content}" for m in state["messages"]])
    trust_score = state.get("trust_score", 50)
    
    prompt = (
        f"You are the verified Digital Twin of a candidate. Trust Score: {trust_score}.\n"
        f"TRANSCRIPT:\n{history_text}\n\n"
        f"INSTRUCTION: Answer the recruiter's question based ONLY on the transcript. "
        f"If the candidate failed a topic, admit it. Do not lie.\n"
        f"RECRUITER: {query}"
    )
    
    # Direct Inference (One-off)
    from langchain_groq import ChatGroq
    llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0)
    response = llm.invoke([SystemMessage(content=prompt)])
    
    return {"reply": response.content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)