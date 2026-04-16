from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db.database import SessionLocal
from app.models import Alert, CleaningLog, Egg, FeedRecord, User
from app.routers.common import commit_and_refresh, get_owned_or_404

router = APIRouter()
READ_MODEL_CONFIG = ConfigDict(from_attributes=True)


class AlertRead(BaseModel):
    id: int
    alert_type: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime

    model_config = READ_MODEL_CONFIG


def get_alert_or_404(session: Session, alert_id: int, user_id: int) -> Alert:
    return get_owned_or_404(session, Alert, alert_id, user_id, "Alert not found")


def has_recent_cleaning_log(session: Session, user_id: int) -> bool:
    cutoff = date.today() - timedelta(days=6)
    return session.scalar(
        select(CleaningLog.id)
        .where(CleaningLog.user_id == user_id, CleaningLog.date >= cutoff)
        .limit(1)
    ) is not None


def has_recent_egg_record(session: Session, user_id: int) -> bool:
    cutoff = date.today() - timedelta(days=1)
    return session.scalar(
        select(Egg.id)
        .where(Egg.user_id == user_id, Egg.date >= cutoff)
        .limit(1)
    ) is not None


def has_recent_feed_record(session: Session, user_id: int) -> bool:
    cutoff = date.today() - timedelta(days=13)
    return session.scalar(
        select(FeedRecord.id)
        .where(FeedRecord.user_id == user_id, FeedRecord.date >= cutoff)
        .limit(1)
    ) is not None


def select_primary_alert(alerts: list[Alert]) -> Alert | None:
    if not alerts:
        return None

    unread_alerts = [alert for alert in alerts if not alert.is_read]
    candidates = unread_alerts or alerts
    return sorted(
        candidates,
        key=lambda alert: (alert.created_at, alert.id),
        reverse=True,
    )[0]


def sync_alerts_for_user(session: Session, user_id: int) -> None:
    existing_alerts = session.scalars(
        select(Alert)
        .where(Alert.user_id == user_id)
        .order_by(Alert.created_at.desc(), Alert.id.desc())
    ).all()
    alerts_by_type: dict[str, list[Alert]] = {}
    for alert in existing_alerts:
        alerts_by_type.setdefault(alert.alert_type, []).append(alert)

    alert_definitions = [
        {
            "alert_type": "cleaning_reminder",
            "message": "No cleaning log has been added in the last 7 days.",
            "severity": "warning",
            "is_triggered": lambda: not has_recent_cleaning_log(session, user_id),
        },
        {
            "alert_type": "egg_reminder",
            "message": "No egg record has been added in the last 2 days.",
            "severity": "info",
            "is_triggered": lambda: not has_recent_egg_record(session, user_id),
        },
        {
            "alert_type": "feed_reminder",
            "message": "No feed record has been added in the last 14 days.",
            "severity": "warning",
            "is_triggered": lambda: not has_recent_feed_record(session, user_id),
        },
    ]

    for definition in alert_definitions:
        alert_type = definition["alert_type"]
        matching_alerts = alerts_by_type.get(alert_type, [])
        if definition["is_triggered"]():
            primary_alert = select_primary_alert(matching_alerts)
            if primary_alert is None:
                session.add(
                    Alert(
                        alert_type=alert_type,
                        message=definition["message"],
                        severity=definition["severity"],
                        is_read=False,
                        created_at=datetime.now(timezone.utc),
                        user_id=user_id,
                    )
                )
                continue

            primary_alert.message = definition["message"]
            primary_alert.severity = definition["severity"]
            for duplicate in matching_alerts:
                if duplicate.id != primary_alert.id:
                    session.delete(duplicate)
        else:
            for alert in matching_alerts:
                session.delete(alert)

    session.commit()


@router.get("/alerts", response_model=list[AlertRead])
def list_alerts(current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        sync_alerts_for_user(session, current_user.id)
        return session.scalars(
            select(Alert)
            .where(Alert.user_id == current_user.id, Alert.is_read.is_(False))
            .order_by(Alert.created_at.desc(), Alert.id.desc())
        ).all()


@router.post("/alerts/{alert_id}/read", response_model=AlertRead)
def mark_alert_as_read(alert_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        alert = get_alert_or_404(session, alert_id, current_user.id)
        alert.is_read = True
        return commit_and_refresh(session, alert)


@router.delete("/alerts/{alert_id}", status_code=204)
def delete_alert(alert_id: int, current_user: User = Depends(get_current_user)):
    with SessionLocal() as session:
        alert = get_alert_or_404(session, alert_id, current_user.id)
        session.delete(alert)
        session.commit()
