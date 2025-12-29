import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from typing import List

# Import existing OCR tool to reuse logic
from resume_parser import extract_text_with_ocr

load_dotenv()

llm = ChatGroq(
    temperature=0.2, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# --- STRUCTURED OUTPUT ---

class TailoredSection(BaseModel):
    section_name: str = Field(..., description="e.g., 'Professional Summary' or 'Work Experience'")
    original_content: str
    tailored_content: str = Field(..., description="The rewritten version optimized for the JD.")
    reasoning: str = Field(..., description="Why this change increases the chance of an interview.")

class TailoredResume(BaseModel):
    job_role_analysis: str = Field(..., description="Brief analysis of what the company *really* wants.")
    sections: List[TailoredSection]
    email_cover_letter_draft: str = Field(..., description="A short, punchy email to the recruiter.")

# --- THE ENGINE ---

def tailor_resume(resume_file_path: str, job_description: str):
    """
    The 'Chameleon' Engine.
    1. Reads the candidate's static PDF.
    2. Reads the Target Job Description.
    3. Rewrites the candidate's story to fit the role.
    """
    
    # 1. Extract Text from PDF (Reusing your robust OCR airlock)
    print(f"--- [Tailor] Reading Resume from {resume_file_path} ---")
    current_resume_text = extract_text_with_ocr(resume_file_path)
    
    if not current_resume_text:
        return {"error": "Failed to read resume file."}

    # 2. The 'Ghostwriter' Prompt
    system_prompt = (
        f"You are a Top-Tier Career Coach and Resume Writer. "
        f"Your Goal: Tailor a candidate's resume for a SPECIFIC Job Description (JD). "
        f"Rules: "
        f"1. Do NOT invent skills the user doesn't have (Integrity First). "
        f"2. DO rephrase existing experience to match the JD's keywords and 'Vibe'. "
        f"3. If the JD mentions 'Scalability' and the user has 'Optimized DB', rewrite it to emphasize the scale. "
        f"4. Generate a 'Cold Email' cover letter that is short and human (not robotic)."
    )

    structured_llm = llm.with_structured_output(TailoredResume)

    try:
        print(f"--- [Tailor] rewriting for JD length: {len(job_description)} chars ---")
        tailored_data = structured_llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"TARGET JOB DESCRIPTION:\n{job_description}\n\nCURRENT RESUME:\n{current_resume_text}")
        ])
        return tailored_data.dict()

    except Exception as e:
        print(f"Tailoring Error: {e}")
        return {"error": str(e)}

# --- TEST BLOCK ---
if __name__ == "__main__":
    # You need a dummy PDF named 'test_resume.pdf' to run this locally
    pass