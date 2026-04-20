"""Background scheduler for the weekly CoopKeeper digest.

Runs in-process inside the FastAPI app (Render Starter tier keeps the dyno
warm, so a simple BackgroundScheduler is enough). Fires Mondays at 09:00
in `DIGEST_TIMEZONE` (defaults to America/Chicago).
"""

from __future__ import annotations

import logging
from typing import Optional
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.services.digest import build_weekly_digest
from app.services.email import EmailNotConfigured, send_email
from app.settings import DIGEST_SCHEDULER_DISABLED, DIGEST_TIMEZONE

logger = logging.getLogger(__name__)

_scheduler: Optional[BackgroundScheduler] = None


def send_weekly_digest_job() -> None:
    """Build the digest and ship it. Swallow exceptions so the scheduler keeps running."""
    try:
        subject, text_body, html_body = build_weekly_digest()
        send_email(subject=subject, text_body=text_body, html_body=html_body)
        logger.info("Weekly digest sent: %s", subject)
    except EmailNotConfigured as exc:
        logger.warning("Skipped weekly digest: %s", exc)
    except Exception:  # noqa: BLE001 — never crash the scheduler thread
        logger.exception("Weekly digest job failed")


def start_scheduler() -> BackgroundScheduler | None:
    """Start the scheduler if it isn't already running. Returns the scheduler."""
    global _scheduler

    if DIGEST_SCHEDULER_DISABLED:
        logger.info("Digest scheduler disabled via DIGEST_SCHEDULER_DISABLED")
        return None

    if _scheduler is not None:
        return _scheduler

    try:
        tz = ZoneInfo(DIGEST_TIMEZONE)
    except Exception:  # noqa: BLE001
        logger.warning("Invalid DIGEST_TIMEZONE %r, falling back to America/Chicago", DIGEST_TIMEZONE)
        tz = ZoneInfo("America/Chicago")

    scheduler = BackgroundScheduler(timezone=tz)
    scheduler.add_job(
        send_weekly_digest_job,
        trigger=CronTrigger(day_of_week="mon", hour=9, minute=0, timezone=tz),
        id="weekly_digest",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
        misfire_grace_time=3600,
    )
    scheduler.start()
    _scheduler = scheduler
    logger.info("Digest scheduler started (Mon 09:00 %s)", tz)
    return scheduler


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("Digest scheduler stopped")
