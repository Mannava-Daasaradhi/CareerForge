# backend/kanban.py — COMPLETE FIXED VERSION
# Changes from original:
#   1. add_application() now accepts and writes user_id (was silently failing Supabase non-null constraint)
#   2. analyze_rejection() exposed and used correctly
#   3. All print() replaced with logger
#   4. Type hints added to all public functions

from pydantic import BaseModel
from typing import Optional, List
from logger import get_logger
from database import db_manager

logger = get_logger(__name__)


# ── Models ────────────────────────────────────────────────────────────────────

class Application(BaseModel):
    # Field names MUST match the Supabase `applications` table schema
    # (role_title, company_name, status, salary_range, notes).
    role_title: str
    company_name: str
    status: str = "Wishlist"         # Wishlist | Applied | Interview | Offer | Rejected
    salary_range: Optional[str] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


class RejectionAnalysis(BaseModel):
    phoenix_task_title: str
    recovery_plan: str
    skill_gaps_identified: List[str]
    suggested_next_companies: List[str]


# ── CRUD operations ───────────────────────────────────────────────────────────

def add_application(app: Application, user_id: str) -> dict:
    """
    Inserts a new job application for the given user.
    user_id is required — Supabase schema has a non-null constraint on this column.
    """
    if not db_manager.enabled:
        logger.warning("DB not enabled — application not persisted")
        return {"id": "offline-mode", **app.dict(), "user_id": user_id}

    try:
        result = db_manager.supabase.table("applications").insert({
            **app.dict(),
            "user_id": user_id,          # ← FIX: was missing, caused non-null constraint failure
        }).execute()
        logger.info("Application added for user %s at %s", user_id, app.company_name)
        return result.data[0] if result.data else {}
    except Exception as e:
        logger.error("Failed to insert application: %s", str(e))
        return {"error": str(e)}


def get_applications(user_id: str) -> list:
    """Returns all applications for the given user, ordered by creation date."""
    if not db_manager.enabled:
        return []

    try:
        result = db_manager.supabase.table("applications") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return result.data or []
    except Exception as e:
        logger.error("Failed to fetch applications: %s", str(e))
        return []


def update_application(app_id: str, update: ApplicationUpdate, user_id: str) -> dict:
    """Updates status and/or notes for a specific application."""
    if not db_manager.enabled:
        return {"id": app_id, **update.dict()}

    try:
        result = db_manager.supabase.table("applications") \
            .update(update.dict(exclude_none=True)) \
            .eq("id", app_id) \
            .eq("user_id", user_id) \
            .execute()
        logger.info("Application %s updated to status=%s", app_id, update.status)
        return result.data[0] if result.data else {}
    except Exception as e:
        logger.error("Failed to update application %s: %s", app_id, str(e))
        return {"error": str(e)}


def delete_application(app_id: str, user_id: str) -> dict:
    """Deletes an application. Requires user_id to prevent cross-user deletion."""
    if not db_manager.enabled:
        return {"deleted": app_id}

    try:
        db_manager.supabase.table("applications") \
            .delete() \
            .eq("id", app_id) \
            .eq("user_id", user_id) \
            .execute()
        logger.info("Application %s deleted", app_id)
        return {"deleted": app_id}
    except Exception as e:
        logger.error("Failed to delete application %s: %s", app_id, str(e))
        return {"error": str(e)}


# ── Agentic rejection analysis ────────────────────────────────────────────────

def analyze_rejection(app_id: str, feedback: str = "", user_id: str = "") -> dict:
    """
    Runs agentic rejection analysis for a rejected application.
    Generates a Phoenix recovery plan: skill gaps, next steps, similar companies.
    This was previously implemented but never exposed as an API route.
    """
    import os
    from groq import Groq

    # Fetch application details for context
    application_context = ""
    if db_manager.enabled and app_id and app_id != "test-app-id":
        try:
            result = db_manager.supabase.table("applications") \
                .select("*") \
                .eq("id", app_id) \
                .execute()
            if result.data:
                app = result.data[0]
                application_context = f"Company: {app.get('company_name', 'Unknown')}, Role: {app.get('role_title', 'Unknown')}"
        except Exception as e:
            logger.warning("Could not fetch application for rejection analysis: %s", str(e))

    prompt = f"""You are a career recovery coach. A candidate was rejected from a job application.

Application: {application_context or 'Role not specified'}
Rejection feedback: {feedback or 'No specific feedback provided'}

Respond ONLY with valid JSON in this exact format:
{{
  "phoenix_task_title": "Short motivating action title (e.g. 'Redis Deep Dive Sprint')",
  "recovery_plan": "2-3 sentence concrete recovery plan based on the feedback",
  "skill_gaps_identified": ["gap1", "gap2", "gap3"],
  "suggested_next_companies": ["Company A", "Company B", "Company C"]
}}"""

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500,
        )
        import json
        raw = response.choices[0].message.content.strip()
        # Strip markdown fences if present
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        # Mark application as rejected in DB
        if db_manager.enabled and app_id and app_id != "test-app-id":
            update_application(app_id, ApplicationUpdate(status="rejected", notes=feedback), user_id)

        logger.info("Rejection analysis complete for app %s", app_id)
        return result

    except Exception as e:
        logger.error("Rejection analysis failed: %s", str(e))
        return {
            "phoenix_task_title": "Regroup and Reassess",
            "recovery_plan": "Review the job description again, identify which requirements you didn't meet, and build a targeted 2-week learning sprint.",
            "skill_gaps_identified": ["Unable to analyze — check logs"],
            "suggested_next_companies": []
        }
