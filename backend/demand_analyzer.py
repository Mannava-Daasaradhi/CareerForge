import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from typing import List

load_dotenv()

# Initialize Groq (Llama 3.3 70B)
llm = ChatGroq(
    temperature=0.2, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# Initialize Search Tool (Zero-Cost Web Search)
search_tool = DuckDuckGoSearchRun()

# --- STRUCTURED OUTPUT ---
class SkillTrend(BaseModel):
    skill_name: str
    sentiment: str = Field(..., description="'Rising', 'Stable', 'Declining', or 'Saturated'")
    evidence: str = Field(..., description="Brief reason e.g., 'High volume of recent layoffs mentions'")

class MarketPulse(BaseModel):
    role: str
    demand_score: int = Field(..., description="0-100 score of how 'hot' this role is right now.")
    saturation_warning: bool = Field(..., description="True if entry-level market is flooded.")
    key_trends: List[SkillTrend]
    salary_range_insight: str

# --- THE ENGINE ---

def analyze_market_demand(target_role: str, location: str = "Remote"):
    """
    The 'Sniper' Engine.
    1. Searches the live web for recent hiring trends (Last 30 days implied by search ranking).
    2. Uses Llama 3 to synthesize a 'Market Pulse' report.
    """
    print(f"--- [Sniper] Scanning Market for: {target_role} ({location}) ---")
    
    # 1. Perform Live Searches
    queries = [
        f"{target_role} job market trends 2024 2025",
        f"{target_role} entry level saturation reddit", # Reddit is great for "real" sentiment
        f"technologies replacing {target_role} skills",
        f"{target_role} salary trends {location} recent"
    ]
    
    search_context = ""
    try:
        for q in queries:
            result = search_tool.invoke(q)
            search_context += f"\nQuery: {q}\nResult: {result}\n"
    except Exception as e:
        print(f"Search Tool Error: {e}")
        return {"error": "Market data unavailable (Search rate limit)."}

    # 2. Synthesize with LLM
    system_prompt = (
        f"You are a Senior Career Strategist analyzing the REAL-TIME job market. "
        f"Target Role: {target_role}. Location: {location}. "
        f"Input Data: Live web search snippets provided below. "
        f"Task: "
        f"1. Ignore generic fluff. Look for signals of 'Saturation' (too many juniors) or 'Desperation' (companies can't find seniors). "
        f"2. Identify which skills are 'Rising' (e.g., AI/Agents) vs 'Declining'. "
        f"3. Output a brutally honest assessment."
    )

    structured_llm = llm.with_structured_output(MarketPulse)

    try:
        market_report = structured_llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Analyze this market data:\n{search_context}")
        ])
        return market_report.dict()
        
    except Exception as e:
        print(f"Market Analysis Failed: {e}")
        return {"error": str(e)}

# --- TEST BLOCK ---
if __name__ == "__main__":
    # Test: Is "Junior Frontend Developer" dead?
    report = analyze_market_demand("Junior React Developer")
    import json
    print(json.dumps(report, indent=2))