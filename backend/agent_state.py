from typing import TypedDict, Annotated, List, Union
from langchain_core.messages import BaseMessage
import operator

class InterviewState(TypedDict):
    """
    The shared memory of the AI Interview Team.
    """
    # The conversation history (Standard Chat Log)
    # operator.add ensures new messages are appended, not overwritten
    messages: Annotated[List[BaseMessage], operator.add]
    
    # The specific question currently being asked
    current_question: str
    
    # The Shadow Auditor's secret analysis of the user's last answer
    shadow_critique: str
    
    # The current difficulty level (1-100) - The "Elo" Score
    difficulty_level: int
    
    # Status flags
    interview_status: str  # 'active', 'finished', 'failed'
    topic: str             # e.g., "Python", "React", "System Design"