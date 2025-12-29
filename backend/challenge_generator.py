import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from typing import List

load_dotenv()

# Initialize Groq (Llama 3.3 70B)
llm = ChatGroq(
    temperature=0.7, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# --- STRUCTURED OUTPUT ---
class TestCase(BaseModel):
    input_val: str = Field(..., description="Input to pass to the function")
    expected_output: str = Field(..., description="The required return value")

class CursedChallenge(BaseModel):
    title: str = Field(..., description="e.g., 'The Async Deadlock'")
    scenario: str = Field(..., description="Context: 'You are maintaining a legacy payment system...'")
    broken_code: str = Field(..., description="The Python code containing the bug")
    constraint: str = Field(..., description="e.g., 'Do NOT use time.sleep()'")
    test_cases: List[TestCase] = Field(..., description="Hidden tests to verify the fix")
    solution_summary: str = Field(..., description="Brief explanation of the correct fix")

# --- THE ENGINE ---

def generate_challenge(topic: str, difficulty: int):
    """
    The 'Cursed' Content Engine.
    Generates a broken code snippet that the user must fix.
    """
    print(f"--- [Challenge Generator] Crafting '{topic}' puzzle (Diff: {difficulty}) ---")
    
    system_prompt = (
        f"You are a Senior Principal Engineer conducting a technical screen. "
        f"Topic: {topic}. Difficulty: {difficulty}/100. "
        f"Task: Create a 'Cursed' Coding Challenge. "
        f"1. Generate a Python function that HAS A BUG (Logic error, performance issue, or crash). "
        f"2. The bug must be subtle (not a syntax error). "
        f"3. Provide strict constraints."
    )

    structured_llm = llm.with_structured_output(CursedChallenge)

    try:
        challenge = structured_llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content="Generate the challenge now.")
        ])
        return challenge.dict()
        
    except Exception as e:
        print(f"Challenge Gen Failed: {e}")
        # Fallback for demo purposes if LLM fails
        return {
            "title": "The Recursive Trap (Fallback)",
            "scenario": "Fix the infinite recursion.",
            "broken_code": "def factorial(n):\n    return n * factorial(n-1)",
            "constraint": "Handle base cases.",
            "test_cases": [],
            "solution_summary": "Add if n == 0 return 1"
        }

# --- TEST BLOCK ---
if __name__ == "__main__":
    # Test generation
    c = generate_challenge("Python Generators", 75)
    import json
    print(json.dumps(c, indent=2))