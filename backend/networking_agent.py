# backend/networking_agent.py

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from skill_passport import get_skill_passport

load_dotenv()

# Initialize Groq (Llama 3.3 70B)
llm = ChatGroq(
    temperature=0.4, # Slightly creative but professional
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# --- DATA MODELS ---
class OutreachDraft(BaseModel):
    subject_line: str = Field(..., description="High open-rate subject line.")
    email_body: str = Field(..., description="The full email content.")
    strategy_explanation: str = Field(..., description="Why this specific angle was chosen.")

# --- THE ENGINE ---

def generate_cold_outreach(username: str, target_company: str, target_role: str = "Hiring Manager", job_context: str = ""):
    """
    Generates a 'Proof-Based' cold email.
    Instead of 'I am passionate', it says 'I have verified skills in X'.
    """
    
    # 1. Fetch Verified Proof
    try:
        passport = get_skill_passport(username)
        top_skills = passport.get("verified_skills", [])[:3] # Top 3 skills
        trust_score = passport.get("github_trust_score", 0)
        
        # If no skills, we fallback to generic mode (but still better than average)
        proof_statement = f"I recently achieved a verified Trust Score of {trust_score}/100 on CareerForge"
        if top_skills:
            proof_statement += f" and passed technical challenges in {', '.join(top_skills)}."
            
    except Exception:
        proof_statement = "I have been rigorously preparing my technical stack."

    # 2. Define the Strategy
    system_prompt = (
        f"You are a Career Agent specializing in 'Cold Outreach'. "
        f"Your Client: {username}. "
        f"Target: {target_role} at {target_company}. "
        f"Context on Job: {job_context}. "
        f"\n\n"
        f"THE STRATEGY (The 'Value-First' Approach):\n"
        f"1. DO NOT start with 'My name is...'. Start with value or a connection.\n"
        f"2. USE THE PROOF: You MUST mention the following verified stats to establish credibility: '{proof_statement}'.\n"
        f"3. CALL TO ACTION: Ask for specific advice or a brief 10-min chat, not just 'a job'.\n"
        f"4. TONE: Professional, concise (under 150 words), and confident."
    )

    # 3. Generate
    structured_llm = llm.with_structured_output(OutreachDraft)
    
    try:
        draft = structured_llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Draft a cold email to {target_company}.")
        ])
        return draft.dict()
    except Exception as e:
        return {"error": str(e)}