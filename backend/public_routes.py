# backend/public_routes.py
# PATCH — Replace hardcoded mock data with real DB/LLM calls
#
# Two functions need updating:
#   1. get_public_profile()  → call get_skill_passport() instead of random dict
#   2. ask_digital_twin()    → call query_digital_twin() instead of if/elif keyword match
#
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


# ── Route 1: Public profile (Skill Passport data) ────────────────────────────

@router.get("/api/public/profile/{username}")
async def get_public_profile(username: str):
    """
    Returns real Skill Passport data for a candidate.
    Previously returned hardcoded random dict — now calls get_skill_passport().
    """
    from skill_passport import get_skill_passport   # ← was missing
    return get_skill_passport(username)


# ── Route 2: Digital Twin Q&A ─────────────────────────────────────────────────

class TwinQuestion(BaseModel):
    question: str

@router.post("/api/public/twin/{username}/ask")
async def ask_digital_twin(username: str, req: TwinQuestion):
    """
    Answers recruiter questions about a candidate using real LLM + passport evidence.
    Previously used if/elif keyword matching — now calls query_digital_twin().
    """
    from recruiter_proxy import query_digital_twin  # ← was missing
    result = query_digital_twin(username, req.question)
    return {"reply": result.get("reply", "I couldn't generate a response.")}
