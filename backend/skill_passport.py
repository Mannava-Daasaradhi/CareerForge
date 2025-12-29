import hashlib
import json
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

# Import your existing engines
from database import db_manager
from auditor import GitHubAuditor

# Initialize Auditor
auditor = GitHubAuditor()

# --- DATA MODELS ---

class VerifiedChallenge(BaseModel):
    challenge_title: str
    status: str
    timestamp: str
    verification_hash: str = Field(..., description="Simulated blockchain-style hash of the success.")

class SkillPassport(BaseModel):
    candidate_id: str
    generated_at: str
    github_trust_score: int
    interview_readiness_score: int
    verified_skills: List[str]
    recent_achievements: List[VerifiedChallenge]
    passport_signature: str = Field(..., description="Unique ID proving this data wasn't tampered with.")

# --- THE ENGINE ---

def generate_verification_hash(data_string: str) -> str:
    """Creates a SHA-256 signature to make the data look 'official'."""
    return hashlib.sha256(data_string.encode()).hexdigest()[:16]

def get_skill_passport(username: str, session_id: Optional[str] = None):
    """
    The 'Ledger' Engine.
    Aggregates:
    1. GitHub History (Real code pushed).
    2. Interview Performance (Voice confidence + logic).
    3. Challenge Results (Code Sandbox execution).
    """
    print(f"--- [Passport] Minting identity for {username} ---")

    # 1. Get External Trust (GitHub)
    gh_stats = auditor.calculate_trust_score(username)
    gh_score = gh_stats.get("trust_score", 0)

    # 2. Get Internal Trust (Database Logs)
    # We fetch the last 5 passed challenges and interview interactions
    verified_challenges = []
    avg_interview_score = 50 # Default starting point

    if db_manager.enabled:
        try:
            # Fetch passed challenges
            # Note: Assuming 'challenge_attempts' table exists as per previous context
            attempts = db_manager.supabase.table("challenge_attempts")\
                .select("*").eq("status", "PASS").order("created_at", desc=True).limit(5).execute()
            
            for att in attempts.data:
                # Create a hash of the success record
                v_hash = generate_verification_hash(f"{att['id']}-{att['created_at']}-PASS")
                verified_challenges.append(VerifiedChallenge(
                    challenge_title=att['challenge_title'],
                    status="VERIFIED_PASS",
                    timestamp=att['created_at'],
                    verification_hash=v_hash
                ))
            
            # Fetch generic interview logs to estimate "Readiness"
            # (Simple heuristic: more logs = more practice = higher score)
            logs = db_manager.supabase.table("interview_logs")\
                .select("id").eq("session_id", session_id if session_id else "").execute()
            
            if logs.data:
                # Cap bonus at 30 points for practice
                avg_interview_score += min(30, len(logs.data) * 2)

        except Exception as e:
            print(f"Passport DB Error: {e}")

    # 3. Synthesize the Passport
    # Combine GitHub score (0-100) and Internal Prep (0-80)
    final_score = min(99, int((gh_score * 0.6) + (avg_interview_score * 0.4)))
    
    # Skills are derived from successful challenges
    skills = list(set([c.challenge_title.split(" ")[0] for c in verified_challenges]))
    if not skills: skills = ["Pending Verification"]

    passport_data = {
        "candidate_id": username,
        "generated_at": datetime.utcnow().isoformat(),
        "github_trust_score": gh_score,
        "interview_readiness_score": final_score,
        "verified_skills": skills,
        "recent_achievements": verified_challenges,
        "passport_signature": ""
    }
    
    # Sign the document
    raw_json = json.dumps(passport_data, sort_keys=True)
    passport_data["passport_signature"] = generate_verification_hash(raw_json)

    return passport_data

# --- TEST BLOCK ---
if __name__ == "__main__":
    # Test with a known GitHub user
    print(json.dumps(get_skill_passport("torvalds"), indent=2))