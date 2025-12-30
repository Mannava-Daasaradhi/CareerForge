# backend/recruiter_proxy.py

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from database import db_manager
from skill_passport import get_skill_passport
import json

load_dotenv()

# Initialize Groq (Llama 3.3 70B)
llm = ChatGroq(
    temperature=0.2, # Low temp for factual accuracy
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def query_digital_twin(username: str, recruiter_question: str):
    """
    ENGINE 6 (ENHANCED): The Reverse Recruiter / Digital Twin.
    
    Unique Value Prop:
    It doesn't just "chat"; it cites 'Verified Challenges' from the Skill Passport
    as cryptographic proof of competence.
    """
    
    # 1. Fetch The "Truth" (Skill Passport)
    # This distinguishes your app from generic chatbots. You have PROOF.
    try:
        passport = get_skill_passport(username)
        passport_summary = (
            f"Verified Skills: {', '.join(passport.get('verified_skills', []))}\n"
            f"Trust Score (GitHub): {passport.get('github_trust_score')}/100\n"
            f"Interview Readiness: {passport.get('interview_readiness_score')}/100\n"
            f"Recent Achievements: {[a['challenge_title'] for a in passport.get('recent_achievements', [])]}"
        )
    except Exception as e:
        passport_summary = "Passport Data Unavailable (User may be new)."

    # 2. Fetch "Depth" (Interview Logs)
    # Shows how the candidate thinks, not just what they know.
    chat_context = ""
    if db_manager.enabled:
        try:
            logs = db_manager.supabase.table("interview_logs")\
                .select("topic, user_input, ai_response, shadow_critique")\
                .order("created_at", desc=True).limit(5).execute()
            
            for log in logs.data:
                # We interpret the critique to be honest about weaknesses
                critique_note = f"(Self-Correction: {log['shadow_critique']})" if log['shadow_critique'] != "None" else "(Strong Answer)"
                chat_context += f"- Topic: {log['topic']}\n  Q: {log['ai_response'][:50]}...\n  Candidate: {log['user_input'][:100]}... {critique_note}\n"
        except Exception:
            chat_context = "No interview history available yet."

    # 3. Synthesize the "Advocate" Response
    system_prompt = (
        f"You are the 'Digital Twin' of a software engineer named {username}. "
        f"A recruiter is asking you a specific question to see if {username} is a good hire. "
        f"\n\n"
        f"YOUR KNOWLEDGE BASE (The Truth):\n"
        f"1. PASSPORT PROOF: {passport_summary}\n"
        f"2. INTERVIEW EXCERPTS: {chat_context}\n"
        f"\n"
        f"RULES FOR ANSWERING:\n"
        f"1. BE EVIDENCE-BASED: If asked about a skill (e.g., 'Do you know SQL?'), refer to the PASSPORT ('Yes, I passed a verified Challenge on SQL Indexing...').\n"
        f"2. OWN YOUR WEAKNESSES: If the interview logs show a failure, admit it but mention the learning path.\n"
        f"3. PROFESSIONAL BUT HUMAN: Speak in the first person ('I'). Be confident but not arrogant.\n"
        f"4. GOAL: Convince the recruiter to book a real meeting."
    )

    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"RECRUITER ASKS: {recruiter_question}")
        ])
        return {
            "reply": response.content,
            "evidence_used": passport.get("verified_skills", []) # For frontend UI badges
        }
    except Exception as e:
        return {"reply": f"Digital Twin Error: {str(e)}", "evidence_used": []}