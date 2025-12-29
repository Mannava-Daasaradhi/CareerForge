from typing import TypedDict, Annotated, List, Union, Optional
from langchain_core.messages import BaseMessage
import operator

class InterviewState(TypedDict):
    """
    The Shared Memory of the Interview Graph.
    Now includes 'Burnout Tracking'.
    """
    messages: Annotated[List[BaseMessage], operator.add]
    topic: str
    difficulty_level: int
    
    # Analysis Artifacts
    shadow_critique: Optional[str]
    code_output: Optional[str] # Output from the Sandbox
    
    # Safety & Logic Counters
    step_count: int
    consecutive_failures: int # Tracks how many times code/logic failed in a row
    is_burnout_risk: bool # Flag if we should switch to 'Therapist Mode'