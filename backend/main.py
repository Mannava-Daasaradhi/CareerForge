from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import os
import shutil
import uuid
import json
import re
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
# from demand_analyzer import analyze_market_demand 
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
from public_routes import router as public_router

load_dotenv()

app = FastAPI(title="CareerForge PI Engine", version="5.5.0-Unified")

# --- REGISTER ROUTERS ---
app.include_router(public_router)

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
        if not db_manager.enabled:
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

def sanitize_input(text: str) -> str:
    """Basic sanitization to prevent injection or huge payloads."""
    if not text: return ""
    # Strip null bytes and truncate
    clean = text.replace("\0", "")
    return clean[:5000]

# --- DATA MODELS ---
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] # Kept for frontend compat, but backend uses internal state
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
    return {"status": "active", "mode": "stateful_agent"}

# 1. VOICE & TEXT INTERVIEW (Protected & Stateful)
@app.post("/api/interview/voice-chat")
async def voice_chat_endpoint(
    audio: UploadFile = File(...),
    history: str = Form(...), 
    topic: str = Form(...),
    difficulty: int = Form(...),
    session_id: str = Form(None),
    authorization: str = Header(None) 
):
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
    return generate_learning_roadmap(request.skill_gaps, request.target_role)

@app.post("/api/career/hunt")
async def find_jobs(request: JobHuntRequest, user_id: str = Depends(get_current_user)):
    return hunt_opportunities(request.target_role, request.current_skill_gaps, request.location)

# 3. CHALLENGES
@app.post("/api/challenge/new")
async def create_challenge(request: ChallengeRequest, user_id: str = Depends(get_current_user)):
    return generate_challenge(request.topic, request.difficulty)

@app.post("/api/challenge/verify")
async def verify_challenge(request: VerifySolutionRequest, user_id: str = Depends(get_current_user)):
    try:
        # Improved Verification: Checks if tests ACTUALLY ran
        full_code = request.user_code + "\n\n# --- HIDDEN TEST HARNESS ---\n"
        full_code += "try:\n"
        for test in request.test_cases:
            full_code += f"    print(f'Test: {test['input_val']} -> Expect {test['expected_output']}')\n"
            full_code += f"    assert str({test['input_val']}) == '{test['expected_output']}', 'Failed Case: {test['input_val']}'\n"
        full_code += "    print('ALL_TESTS_PASSED')\n"
        full_code += "except Exception as e:\n"
        full_code += "    print(f'TEST_FAILURE: {e}')\n"
        
        output = execute_code(request.language, full_code)
        
        # Stricter check
        passed = "ALL_TESTS_PASSED" in output and "TEST_FAILURE" not in output
        status = "PASS" if passed else "FAIL"
        
        if db_manager.enabled:
            db_manager.supabase.table("challenge_attempts").insert({
                "user_id": user_id,
                "challenge_title": "Generated Challenge",
                "user_code": request.user_code,
                "status": status,
                "output_log": output
            }).execute()

        return {"status": status, "output": output}
    except Exception as e:
        return {"status": "ERROR", "output": str(e)}

# 4. DIGITAL TWIN (Internal)
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

# 8. KANBAN
@app.get("/api/kanban/list")
async def list_applications(user_id: str = Depends(get_current_user)):
    if not db_manager.enabled: return []
    data = db_manager.supabase.table("applications").select("*").eq("user_id", user_id).execute()
    return data.data

@app.post("/api/kanban/add")
async def add_application_endpoint(app: Application, user_id: str = Depends(get_current_user)):
    if not db_manager.enabled: return {"error": "DB Offline"}
    app_dict = app.dict()
    app_dict["user_id"] = user_id
    data = db_manager.supabase.table("applications").insert(app_dict).execute()
    return data.data

@app.post("/api/kanban/update")
async def update_application_status(update: KanbanUpdate, user_id: str = Depends(get_current_user)):
    return update_status(update.id, update.status)

@app.get("/api/passport/{username}")
async def get_passport(username: str, user_id: str = Depends(get_current_user)):
    return get_skill_passport(username, session_id=None)

@app.get("/api/audit/{username}")
async def audit_user_endpoint(username: str):
    return auditor_agent.calculate_trust_score(username)

# --- SHARED LOGIC (STATEFUL) ---
async def run_interview_turn(user_id, message, history, topic, difficulty, session_id):
    """
    Executes a turn in the LangGraph agent.
    NOW STATEFUL: Uses 'session_id' as a thread ID to persist context (failures, burnout status).
    """
    # 1. Ensure Session ID
    session_id = session_id or str(uuid.uuid4())
    clean_message = sanitize_input(message)
    
    # 2. Configure Persistence
    # This tells LangGraph to load the previous state for this specific user session.
    config = {"configurable": {"thread_id": session_id}}

    # 3. Invoke Graph
    # We only pass the NEW message. The graph's memory (checkpointer) handles the history.
    inputs = {
        "messages": [HumanMessage(content=clean_message)],
        "topic": topic,
        "difficulty_level": difficulty
    }

    try:
        # Use invoke with config for statefulness
        result = app_graph.invoke(inputs, config=config)
        
        # 4. Extract Result
        # The result state contains the FULL history. We want the last message (AI response).
        messages = result.get("messages", [])
        ai_response = messages[-1].content if messages else "Error: No response generated."
        critique = result.get("shadow_critique", "None")
        
        # 5. Log Interaction
        db_manager.log_interaction(user_id, session_id, topic, clean_message, ai_response, critique)
        
        return {
            "reply": ai_response,
            "critique": critique,
            "session_id": session_id,
            "user_text_processed": clean_message
        }
    except Exception as e:
        print(f"Graph Execution Error: {e}")
        return {
            "reply": "I'm having trouble connecting to my thought process. Please try again.",
            "critique": "System Error",
            "session_id": session_id,
            "user_text_processed": clean_message
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)