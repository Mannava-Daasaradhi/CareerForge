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

# --- IMPORT EXISTING ENGINES ---
from auditor import GitHubAuditor
from graph import app_graph
from resume_parser import analyze_resume
from database import db_manager
from voice_processor import VoiceProcessor
from roadmap_generator import generate_learning_roadmap
from demand_analyzer import analyze_market_demand

# --- NEW IMPORTS (Challenge Engine) ---
from challenge_generator import generate_challenge
from code_sandbox import execute_code 

load_dotenv()

app = FastAPI(title="CareerForge PI Engine", version="3.0.0-Gold")

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
    print(f"Security Warning: Presidio not loaded ({e}).")
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
    test_cases: List[Any] # The hidden tests from the generated challenge

# --- Helper Functions ---
def sanitize_input(text: str) -> str:
    if not SECURITY_ACTIVE: return text
    try:
        results = analyzer.analyze(text=text, entities=["EMAIL_ADDRESS", "PHONE_NUMBER"], language="en")
        return anonymizer.anonymize(text=text, analyzer_results=results).text
    except: return text

# --- CORE ROUTES ---

@app.get("/")
async def health_check():
    return {"status": "active", "version": "3.0.0", "modules": ["Voice", "Roadmap", "Sniper", "Cursed-Sandbox"]}

# 1. AUDIT (Login Entropy)
@app.get("/api/audit/{username}")
async def audit_user(username: str):
    result = auditor_agent.calculate_trust_score(username)
    if "error" in result: raise HTTPException(404, detail=result["error"])
    return result

# 2. VOICE INTERVIEW
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
        
        context_note = ""
        if metrics.get("confidence_score", 100) < 60:
            context_note = f" [SYSTEM_NOTE: User sounds nervous. Confidence: {metrics['confidence_score']}/100.]"
            
        final_input = user_text + context_note
        response = await run_interview_turn(final_input, history_list, topic, difficulty, session_id)
        response["vibe_metrics"] = metrics
        return response
    except Exception as e:
        print(f"Voice Error: {e}")
        raise HTTPException(500, detail=str(e))

# 3. TEXT INTERVIEW
@app.post("/api/interview/chat")
async def chat_endpoint(request: ChatRequest):
    return await run_interview_turn(request.message, request.history, request.topic, request.difficulty, request.session_id)

# 4. ROADMAP GENERATOR
@app.post("/api/career/roadmap")
async def generate_roadmap(request: RoadmapRequest):
    return generate_learning_roadmap(request.skill_gaps, request.target_role)

# 5. MARKET ANALYSIS
@app.get("/api/career/market-pulse")
async def market_pulse(role: str, location: str = "Remote"):
    return analyze_market_demand(role, location)

# 6. CURSED CHALLENGE GENERATOR (NEW)
@app.post("/api/challenge/new")
async def create_challenge(request: ChallengeRequest):
    """Generates a broken code scenario."""
    return generate_challenge(request.topic, request.difficulty)

@app.post("/api/challenge/verify")
async def verify_challenge(request: VerifySolutionRequest):
    """
    Runs the User's Fix + Hidden Test Cases in the Piston Sandbox.
    """
    try:
        # 1. Construct the Test Harness
        # We append the test assertions to the user's code
        full_code = request.user_code + "\n\n# --- HIDDEN TEST HARNESS ---\n"
        
        for test in request.test_cases:
            # Simple assertion logic for Python
            full_code += f"print(f'Test: {test['input_val']} -> Expect {test['expected_output']}')\n"
            full_code += f"assert str({test['input_val']}) == '{test['expected_output']}', 'Failed Case: {test['input_val']}'\n"
        
        full_code += "print('ALL_TESTS_PASSED')"

        # 2. Execute in Sandbox
        output = execute_code(request.language, full_code)
        
        # 3. Analyze Result
        if "ALL_TESTS_PASSED" in output:
            return {"status": "PASS", "output": output}
        else:
            return {"status": "FAIL", "output": output}

    except Exception as e:
        return {"status": "ERROR", "output": str(e)}

# --- Shared Logic ---
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
        "step_count": 0
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