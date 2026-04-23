# backend/recruiter_proxy.py

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from database import db_manager
from skill_passport import get_skill_passport

load_dotenv()

llm = ChatGroq(
    temperature=0.2,
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def query_digital_twin(username: str, recruiter_question: str):
    """
    ENGINE 6 (ENHANCED): The Reverse Recruiter / Digital Twin.
    Cites Verified Skill Passport data as proof of competence.
    """
    # 1. Fetch The "Truth" (Skill Passport)
    try:
        passport = get_skill_passport(username)
        passport_summary = (
            f"Skill Verdict: {passport.get('skill_verdict', 'Unverified')}\n"
            f"Trust Score (GitHub): {passport.get('trust_score', 0)}/100\n"
            f"Readiness Score: {passport.get('readiness_score', 0)}/100\n"
            f"Challenges Passed: {passport.get('challenges_passed', 0)}\n"
            f"Interview Sessions: {passport.get('interview_sessions', 0)}"
        )
    except Exception as e:
        passport = {}
        passport_summary = "Passport Data Unavailable (User may be new)."

    # 2. Fetch "Depth" (Interview Logs)
    chat_context = ""
    if db_manager.enabled:
        try:
            logs = db_manager.supabase.table("interview_logs")\
                .select("topic, user_input, ai_response, shadow_critique")\
                .order("created_at", desc=True).limit(5).execute()

            for log in logs.data:
                critique_note = f"(Self-Correction: {log['shadow_critique']})" if log['shadow_critique'] != "None" else "(Strong Answer)"
                chat_context += f"- Topic: {log['topic']}\n  Q: {log['ai_response'][:50]}...\n  Candidate: {log['user_input'][:100]}... {critique_note}\n"
        except Exception:
            chat_context = "No interview history available yet."

    # 3. Synthesize the "Advocate" Response
    system_prompt = (
        f"You are the 'Digital Twin' of a software engineer named {username}. "
        f"A recruiter is asking you a specific question to see if {username} is a good hire. "
        f"\n\nYOUR KNOWLEDGE BASE (The Truth):\n"
        f"1. PASSPORT PROOF: {passport_summary}\n"
        f"2. INTERVIEW EXCERPTS: {chat_context}\n\n"
        f"RULES FOR ANSWERING:\n"
        f"1. BE EVIDENCE-BASED: Refer to the PASSPORT when asked about skills.\n"
        f"2. OWN YOUR WEAKNESSES: Admit failures but mention the learning path.\n"
        f"3. PROFESSIONAL BUT HUMAN: Speak in first person. Confident, not arrogant.\n"
        f"4. GOAL: Convince the recruiter to book a real meeting."
    )

    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"RECRUITER ASKS: {recruiter_question}")
        ])
        return {
            "reply": response.content,
            "evidence_used": passport.get("skill_verdict", "Unverified")
        }
    except Exception as e:
        return {"reply": f"Digital Twin Error: {str(e)}", "evidence_used": []}