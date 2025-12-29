from agent_state import InterviewState
from langchain_core.messages import SystemMessage

def burnout_router(state: InterviewState):
    """
    The Traffic Cop.
    Decides where to send the user after the Code Sandbox runs.
    """
    output = state.get("code_output", "")
    failures = state.get("consecutive_failures", 0)

    # Check 1: Did the code fail?
    # We look for Python Tracebacks or explicit error flags
    is_error = "Traceback" in output or "Error:" in output or "FAIL" in output

    if is_error:
        # Increment failure count (in a real graph, we'd return an update, 
        # but here we return the *next node* name)
        if failures >= 2:
            return "burnout_intervention"
        return "retry_prompt"
    else:
        return "lead_interviewer"

def burnout_intervention_node(state: InterviewState):
    """
    Node: The 'Therapist' Intervention.
    Replaces the standard Interviewer response with a calming message.
    """
    print("--- [Guard] Triggering Burnout Intervention ---")
    
    # We inject a system message that forces the AI to be kind
    intervention_msg = SystemMessage(content=(
        "SYSTEM OVERRIDE: The user is failing repeatedly and likely frustrated. "
        "STOP asking technical questions. "
        "Instead: 1. Acknowledge the difficulty. 2. Suggest a 5-minute break. "
        "3. Offer to switch to a simpler topic or show the solution. "
        "Be empathetic, not judgmental."
    ))
    
    # We allow the Lead Interviewer model to generate the actual text, 
    # but guided by this strong override.
    return {"messages": [intervention_msg], "consecutive_failures": 0} 

def reset_failures(state: InterviewState):
    """Resets counter on success"""
    return {"consecutive_failures": 0}