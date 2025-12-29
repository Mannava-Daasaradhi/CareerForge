import pdfplumber
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

# Initialize Groq (Llama 3.3)
llm = ChatGroq(
    temperature=0.0, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def extract_text_from_pdf(file_path):
    """
    Raw extraction of text from a PDF file.
    """
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text

def analyze_resume(file_path: str, target_role: str = "Software Engineer"):
    """
    1. Extracts text.
    2. TRUNCATES it to 10,000 chars (approx 2.5k tokens) to prevent API crashes.
    3. Sends it to AI to grade against the Target Role.
    """
    resume_text = extract_text_from_pdf(file_path)
    
    # --- CRITICAL FIX: Limit text size for API ---
    # 10,000 characters is plenty for a 2-page resume.
    if len(resume_text) > 10000:
        resume_text = resume_text[:10000] + "\n...[TRUNCATED DUE TO LENGTH]..."
    # ---------------------------------------------
    
    # AI Prompt
    system_prompt = (
        f"You are an expert ATS (Applicant Tracking System) Auditor. "
        f"Target Role: {target_role}.\n"
        f"Analyze the following resume text. "
        f"Output a JSON-like summary with: "
        f"1. 'match_score' (0-100). "
        f"2. 'missing_keywords' (list). "
        f"3. 'verdict' (Pass/Fail). "
        f"Keep it strict."
    )
    
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=resume_text)
    ])
    
    return response.content