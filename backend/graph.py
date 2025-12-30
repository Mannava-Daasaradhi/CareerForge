from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from agent_state import InterviewState

# Import Workers
from interviewer import lead_interviewer_node
from shadow_auditor import shadow_auditor_node
from code_sandbox import code_execution_node
from burnout_guard import burnout_router, burnout_intervention_node, reset_failures

# 1. Initialize
workflow = StateGraph(InterviewState)

# 2. Add Nodes
workflow.add_node("shadow_auditor", shadow_auditor_node)
workflow.add_node("code_sandbox", code_execution_node)
workflow.add_node("lead_interviewer", lead_interviewer_node)
workflow.add_node("burnout_intervention", burnout_intervention_node)

# 3. Define the Flow

# Entry
workflow.set_entry_point("shadow_auditor")

# Auditor always checks safety/critique first
workflow.add_edge("shadow_auditor", "code_sandbox")

# --- THE CONDITIONAL EDGE (The Cycle) ---
# After code runs, we don't just go to Interviewer. We check for burnout.
workflow.add_conditional_edges(
    "code_sandbox",
    burnout_router,
    {
        "lead_interviewer": "lead_interviewer",     # Code passed -> Continue
        "retry_prompt": "lead_interviewer",         # Code failed once -> Ask to fix (Standard)
        "burnout_intervention": "burnout_intervention" # Code failed 3x -> Intervention
    }
)

# Logic for Intervention
# If we intervene, we add the "Be Nice" system prompt, THEN let the interviewer speak.
workflow.add_edge("burnout_intervention", "lead_interviewer")

# Exit
workflow.add_edge("lead_interviewer", END)

# 4. Compile with Persistence (Fixes "State Amnesia")
memory = MemorySaver()
app_graph = workflow.compile(checkpointer=memory)
