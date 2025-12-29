# FILE: backend/ast_linter.py
import ast

def lint_code_security(code: str, language: str) -> dict:
    """
    Phase 2: AST-Based Security Linting.
    Prevents "Lazy" coding and Security Risks before Sandbox execution.
    """
    if language.lower() not in ["python", "py"]:
        return {"valid": True, "error": None} # Only supporting Python AST for now

    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {"valid": False, "error": f"Syntax Error: {e}"}

    # 1. Security: Block Dangerous Imports
    blacklist = ["os", "subprocess", "sys", "shutil", "eval", "exec"]
    
    for node in ast.walk(tree):
        # Check imports
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split('.')[0] in blacklist:
                    return {"valid": False, "error": f"Security Violation: '{alias.name}' is banned in this interview."}
        
        # Check import from
        elif isinstance(node, ast.ImportFrom):
            if node.module and node.module.split('.')[0] in blacklist:
                return {"valid": False, "error": f"Security Violation: Module '{node.module}' is banned."}
        
        # 2. Quality: Check for 'pass' in except blocks (Lazy Error Handling)
        elif isinstance(node, ast.ExceptHandler):
            for body_node in node.body:
                if isinstance(body_node, ast.Pass):
                    return {"valid": False, "error": "Quality Check Failed: Do not use 'pass' in exception handlers. Handle the error."}

    return {"valid": True, "error": None}