# backend/negotiator.py

import os
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from typing import List, Dict

load_dotenv()

# Initialize Groq
llm = ChatGroq(
    temperature=0.7, 
    model_name="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# --- DATA MODELS ---

class NegotiationOffer(BaseModel):
    base_salary: int = Field(..., description="The cash component.")
    equity: str = Field(..., description="e.g. '0.1%' or '$50k/4yr'")
    sign_on: int = Field(..., description="One-time bonus.")
    hr_comment: str = Field(..., description="The justification given by HR.")
    hr_mood: str = Field(..., description="e.g. 'Annoyed', 'Firm', 'Flexible'")

class NegotiationCritique(BaseModel):
    tactic_detected: str = Field(..., description="e.g. 'Anchoring', 'Ultimatum', 'Appeasement'")
    mistake: str = Field(..., description="What they did wrong.")
    better_response: str = Field(..., description="What they SHOULD have said.")

# --- THE ENGINE ---

def start_negotiation_scenario(role: str, location: str):
    """Generates a 'Low-Ball' initial offer to trigger the user."""
    system_prompt = (
        f"You are a Stingy HR Manager at a Tech Company in {location}. "
        f"Role: {role}. "
        f"Goal: Create a realistic but slightly LOW initial offer to start a negotiation. "
        f"Output JSON with base_salary, equity, sign_on, hr_comment (corporate speak about 'standard bands'), and hr_mood."
    )
    
    structured_llm = llm.with_structured_output(NegotiationOffer)
    return structured_llm.invoke([SystemMessage(content=system_prompt)]).dict()

def run_negotiation_turn(history: List[Dict[str, str]], current_offer_details: Dict):
    """
    The HR Agent listens to the user and decides whether to budge.
    """
    
    # 1. THE COACH (Audit the User's move FIRST)
    # We analyze the user's last message to give immediate feedback
    last_user_msg = history[-1]['content']
    audit_prompt = (
        f"Analyze this negotiation move: '{last_user_msg}'. "
        f"Did they anchor a number? Did they sound desperate? Did they use silence? "
        f"Provide a critique."
    )
    critique_llm = llm.with_structured_output(NegotiationCritique)
    critique = critique_llm.invoke([SystemMessage(content=audit_prompt)]).dict()

    # 2. THE OPPONENT (HR Agent responds)
    # If the user pushed hard, maybe we improve the offer.
    hr_prompt = (
        f"You are a Tough HR Negotiator. Current Offer on table: {current_offer_details}. "
        f"User just said: '{last_user_msg}'. "
        f"Rules: "
        f"1. If they make a good point about market rates, improve the Base Salary slightly (+$2k-$5k). "
        f"2. If they are rude or unreasonable, HOLD FIRM. "
        f"3. Keep responses short and professional. "
        f"4. Output the NEW offer details (update numbers if needed) and your text reply."
    )
    
    # We use the same Offer model but enriched with the text reply
    class TurnResult(NegotiationOffer):
        reply_text: str

    turn_llm = llm.with_structured_output(TurnResult)
    new_state = turn_llm.invoke([SystemMessage(content=hr_prompt)]).dict()

    return {
        "new_offer": {k:v for k,v in new_state.items() if k != 'reply_text'},
        "reply": new_state['reply_text'],
        "critique": critique
    }