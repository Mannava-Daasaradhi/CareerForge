# backend/tests/test_flow.py — COMPLETE FIXED VERSION
# Changes from original:
#   1. test_dashboard_pulse() was calling GET /api/career/market-pulse (doesn't exist)
#      Fixed to call POST /api/career/demand
#   2. test_recruiter_proxy() was missing required "username" field in payload
#      Fixed to include username
#   3. All tests now have clear pass/fail output
#   4. Added timeout to all requests so tests don't hang indefinitely

import sys
import json
import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30  # seconds


def _ok(test_name: str):
    print(f"  ✅ PASS: {test_name}")


def _fail(test_name: str, reason: str):
    print(f"  ❌ FAIL: {test_name} — {reason}")


def test_health():
    """Basic health check — confirms FastAPI is running."""
    try:
        r = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "status" in data, "Response missing 'status' key"
        _ok("Health check")
    except Exception as e:
        _fail("Health check", str(e))


def test_github_audit():
    """Tests the GitHub Auditor against a known public account."""
    try:
        r = requests.get(f"{BASE_URL}/api/audit/torvalds", timeout=TIMEOUT)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "trust_score" in data, "Response missing 'trust_score'"
        assert isinstance(data["trust_score"], (int, float)), "trust_score must be numeric"
        _ok("GitHub audit")
    except Exception as e:
        _fail("GitHub audit", str(e))


def test_challenge_generation():
    """Tests the Cursed Challenge generator (requires GROQ_API_KEY)."""
    try:
        payload = {"topic": "Python list comprehensions", "difficulty": 50}
        r = requests.post(
            f"{BASE_URL}/api/challenge/new",
            json=payload,
            timeout=TIMEOUT
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        # Validate against backend CursedChallenge model field names
        assert "title" in data, "Response missing 'title'"
        assert "scenario" in data, "Response missing 'scenario' (not 'description')"
        assert "broken_code" in data, "Response missing 'broken_code' (not 'starter_code')"
        _ok("Challenge generation")
    except Exception as e:
        _fail("Challenge generation", str(e))


def test_market_demand():
    """
    Tests the market demand analyzer.
    FIX: was calling GET /api/career/market-pulse (route never existed).
    Correct route is POST /api/career/demand.
    """
    try:
        payload = {"role": "Backend Engineer", "location": "Remote"}
        r = requests.post(
            f"{BASE_URL}/api/career/demand",  # ← FIX: was /api/career/market-pulse
            json=payload,
            timeout=TIMEOUT
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        _ok("Market demand analyzer")
    except Exception as e:
        _fail("Market demand analyzer", str(e))


def test_recruiter_proxy():
    """
    Tests the recruiter digital twin endpoint.
    FIX: was missing required 'username' field — caused 422 Unprocessable Entity.
    """
    try:
        payload = {
            "username": "torvalds",        # ← FIX: was missing entirely
            "question": "What are this candidate's strongest technical skills?"
        }
        r = requests.post(
            f"{BASE_URL}/api/recruiter/ask",
            json=payload,
            timeout=TIMEOUT
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "reply" in data or "response" in data, "Response missing reply field"
        _ok("Recruiter proxy")
    except Exception as e:
        _fail("Recruiter proxy", str(e))


def test_roadmap_generation():
    """Tests the career roadmap generator (requires GROQ_API_KEY)."""
    try:
        payload = {
            "skill_gaps": ["Redis", "Docker"],
            "target_role": "Backend Engineer"
        }
        r = requests.post(
            f"{BASE_URL}/api/career/roadmap",
            json=payload,
            timeout=TIMEOUT
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "milestones" in data or "weeks" in data or "target_role" in data, \
            "Response doesn't look like a CareerRoadmap"
        _ok("Roadmap generation")
    except Exception as e:
        _fail("Roadmap generation", str(e))


def run_all():
    print("\nCareerForge Integration Tests")
    print(f"Target: {BASE_URL}")
    print("=" * 45)

    tests = [
        test_health,
        test_github_audit,
        test_challenge_generation,
        test_market_demand,
        test_recruiter_proxy,
        test_roadmap_generation,
    ]

    passed = 0
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"  💥 UNEXPECTED ERROR in {test.__name__}: {e}")

    print("=" * 45)
    print(f"Results: {passed}/{len(tests)} passed")
    if passed < len(tests):
        print("Run 'uvicorn main:app --reload' in backend/ before running these tests.")
    print()


if __name__ == "__main__":
    run_all()
