# backend/skill_passport.py — COMPLETE FIXED VERSION
# Changes from original:
#   1. Interview log query now uses user_id instead of session_id
#      (was always returning 0 logs because session_id defaulted to "")
#   2. All print() replaced with logger
#   3. Consistent return type (always dict)
#   4. Clearer score aggregation logic

import os
import hashlib
from datetime import datetime
from typing import Optional
from logger import get_logger
from database import db_manager

logger = get_logger(__name__)


def get_skill_passport(username: str, session_id: Optional[str] = None) -> dict:
    """
    Builds and returns a Skill Passport for the given GitHub username.

    Aggregates:
      - GitHub trust score (from auditor)
      - Challenges passed (from DB)
      - Interview sessions completed (from DB, queried by user_id NOT session_id)
      - Overall readiness score (weighted average)

    Returns a dict always — never raises.
    """
    logger.info("Building Skill Passport for: %s", username)

    # ── 1. GitHub trust score ─────────────────────────────────────────────────
    github_trust = 0
    try:
        from auditor import GitHubAuditor
        auditor = GitHubAuditor()
        audit_result = auditor.calculate_trust_score(username)
        github_trust = audit_result.get("trust_score", 0)
        logger.info("GitHub trust score for %s: %d", username, github_trust)
    except Exception as e:
        logger.warning("Could not fetch GitHub trust for %s: %s", username, str(e))

    # ── 2. Challenges passed ──────────────────────────────────────────────────
    challenges_passed = 0
    if db_manager.enabled:
        try:
            result = db_manager.supabase.table("challenge_results") \
                .select("id") \
                .eq("user_id", username) \
                .eq("passed", True) \
                .execute()
            challenges_passed = len(result.data) if result.data else 0
            logger.info("Challenges passed for %s: %d", username, challenges_passed)
        except Exception as e:
            logger.warning("Could not fetch challenge results: %s", str(e))

    # ── 3. Interview sessions ─────────────────────────────────────────────────
    # FIX: was `.eq("session_id", session_id if session_id else "")`
    # which always returned 0 when no session_id was provided.
    # Now correctly queries by user_id so all sessions for the user are counted.
    interview_sessions = 0
    if db_manager.enabled:
        try:
            result = db_manager.supabase.table("interview_logs") \
                .select("id") \
                .eq("user_id", username) \
                .execute()
            interview_sessions = len(result.data) if result.data else 0
            logger.info("Interview sessions for %s: %d", username, interview_sessions)
        except Exception as e:
            logger.warning("Could not fetch interview logs: %s", str(e))

    # ── 4. Readiness score (weighted) ─────────────────────────────────────────
    # Weights: GitHub trust 40%, challenges 40%, interview activity 20%
    challenge_score = min(challenges_passed * 20, 100)   # 5 challenges = 100
    interview_score = min(interview_sessions * 25, 100)  # 4 sessions = 100

    readiness_score = int(
        (github_trust * 0.4) +
        (challenge_score * 0.4) +
        (interview_score * 0.2)
    )

    # ── 5. Skill verdict ──────────────────────────────────────────────────────
    if readiness_score >= 80:
        verdict = "VERIFIED — Strong Candidate"
    elif readiness_score >= 60:
        verdict = "VERIFIED — Mid-Level"
    elif readiness_score >= 40:
        verdict = "PARTIAL — Needs More Practice"
    else:
        verdict = "UNVERIFIED — Complete Challenges to Build Score"

    # ── 6. Verification hash (internal consistency hash, not cryptographic proof) ──
    # NOTE: This is a SHA-256 of the passport data for internal consistency checks.
    # It is NOT an external cryptographic proof — the same DB can be edited.
    hash_input = f"{username}:{readiness_score}:{github_trust}:{challenges_passed}"
    verification_hash = "sha256:" + hashlib.sha256(hash_input.encode()).hexdigest()[:16]

    passport = {
        "username": username,
        "readiness_score": readiness_score,
        "trust_score": github_trust,
        "challenges_passed": challenges_passed,
        "interview_sessions": interview_sessions,
        "skill_verdict": verdict,
        "verification_hash": verification_hash,
        "hash_note": "Internal consistency hash — not an external cryptographic proof",
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }

    # Persist to DB if enabled
    if db_manager.enabled:
        try:
            db_manager.supabase.table("skill_passports").upsert({
                "user_id": username,
                **passport,
            }).execute()
            logger.info("Passport persisted for %s", username)
        except Exception as e:
            logger.warning("Could not persist passport: %s", str(e))

    return passport
