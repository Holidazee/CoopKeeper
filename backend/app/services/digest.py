"""Weekly digest stats for CoopKeeper.

Builds a dict + rendered HTML/text summary of the prior 7 days:
- new signups
- total users
- weekly active users (logged in in the last 7 days)
- eggs / feed records / cleaning logs added
- top day for logging activity
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Iterable

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models import CleaningLog, Egg, FeedRecord, User

DIGEST_WINDOW_DAYS = 7


@dataclass
class DigestStats:
    window_start: datetime
    window_end: datetime
    new_signups: int
    total_users: int
    weekly_active_users: int
    eggs_logged: int
    feed_records_added: int
    cleaning_logs_added: int
    top_day: date | None
    top_day_count: int


def _count(session: Session, column, predicate) -> int:
    value = session.scalar(select(func.count()).select_from(column).where(predicate))
    return int(value or 0)


def _scalar_count(session: Session, stmt) -> int:
    return int(session.scalar(stmt) or 0)


def _pick_top_day(rows: Iterable[tuple[date | None, int]]) -> tuple[date | None, int]:
    counter: Counter[date] = Counter()
    for day, count in rows:
        if day is None:
            continue
        counter[day] += int(count or 0)
    if not counter:
        return None, 0
    top_day, top_count = counter.most_common(1)[0]
    return top_day, top_count


def build_digest_stats(session: Session, now: datetime | None = None) -> DigestStats:
    now = now or datetime.now(timezone.utc)
    window_start = now - timedelta(days=DIGEST_WINDOW_DAYS)
    window_start_date = window_start.date()

    new_signups = _scalar_count(
        session,
        select(func.count(User.id)).where(User.created_at >= window_start),
    )
    total_users = _scalar_count(session, select(func.count(User.id)))
    weekly_active_users = _scalar_count(
        session,
        select(func.count(User.id)).where(User.last_login >= window_start),
    )

    eggs_logged = _scalar_count(
        session,
        select(func.coalesce(func.sum(Egg.count), 0)).where(Egg.date >= window_start_date),
    )
    feed_records_added = _scalar_count(
        session,
        select(func.count(FeedRecord.id)).where(FeedRecord.date >= window_start_date),
    )
    cleaning_logs_added = _scalar_count(
        session,
        select(func.count(CleaningLog.id)).where(CleaningLog.date >= window_start_date),
    )

    # Top day across all three logging activities (by row count, eggs weighted by count).
    egg_rows = session.execute(
        select(Egg.date, func.coalesce(func.sum(Egg.count), 0))
        .where(Egg.date >= window_start_date)
        .group_by(Egg.date)
    ).all()
    feed_rows = session.execute(
        select(FeedRecord.date, func.count(FeedRecord.id))
        .where(FeedRecord.date >= window_start_date)
        .group_by(FeedRecord.date)
    ).all()
    cleaning_rows = session.execute(
        select(CleaningLog.date, func.count(CleaningLog.id))
        .where(CleaningLog.date >= window_start_date)
        .group_by(CleaningLog.date)
    ).all()
    top_day, top_day_count = _pick_top_day(
        list(egg_rows) + list(feed_rows) + list(cleaning_rows)
    )

    return DigestStats(
        window_start=window_start,
        window_end=now,
        new_signups=new_signups,
        total_users=total_users,
        weekly_active_users=weekly_active_users,
        eggs_logged=eggs_logged,
        feed_records_added=feed_records_added,
        cleaning_logs_added=cleaning_logs_added,
        top_day=top_day,
        top_day_count=top_day_count,
    )


def render_digest_subject(stats: DigestStats) -> str:
    return (
        f"CoopKeeper weekly — {stats.new_signups} new "
        f"user{'s' if stats.new_signups != 1 else ''}, "
        f"{stats.eggs_logged} egg{'s' if stats.eggs_logged != 1 else ''} logged"
    )


def _fmt_date(value: date | None) -> str:
    return value.strftime("%a %b %-d") if value else "—"


def render_digest_text(stats: DigestStats) -> str:
    lines = [
        "CoopKeeper — weekly digest",
        f"{stats.window_start.strftime('%b %-d')} – {stats.window_end.strftime('%b %-d, %Y')}",
        "",
        "Users",
        f"  New signups this week : {stats.new_signups}",
        f"  Total users           : {stats.total_users}",
        f"  Weekly active users   : {stats.weekly_active_users}",
        "",
        "Activity",
        f"  Eggs logged           : {stats.eggs_logged}",
        f"  Feed records          : {stats.feed_records_added}",
        f"  Cleaning logs         : {stats.cleaning_logs_added}",
        "",
        f"Top day for logging    : {_fmt_date(stats.top_day)} ({stats.top_day_count})",
        "",
        "— CoopKeeper",
    ]
    return "\n".join(lines)


def render_digest_html(stats: DigestStats) -> str:
    return f"""\
<!doctype html>
<html>
<body style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1F1B15;background:#F3EBDB;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#FFFDF7;border:1px solid rgba(31,27,21,0.08);border-radius:12px;padding:28px;">
    <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 4px;">CoopKeeper weekly</h1>
    <div style="color:#7B715E;font-size:13px;margin-bottom:20px;">
      {stats.window_start.strftime('%b %-d')} – {stats.window_end.strftime('%b %-d, %Y')}
    </div>

    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#556B3C;margin:20px 0 8px;">Users</h2>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      <tr><td>New signups this week</td><td style="text-align:right;"><b>{stats.new_signups}</b></td></tr>
      <tr><td>Total users</td><td style="text-align:right;"><b>{stats.total_users}</b></td></tr>
      <tr><td>Weekly active users</td><td style="text-align:right;"><b>{stats.weekly_active_users}</b></td></tr>
    </table>

    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#556B3C;margin:24px 0 8px;">Activity</h2>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      <tr><td>Eggs logged</td><td style="text-align:right;"><b>{stats.eggs_logged}</b></td></tr>
      <tr><td>Feed records added</td><td style="text-align:right;"><b>{stats.feed_records_added}</b></td></tr>
      <tr><td>Cleaning logs added</td><td style="text-align:right;"><b>{stats.cleaning_logs_added}</b></td></tr>
    </table>

    <div style="margin-top:20px;font-size:15px;">
      Top day for logging: <b>{_fmt_date(stats.top_day)}</b>
      <span style="color:#7B715E;">({stats.top_day_count})</span>
    </div>

    <div style="margin-top:28px;color:#7B715E;font-size:12px;">
      Sent automatically every Monday morning.
    </div>
  </div>
</body>
</html>
"""


def build_weekly_digest() -> tuple[str, str, str]:
    """Return (subject, text_body, html_body) ready for sending."""
    with SessionLocal() as session:
        stats = build_digest_stats(session)
    return (
        render_digest_subject(stats),
        render_digest_text(stats),
        render_digest_html(stats),
    )
