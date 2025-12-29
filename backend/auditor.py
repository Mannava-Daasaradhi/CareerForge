import requests
from datetime import datetime, timedelta
import os

class GitHubAuditor:
    def __init__(self):
        self.base_url = "https://api.github.com"
        # Optional: Use token if available to avoid rate limits (60 requests/hr vs 5000)
        self.token = os.getenv("GITHUB_TOKEN")
        self.headers = {"Authorization": f"token {self.token}"} if self.token else {}

    def get_user_data(self, username: str):
        """Fetches basic user profile data (Account age, public repos)."""
        url = f"{self.base_url}/users/{username}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            return None
        return response.json()

    def get_recent_activity(self, username: str):
        """Fetches the last 30 public events (Pushes, PRs)."""
        url = f"{self.base_url}/users/{username}/events/public"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            return []
        return response.json()

    def calculate_trust_score(self, username: str):
        """
        The Core Logic:
        1. Account Age: Older accounts = Higher Trust.
        2. Recent Activity: More 'PushEvents' = Higher Trust.
        3. Repo Count: More public work = Higher Trust.
        """
        user = self.get_user_data(username)
        if not user:
            return {"error": "User not found", "trust_score": 0}

        # 1. Calculate Account Age (Years)
        created_at = datetime.strptime(user['created_at'], "%Y-%m-%dT%H:%M:%SZ")
        account_age_days = (datetime.now() - created_at).days
        years_active = account_age_days / 365

        # 2. Analyze Recent Events
        events = self.get_recent_activity(username)
        push_count = sum(1 for e in events if e['type'] == 'PushEvent')
        
        # 3. The Scoring Algorithm (0 to 100)
        score = 0
        
        # Base Score from Age (Max 40 points for 4+ years)
        score += min(40, years_active * 10)
        
        # Activity Score (Max 40 points for 10+ recent pushes)
        score += min(40, push_count * 4)
        
        # Repo Bonus (Max 20 points for 20+ repos)
        repo_count = user.get('public_repos', 0)
        score += min(20, repo_count)

        return {
            "username": username,
            "trust_score": int(score),
            "account_age_years": round(years_active, 1),
            "recent_pushes": push_count,
            "verdict": "High Trust" if score > 70 else "Low Trust - Sandbox Mode Activated"
        }

# Simple test block to run it directly
if __name__ == "__main__":
    auditor = GitHubAuditor()
    # Test with a known user (e.g., the creator of Linux, torvalds)
    print(auditor.calculate_trust_score("torvalds"))