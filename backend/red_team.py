import os
from langchain_core.messages import SystemMessage
from langchain_groq import ChatGroq
from agent_state import InterviewState

# Initialize Groq (Llama 3.3 70B) for its reasoning capabilities
llm = ChatGroq(
    temperature=0.3, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def red_team_node(state: InterviewState):
    """
    The Red Team Auditor Node:
    1. Acts as the "Cynic" in the room.
    2. Analyzes the User's latest answer for 'Resume-Driven Development'.
    3. Penalizes over-engineering (e.g., using Microservices for a To-Do app).
    """
    messages = state.get("messages", [])
    
    # Safety check: ensure there are messages and the last one is from the user
    if not messages or messages[-1].type != "human":
        return {}

    user_input = messages[-1].content
    topic = state.get("topic", "General Engineering")
    
    # The Prompt: Specifically designed to catch "BS" and complexity addiction.
    system_prompt = (
        f"You are a Red Team Technical Auditor. Topic: {topic}. "
        f"Analyze the candidate's latest answer: '{user_input}'. "
        f"Your Goal: Detect OVER-ENGINEERING and BUZZWORD STUFFING. "
        f"1. Did they suggest a complex tool (K8s, Kafka, Blockchain) for a simple problem? "
        f"2. Did they use buzzwords without explaining the 'Why'? "
        f"3. Is their solution pragmatic? "
        f"\n"
        f"Output ONLY a concise critique. If the answer is pragmatic and good, output 'PASS'. "
        f"If it is over-engineered, start your response with 'RED FLAG:' followed by the reason."
    )

    try:
        response = llm.invoke([SystemMessage(content=system_prompt)])
        return {"red_team_verdict": response.content}
    except Exception as e:
        print(f"Red Team Error: {e}")
        return {"red_team_verdict": "PASS (Error)"}