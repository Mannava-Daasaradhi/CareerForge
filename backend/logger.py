# backend/logger.py
# ─────────────────────────────────────────────────────────────────────────────
# Shared logger to replace all print() calls across the backend.
# Usage: from logger import get_logger; logger = get_logger(__name__)
# ─────────────────────────────────────────────────────────────────────────────

import logging
import sys


def get_logger(name: str) -> logging.Logger:
    """Returns a configured logger for the given module name."""
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(
            "%(asctime)s [%(name)s] %(levelname)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        ))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)

    return logger


# ── Example usage (add to any backend module) ─────────────────────────────────
#
# from logger import get_logger
# logger = get_logger(__name__)
#
# logger.info("Processing resume for user: %s", username)
# logger.warning("GitHub API rate limit approaching")
# logger.error("Supabase insert failed: %s", str(e))
#
# ── Replace every print() call in the backend like this ──────────────────────
#
# BEFORE:  print(f"[Auditor] Trust score: {score}")
# AFTER:   logger.info("Trust score: %s", score)
#
# BEFORE:  print(f"ERROR: {e}")
# AFTER:   logger.error("Unexpected error: %s", str(e))
