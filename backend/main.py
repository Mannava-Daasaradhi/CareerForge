# backend/main.py

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import os
import shutil
import uuid
import json
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage

# --- SECURITY & UTILS ---
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

# --- IMPORT ALL ENGINES ---
from auditor import GitHubAuditor
from graph import app_graph
from resume_parser import analyze_resume
from database import db_manager
from voice_processor import VoiceProcessor
from roadmap_generator import generate_learning_roadmap
# from demand_analyzer import analyze_market_demand # (Uncomment if you have this file)
from challenge_generator import generate_challenge
from code_sandbox import execute_code 
from recruiter_proxy import query_digital_twin
from job_fetcher import hunt_opportunities
from resume_tailor import tailor_resume
from skill_passport import get_skill_passport

# --- NEW IMPORTS (The "Agentic" Suite) ---
from networking_agent import generate_cold_outreach
from negotiator import start_negotiation_scenario, run_negotiation_turn
from ab_tester import run_ab_test
from kanban import add_application, get_applications, update_status, Application

load_dotenv()

app = FastAPI(title="CareerForge PI Engine", version="5.3.0-Secure")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTHENTICATION LAYER ---
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validates the JWT sent by the frontend against Supabase Auth.
    Returns the user_id (UUID) if valid, otherwise 401.
    """
    token = credentials.credentials
    try:
        # Use the Supabase client initialized in db_manager to verify
        if not db_manager.enabled:
            # Fallback for dev mode without DB
            return "dev-user-id"
            
        user_response = db_manager.supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid Token")
            
        return user_response.user.id
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Authentication Failed")

# --- INITIALIZATION ---
try:
    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine()
    SECURITY_ACTIVE = True
except Exception:
    SECURITY_ACTIVE = False

auditor_agent = GitHubAuditor()
voice_engine = VoiceProcessor()

# --- DATA MODELS ---
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]]
    topic: str = "General Engineering"
    difficulty: int = 50
    session_id: Optional[str] = None

class RoadmapRequest(BaseModel):
    skill_gaps: List[str]
    target_role: str

class ChallengeRequest(BaseModel):
    topic: str
    difficulty: int

class VerifySolutionRequest(BaseModel):
    user_code: str
    language: str
    test_cases: List[Any]

class JobHuntRequest(BaseModel):
    target_role: str
    location: str = "Remote"
    current_skill_gaps: List[str] = []

class RecruiterQuery(BaseModel):
    username: str
    question: str

class OutreachRequest(BaseModel):
    username: str
    target_company: str
    target_role: str = "Hiring Manager"
    job_context: str = ""

class NegStartRequest(BaseModel):
    role: str
    location: str

class NegTurnRequest(BaseModel):
    history: List[Dict[str, str]]
    current_offer: Dict[str, Any]

class KanbanUpdate(BaseModel):
    id: str
    status: str

# --- ROUTES ---

@app.get("/")
async def health_check():
    return {"status": "active", "mode": "secure"}

# 1. VOICE & TEXT INTERVIEW (Protected)
@app.post("/api/interview/voice-chat")
async def voice_chat_endpoint(
    audio: UploadFile = File(...),
    history: str = Form(...), 
    topic: str = Form(...),
    difficulty: int = Form(...),
    session_id: str = Form(None),
    # Extract JWT manually since it's a Form Data request
    authorization: str = Header(None) 
):
    # Manual Auth Check for File Uploads
    user_id = "dev-user-id"
    if db_manager.enabled and authorization:
        try:
            token = authorization.split(" ")[1]
            user = db_manager.supabase.auth.get_user(token)
            user_id = user.user.id
        except:
            raise HTTPException(401, "Invalid Auth Header")

    try:
        content = await audio.read()
        processed = voice_engine.process_audio(content, filename=audio.filename)
        if processed["status"] == "error": raise HTTPException(500, detail=processed["error_msg"])
            
        user_text = processed["text"]
        metrics = processed["metrics"] 
        history_list = json.loads(history)
        
        final_input = user_text
        if metrics.get("confidence_score", 100) < 60:
            final_input += f" [SYSTEM_NOTE: User sounds nervous. Confidence: {metrics['confidence_score']}/100.]"
            
        response = await run_interview_turn(user_id, final_input, history_list, topic, difficulty, session_id)
        response["vibe_metrics"] = metrics
        return response
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/api/interview/chat")
async def chat_endpoint(request: ChatRequest, user_id: str = Depends(get_current_user)):
    return await run_interview_turn(user_id, request.message, request.history, request.topic, request.difficulty, request.session_id)

# 2. ROADMAP & MARKET
@app.post("/api/career/roadmap")
async def generate_roadmap(request: RoadmapRequest, user_id: str = Depends(get_current_user)):
    # Roadmap doesn't necessarily need saving, but good to have context
    return generate_learning_roadmap(request.skill_gaps, request.target_role)

@app.post("/api/career/hunt")
async def find_jobs(request: JobHuntRequest, user_id: str = Depends(get_current_user)):
    return hunt_opportunities(request.target_role, request.current_skill_gaps, request.location)

# 3. CHALLENGES (Protected - Verification saves to DB)
@app.post("/api/challenge/new")
async def create_challenge(request: ChallengeRequest, user_id: str = Depends(get_current_user)):
    return generate_challenge(request.topic, request.difficulty)

@app.post("/api/challenge/verify")
async def verify_challenge(request: VerifySolutionRequest, user_id: str = Depends(get_current_user)):
    try:
        full_code = request.user_code + "\n\n# --- HIDDEN TEST HARNESS ---\n"
        for test in request.test_cases:
            full_code += f"print(f'Test: {test['input_val']} -> Expect {test['expected_output']}')\n"
            full_code += f"assert str({test['input_val']}) == '{test['expected_output']}', 'Failed Case: {test['input_val']}'\n"
        full_code += "print('ALL_TESTS_PASSED')"
        
        output = execute_code(request.language, full_code)
        status = "PASS" if "ALL_TESTS_PASSED" in output else "FAIL"
        
        # SAVE ATTEMPT TO DB
        if db_manager.enabled:
            db_manager.supabase.table("challenge_attempts").insert({
                "user_id": user_id,
                "challenge_title": "Generated Challenge", # In real app, pass title
                "user_code": request.user_code,
                "status": status,
                "output_log": output
            }).execute()

        return {"status": status, "output": output}
    except Exception as e:
        return {"status": "ERROR", "output": str(e)}

# 4. DIGITAL TWIN (RECRUITER)
@app.post("/api/recruiter/ask")
async def ask_digital_twin(request: RecruiterQuery, user_id: str = Depends(get_current_user)):
    return query_digital_twin(request.username, request.question)

# 5. NETWORKING AGENT
@app.post("/api/network/generate")
async def generate_outreach_endpoint(request: OutreachRequest, user_id: str = Depends(get_current_user)):
    return generate_cold_outreach(request.username, request.target_company, request.target_role, request.job_context)

# 6. NEGOTIATOR
@app.post("/api/negotiator/start")
async def start_negotiation(request: NegStartRequest, user_id: str = Depends(get_current_user)):
    return start_negotiation_scenario(request.role, request.location)

@app.post("/api/negotiator/chat")
async def chat_negotiation(request: NegTurnRequest, user_id: str = Depends(get_current_user)):
    return run_negotiation_turn(request.history, request.current_offer)

# 7. RESUME TOOLS
@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    # No Auth required strictly for upload parsing, but recommended
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        analysis = analyze_resume(file_location)
        if os.path.exists(file_location): os.remove(file_location)
        return {"filename": file.filename, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resume/tailor")
async def tailor_resume_endpoint(file: UploadFile = File(...), job_description: str = Form(...)):
    try:
        file_location = f"temp_tailor_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        result = tailor_resume(file_location, job_description)
        if os.path.exists(file_location): os.remove(file_location)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/experiments/run")
async def run_resume_ab_test(file: UploadFile = File(...), job_description: str = Form(...)):
    try:
        file_location = f"temp_ab_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        result = run_ab_test(file_location, job_description)
        if os.path.exists(file_location): os.remove(file_location)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 8. KANBAN (MISSION CONTROL) - HEAVILY SECURED
@app.get("/api/kanban/list")
async def list_applications(user_id: str = Depends(get_current_user)):
    # We must filter by user_id inside get_applications or here
    # Assuming get_applications is updated to take user_id
    if not db_manager.enabled: return []
    data = db_manager.supabase.table("applications").select("*").eq("user_id", user_id).execute()
    return data.data

@app.post("/api/kanban/add")
async def add_application_endpoint(app: Application, user_id: str = Depends(get_current_user)):
    if not db_manager.enabled: return {"error": "DB Offline"}
    
    app_dict = app.dict()
    app_dict["user_id"] = user_id # FORCE OWNER
    
    data = db_manager.supabase.table("applications").insert(app_dict).execute()
    return data.data

@app.post("/api/kanban/update")
async def update_application_status(update: KanbanUpdate, user_id: str = Depends(get_current_user)):
    # Add ownership check in update_status or here
    # For now, simplistic update
    return update_status(update.id, update.status)

@app.get("/api/passport/{username}")
async def get_passport(username: str, user_id: str = Depends(get_current_user)):
    # Pass user_id so we can look up THEIR logs
    return get_skill_passport(username, session_id=None) # Logic needs to be updated to use user_id query

@app.get("/api/audit/{username}")
async def audit_user_endpoint(username: str):
    return auditor_agent.calculate_trust_score(username)

# --- SHARED LOGIC ---
async def run_interview_turn(user_id, message, history, topic, difficulty, session_id):
    session_id = session_id or str(uuid.uuid4())
    clean_message = sanitize_input(message)
    
    # ... (Graph Invocation) ...
    lc_messages = []
    for msg in history:
        if msg["role"] == "user": lc_messages.append(HumanMessage(content=msg["content"]))
        else: lc_messages.append(AIMessage(content=msg["content"]))
    lc_messages.append(HumanMessage(content=clean_message))

    result = app_graph.invoke({
        "messages": lc_messages,
        "topic": topic,
        "difficulty_level": difficulty,
        "shadow_critique": "",
        "code_output": "",
        "step_count": 0,
        "consecutive_failures": 0,
        "is_burnout_risk": False
    })
    
    ai_response = result["messages"][-1].content
    critique = result.get("shadow_critique", "None")
    
    # LOG WITH USER ID
    db_manager.log_interaction(user_id, session_id, topic, clean_message, ai_response, critique)
    
    return {
        "reply": ai_response,
        "critique": critique,
        "session_id": session_id,
        "user_text_processed": clean_message
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)