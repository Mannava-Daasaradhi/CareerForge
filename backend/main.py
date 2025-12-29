from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# 1. Load Environment Variables (Securely loads .env)
load_dotenv()

# 2. Initialize the App
app = FastAPI(
    title="CareerForge API",
    description="The Trust-Based Agentic Career OS Backend",
    version="0.1.0"
)

# 3. CORS Configuration (Allows Frontend to talk to Backend)
# In production, replace "*" with your actual frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Health Check Route (To verify server is alive)
@app.get("/")
async def health_check():
    return {
        "status": "active", 
        "system": "CareerForge Core",
        "version": "Pre-Alpha"
    }

# 5. Placeholder for future Agent Routes
@app.get("/api/test-secure-ingestion")
async def test_ingestion():
    # This will eventually trigger the "Airlock" engine
    return {"message": "Ingestion Engine is ready for implementation"}

if __name__ == "__main__":
    import uvicorn
    # Runs the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)