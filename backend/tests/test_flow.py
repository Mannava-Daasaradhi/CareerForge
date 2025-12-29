import requests
import json
import time
from datetime import datetime

# CONFIGURATION
BASE_URL = "http://localhost:8000"
RED = "\033[91m"
GREEN = "\033[92m"
CYAN = "\033[96m"
RESET = "\033[0m"

def print_status(test_name, status, detail=""):
    if status == "PASS":
        print(f"[{GREEN}PASS{RESET}] {test_name} {detail}")
    else:
        print(f"[{RED}FAIL{RESET}] {test_name} {detail}")

def test_health():
    """Verifies the API is running."""
    try:
        res = requests.get(f"{BASE_URL}/")
        if res.status_code == 200:
            print_status("System Health", "PASS", f"- {res.json()['version']}")
            return True
        else:
            print_status("System Health", "FAIL", f"(Status: {res.status_code})")
            return False
    except Exception as e:
        print_status("System Health", "FAIL", f"(Connection Refused: {e})")
        return False

def test_login_audit():
    """Simulates the Login Page 'Entropy Check'."""
    username = "torvalds"
    print(f"\n{CYAN}--- Testing Feature: LOGIN (Audit Engine) ---{RESET}")
    
    try:
        start = time.time()
        res = requests.get(f"{BASE_URL}/api/audit/{username}")
        duration = round(time.time() - start, 2)
        
        if res.status_code == 200:
            data = res.json()
            score = data.get("trust_score")
            print_status("GitHub Audit", "PASS", f"- User: {username}, Trust Score: {score}/100 ({duration}s)")
        else:
            print_status("GitHub Audit", "FAIL", f"- API Error: {res.text}")
            
    except Exception as e:
        print_status("GitHub Audit", "FAIL", str(e))

def test_dashboard_pulse():
    """Simulates the Dashboard 'Market Pulse' Widget."""
    role = "Software Engineer"
    print(f"\n{CYAN}--- Testing Feature: DASHBOARD (Sniper Engine) ---{RESET}")
    
    try:
        start = time.time()
        res = requests.get(f"{BASE_URL}/api/career/market-pulse?role={role}")
        duration = round(time.time() - start, 2)
        
        if res.status_code == 200:
            data = res.json()
            demand = data.get("demand_score")
            print_status("Market Pulse", "PASS", f"- Demand: {demand}/100 ({duration}s)")
        else:
            print_status("Market Pulse", "FAIL", f"- Status: {res.status_code}")
            
    except Exception as e:
        print_status("Market Pulse", "FAIL", str(e))

def test_roadmap_generation():
    """Simulates the 'Ghost Tech Lead' creating a plan."""
    print(f"\n{CYAN}--- Testing Feature: ROADMAP (Strategy Engine) ---{RESET}")
    
    payload = {
        "target_role": "Backend Developer",
        "skill_gaps": ["Redis", "Docker"]
    }
    
    try:
        start = time.time()
        res = requests.post(f"{BASE_URL}/api/career/roadmap", json=payload)
        duration = round(time.time() - start, 2)
        
        if res.status_code == 200:
            data = res.json()
            weeks = data.get("total_weeks")
            print_status("Roadmap Generator", "PASS", f"- Generated {weeks} week plan ({duration}s)")
        else:
            print_status("Roadmap Generator", "FAIL", f"- Status: {res.status_code}")
            
    except Exception as e:
        print_status("Roadmap Generator", "FAIL", str(e))

def test_challenge_generator():
    """Simulates the 'Cursed' Challenge Engine."""
    print(f"\n{CYAN}--- Testing Feature: CHALLENGE (Cursed Engine) ---{RESET}")
    
    payload = {"topic": "Python Async", "difficulty": 80}
    
    try:
        start = time.time()
        res = requests.post(f"{BASE_URL}/api/challenge/new", json=payload)
        duration = round(time.time() - start, 2)
        
        if res.status_code == 200:
            data = res.json()
            title = data.get("title")
            print_status("Challenge Gen", "PASS", f"- Generated: '{title}' ({duration}s)")
        else:
            print_status("Challenge Gen", "FAIL", f"- Status: {res.status_code}")
            
    except Exception as e:
        print_status("Challenge Gen", "FAIL", str(e))

def test_recruiter_proxy():
    """Simulates a Recruiter querying the Digital Twin."""
    print(f"\n{CYAN}--- Testing Feature: RECRUITER (Digital Twin) ---{RESET}")
    
    question = "Has this candidate demonstrated any skills in Python?"
    
    try:
        start = time.time()
        res = requests.post(f"{BASE_URL}/api/recruiter/ask", json={"question": question})
        duration = round(time.time() - start, 2)
        
        if res.status_code == 200:
            data = res.json()
            reply = data.get("reply", "")
            # Check if it mentions the DB status or actual content
            status = "PASS" if "Digital Twin" in reply or "Python" in reply else "WARN"
            print_status("Recruiter Proxy", status, f"- Reply length: {len(reply)} chars ({duration}s)")
            print(f"   Sample: {reply[:100]}...")
        else:
            print_status("Recruiter Proxy", "FAIL", f"- Status: {res.status_code}")
            
    except Exception as e:
        print_status("Recruiter Proxy", "FAIL", str(e))

if __name__ == "__main__":
    print(f"{CYAN}=== CAREERFORGE V3.1 INTEGRATION TEST SUITE ==={RESET}")
    if test_health():
        test_login_audit()
        test_dashboard_pulse()
        test_roadmap_generation()
        test_challenge_generator()
        test_recruiter_proxy()
    print(f"\n{CYAN}=== SUITE COMPLETE ==={RESET}")