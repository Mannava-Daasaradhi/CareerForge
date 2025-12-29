import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from typing import List, Optional

load_dotenv()

# Reuse your existing Groq setup
llm = ChatGroq(
    temperature=0.1, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

search_tool = DuckDuckGoSearchRun()

# --- DATA MODELS ---

class JobOpportunity(BaseModel):
    role_title: str
    company: str
    match_score: int = Field(..., description="0-100 score based on user skills vs JD")
    why_good_fit: str = Field(..., description="One sentence on why they should apply.")
    cautionary_warning: Optional[str] = Field(None, description="e.g. 'Requires Kubernetes, which is currently a skill gap for you.'")
    apply_link_guess: str = Field(..., description="The URL found in search.")

class JobHuntReport(BaseModel):
    opportunities: List[JobOpportunity]
    strategic_advice: str = Field(..., description="Overall strategy, e.g., 'Target mid-size startups until you fix your SQL gap.'")

# --- THE ENGINE ---

def hunt_opportunities(target_role: str, skill_gaps: List[str], location: str = "Remote"):
    """
    The 'Opportunity Hunter' Agent.
    1. Scours the web for *fresh* job listings (last 24-48h signals).
    2. Filters out jobs that require skills the user explicitly FAILED (skill_gaps).
    """
    print(f"--- [Hunter] Stalking jobs for {target_role} in {location} ---")
    
    # 1. Search Logic (Simulated "Live" listing fetch via Search Engine)
    # In production, you would swap this for a LinkedIn/Indeed Scraper or API.
    query = f"hiring {target_role} {location} \"apply\" -intitle:senior -intitle:lead site:greenhouse.io OR site:lever.co"
    
    try:
        raw_results = search_tool.invoke(query)
    except Exception as e:
        return {"error": f"Search failed: {str(e)}"}

    # 2. The "Reality Check" Prompt
    # This makes your app UNIQUE. It doesn't just list jobs; it protects the user from rejection.
    system_prompt = (
        f"You are a Career Agent acting as a 'Bodyguard' for a candidate. "
        f"Target Role: {target_role}. "
        f"Candidate's KNOWN WEAKNESSES (Skill Gaps): {', '.join(skill_gaps)}. "
        f"Task: "
        f"1. Analyze the raw search results below to extract job openings. "
        f"2. If a job emphasizes a skill the user is BAD at (e.g., 'Must be expert in {skill_gaps[0] if skill_gaps else 'None'}'), "
        f"give it a low match score and a WARNING. "
        f"3. Prioritize jobs that fit their profile."
    )

    structured_llm = llm.with_structured_output(JobHuntReport)

    try:
        report = structured_llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Raw Search Results:\n{raw_results}")
        ])
        return report.dict()
    except Exception as e:
        print(f"Job Hunt Error: {e}")
        return {"error": str(e)}

# --- TEST BLOCK ---
if __name__ == "__main__":
    # Test: User wants 'Frontend Dev' but sucks at 'Redux'
    print(hunt_opportunities("Frontend Engineer", ["Redux", "Unit Testing"], "Remote"))