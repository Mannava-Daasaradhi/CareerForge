from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
import shutil
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage

# Import Engines
from auditor import GitHubAuditor
from graph import app_graph
from resume_parser import analyze_resume # <--- NEW IMPORT

load_dotenv()

app = FastAPI(title="CareerForge API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auditor_agent = GitHubAuditor()

# --- Data Models ---
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]]
    topic: str = "General Engineering"
    difficulty: int = 50

# --- Routes ---

@app.get("/")
async def health_check():
    return {"status": "active", "system": "CareerForge Core"}

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
        lc_messages = []
        for msg in request.history:
            if msg["role"] == "user":
                lc_messages.append(HumanMessage(content=msg["content"]))
            else:
                lc_messages.append(AIMessage(content=msg["content"]))
        
        lc_messages.append(HumanMessage(content=request.message))

        initial_state = {
            "messages": lc_messages,
            "topic": request.topic,
            "difficulty_level": request.difficulty,
            "shadow_critique": ""
        }

        result = app_graph.invoke(initial_state)
        ai_response = result["messages"][-1].content
        
        return {
            "reply": ai_response,
            "critique": result.get("shadow_critique", "None")
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- NEW: Resume Upload Endpoint ---
@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Receives a PDF, saves it temporarily, and analyzes it.
    """
    try:
        # 1. Save file locally
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # 2. Analyze
        analysis = analyze_resume(file_location)
        
        # 3. Clean up (delete file)
        os.remove(file_location)
        
        return {"filename": file.filename, "analysis": analysis}
        
    except Exception as e:
        print(f"Resume Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)