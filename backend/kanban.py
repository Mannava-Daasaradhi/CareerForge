# backend/kanban.py
from pydantic import BaseModel
from typing import Optional, List
from database import db_manager

class Application(BaseModel):
    role_title: str
    company_name: str
    status: str = "Wishlist"
    salary_range: Optional[str] = "Unknown"
    notes: Optional[str] = ""

def add_application(app: Application):
    if not db_manager.enabled:
        return {"error": "Database offline"}
    try:
        data = db_manager.supabase.table("applications").insert(app.dict()).execute()
        return data.data
    except Exception as e:
        return {"error": str(e)}

def get_applications():
    if not db_manager.enabled:
        return [] # Return empty list if offline
    try:
        data = db_manager.supabase.table("applications").select("*").execute()
        return data.data
    except Exception as e:
        return []

def update_status(app_id: str, new_status: str):
    if not db_manager.enabled: return
    db_manager.supabase.table("applications").update({"status": new_status}).eq("id", app_id).execute()