from typing import TypedDict, Annotated, List, Union
from langchain_core.messages import BaseMessage
import operator

class InterviewState(TypedDict):
    """
    The Shared Memory of the Interview Graph.
    
    Attributes:
        messages (List[BaseMessage]): The full chat history (User, AI, System).
                                      'operator.add' means new messages are appended, not overwritten.
        topic (str): The subject being interviewed (e.g., "React", "System Design").
        difficulty_level (int): 0-100 score of current question difficulty.
        shadow_critique (str): The latest critique from the Shadow Auditor node. 
                               Used by the Lead Interviewer to adjust questioning.
        step_count (int): Safety counter to prevent infinite graph loops.
    """
    messages: Annotated[List[BaseMessage], operator.add]
    topic: str
    difficulty_level: int
    shadow_critique: str
    step_count: int