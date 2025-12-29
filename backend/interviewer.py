import os
from dotenv import load_dotenv

# LOAD ENV FIRST
load_dotenv()

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from agent_state import InterviewState

# Initialize the Groq Model (Llama 3.3 70B)
llm = ChatGroq(
    temperature=0.7, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def lead_interviewer_node(state: InterviewState):
    """
    The Lead Interviewer Node:
    1. Looks at the chat history AND the Shadow Auditor's critique.
    2. Generates the next question.
    """
    topic = state.get("topic", "General Engineering")
    difficulty = state.get("difficulty_level", 50)
    messages = state.get("messages", [])
    
    # 1. Extract Secret Feedback (The "Whisper" in the ear)
    critique = state.get("shadow_critique", "")
    
    # 2. Define the Persona
    base_prompt = (
        f"You are a Senior Technical Interviewer for a high-stakes role."
        f"Topic: {topic}. Current Difficulty: {difficulty}/100.\n"
        f"Your Goal: Assess the candidate's depth. Do NOT give away answers."
        f"Keep your questions concise (under 2 sentences)."
    )
    
    # 3. Dynamic Prompt Injection
    # If the Shadow Auditor flagged something, the Interviewer MUST attack it.
    if critique and critique != "None":
        base_prompt += (
            f"\n\n[URGENT FEEDBACK FROM AUDITOR]: The candidate's last answer had issues: '{critique}'. "
            f"Do NOT let this slide. Ask a sharp follow-up question exposing this specific weakness."
        )
        
    # Check if the last message was a Sandbox Failure (SystemMessage)
    if messages and isinstance(messages[-1], SystemMessage) and "SYSTEM_SANDBOX_OUTPUT" in messages[-1].content:
        base_prompt += (
            f"\n\n[OBSERVATION]: The candidate wrote code, and we ran it. "
            f"Analyze the 'SYSTEM_SANDBOX_OUTPUT' in the chat history. "
            f"If it failed/errored, ask them to explain the bug. If it passed, ask about edge cases."
        )

    if not messages:
        intro_msg = f"Hello. I see you're applying for a role involving {topic}. Let's jump straight in. Ready?"
        return {"messages": [HumanMessage(content=intro_msg)]}

    # Construct full context
    conversation = [SystemMessage(content=base_prompt)] + messages
    
    # Generate Response
    response = llm.invoke(conversation)
    
    return {"messages": [response]}