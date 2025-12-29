from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
import shutil
import uuid
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage

# --- SECURITY: Presidio Imports ---
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

# Import Engines
from auditor import GitHubAuditor
from graph import app_graph
from resume_parser import analyze_resume
from database import db_manager  # <--- NEW IMPORT (Memory)

load_dotenv()

app = FastAPI(title="CareerForge API", version="1.0.0 Beta")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Security Engines
# (Ensure you have run: python -m spacy download en_core_web_lg)
try:
    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine()
    SECURITY_ACTIVE = True
except Exception as e:
    print(f"Security Warning: Presidio not loaded ({e}). PII redaction disabled.")
    SECURITY_ACTIVE = False

auditor_agent = GitHubAuditor()

# --- Data Models ---
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]]
    topic: str = "General Engineering"
    difficulty: int = 50
    session_id: str = None # Optional: Client can send a session ID

# --- Helper Functions ---
def sanitize_input(text: str) -> str:
    """
    PII FIREWALL: Redacts sensitive data.
    """
    if not SECURITY_ACTIVE:
        return text
        
    try:
        results = analyzer.analyze(
            text=text,
            entities=["EMAIL_ADDRESS", "PHONE_NUMBER", "IP_ADDRESS", "US_SSN"],
            language="en"
        )
        
        anonymized_result = anonymizer.anonymize(
            text=text,
            analyzer_results=results
        )
        return anonymized_result.text
    except Exception as e:
        print(f"PII Redaction Error: {e}")
        return text

# --- Routes ---

@app.get("/")
async def health_check():
    return {
        "status": "active", 
        "system": "CareerForge PI Engine", 
        "features": {
            "security": SECURITY_ACTIVE,
            "memory": db_manager.enabled
        }
    }

@app.get("/api/audit/{username}")
async def audit_user(username: str):
    print(f"Auditing user: {username}...")
    result = auditor_agent.calculate_trust_score(username)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@app.post("/api/interview/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Setup Session ID
        session_id = request.session_id or str(uuid.uuid4())

        # 2. Sanitize Input (Security Layer)
        clean_message = sanitize_input(request.message)

        # 3. Prepare Graph State
        lc_messages = []
        for msg in request.history:
            if msg["role"] == "user":
                lc_messages.append(HumanMessage(content=msg["content"]))
            else:
                lc_messages.append(AIMessage(content=msg["content"]))
        
        lc_messages.append(HumanMessage(content=clean_message))

        initial_state = {
            "messages": lc_messages,
            "topic": request.topic,
            "difficulty_level": request.difficulty,
            "shadow_critique": "",
            "step_count": 0
        }

        # 4. Execute Logic (Auditor -> Sandbox -> Interviewer)
        result = app_graph.invoke(initial_state)
        
        ai_response = result["messages"][-1].content
        critique = result.get("shadow_critique", "None")

        # 5. Persist to Digital Twin (Memory Layer)
        # We log the *Clean* message to protect the DB too.
        db_manager.log_interaction(
            session_id=session_id,
            topic=request.topic,
            user_input=clean_message,
            ai_response=ai_response,
            critique=critique
        )
        
        return {
            "reply": ai_response,
            "critique": critique,
            "session_id": session_id,
            "sanitized_message": clean_message
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # Uses the new OCR-hardened parser
        analysis = analyze_resume(file_location)
        
        os.remove(file_location)
        
        return {"filename": file.filename, "analysis": analysis}
        
    except Exception as e:
        print(f"Resume Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)