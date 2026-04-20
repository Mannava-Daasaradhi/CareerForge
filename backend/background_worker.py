# backend/background_worker.py — COMPLETE FIXED VERSION
# Changes from original:
#   1. Replaced bare `while True: time.sleep(3600)` with APScheduler
#      (retry on failure, proper logging, clean shutdown on Ctrl+C)
#   2. All print() replaced with logger
#   3. Added startup banner so you can confirm it's running
#
# Run as a separate process alongside uvicorn:
#   .\venv\Scripts\Activate.ps1
#   python background_worker.py
#
# Requires: pip install apscheduler  (add to requirements.txt)

import os
import signal
import sys
from logger import get_logger

logger = get_logger("background_worker")


def run_job_hunt_cycle():
    """
    One cycle of the autonomous job hunt loop.
    Searches for new jobs matching the candidate's profile and stores results.
    Runs every hour by default.
    """
    logger.info("Starting autonomous job hunt cycle...")
    try:
        from job_fetcher import fetch_jobs
        from database import db_manager

        # Pull target roles from DB if available, otherwise use defaults
        target_roles = ["Backend Engineer", "Python Developer", "ML Engineer"]

        if db_manager.enabled:
            try:
                result = db_manager.supabase.table("profiles") \
                    .select("target_role") \
                    .not_.is_("target_role", "null") \
                    .execute()
                if result.data:
                    target_roles = list({r["target_role"] for r in result.data if r.get("target_role")})
                    logger.info("Fetched %d target roles from DB", len(target_roles))
            except Exception as e:
                logger.warning("Could not fetch target roles from DB: %s — using defaults", str(e))

        total_found = 0
        for role in target_roles:
            try:
                jobs = fetch_jobs(role)
                total_found += len(jobs) if isinstance(jobs, list) else 0
                logger.info("Found %s results for role: %s", len(jobs) if isinstance(jobs, list) else "?", role)
            except Exception as e:
                logger.error("Job fetch failed for role '%s': %s", role, str(e))

        logger.info("Job hunt cycle complete — %d total results", total_found)

    except Exception as e:
        logger.error("Unhandled error in job hunt cycle: %s", str(e))
        # Do NOT re-raise — APScheduler will catch and log, then retry next interval


def run_passport_refresh():
    """
    Refreshes Skill Passport scores for recently active users.
    Runs every 6 hours.
    """
    logger.info("Starting passport refresh cycle...")
    try:
        from skill_passport import get_skill_passport
        from database import db_manager

        if not db_manager.enabled:
            logger.info("DB not enabled — skipping passport refresh")
            return

        # Get users active in the last 24 hours
        from datetime import datetime, timedelta
        cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()

        result = db_manager.supabase.table("interview_logs") \
            .select("user_id") \
            .gte("created_at", cutoff) \
            .execute()

        if not result.data:
            logger.info("No recently active users — skipping passport refresh")
            return

        active_users = list({r["user_id"] for r in result.data})
        logger.info("Refreshing passports for %d recently active users", len(active_users))

        for user_id in active_users:
            try:
                get_skill_passport(user_id)
                logger.info("Passport refreshed for user: %s", user_id)
            except Exception as e:
                logger.error("Passport refresh failed for user %s: %s", user_id, str(e))

    except Exception as e:
        logger.error("Unhandled error in passport refresh: %s", str(e))


def main():
    try:
        from apscheduler.schedulers.blocking import BlockingScheduler
        from apscheduler.triggers.interval import IntervalTrigger
    except ImportError:
        logger.error(
            "APScheduler not installed. Run: pip install apscheduler\n"
            "Then add 'apscheduler>=3.10.0' to requirements.txt"
        )
        sys.exit(1)

    scheduler = BlockingScheduler(timezone="UTC")

    # Job hunt — every hour
    scheduler.add_job(
        run_job_hunt_cycle,
        trigger=IntervalTrigger(hours=1),
        id="job_hunt",
        name="Autonomous Job Hunt",
        replace_existing=True,
        max_instances=1,          # prevent overlap if a cycle takes too long
        misfire_grace_time=300,   # 5 min grace period if scheduler was down
    )

    # Passport refresh — every 6 hours
    scheduler.add_job(
        run_passport_refresh,
        trigger=IntervalTrigger(hours=6),
        id="passport_refresh",
        name="Skill Passport Refresh",
        replace_existing=True,
        max_instances=1,
        misfire_grace_time=600,
    )

    # Graceful shutdown on Ctrl+C or SIGTERM
    def shutdown(signum, frame):
        logger.info("Shutdown signal received — stopping scheduler...")
        scheduler.shutdown(wait=False)
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    logger.info("=" * 50)
    logger.info("CareerForge Background Worker started")
    logger.info("  Job hunt:        every 1 hour")
    logger.info("  Passport refresh: every 6 hours")
    logger.info("  Press Ctrl+C to stop")
    logger.info("=" * 50)

    # Run once immediately on startup so you can verify it works
    logger.info("Running initial job hunt cycle on startup...")
    run_job_hunt_cycle()

    scheduler.start()


if __name__ == "__main__":
    main()
