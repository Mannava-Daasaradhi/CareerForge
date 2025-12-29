from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage

# Import our Logic
from auditor import GitHubAuditor
from graph import app_graph

# 1. Load Environment Variables
load_dotenv()

# 2. Initialize the App
app = FastAPI(
    title="CareerForge API",
    description="The Trust-Based Agentic Career OS Backend",
    version="0.3.0"
)

# 3. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agents
auditor_agent = GitHubAuditor()

# 4. Request Models (Validation)
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] # [{'role': 'user', 'content': '...'}, ...]
    topic: str = "General Engineering"
    difficulty: int = 50

# 5. Routes
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
    """
    The Core Interview Loop:
    User Input -> Shadow Auditor -> Lead Interviewer -> Response
    """
    try:
        # Convert JSON history to LangChain Message Objects
        lc_messages = []
        for msg in request.history:
            if msg["role"] == "user":
                lc_messages.append(HumanMessage(content=msg["content"]))
            else:
                lc_messages.append(AIMessage(content=msg["content"]))
        
        # Add the latest user message
        lc_messages.append(HumanMessage(content=request.message))

        # Prepare the State
        initial_state = {
            "messages": lc_messages,
            "topic": request.topic,
            "difficulty_level": request.difficulty,
            "shadow_critique": "" # Reset critique for new turn
        }

        # Run the Graph! 
        # We start at 'shadow_auditor' to critique the user's input first
        result = app_graph.invoke(initial_state)
        
        # Extract the final response from the Lead Interviewer
        ai_response = result["messages"][-1].content
        
        return {
            "reply": ai_response,
            "critique": result.get("shadow_critique", "None") # Useful for debugging
        }

    except Exception as e:
        print(f"Error in chat loop: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)