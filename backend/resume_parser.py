import os
import pytesseract
from pdf2image import convert_from_path
from pypdf import PdfReader
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

# Initialize Groq (Llama 3.3 70B)
llm = ChatGroq(
    temperature=0.0, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def extract_text_with_pypdf(file_path):
    """
    FALLBACK LAYER: Pure Python Extraction
    Used if Tesseract/OCR is not installed on the host machine.
    """
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"PyPDF Error: {e}")
        return ""

def extract_text_with_ocr(file_path):
    """
    SECURITY LAYER: The 'Airlock'
    1. Converts PDF pages to high-res images (Rasterization).
    2. Uses OCR (Tesseract) to read the text from the pixels.
    """
    try:
        # Check if we can even run this (avoids crashing if tools are missing)
        images = convert_from_path(file_path)
        
        full_text = ""
        for i, image in enumerate(images):
            text = pytesseract.image_to_string(image)
            full_text += f"\n--- Page {i+1} ---\n{text}"
            
        return full_text
    except Exception as e:
        print(f"OCR Error (System tools likely missing): {e}")
        return ""

def analyze_resume(file_path: str, target_role: str = "Software Engineer"):
    """
    1. Tries Secure OCR first.
    2. Falls back to standard PyPDF if OCR fails.
    3. Sends to AI.
    """
    print(f"--- [Resume Parser] Processing: {file_path} ---")
    
    # 1. Try OCR (Best for security/images)
    resume_text = extract_text_with_ocr(file_path)
    
    # 2. Fallback to PyPDF (Best for compatibility)
    if not resume_text or len(resume_text.strip()) < 50:
        print("--- [Resume Parser] OCR failed or empty. Switching to PyPDF fallback. ---")
        resume_text = extract_text_with_pypdf(file_path)

    if not resume_text or len(resume_text.strip()) < 10:
        return {
            "match_score": 0, 
            "verdict": "Fail", 
            "error": "Could not read resume. File might be empty or encrypted."
        }

    # 3. Length Guard
    if len(resume_text) > 20000:
        resume_text = resume_text[:20000] + "\n...[TRUNCATED]..."
    
    # 4. AI Analysis
    system_prompt = (
        f"You are an expert ATS (Applicant Tracking System) Auditor. "
        f"Target Role: {target_role}.\n"
        f"Analyze the following RESUME TEXT. "
        f"Output a JSON-like summary with these exact keys: "
        f"1. 'match_score' (0-100). "
        f"2. 'missing_keywords' (list). "
        f"3. 'verdict' (Pass/Fail). "
        f"4. 'red_flags' (e.g., vague timelines, filler words). "
        f"5. 'summary' (One sentence opinion). "
        f"Keep it strict."
    )
    
    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=resume_text)
        ])
        return response.content
    except Exception as e:
        return {"error": f"AI Inference Failed: {str(e)}"}