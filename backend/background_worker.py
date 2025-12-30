import time
import os
from dotenv import load_dotenv
from typing import List

# Import Engines
from database import db_manager
from job_fetcher import hunt_opportunities
from networking_agent import generate_cold_outreach
from kanban import add_application, Application

load_dotenv()

# --- CONFIGURATION ---
SLEEP_INTERVAL = 3600  # Run every hour (simulated)
# In production, this would be 24h or triggered by cron

def process_user_hunt(user_id: str, target_role: str, location: str, skill_gaps: List[str]):
    """
    The autonomous loop for a single user.
    1. Finds jobs.
    2. Filters for high matches (>80%).
    3. Drafts a cold email.
    4. Adds to Kanban.
    """
    print(f"--- [Shadow Hunter] Stalking jobs for User {user_id} ({target_role}) ---")
    
    # 1. Hunt
    # Note: hunt_opportunities returns a dict with 'opportunities' list
    hunt_result = hunt_opportunities(target_role, skill_gaps, location)
    
    if "error" in hunt_result:
        print(f"Error hunting for {user_id}: {hunt_result['error']}")
        return

    opportunities = hunt_result.get("opportunities", [])
    print(f"Found {len(opportunities)} raw results.")

    # 2. Analyze & Act
    for job in opportunities:
        # Only act on high-quality matches
        if job["match_score"] >= 80:
            print(f"  -> HIT: {job['role_title']} at {job['company']} (Score: {job['match_score']})")
            
            # 3. Auto-Networking (Draft the email)
            # We assume the user's name is "Candidate" for now, or fetch from DB profile
            email_draft = generate_cold_outreach(
                username="Candidate", 
                target_company=job['company'], 
                target_role="Hiring Manager", 
                job_context=job['why_good_fit']
            )
            
            # 4. Add to Kanban (The "Proactive" Step)
            # We use the existing 'add_application' function but with a special status
            new_app = Application(
                role_title=job['role_title'],
                company_name=job['company'],
                status="AI Recommended", # Special status for UI to highlight
                salary_range="Unknown",
                notes=(
                    f"Match Score: {job['match_score']}/100.\n"
                    f"Why: {job['why_good_fit']}\n"
                    f"Caution: {job['cautionary_warning'] or 'None'}\n\n"
                    f"--- DRAFT EMAIL ---\nSubject: {email_draft.get('subject_line')}\n\n{email_draft.get('email_body')}"
                )
            )
            
            # Verify DB connection before write
            if db_manager.enabled:
                # We manually inject user_id since add_application expects it from Depends() usually
                # Here we are the backend system, so we bypass Depends
                app_dict = new_app.dict()
                app_dict["user_id"] = user_id
                
                try:
                    db_manager.supabase.table("applications").insert(app_dict).execute()
                    print(f"     [+] Added to Kanban Board.")
                except Exception as e:
                    print(f"     [-] DB Error: {e}")
            else:
                print("     [!] DB Offline. Skipping save.")

def main_loop():
    """
    Simulates the background worker process.
    """
    print("--- [System] Background Worker Started. Press Ctrl+C to stop. ---")
    
    while True:
        # 1. Fetch Active Users
        # In a real app, select distinct users from 'preferences' table.
        # Here, we simulate 1 active user for demonstration.
        active_users = [
            {
                "id": "dev-user-id",
                "role": "Full Stack Engineer",
                "location": "Remote",
                "gaps": ["Kubernetes", "GraphQL"]
            }
        ]
        
        # 2. Process Batch
        for user in active_users:
            process_user_hunt(
                user_id=user['id'],
                target_role=user['role'],
                location=user['location'],
                skill_gaps=user['gaps']
            )
            
        # 3. Sleep
        print(f"--- [System] Sleeping for {SLEEP_INTERVAL}s... ---")
        time.sleep(SLEEP_INTERVAL)

if __name__ == "__main__":
    main_loop()