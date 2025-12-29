from langgraph.graph import StateGraph, END
from agent_state import InterviewState
from interviewer import lead_interviewer_node
from shadow_auditor import shadow_auditor_node

# 1. Initialize the Graph with our State schema
workflow = StateGraph(InterviewState)

# 2. Add the Nodes (The Workers)
workflow.add_node("shadow_auditor", shadow_auditor_node)
workflow.add_node("lead_interviewer", lead_interviewer_node)

# 3. Define the Flow (The Edges)
# When the graph starts, go to Lead Interviewer (to ask the first question)
workflow.set_entry_point("lead_interviewer")

# After Lead Interviewer speaks, we wait for User Input (handled by the API later)
# Ideally, in a real loop, we would loop back. 
# For this API, we will run one "turn" at a time.

# Logic for a Turn:
# User Input -> Shadow Auditor scans it -> Lead Interviewer responds
workflow.add_edge("shadow_auditor", "lead_interviewer")
workflow.add_edge("lead_interviewer", END)

# 4. Compile the Graph (Ready to run)
app_graph = workflow.compile()