# FILE: backend/interviewer.py
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from agent_state import InterviewState

load_dotenv()

llm = ChatGroq(
    temperature=0.6, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def lead_interviewer_node(state: InterviewState):
    """
    The Lead Interviewer:
    Dynamically adjusts persona based on the 'Trust Score' and Flags.
    """
    topic = state.get("topic", "System Design")
    difficulty = state.get("difficulty_level", "Standard") # Standard vs Hardcore
    trust_score = state.get("trust_score", 50)
    
    messages = state.get("messages", [])
    
    # Signals
    shadow_critique = state.get("shadow_critique", "")
    red_team_flag = state.get("red_team_flag", "None")
    
    # Base Persona
    persona = (
        f"You are a Lead Technical Interviewer. Topic: {topic}.\n"
        f"Current Trust Score: {trust_score}/100.\n"
        f"Difficulty Mode: {difficulty.upper()}.\n"
    )
    
    # Logic Injection
    if difficulty == "Hardcore":
        persona += "MODE: RUTHLESS. The candidate is failing. Do not be polite. Drill into their specific weaknesses."
    else:
        persona += "MODE: Professional but skeptical."

    # Contextual Attacks
    attack_vector = ""
    
    # 1. Red Team Attack (Over-engineering)
    if red_team_flag and "FLAG:" in red_team_flag:
        attack_vector = (
            f"\n[CRITICAL]: The Red Team flagged their code: '{red_team_flag}'. "
            "Ignore everything else. DEMAND they explain why they wrote such bloated code."
        )
    
    # 2. Shadow Auditor Attack (Vague answers)
    elif shadow_critique and "vague" in shadow_critique.lower():
        attack_vector = (
            f"\n[FEEDBACK]: The Auditor noted the last answer was vague. "
            "Ask a specific follow-up question that requires exact syntax or implementation details."
        )

    # 3. Sandbox Output check
    if messages and "SYSTEM_SANDBOX_OUTPUT" in messages[-1].content:
        persona += "\n[OBSERVATION]: The candidate just ran code. Review the 'SYSTEM_SANDBOX_OUTPUT' above. If it failed, ask them to fix it."

    system_msg = SystemMessage(content=persona + attack_vector)
    
    # We reconstruct the history for the LLM, putting the System Prompt first
    # (Excluding previous system prompts to save tokens/confusion)
    conversation = [system_msg] + [m for m in messages if not isinstance(m, SystemMessage)]
    
    response = llm.invoke(conversation)
    
    return {"messages": [response]}