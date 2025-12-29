import os
from dotenv import load_dotenv

# LOAD ENV FIRST (Critical Fix)
load_dotenv()

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from agent_state import InterviewState

# Initialize the Groq Model (Llama 3.3 70B)
# Now the key will be visible because we loaded the .env above
llm = ChatGroq(
    temperature=0.7, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def lead_interviewer_node(state: InterviewState):
    """
    The Lead Interviewer Node:
    1. Looks at the chat history.
    2. Generates the next question based on the topic and difficulty.
    """
    topic = state.get("topic", "General Engineering")
    difficulty = state.get("difficulty_level", 50)
    messages = state.get("messages", [])
    
    # Define the Persona
    system_prompt = (
        f"You are a Senior Technical Interviewer for a high-stakes role."
        f"Topic: {topic}. Current Difficulty: {difficulty}/100.\n"
        f"Your Goal: Assess the candidate's depth. Do NOT give away answers."
        f"If the user's last answer was vague, ask a follow-up digging deeper."
        f"Keep your questions concise (under 2 sentences)."
    )
    
    if not messages:
        intro_msg = f"Hello. I see you're applying for a role involving {topic}. Let's jump straight in. Ready?"
        return {"messages": [HumanMessage(content=intro_msg)]}

    conversation = [SystemMessage(content=system_prompt)] + messages
    response = llm.invoke(conversation)
    
    return {"messages": [response]}