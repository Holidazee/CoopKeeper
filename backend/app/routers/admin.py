"""Admin-only endpoints (e.g. manual digest trigger)."""

from __future__ import annotations

import hmac
import logging

from fastapi import APIRouter, Header, HTTPException, status

from app.services.digest import build_weekly_digest
from app.services.email import EmailNotConfigured, send_email
from app.settings import ADMIN_DIGEST_SECRET

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


def _require_secret(header_value: str | None) -> None:
    if not ADMIN_DIGEST_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ADMIN_DIGEST_SECRET is not configured",
        )
    if not header_value or not hmac.compare_digest(header_value, ADMIN_DIGEST_SECRET):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin secret",
        )


@router.post("/send-digest")
def send_digest_now(
    x_admin_secret: str | None = Header(default=None, alias="X-Admin-Secret"),
):
    _require_secret(x_admin_secret)

    subject, text_body, html_body = build_weekly_digest()

    try:
        result = send_email(subject=subject, text_body=text_body, html_body=html_body)
    except EmailNotConfigured as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return {
        "status": "sent",
        "subject": subject,
        "resend_id": result.get("id"),
    }


@router.get("/preview-digest")
def preview_digest(
    x_admin_secret: str | None = Header(default=None, alias="X-Admin-Secret"),
):
    """Render the digest without sending it — useful for spot-checks."""
    _require_secret(x_admin_secret)
    subject, text_body, html_body = build_weekly_digest()
    return {"subject": subject, "text": text_body, "html": html_body}
