import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from typing import List

load_dotenv()

# Initialize Groq (Llama 3.3 70B)
# We use Llama 3.3 because it is excellent at following complex JSON schemas.
llm = ChatGroq(
    temperature=0.3, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# --- STRUCTURED OUTPUT DEFINITIONS ---
# We force the LLM to return data we can render on a Gantt chart.

class DailyTask(BaseModel):
    day_title: str = Field(..., description="Short title, e.g., 'Mastering Decorators'")
    task_description: str = Field(..., description="Actionable instruction.")
    resource_link: str = Field(..., description="A specific URL (Doc or Tutorial).")
    estimated_hours: int = Field(..., description="Time required.")

class WeeklyMilestone(BaseModel):
    week_number: int
    theme: str = Field(..., description="Main focus, e.g., 'Advanced Concurrency'")
    goal: str = Field(..., description="The 'Exam' they must pass at end of week.")
    daily_plan: List[DailyTask]

class CareerRoadmap(BaseModel):
    candidate_level: str = Field(..., description="Junior, Mid, or Senior based on analysis")
    total_weeks: int
    roadmap: List[WeeklyMilestone]

# --- THE ENGINE ---

def generate_learning_roadmap(skill_gaps: List[str], target_role: str = "Full Stack Engineer"):
    """
    The 'Ghost Tech Lead' Engine.
    Takes a list of failures (e.g., ['SQL Injection', 'React Hooks'])
    and generates a strict recovery plan.
    """
    
    if not skill_gaps:
        return {"message": "No significant skill gaps detected. You are ready for the interview!"}

    system_prompt = (
        f"You are a Senior Engineering Manager creating a Performance Improvement Plan (PIP). "
        f"The candidate is aiming for: {target_role}. "
        f"They FAILED assessments in the following areas: {', '.join(skill_gaps)}. "
        f"Your Goal: Create a brutal but effective study schedule to fix these gaps. "
        f"Rules: "
        f"1. Be specific (Don't say 'Learn SQL', say 'Practice Recursive CTEs'). "
        f"2. Include real resources (Official Docs, reputable blogs). "
        f"3. Structure it by Week."
    )

    # We use .with_structured_output to guarantee JSON for the frontend
    structured_llm = llm.with_structured_output(CareerRoadmap)

    try:
        print(f"--- [Ghost Tech Lead] Generating Roadmap for: {skill_gaps} ---")
        roadmap = structured_llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content="Generate my recovery plan.")
        ])
        return roadmap.dict()
        
    except Exception as e:
        print(f"Roadmap Generation Error: {e}")
        return {"error": str(e)}

# --- TEST BLOCK ---
if __name__ == "__main__":
    # Simulate a user who failed Python Memory Management and SQL
    test_gaps = ["Python Garbage Collection", "PostgreSQL Indexing", "System Design Caching"]
    plan = generate_learning_roadmap(test_gaps, "Backend Engineer")
    import json
    print(json.dumps(plan, indent=2))