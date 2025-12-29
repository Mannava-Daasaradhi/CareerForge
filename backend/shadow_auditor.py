import os
from dotenv import load_dotenv

load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage
from agent_state import InterviewState

# Initialize Gemini 1.5 Flash
# We wrap this in a try/except block later to handle missing keys gracefully
try:
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.0
    )
    API_ACTIVE = True
except Exception:
    API_ACTIVE = False

def shadow_auditor_node(state: InterviewState):
    """
    The Shadow Auditor:
    1. Listens to the User's latest answer.
    2. Critiques it for depth, accuracy, and "BS" (Buzzwords).
    3. Saves the critique to the state.
    """
    if not API_ACTIVE:
        return {"shadow_critique": "Auditor Offline (Check GOOGLE_API_KEY)"}

    messages = state.get("messages", [])
    
    # Skip if no messages or if the last message was AI
    if not messages or messages[-1].type == "ai":
        return {}

    last_user_message = messages[-1].content
    
    # Fallback if transcription was empty
    if not last_user_message:
        return {}

    current_topic = state.get("topic", "Tech")

    system_prompt = (
        f"You are a silent Technical Auditor evaluating a candidate on {current_topic}. "
        f"Analyze their latest answer: '{last_user_message}'. "
        f"Identify: 1. Factual errors. 2. Vagueness/Fluff. 3. True Depth. "
        f"Output a concise critique (max 2 sentences) for the Lead Interviewer."
    )

    try:
        response = llm.invoke([SystemMessage(content=system_prompt)])
        return {"shadow_critique": response.content}
    except Exception as e:
        # Prevent crash if Google API fails
        print(f"Shadow Auditor Error: {e}")
        return {"shadow_critique": "Auditor Silent (API Error)"}