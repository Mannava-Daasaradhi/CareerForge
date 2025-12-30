# backend/ab_tester.py

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from resume_parser import analyze_resume # Reusing your existing parser

load_dotenv()

llm = ChatGroq(
    temperature=0.4, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

class ResumeVariant(BaseModel):
    variant_name: str
    strategy_explanation: str
    tailored_content: str = Field(..., description="The full markdown/text of the new resume.")

class ABTestResult(BaseModel):
    variant_a: ResumeVariant
    variant_b: ResumeVariant
    recommendation: str

def run_ab_test(file_path: str, job_description: str):
    """
    Generates two strategic variations of a resume.
    """
    # 1. Parse Original Resume
    current_resume_content = analyze_resume(file_path)
    
    # 2. Define Strategies
    system_prompt = (
        f"You are a Career Scientist running an A/B Test on a candidate's resume. "
        f"Job Description: {job_description}. "
        f"Candidate Profile: {current_resume_content}. "
        f"\n\n"
        f"TASK: Generate two distinct versions of the resume:\n"
        f"VARIANT A (The Specialist): Focus purely on hard skills, keywords, and technical depth matching the JD. Remove fluff.\n"
        f"VARIANT B (The Generalist): Focus on soft skills, adaptability, culture fit, and potential. "
        f"\n"
        f"Finally, recommend which one fits this specific Job Description better."
    )
    
    structured_llm = llm.with_structured_output(ABTestResult)
    
    try:
        result = structured_llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content="Generate the A/B variants.")
        ])
        return result.dict()
    except Exception as e:
        return {"error": str(e)}