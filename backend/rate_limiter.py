# backend/rate_limiter.py
# ─────────────────────────────────────────────────────────────────────────────
# Simple in-memory rate limiter for unauthenticated endpoints.
# The /api/audit/{username} route is currently open and makes GitHub API calls
# — without rate limiting it can be abused to exhaust your GitHub token quota.
#
# This uses a sliding window approach stored in a dict (resets on server restart).
# For production, replace with Redis-backed rate limiting.
#
# Usage in main.py:
#   from rate_limiter import RateLimiter
#   limiter = RateLimiter(max_calls=10, window_seconds=60)
#
#   @app.get("/api/audit/{username}")
#   async def audit(username: str, request: Request):
#       limiter.check(request.client.host)  # raises 429 if exceeded
#       ...
# ─────────────────────────────────────────────────────────────────────────────

import time
from collections import defaultdict, deque
from fastapi import HTTPException, Request
from logger import get_logger

logger = get_logger(__name__)


class RateLimiter:
    """
    Sliding window rate limiter.

    Args:
        max_calls: Maximum number of calls allowed per window
        window_seconds: Window size in seconds
    """

    def __init__(self, max_calls: int = 10, window_seconds: int = 60):
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self._calls: dict[str, deque] = defaultdict(deque)

    def check(self, client_ip: str) -> None:
        """
        Checks if the client IP is within the rate limit.
        Raises HTTP 429 if the limit is exceeded.
        """
        now = time.time()
        window_start = now - self.window_seconds
        calls = self._calls[client_ip]

        # Remove calls outside the current window
        while calls and calls[0] < window_start:
            calls.popleft()

        if len(calls) >= self.max_calls:
            logger.warning(
                "Rate limit exceeded for IP %s (%d calls in %ds window)",
                client_ip, len(calls), self.window_seconds
            )
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {self.max_calls} requests per {self.window_seconds} seconds."
            )

        calls.append(now)


# ── Pre-configured limiters for different endpoint types ─────────────────────

# For unauthenticated public endpoints (GitHub audit, public profile)
public_limiter = RateLimiter(max_calls=10, window_seconds=60)

# For LLM-heavy endpoints (challenge gen, roadmap, negotiator)
llm_limiter = RateLimiter(max_calls=5, window_seconds=60)


# ── FastAPI dependency for easy use ──────────────────────────────────────────

async def public_rate_limit(request: Request):
    """FastAPI dependency — add to any route that should be rate limited."""
    public_limiter.check(request.client.host)


async def llm_rate_limit(request: Request):
    """FastAPI dependency for LLM-heavy routes."""
    llm_limiter.check(request.client.host)


# ── Usage examples in main.py ─────────────────────────────────────────────────
#
# from rate_limiter import public_rate_limit, llm_rate_limit
#
# @app.get("/api/audit/{username}")
# async def audit_endpoint(
#     username: str,
#     _: None = Depends(public_rate_limit)   # ← add this
# ):
#     ...
#
# @app.post("/api/challenge/new")
# async def challenge_endpoint(
#     request: ChallengeRequest,
#     _: None = Depends(llm_rate_limit)      # ← add this
# ):
#     ...
