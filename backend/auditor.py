import requests
import base64
from datetime import datetime
import os

class GitHubAuditor:
    def __init__(self):
        self.base_url = "https://api.github.com"
        # Optional: Use token if available to avoid rate limits
        self.token = os.getenv("GITHUB_TOKEN")
        self.headers = {"Authorization": f"token {self.token}"} if self.token else {}

    def _safe_get(self, url: str):
        """Helper to handle network errors gracefully."""
        try:
            response = requests.get(url, headers=self.headers, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"GitHub API Error ({url}): {e}")
            return None

    def get_user_data(self, username: str):
        return self._safe_get(f"{self.base_url}/users/{username}")

    def get_recent_activity(self, username: str):
        data = self._safe_get(f"{self.base_url}/users/{username}/events/public")
        return data if data else []

    def get_file_content(self, url: str):
        """Fetches and decodes Base64 file content from GitHub."""
        data = self._safe_get(url)
        if data and "content" in data and data.get("encoding") == "base64":
            try:
                return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
            except Exception:
                return "[Error decoding file content]"
        return "[No content or not base64 encoded]"

    def fetch_top_repo_context(self, username: str):
        """
        New Feature: Deep Context Audit
        1. Finds the user's most popular repository (by stars).
        2. Fetches the README and up to 2 code files.
        """
        print(f"Fetching Deep Context for {username}...")
        repos = self._safe_get(f"{self.base_url}/users/{username}/repos?sort=updated&per_page=5")
        
        if not repos:
            return {"error": "No public repositories found."}

        # Pick the repo with the most stars
        top_repo = max(repos, key=lambda x: x['stargazers_count'])
        repo_name = top_repo['name']
        
        # Get file list (root directory)
        contents_url = top_repo['contents_url'].replace("{+path}", "")
        files = self._safe_get(contents_url)
        
        context_data = {
            "repo_name": repo_name,
            "description": top_repo.get("description", "No description"),
            "stars": top_repo['stargazers_count'],
            "files": {}
        }

        if not files:
            return context_data

        # Strategy: Get README + First 2 Code Files (py, js, ts, go, rs)
        target_extensions = ('.py', '.js', '.ts', '.go', '.rs', '.java', '.cpp')
        code_file_count = 0
        
        for file in files:
            if file['name'].lower() == "readme.md":
                context_data["files"]["README.md"] = self.get_file_content(file['url'])
            
            elif file['name'].endswith(target_extensions) and code_file_count < 2:
                content = self.get_file_content(file['url'])
                # Truncate large files to save tokens
                context_data["files"][file['name']] = content[:2000] + ("..." if len(content)>2000 else "")
                code_file_count += 1

        return context_data

    def calculate_trust_score(self, username: str):
        """
        The Core Logic:
        1. Account Age: Older accounts = Higher Trust.
        2. Recent Activity: More 'PushEvents' = Higher Trust.
        3. Repo Count: More public work = Higher Trust.
        """
        user = self.get_user_data(username)
        if not user:
            return {"error": "User not found or Auditor Offline", "trust_score": 0}

        # 1. Calculate Account Age
        created_at = datetime.strptime(user['created_at'], "%Y-%m-%dT%H:%M:%SZ")
        years_active = (datetime.now() - created_at).days / 365

        # 2. Analyze Recent Events
        events = self.get_recent_activity(username)
        push_count = sum(1 for e in events if e['type'] == 'PushEvent')
        
        # 3. Scoring
        score = 0
        score += min(40, years_active * 10)
        score += min(40, push_count * 4)
        score += min(20, user.get('public_repos', 0))

        return {
            "username": username,
            "trust_score": int(score),
            "account_age_years": round(years_active, 1),
            "recent_pushes": push_count,
            "verdict": "High Trust" if score > 70 else "Low Trust - Sandbox Mode Activated"
        }

if __name__ == "__main__":
    auditor = GitHubAuditor()
    # Test Deep Context
    print(auditor.fetch_top_repo_context("torvalds"))