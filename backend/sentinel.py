# FILE: backend/sentinel.py
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

# Initialize Gemini 1.5 Flash (Best for Context Analysis) [cite: 16]
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.0
)

def analyze_persona_gap(resume_text: str, linkedin_text: str) -> dict:
    """
    Engine 1: The LinkedIn Sentinel [cite: 26]
    Cross-references "What I claim" (Resume) vs "What the world says" (LinkedIn).
    """
    if not resume_text or not linkedin_text:
        return {"status": "SKIPPED", "penalty": 0, "reason": "Missing profile data"}

    system_prompt = (
        "You are the 'LinkedIn Sentinel' for CareerForge. "
        "Your goal is to detect 'Persona Gaps'—discrepancies between a candidate's Resume and their LinkedIn profile.\n\n"
        "RULES:\n"
        "1. Check for Timeline Inconsistencies (e.g., Resume says 'Senior Dev' in 2022, LinkedIn says 'Intern').\n"
        "2. Check for Skill Hallucinations (e.g., Resume lists 5 years of Rust, LinkedIn shows no Rust usage).\n"
        "3. Output strictly in this format: 'PASS' or 'FAIL: <Brief Reason>'.\n"
        "4. If FAIL, suggest a Trust Score Penalty (10-30 points)."
    )

    user_payload = f"--- RESUME ---\n{resume_text}\n\n--- LINKEDIN PROFILE ---\n{linkedin_text}"

    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_payload)
        ])
        
        content = response.content.strip()
        
        if "FAIL" in content:
            # Simple parsing for the hackathon
            return {
                "status": "FAIL", 
                "penalty": 20, 
                "reason": content.replace("FAIL:", "").strip()
            }
        
        return {"status": "PASS", "penalty": 0, "reason": "Consistent Persona"}
        
    except Exception as e:
        return {"status": "ERROR", "penalty": 0, "reason": str(e)}

def mask_pii(text: str) -> str:
    """
    Placeholder for Microsoft Presidio PII Firewall[cite: 18].
    For the hackathon, we use a simple rule-based mask or LLM-based redaction 
    if Presidio isn't installed.
    """
    # Simple email redaction for now
    import re
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.sub(email_pattern, "[REDACTED_EMAIL]", text)