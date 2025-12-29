# FILE: backend/pivot_agent.py
from langchain_core.messages import SystemMessage, AIMessage
from agent_state import InterviewState

def pivot_agent_node(state: InterviewState):
    """
    Engine 3: The Contextual Pivot.
    Decides if the flow should be interrupted based on Trust Score drop.
    """
    critique = state.get("shadow_critique", "")
    trust_score = state.get("trust_score", 50)
    
    # THRESHOLD: If Score < 40 OR Auditor flagged "Buzzwords/Vague"
    # We trigger the "Contextual Pivot"
    trigger_pivot = trust_score < 40 or "vague" in critique.lower() or "buzzwords" in critique.lower()
    
    if trigger_pivot:
        # Create the "Hardcore" challenge prompt
        pivot_msg = (
            f"[SYSTEM INTERVENTION]: The previous answer was flagged as weak ('{critique}'). "
            "Switching mode to 'Hardcore Drill'. "
            "INSTRUCTION TO INTERVIEWER: Ignore pleasantries. "
            "Present a BROKEN code snippet related to the topic and demand an immediate fix."
        )
        
        return {
            "pivot_triggered": True,
            "difficulty_level": "Hardcore",
            # We inject a System Message so the Lead Interviewer sees the command
            "messages": [SystemMessage(content=pivot_msg)]
        }
        
    return {"pivot_triggered": False}