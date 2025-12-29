import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from database import db_manager

load_dotenv()

llm = ChatGroq(
    temperature=0.0, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def query_digital_twin(recruiter_question: str):
    """
    ENGINE 6: The Recruiter Proxy.
    Answers questions based SOLELY on the candidate's actual performance logs.
    """
    # FIX: Changed key from 'answer' to 'reply' to match Test Suite expectations
    if not db_manager.enabled:
        return {"reply": "Digital Twin Offline (Database connection missing). Please check SUPABASE_URL in .env."}

    try:
        # 1. Fetch relevant logs
        logs = db_manager.supabase.table("interview_logs")\
            .select("*").order("created_at", desc=True).limit(20).execute()
        
        challenges = db_manager.supabase.table("challenge_attempts")\
            .select("*").order("created_at", desc=True).limit(5).execute()
            
        context = "CANDIDATE HISTORY:\n"
        
        for log in logs.data:
            context += f"- Q: {log['user_input']}\n  A: {log['ai_response']}\n  Critique: {log['shadow_critique']}\n"
            
        for chal in challenges.data:
             context += f"- CHALLENGE: {chal['challenge_title']} | STATUS: {chal['status']}\n"

    except Exception as e:
        # FIX: Changed key from 'error' to 'reply' so the frontend displays the error gracefully
        return {"reply": f"Digital Twin Error: {str(e)}"}

    # 2. Synthesize Answer
    system_prompt = (
        f"You are the 'Digital Twin' of a candidate. A recruiter is asking you questions. "
        f"Use the EVIDENCE provided below to answer. "
        f"Rules: "
        f"1. If the candidate passed a relevant challenge, mention it proudly. "
        f"2. If the logs show they struggled (bad critique), be honest but professional. "
        f"3. Do NOT make up skills not found in the logs."
    )

    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"EVIDENCE:\n{context}\n\nRECRUITER QUESTION: {recruiter_question}")
    ])
    
    return {"reply": response.content}