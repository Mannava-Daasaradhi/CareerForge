import os
import pytesseract
from pdf2image import convert_from_path
from langchain_core.documents import Document

# --- WINDOWS CONFIGURATION (CRITICAL FIX) ---
# We use the exact path you found in your file explorer.
# Make sure this path contains 'pdftoppm.exe'
POPPLER_PATH = r"C:\Program Files\poppler\Release-25.12.0-0\poppler-25.12.0\Library\bin"

# Standard Tesseract Path (Verify this exists too!)
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Apply Configuration if on Windows
if os.name == 'nt':
    # 1. Setup Tesseract
    if os.path.exists(TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    else:
        print(f"WARNING: Tesseract not found at {TESSERACT_PATH}")

    # 2. Setup Poppler (Just warn if missing, we pass it explicitly later)
    if not os.path.exists(POPPLER_PATH):
        print(f"WARNING: Poppler path invalid: {POPPLER_PATH}")

def analyze_resume(file_path: str):
    """
    Engine 1: The Sentinel.
    Extracts text from PDF Resumes using OCR (Tesseract) + Vision (Poppler).
    """
    text_content = ""
    
    try:
        # 1. Convert PDF to Images
        # CRITICAL: We pass the explicit path here to fix "Unable to get page count"
        images = convert_from_path(file_path, poppler_path=POPPLER_PATH if os.name == 'nt' else None)
        
        # 2. Extract Text (OCR)
        for i, image in enumerate(images):
            text = pytesseract.image_to_string(image)
            text_content += f"\n--- PAGE {i+1} ---\n{text}"
            
        print(f"--- [SENTINEL] Extracted {len(text_content)} chars ---")
        
        # 3. Simple Skill Extraction (Vibe Check)
        analysis = {
            "raw_text": text_content[:500] + "...", 
            "skills_detected": [],
            "red_flags": []
        }
        
        keywords = ["Python", "FastAPI", "React", "SQL", "Docker", "Tesseract"]
        detected = [kw for kw in keywords if kw.lower() in text_content.lower()]
        analysis["skills_detected"] = detected
        
        return analysis

    except Exception as e:
        print(f"Resume Parser Error: {e}")
        return {"error": str(e), "hint": "Check POPPLER_PATH in resume_parser.py"}