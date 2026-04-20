"""Thin Resend REST API wrapper.

We avoid the `resend` SDK and use httpx directly — httpx is already a
project dependency and the REST endpoint is a single POST.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.settings import DIGEST_FROM_EMAIL, DIGEST_RECIPIENT_EMAIL, RESEND_API_KEY

RESEND_API_URL = "https://api.resend.com/emails"
logger = logging.getLogger(__name__)


class EmailNotConfigured(RuntimeError):
    """Raised when Resend credentials or a recipient are missing."""


def send_email(
    *,
    subject: str,
    text_body: str,
    html_body: str | None = None,
    to: str | None = None,
    from_address: str | None = None,
    timeout: float = 15.0,
) -> dict[str, Any]:
    recipient = to or DIGEST_RECIPIENT_EMAIL
    sender = from_address or DIGEST_FROM_EMAIL

    if not RESEND_API_KEY:
        raise EmailNotConfigured("RESEND_API_KEY is not set")
    if not recipient:
        raise EmailNotConfigured("No recipient configured (DIGEST_RECIPIENT_EMAIL)")

    payload: dict[str, Any] = {
        "from": sender,
        "to": [recipient],
        "subject": subject,
        "text": text_body,
    }
    if html_body:
        payload["html"] = html_body

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    with httpx.Client(timeout=timeout) as client:
        response = client.post(RESEND_API_URL, json=payload, headers=headers)

    if response.status_code >= 300:
        logger.error(
            "Resend rejected email: status=%s body=%s", response.status_code, response.text
        )
        response.raise_for_status()

    logger.info("Sent email to %s (subject=%r)", recipient, subject)
    return response.json()
