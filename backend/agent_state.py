from typing import TypedDict, Annotated, List, Dict, Optional, Union
from langchain_core.messages import BaseMessage
import operator

class InterviewState(TypedDict):
    """
    The Shared Memory for all 6 Engines.
    """
    # History (Appended, not overwritten)
    messages: Annotated[List[BaseMessage], operator.add]
    
    # Context
    user_id: Optional[str]
    topic: str
    difficulty_level: str  # "Standard" or "Hardcore"
    
    # Trust Engine (Engine 3 & 4)
    trust_score: int       # 0-100
    elo_rating: int        
    
    # Forensics (Engine 2)
    behavioral_metrics: Dict[str, Union[float, int]]
    
    # Signals
    shadow_critique: Optional[str]
    red_team_flag: Optional[str]
    pivot_triggered: bool