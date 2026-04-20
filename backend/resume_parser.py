# backend/resume_parser.py — COMPLETE FIXED VERSION
# Changes from original:
#   1. analyze_resume() now ALWAYS returns a dict — was returning str on success, dict on error
#      which caused callers (main.py route handlers) to break on attribute access
#   2. All print() replaced with logger
#   3. Return type hint added

import os
import tempfile
from typing import Optional
from logger import get_logger

logger = get_logger(__name__)


def analyze_resume(file_path: str) -> dict:
    """
    Parses a PDF resume and returns structured analysis.

    Always returns a dict with keys:
        raw_text: str           — extracted text (may be empty on failure)
        analysis: str           — LLM analysis of skills/experience
        skills_detected: list   — extracted skill keywords
        error: str | None       — error message if something went wrong

    Previously returned str on success and dict on error, which broke callers.
    """
    raw_text = _extract_text(file_path)

    if not raw_text or len(raw_text.strip()) < 50:
        logger.warning("Resume extraction yielded insufficient text (len=%d)", len(raw_text or ""))
        return {
            "raw_text": raw_text or "",
            "analysis": "",
            "skills_detected": [],
            "error": "Could not extract readable text from this PDF. Try a text-based PDF rather than a scanned image, or ensure the file is not corrupted."
        }

    # Truncate to avoid hitting token limits
    truncated_text = raw_text[:20000]

    analysis_text = _run_llm_analysis(truncated_text)
    skills = _extract_skills(truncated_text)

    return {
        "raw_text": truncated_text,
        "analysis": analysis_text,      # ← FIX: was returned as bare str, now inside dict
        "skills_detected": skills,
        "error": None
    }


def _extract_text(file_path: str) -> str:
    """
    Two-pass extraction: OCR first (pdf2image + tesseract), fall back to pypdf.
    Returns raw text string.
    """
    # Pass 1: OCR via pdf2image + pytesseract
    try:
        from pdf2image import convert_from_path
        import pytesseract

        logger.info("Attempting OCR extraction for: %s", file_path)
        pages = convert_from_path(file_path, dpi=200)
        ocr_text = ""
        for page in pages:
            ocr_text += pytesseract.image_to_string(page)

        if len(ocr_text.strip()) > 100:
            logger.info("OCR extraction succeeded (%d chars)", len(ocr_text))
            return ocr_text

        logger.info("OCR yielded little text, falling back to pypdf")
    except Exception as e:
        logger.warning("OCR extraction failed: %s — falling back to pypdf", str(e))

    # Pass 2: Direct text extraction via pypdf
    try:
        from pypdf import PdfReader

        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        logger.info("pypdf extraction succeeded (%d chars)", len(text))
        return text
    except Exception as e:
        logger.error("pypdf extraction also failed: %s", str(e))
        return ""


def _run_llm_analysis(text: str) -> str:
    """Runs Groq LLM analysis on extracted resume text."""
    try:
        from groq import Groq

        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""Analyze this resume and provide:
1. A summary of the candidate's experience level (junior/mid/senior)
2. Key technical skills identified
3. Strongest areas
4. Potential gaps or weaknesses
5. Overall assessment in 2-3 sentences

Resume text:
{text}"""
            }],
            temperature=0.3,
            max_tokens=800,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error("LLM analysis failed: %s", str(e))
        return "Analysis unavailable — LLM call failed. Check GROQ_API_KEY."


def _extract_skills(text: str) -> list:
    """
    Simple keyword-based skill extraction.
    Returns a deduplicated list of detected technology keywords.
    """
    skill_keywords = [
        "Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C++", "C#",
        "React", "Next.js", "Vue", "Angular", "Node.js", "FastAPI", "Django", "Flask",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "Elasticsearch",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
        "LangChain", "LangGraph", "PyTorch", "TensorFlow", "scikit-learn",
        "Git", "CI/CD", "GitHub Actions", "REST", "GraphQL", "gRPC",
        "Linux", "Bash", "PowerShell",
    ]

    text_lower = text.lower()
    detected = [skill for skill in skill_keywords if skill.lower() in text_lower]
    return list(dict.fromkeys(detected))  # deduplicate while preserving order
