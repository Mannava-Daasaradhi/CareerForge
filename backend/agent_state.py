# FILE: backend/agent_state.py
from typing import TypedDict, Annotated, List, Dict, Optional, Union
from langchain_core.messages import BaseMessage
import operator

class InterviewState(TypedDict):
    """
    The 'Trust-Based' Memory Structure.
    Matches Database Schema Strategy (Section 5 of CareerForge Doc).
    """
    # --- Conversation History ---
    # 'operator.add' ensures new messages append to history, not overwrite it.
    messages: Annotated[List[BaseMessage], operator.add]
    
    # --- Context & Meta ---
    user_id: str
    topic: str
    difficulty_level: str  # "Standard" (>70 score) or "Hardcore" (<70 score) [cite: 30]
    
    # --- The "Trust" Metrics (Engine 3 & 4) ---
    trust_score: int       # 0-100 (Starts at 50) [cite: 55]
    elo_rating: int        # 1-100 skill rating [cite: 55]
    
    # --- Forensics Data (Engine 2) ---
    # Data sent from Frontend (Keystrokes, TTR) [cite: 36]
    # Example: {'avg_ttr': 2.5, 'keystroke_velocity': 120, 'paste_count': 0}
    behavioral_metrics: Dict[str, Union[float, int]]
    
    # --- Agent Signals ---
    shadow_critique: Optional[str]        # From Shadow Auditor [cite: 13]
    red_team_flag: Optional[str]          # From Red Team ("Over-Engineering") [cite: 14]
    pivot_triggered: bool                 # True if Pivot Agent interrupts [cite: 37]
    
    # --- Persistence ---
    verified_skills: List[str]            # For W3C Credential [cite: 49]
    resume_text: Optional[str]            # For Sentinel checks
    linkedin_text: Optional[str]          # For Sentinel checks