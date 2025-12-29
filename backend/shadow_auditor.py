import os
from dotenv import load_dotenv

# LOAD ENV FIRST (Critical Fix)
load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from agent_state import InterviewState

# Initialize Gemini 1.5 Flash
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.0
)

def shadow_auditor_node(state: InterviewState):
    """
    The Shadow Auditor:
    1. Listens to the User's latest answer.
    2. Critiques it for depth, accuracy, and "BS" (Buzzwords).
    3. Saves the critique to the state.
    """
    messages = state.get("messages", [])
    
    if not messages or messages[-1].type == "ai":
        return {}

    last_user_message = messages[-1].content
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
        print(f"Shadow Auditor Offline/Error: {e}")
        # Return "None" so the Lead Interviewer ignores the missing critique
        return {"shadow_critique": "None"}