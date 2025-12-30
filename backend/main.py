# backend/main.py

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
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
from demand_analyzer import analyze_market_demand
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

app = FastAPI(title="CareerForge PI Engine", version="5.0.0-Ultimate")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Security
try:
    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine()
    SECURITY_ACTIVE = True
except Exception as e:
    # Presidio might fail if model not downloaded
    SECURITY_ACTIVE = False

auditor_agent = GitHubAuditor()
voice_engine = VoiceProcessor()

# --- Data Models ---
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

# NEW MODELS
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

# --- Helper Functions ---
def sanitize_input(text: str) -> str:
    if not SECURITY_ACTIVE: return text
    try:
        results = analyzer.analyze(text=text, entities=["EMAIL_ADDRESS", "PHONE_NUMBER"], language="en")
        return anonymizer.anonymize(text=text, analyzer_results=results).text
    except: return text

# --- ROUTES ---

@app.get("/")
async def health_check():
    return {
        "status": "active", 
        "version": "5.0.0", 
        "modules": ["Voice", "Roadmap", "Hunter", "Recruiter", "Network", "Negotiator", "AB-Test", "Kanban"]
    }

# 1. VOICE & TEXT INTERVIEW
@app.post("/api/interview/voice-chat")
async def voice_chat_endpoint(
    audio: UploadFile = File(...),
    history: str = Form(...), 
    topic: str = Form(...),
    difficulty: int = Form(...),
    session_id: str = Form(None)
):
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
            
        response = await run_interview_turn(final_input, history_list, topic, difficulty, session_id)
        response["vibe_metrics"] = metrics
        return response
    except Exception as e:
        print(f"Voice Error: {e}")
        raise HTTPException(500, detail=str(e))

@app.post("/api/interview/chat")
async def chat_endpoint(request: ChatRequest):
    return await run_interview_turn(request.message, request.history, request.topic, request.difficulty, request.session_id)

# 2. ROADMAP & MARKET
@app.post("/api/career/roadmap")
async def generate_roadmap(request: RoadmapRequest):
    return generate_learning_roadmap(request.skill_gaps, request.target_role)

@app.post("/api/career/hunt")
async def find_jobs(request: JobHuntRequest):
    return hunt_opportunities(request.target_role, request.current_skill_gaps, request.location)

# 3. CHALLENGES
@app.post("/api/challenge/new")
async def create_challenge(request: ChallengeRequest):
    return generate_challenge(request.topic, request.difficulty)

@app.post("/api/challenge/verify")
async def verify_challenge(request: VerifySolutionRequest):
    try:
        full_code = request.user_code + "\n\n# --- HIDDEN TEST HARNESS ---\n"
        for test in request.test_cases:
            full_code += f"print(f'Test: {test['input_val']} -> Expect {test['expected_output']}')\n"
            full_code += f"assert str({test['input_val']}) == '{test['expected_output']}', 'Failed Case: {test['input_val']}'\n"
        full_code += "print('ALL_TESTS_PASSED')"
        output = execute_code(request.language, full_code)
        status = "PASS" if "ALL_TESTS_PASSED" in output else "FAIL"
        return {"status": status, "output": output}
    except Exception as e:
        return {"status": "ERROR", "output": str(e)}

# 4. DIGITAL TWIN (RECRUITER)
@app.post("/api/recruiter/ask")
async def ask_digital_twin(request: RecruiterQuery):
    return query_digital_twin(request.username, request.question)

# 5. NETWORKING AGENT
@app.post("/api/network/generate")
async def generate_outreach_endpoint(request: OutreachRequest):
    return generate_cold_outreach(request.username, request.target_company, request.target_role, request.job_context)

# 6. NEGOTIATOR
@app.post("/api/negotiator/start")
async def start_negotiation(request: NegStartRequest):
    return start_negotiation_scenario(request.role, request.location)

@app.post("/api/negotiator/chat")
async def chat_negotiation(request: NegTurnRequest):
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

@app.post("/api/experiments/run")
async def run_resume_ab_test(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        file_location = f"temp_ab_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        result = run_ab_test(file_location, job_description)
        
        if os.path.exists(file_location): os.remove(file_location)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 8. KANBAN (MISSION CONTROL)
@app.get("/api/kanban/list")
async def list_applications():
    return get_applications()

@app.post("/api/kanban/add")
async def add_application_endpoint(app: Application):
    return add_application(app)

@app.post("/api/kanban/update")
async def update_application_status(update: KanbanUpdate):
    return update_status(update.id, update.status)

@app.get("/api/passport/{username}")
async def get_passport(username: str):
    return get_skill_passport(username)

# --- SHARED LOGIC ---
async def run_interview_turn(message, history, topic, difficulty, session_id):
    session_id = session_id or str(uuid.uuid4())
    clean_message = sanitize_input(message)
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
    
    db_manager.log_interaction(session_id, topic, clean_message, ai_response, critique)
    
    return {
        "reply": ai_response,
        "critique": critique,
        "session_id": session_id,
        "user_text_processed": clean_message
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)