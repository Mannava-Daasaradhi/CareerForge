from langgraph.graph import StateGraph, END
from agent_state import InterviewState

# Import Workers
from interviewer import lead_interviewer_node
from shadow_auditor import shadow_auditor_node
from code_sandbox import code_execution_node  # <--- NEW IMPORT

# 1. Initialize Graph
workflow = StateGraph(InterviewState)

# 2. Add Nodes
workflow.add_node("shadow_auditor", shadow_auditor_node)
workflow.add_node("code_sandbox", code_execution_node) # <--- NEW NODE
workflow.add_node("lead_interviewer", lead_interviewer_node)

# 3. Define the Flow
# The "Thinking Process" for the AI:
# Input -> Critique It -> Try to Run Code -> Formulate Response

workflow.set_entry_point("shadow_auditor")

# Linear Sequence
workflow.add_edge("shadow_auditor", "code_sandbox")
workflow.add_edge("code_sandbox", "lead_interviewer")
workflow.add_edge("lead_interviewer", END)

# 4. Compile
app_graph = workflow.compile()