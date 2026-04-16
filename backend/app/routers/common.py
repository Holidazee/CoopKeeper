from typing import Any, TypeVar

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

ModelT = TypeVar("ModelT")


def get_or_404(session: Session, model: type[ModelT], object_id: int, detail: str) -> ModelT:
    instance = session.get(model, object_id)
    if instance is None:
        raise HTTPException(status_code=404, detail=detail)
    return instance


def get_owned_or_404(
    session: Session,
    model: type[ModelT],
    object_id: int,
    user_id: int,
    detail: str,
) -> ModelT:
    instance = session.scalar(
        select(model).where(model.id == object_id, model.user_id == user_id)
    )
    if instance is None:
        raise HTTPException(status_code=404, detail=detail)
    return instance


def commit_and_refresh(session: Session, instance: Any) -> Any:
    session.commit()
    session.refresh(instance)
    return instance
