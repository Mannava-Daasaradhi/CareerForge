# backend/test_gemini.py
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

key = os.getenv("GOOGLE_API_KEY")
print(f"Key found: {key[:5]}... (Length: {len(key) if key else 0})")

try:
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=key)
    res = llm.invoke("Say hello")
    print(f"Success! Gemini says: {res.content}")
except Exception as e:
    print(f"Error: {e}")