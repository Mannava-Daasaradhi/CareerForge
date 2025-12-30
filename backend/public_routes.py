
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random

# Initialize Router
router = APIRouter(
    prefix="/api/public",
    tags=["Public Profile & Twin"]
)

# --- MODELS ---
class TwinChatRequest(BaseModel):
    recruiter_name: str
    question: str

class TwinChatResponse(BaseModel):
    reply: str

# --- ROUTES ---

@router.get("/profile/{username}")
async def get_public_profile(username: str):
    """
    Fetches the public 'Skill Passport' for a candidate.
    Used by the /candidate/[username] frontend page.
    """
    # SIMULATION: In production, fetch this from supabase via db_manager
    # For now, we return mock data so your frontend works immediately.
    
    # Randomize score slightly to make it feel dynamic
    base_score = 85
    
    return {
        "candidate_id": username,
        "interview_readiness_score": base_score + random.randint(0, 10),
        "github_trust_score": 92,
        "verified_skills": ["React", "Next.js", "Python", "LangChain", "System Design"],
        "recent_achievements": [
            {
                "challenge_title": "Distributed Systems Challenge", 
                "status": "Verified", 
                "timestamp": "2023-12-01T10:00:00Z"
            },
            {
                "challenge_title": "Advanced React Hooks", 
                "status": "Verified", 
                "timestamp": "2023-11-28T14:30:00Z"
            },
             {
                "challenge_title": "Cybersecurity Basics", 
                "status": "Verified", 
                "timestamp": "2023-11-15T09:15:00Z"
            }
        ]
    }

@router.post("/twin/{username}/ask", response_model=TwinChatResponse)
async def ask_digital_twin(username: str, req: TwinChatRequest):
    """
    The 'Digital Twin' Chatbot Endpoint.
    """
    question = req.question.lower()
    
    # SIMULATION: Simple logic to mimic an AI Agent.
    # Later, we can connect this to the LangGraph 'CandidateAgent'.
    
    if "salary" in question or "money" in question:
        reply = "As an AI representation, I don't negotiate salary directly, but I know my human counterpart is looking for competitive market rates for a Senior Engineer role."
    elif "experience" in question or "work" in question:
        reply = f"I have been working with Full Stack technologies for over 4 years. Recently, I've been diving deep into Autonomous AI Agents using Python and LangGraph."
    elif "python" in question:
        reply = "I use Python heavily for backend systems, specifically FastAPI for APIs and PyTorch/LangChain for AI workflows. I prefer clear, typed code with Pydantic models."
    elif "react" in question or "frontend" in question:
        reply = "On the frontend, I specialize in Next.js (App Router) and Tailwind CSS. I focus on creating 'Cyberpunk' or 'Terminal' style interfaces that stand out."
    else:
        reply = f"That's an interesting question, {req.recruiter_name}. My primary focus is on building scalable systems and AI tools. I'm happy to discuss specific technical challenges!"

    return {"reply": reply}
