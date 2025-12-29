# FILE: backend/red_team.py
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from agent_state import InterviewState

load_dotenv()

# Using Llama 3.3 70B for deep reasoning
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0.0,
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def red_team_node(state: InterviewState):
    """
    Engine 4: The Red Team Auditor.
    Checks for 'Over-Engineering' in passing code.
    """
    messages = state.get("messages", [])
    
    # We only care if there was Sandbox Output
    sandbox_output = ""
    code_snippet = ""
    
    # Scan backward for the code and the sandbox result
    for msg in reversed(messages):
        if "SYSTEM_SANDBOX_OUTPUT" in msg.content:
            sandbox_output = msg.content
        if "```" in msg.content and msg.type == "human":
            code_snippet = msg.content
            break
            
    if not sandbox_output or not code_snippet:
        return {}

    # Prompt: "Is this solution too complex?"
    system_prompt = (
        "You are a Senior Staff Engineer conducting a code review. "
        "Analyze the Candidate's Code and the Sandbox Output.\n"
        "GOAL: Detect 'Over-Engineering' or 'AI-Generated Bloat'.\n\n"
        "CRITERIA:\n"
        "1. Did they use a heavy library (pandas/numpy) for a simple list task?\n"
        "2. Did they add 5 layers of abstraction (Classes, Factories) for a simple script?\n"
        "3. Is the code confusingly verbose?\n\n"
        "OUTPUT strictly:\n"
        "'PASS' -> If code is pragmatic.\n"
        "'FLAG: <Reason>' -> If over-engineered."
    )
    
    response = llm.invoke([
        SystemMessage(content=system_prompt), 
        SystemMessage(content=f"--- CODE ---\n{code_snippet}\n\n--- OUTPUT ---\n{sandbox_output}")
    ])
    
    content = response.content.strip()
    
    if "FLAG:" in content:
        # Penalize Trust Score for Over-engineering
        current_score = state.get("trust_score", 50)
        return {
            "red_team_flag": content,
            "trust_score": max(0, current_score - 15) # -15 Penalty
        }
        
    return {"red_team_flag": "None"}