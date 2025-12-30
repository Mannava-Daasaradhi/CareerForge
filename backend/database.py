# backend/database.py

import os
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class DatabaseManager:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        self.enabled = False
        # Check if keys are real, not just the placeholders from .env.example
        if url and key and "your-project" not in url:
            try:
                self.supabase: Client = create_client(url, key)
                self.enabled = True
                print("DatabaseManager: Connected to Supabase (Digital Twin Storage Active).")
            except Exception as e:
                print(f"DatabaseManager: Connection failed ({e}).")
        else:
            print("DatabaseManager: No valid credentials found. Running in Stateless Mode.")

    def log_interaction(self, user_id: str, session_id: str, topic: str, user_input: str, ai_response: str, critique: str):
        """
        Persists the interview turn linked to a specific USER_ID.
        This data builds the 'Trust Ledger' used by the Recruiter Portal.
        """
        if not self.enabled:
            return
        
        # Data Payload with USER_ID linkage
        record = {
            "user_id": user_id,  # <--- CRITICAL SECURITY UPDATE
            "session_id": session_id,
            "topic": topic,
            "user_input": user_input,
            "ai_response": ai_response,
            "shadow_critique": critique,
            "created_at": datetime.utcnow().isoformat()
        }
        
        try:
            # We assume a table named 'interview_logs' exists in Supabase
            self.supabase.table("interview_logs").insert(record).execute()
        except Exception as e:
            # Don't crash the interview if logging fails
            print(f"Database Insert Error: {e}")

# Create a Singleton instance to be imported elsewhere
db_manager = DatabaseManager()