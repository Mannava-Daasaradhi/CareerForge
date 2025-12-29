import os
import pytesseract
from pdf2image import convert_from_path
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

def extract_text_with_ocr(file_path):
    """
    SECURITY LAYER: The 'Airlock'
    1. Converts PDF pages to high-res images (Rasterization).
    2. Uses OCR (Tesseract) to read the text from the pixels.
    
    This destroys 'invisible' malicious text or metadata prompt injections.
    """
    try:
        # Convert PDF to list of images
        images = convert_from_path(file_path)
        
        full_text = ""
        for i, image in enumerate(images):
            # Extract text from the image
            text = pytesseract.image_to_string(image)
            full_text += f"\n--- Page {i+1} ---\n{text}"
            
        return full_text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

def analyze_resume(file_path: str, target_role: str = "Software Engineer"):
    """
    1. Sanitizes input via OCR.
    2. Sends cleaned text to AI for analysis.
    """
    # 1. Secure Extraction
    resume_text = extract_text_with_ocr(file_path)
    
    if not resume_text:
        return {"error": "Could not read resume. Ensure it is a valid PDF."}

    # 2. Length Guard (Prevents Context Overflow)
    # 15,000 chars is roughly 3-4k tokens, safe for Llama 3.3
    if len(resume_text) > 15000:
        resume_text = resume_text[:15000] + "\n...[TRUNCATED]..."
    
    # 3. AI Analysis Prompt
    system_prompt = (
        f"You are an expert ATS (Applicant Tracking System) Auditor. "
        f"Target Role: {target_role}.\n"
        f"Analyze the following RESUME TEXT (extracted via OCR). "
        f"Output a JSON-like summary with these exact keys: "
        f"1. 'match_score' (0-100). "
        f"2. 'missing_keywords' (list). "
        f"3. 'verdict' (Pass/Fail). "
        f"4. 'red_flags' (e.g., vague timelines, filler words). "
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