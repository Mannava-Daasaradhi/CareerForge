import os
import requests
import re
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage
from agent_state import InterviewState

load_dotenv()

# Use the Piston public API or your self-hosted instance
# Default: https://emkc.org/api/v2/piston
PISTON_BASE_URL = os.getenv("PISTON_API_URL", "https://emkc.org/api/v2/piston")

def execute_code(language: str, code: str):
    """
    Executes code via Piston API (Sandboxed).
    Endpoint: POST /api/v2/piston/execute
    """
    url = f"{PISTON_BASE_URL.rstrip('/')}/execute"
    
    # Map friendly names to Piston runtimes
    lang_map = {
        "py": "python",
        "python": "python",
        "js": "javascript",
        "javascript": "javascript",
        "ts": "typescript",
        "typescript": "typescript",
        "go": "go",
        "rust": "rust",
        "java": "java",
        "c": "c",
        "cpp": "c++"
    }
    
    target_lang = lang_map.get(language.lower(), language.lower())
    
    payload = {
        "language": target_lang,
        "version": "*", # Use latest available version
        "files": [{"content": code}]
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        
        # Parse Piston Output
        if "run" in result:
            output = result["run"].get("output", "")
            stderr = result["run"].get("stderr", "")
            # Combine stdout and stderr
            full_out = output
            if stderr:
                full_out += f"\n[STDERR]\n{stderr}"
            return full_out.strip()
        
        return "No output returned from Sandbox."
        
    except Exception as e:
        return f"Sandbox Execution Failed: {str(e)}"

def code_execution_node(state: InterviewState):
    """
    LangGraph Node:
    1. Scans the last USER message for Markdown code blocks.
    2. If found, executes them in the Piston Sandbox.
    3. Appends the output to the chat history as a SystemMessage.
    """
    messages = state.get("messages", [])
    if not messages:
        return {}
    
    last_msg = messages[-1]
    
    # Only execute if the *User* provided the code
    if not isinstance(last_msg, HumanMessage):
        return {}

    content = last_msg.content
    
    # Regex to capture content inside ```lang ... ```
    # Example matches: ```python\nprint('hello')\n```
    pattern = r"```(\w+)\s*\n(.*?)```"
    matches = re.findall(pattern, content, re.DOTALL)
    
    if not matches:
        return {}
        
    outputs = []
    for lang, code in matches:
        print(f"--- [Sandbox] Executing {lang} code... ---")
        out = execute_code(lang, code)
        outputs.append(f"Code ({lang}) Execution Result:\n{out}")
        
    if outputs:
        final_output = "\n\n".join(outputs)
        # Return a SystemMessage so the Lead Interviewer (AI) sees the result
        return {"messages": [SystemMessage(content=f"SYSTEM_SANDBOX_OUTPUT:\n{final_output}")]}
    
    return {}