from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Import our new Auditor Logic
from auditor import GitHubAuditor

# 1. Load Environment Variables
load_dotenv()

# 2. Initialize the App
app = FastAPI(
    title="CareerForge API",
    description="The Trust-Based Agentic Career OS Backend",
    version="0.2.0"
)

# 3. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Auditor Agent
auditor_agent = GitHubAuditor()

# 4. Health Check Route
@app.get("/")
async def health_check():
    return {
        "status": "active", 
        "system": "CareerForge Core",
        "version": "Pre-Alpha"
    }

# 5. NEW: The Audit Endpoint
@app.get("/api/audit/{username}")
async def audit_user(username: str):
    """
    Scans a GitHub profile and returns a Trust Score.
    """
    print(f"Auditing user: {username}...") # Log to terminal
    result = auditor_agent.calculate_trust_score(username)
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
        
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)