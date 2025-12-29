# FILE: backend/shadow_auditor.py
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage
from agent_state import InterviewState

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.0
)

def shadow_auditor_node(state: InterviewState):
    """
    The Shadow Auditor[cite: 13]:
    1. Listens to the User.
    2. Updates 'trust_score' based on answer quality.
    3. Flags 'Vibecoding' (AI Fluff).
    """
    messages = state.get("messages", [])
    current_score = state.get("trust_score", 50) # Default start at 50 [cite: 55]
    
    if not messages or messages[-1].type == "ai":
        return {}

    last_user_message = messages[-1].content
    current_topic = state.get("topic", "General Engineering")

    # Engineered Prompt for Scoring
    system_prompt = (
        f"You are a silent Technical Auditor evaluating a candidate on {current_topic}. "
        f"Analyze their latest answer: '{last_user_message}'.\n\n"
        f"SCORING RULES:\n"
        f"- If the answer is vague/buzzwords -> Score Change: -10\n"
        f"- If the answer is factually wrong -> Score Change: -20\n"
        f"- If the answer is correct but shallow -> Score Change: +2\n"
        f"- If the answer is deep/insightful -> Score Change: +5\n\n"
        f"Output format: 'SCORE_CHANGE: <int> | CRITIQUE: <short text>'"
    )

    response = llm.invoke([SystemMessage(content=system_prompt)])
    content = response.content.strip()
    
    # Parse the output
    score_change = 0
    critique = "No critique."
    
    try:
        if "SCORE_CHANGE:" in content:
            parts = content.split("|")
            score_part = parts[0].replace("SCORE_CHANGE:", "").strip()
            critique_part = parts[1].replace("CRITIQUE:", "").strip()
            score_change = int(score_part)
            critique = critique_part
    except:
        # Fallback if LLM breaks format
        critique = content

    # Calculate new score (Clamped 0-100)
    new_score = max(0, min(100, current_score + score_change))
    
    return {
        "shadow_critique": critique, 
        "trust_score": new_score
    }