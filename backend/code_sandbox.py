# FILE: backend/code_sandbox.py
import os
import requests
import re
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage
from agent_state import InterviewState
from ast_linter import lint_code_security  # <--- NEW IMPORT

load_dotenv()

PISTON_BASE_URL = os.getenv("PISTON_API_URL", "https://emkc.org/api/v2/piston")

def get_adversarial_test(language: str, topic: str) -> str:
    """
    Returns hidden test cases based on topic.
    In a real app, this would come from the 'skills_graph' database.
    """
    if language != "python": return ""
    
    # Example: If topic is "Algorithms", ensure they handle edge cases
    return """
# --- ADVERSARIAL TEST SUITE (HIDDEN) ---
try:
    print(f"Test Run: Input(0) -> {solution(0)}") 
    print(f"Test Run: Input(-1) -> {solution(-1)}")
except NameError:
    print("Error: You must define a function named 'solution'.")
except Exception as e:
    print(f"Runtime Error: {e}")
"""

def execute_code(language: str, code: str, run_tests: bool = False, topic: str = ""):
    """
    Executes code with AST Linting + Piston Sandbox + Adversarial Tests.
    """
    # 1. AST Linter (Security Layer)
    lint_result = lint_code_security(code, language)
    if not lint_result["valid"]:
        return f"[LINTER BLOCK]: {lint_result['error']}"

    # 2. Test Injection (Adversarial Layer)
    final_code = code
    if run_tests and language == "python":
        test_suite = get_adversarial_test(language, topic)
        if test_suite:
            final_code += f"\n{test_suite}"

    # 3. Piston Execution
    url = f"{PISTON_BASE_URL.rstrip('/')}/execute"
    lang_map = {"py": "python", "js": "javascript", "ts": "typescript"}
    target_lang = lang_map.get(language.lower(), language.lower())
    
    payload = {
        "language": target_lang,
        "version": "*",
        "files": [{"content": final_code}]
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        
        if "run" in result:
            output = result["run"].get("output", "")
            stderr = result["run"].get("stderr", "")
            full_out = output + (f"\n[STDERR]\n{stderr}" if stderr else "")
            return full_out.strip()
        return "No output from Sandbox."
    except Exception as e:
        return f"Sandbox Connection Failed: {str(e)}"

def code_execution_node(state: InterviewState):
    """
    Engine 2: The Cursed Sandbox Node.
    """
    messages = state.get("messages", [])
    if not messages: return {}
    
    last_msg = messages[-1]
    if not isinstance(last_msg, HumanMessage): return {}

    # Extract code
    pattern = r"```(\w+)\s*\n(.*?)```"
    matches = re.findall(pattern, last_msg.content, re.DOTALL)
    
    if not matches:
        return {}
        
    outputs = []
    # Check if we are in "Hardcore" mode (Adversarial)
    is_hardcore = state.get("difficulty_level") == "Hardcore"
    topic = state.get("topic", "General")

    for lang, code in matches:
        print(f"--- [Sandbox] Running {lang} (Adversarial: {is_hardcore}) ---")
        
        # Execute with Tests if Hardcore
        out = execute_code(lang, code, run_tests=is_hardcore, topic=topic)
        
        # Prefix output so LLM knows it's from the system
        outputs.append(f"Code ({lang}) Execution Result:\n{out}")
        
    if outputs:
        final_output = "\n\n".join(outputs)
        # Update State
        return {
            "messages": [SystemMessage(content=f"SYSTEM_SANDBOX_OUTPUT:\n{final_output}")]
        }
    
    return {}