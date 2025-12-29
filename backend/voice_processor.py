import os
import io
from dotenv import load_dotenv
from groq import Groq
from typing import Dict, Any

load_dotenv()

# Initialize Groq Client
# We use Groq for both Llama (Reasoning) and Whisper (Hearing)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class VoiceProcessor:
    def __init__(self):
        self.filler_words = ["um", "uh", "like", "you know", "basically", "actually", "sort of"]
        self.hedge_words = ["maybe", "i guess", "probably", "i think", "not sure"]

    def analyze_confidence_text(self, text: str) -> Dict[str, Any]:
        """
        FORENSIC ANALYSIS:
        Analyzes the *transcribed* text for verbal ticks that indicate anxiety.
        """
        words = text.lower().split()
        word_count = len(words)
        if word_count == 0:
            return {"confidence_score": 0, "clarity_score": 0}

        # 1. Stutter/Filler Index
        filler_count = sum(1 for w in words if w in self.filler_words)
        filler_density = filler_count / word_count
        
        # 2. Hedging Index (Lack of conviction)
        hedge_count = sum(1 for w in words if w in self.hedge_words)
        
        # 3. Calculate Scores (0-100)
        # Higher filler density = Lower Clarity
        clarity_score = max(0, 100 - int(filler_density * 500)) 
        
        # Higher hedging = Lower Confidence
        confidence_base = 100
        confidence_base -= (hedge_count * 5)
        confidence_base -= (filler_count * 2)
        confidence_score = max(0, confidence_base)

        return {
            "clarity_score": clarity_score,
            "confidence_score": confidence_score,
            "detected_fillers": filler_count,
            "detected_hedging": hedge_count
        }

    def process_audio(self, audio_file_bytes: bytes, filename: str = "input.m4a") -> Dict[str, Any]:
        """
        1. Transcribes Audio (Groq Whisper).
        2. Performs Vibe Check.
        """
        try:
            # Groq API expects a file-like object with a name
            # We wrap the bytes in BytesIO
            audio_stream = io.BytesIO(audio_file_bytes)
            audio_stream.name = filename 

            # 1. Transcribe via Groq (Whisper-Large-V3 is free & fast)
            print("--- [Voice Engine] Transcribing Audio... ---")
            transcription = client.audio.transcriptions.create(
                file=(filename, audio_file_bytes),
                model="whisper-large-v3",
                prompt="The speaker is a software engineer in a technical interview. Expect technical jargon.",
                response_format="json",
                language="en",
                temperature=0.0
            )
            
            raw_text = transcription.text
            
            # 2. Analyze the 'Vibe'
            metrics = self.analyze_confidence_text(raw_text)
            
            # 3. Return Combined Packet
            return {
                "text": raw_text,
                "metrics": metrics,
                "status": "success"
            }

        except Exception as e:
            print(f"Voice Processing Error: {e}")
            return {
                "text": "",
                "metrics": {},
                "status": "error",
                "error_msg": str(e)
            }

# --- TEST BLOCK ---
if __name__ == "__main__":
    # To test this, you would need a real .m4a or .wav file in the directory.
    # This is a mock interaction to show logic flow.
    processor = VoiceProcessor()
    
    # Mocking a "Nervous Candidate" transcript
    mock_input = "Um, I think maybe we could use, uh, use a HashMap? Basically it's faster, I guess."
    
    print(f"Analyzing Mock Input: '{mock_input}'")
    metrics = processor.analyze_confidence_text(mock_input)
    
    import json
    print(json.dumps(metrics, indent=2))
    
    if metrics['confidence_score'] < 70:
        print(">>> TRIGGER: Interviewer should ask candidate to take a deep breath.")