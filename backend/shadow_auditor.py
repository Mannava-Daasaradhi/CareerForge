import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from agent_state import InterviewState

load_dotenv()

# Initialize Gemini 1.5 Flash
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.0
)

def shadow_auditor_node(state: InterviewState):
    """
    Engine 1: The Shadow Auditor.
    Listens -> Critiques -> Updates Score.
    """
    messages = state.get("messages", [])
    current_score = state.get("trust_score", 50)
    
    # 1. Safety Checks
    if not messages:
        return {}
    
    last_msg = messages[-1]
    # Only audit User messages, not AI messages
    if last_msg.type == "ai":
        return {}

    last_user_message = last_msg.content
    topic = state.get("topic", "General Engineering")

    print(f"--- [AUDITOR] Analyzing: {last_user_message[:30]}... ---")

    # 2. The Prompt (Strict JSON-like format)
    audit_instruction = (
        f"ROLE: Silent Technical Auditor.\n"
        f"CONTEXT: Candidate is answering a question about '{topic}'.\n"
        f"INPUT: '{last_user_message}'\n\n"
        f"TASK: Rate the answer quality and output a score penalty/bonus.\n"
        f"RULES:\n"
        f"- AI/Vague/Buzzwords -> SCORE_CHANGE: -10\n"
        f"- Incorrect/False -> SCORE_CHANGE: -20\n"
        f"- Shallow/Basic -> SCORE_CHANGE: +2\n"
        f"- Deep/Insightful -> SCORE_CHANGE: +5\n\n"
        f"OUTPUT FORMAT: 'SCORE_CHANGE: <int> | CRITIQUE: <text>'"
    )

    try:
        # 3. Call Gemini (Using HumanMessage to prevent 500 Error)
        response = llm.invoke([HumanMessage(content=audit_instruction)])
        content = response.content.strip()
        
        # 4. Parse Output
        score_change = 0
        critique = "No critique."
        
        if "SCORE_CHANGE:" in content:
            parts = content.split("|")
            for part in parts:
                if "SCORE_CHANGE:" in part:
                    try:
                        # Extract number safely
                        num_str = part.replace("SCORE_CHANGE:", "").strip()
                        score_change = int(num_str)
                    except: pass
                if "CRITIQUE:" in part:
                    critique = part.replace("CRITIQUE:", "").strip()
        else:
            # Fallback for malformed output
            critique = content[:100]

        # 5. Update Score
        new_score = max(0, min(100, current_score + score_change))
        
        print(f"--- [AUDITOR] Verdict: {score_change} pts. Old: {current_score} -> New: {new_score} ---")
        
        return {
            "shadow_critique": critique, 
            "trust_score": new_score
        }

    except Exception as e:
        print(f"--- [AUDITOR ERROR] {e} ---")
        return {"trust_score": current_score} # Fail safe