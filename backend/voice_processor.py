import os
import io
from dotenv import load_dotenv
from groq import Groq
from typing import Dict, Any

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class VoiceProcessor:
    def __init__(self):
        self.filler_words = ["um", "uh", "like", "you know", "basically", "actually", "sort of", "i mean"]
        self.hedge_words = ["maybe", "i guess", "probably", "i think", "not sure", "kind of"]

    def analyze_confidence_text(self, text: str) -> Dict[str, Any]:
        """Analyzes the *transcribed* text for verbal ticks."""
        words = text.lower().split()
        word_count = len(words)
        if word_count == 0:
            return {"confidence_score": 0, "clarity_score": 0, "detected_fillers": 0}

        filler_count = sum(1 for w in words if w in self.filler_words)
        hedge_count = sum(1 for w in words if w in self.hedge_words)
        
        # Calculate Scores
        clarity_score = max(0, 100 - int((filler_count / word_count) * 1000)) 
        
        confidence_base = 100
        confidence_base -= (hedge_count * 5)
        confidence_base -= (filler_count * 3)
        confidence_score = max(0, confidence_base)

        return {
            "clarity_score": clarity_score,
            "confidence_score": confidence_score,
            "detected_fillers": filler_count,
            "detected_hedging": hedge_count
        }

    def process_audio(self, audio_file_bytes: bytes, filename: str = "input.webm") -> Dict[str, Any]:
        try:
            print(f"--- [Voice Engine] Processing {len(audio_file_bytes)} bytes ({filename}) ---")
            
            # 1. Transcribe via Groq
            # We explicitly hint the model to expect technical terms
            transcription = client.audio.transcriptions.create(
                file=(filename, audio_file_bytes),
                model="whisper-large-v3",
                prompt="Technical software engineering interview. Terms: React, API, Kubernetes, SQL, Big O.",
                response_format="json",
                language="en",
                temperature=0.0
            )
            
            raw_text = transcription.text
            print(f"--- [Voice Engine] Transcribed: '{raw_text[:50]}...' ---")
            
            # 2. Analyze Vibe
            metrics = self.analyze_confidence_text(raw_text)
            
            return {
                "text": raw_text,
                "metrics": metrics,
                "status": "success"
            }

        except Exception as e:
            print(f"Voice Processing Error: {e}")
            # Fallback for dev mode if Groq fails
            return {
                "text": "Error processing audio. Please type your response.",
                "metrics": {"confidence_score": 0, "detected_fillers": 0},
                "status": "error",
                "error_msg": str(e)
            }