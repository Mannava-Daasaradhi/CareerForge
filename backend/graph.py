# FILE: backend/graph.py
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from agent_state import InterviewState

# Import Nodes
from shadow_auditor import shadow_auditor_node
from pivot_agent import pivot_agent_node
from code_sandbox import code_execution_node
from red_team import red_team_node
from interviewer import lead_interviewer_node

# 1. Initialize Graph
workflow = StateGraph(InterviewState)

# 2. Add Nodes
workflow.add_node("shadow_auditor", shadow_auditor_node)
workflow.add_node("pivot_agent", pivot_agent_node)
workflow.add_node("code_sandbox", code_execution_node)
workflow.add_node("red_team", red_team_node)
workflow.add_node("lead_interviewer", lead_interviewer_node)

# 3. Entry Point
workflow.set_entry_point("shadow_auditor")

# 4. Conditional Edges

def route_after_pivot(state: InterviewState):
    """
    Decides where to go after the Pivot/Auditor check.
    If the user wrote code -> Sandbox.
    Otherwise -> Lead Interviewer.
    """
    messages = state.get("messages", [])
    if not messages:
        return "lead_interviewer"
        
    last_msg = messages[-1]
    
    # Check if the USER sent code (Markdown blocks)
    # (Note: pivot_agent might have injected a SystemMessage, so we look at the last HUMAN message)
    last_human_msg = next((m for m in reversed(messages) if isinstance(m, HumanMessage)), None)
    
    if last_human_msg and "```" in last_human_msg.content:
        return "code_sandbox"
    
    return "lead_interviewer"

# 5. Define Edges
# Step 1: Auditor listens
workflow.add_edge("shadow_auditor", "pivot_agent")

# Step 2: Pivot decides mode, then we route
workflow.add_conditional_edges(
    "pivot_agent",
    route_after_pivot,
    {
        "code_sandbox": "code_sandbox",
        "lead_interviewer": "lead_interviewer"
    }
)

# Step 3: If Code -> Sandbox -> Red Team -> Interviewer
workflow.add_edge("code_sandbox", "red_team")
workflow.add_edge("red_team", "lead_interviewer")

# Step 4: Interviewer -> END (Reply to User)
workflow.add_edge("lead_interviewer", END)

# 6. Compile
app_graph = workflow.compile()