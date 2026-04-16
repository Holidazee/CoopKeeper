from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    chickens: Mapped[list["Chicken"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    eggs: Mapped[list["Egg"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    feed_records: Mapped[list["FeedRecord"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    expenses: Mapped[list["Expense"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    cleaning_logs: Mapped[list["CleaningLog"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    alerts: Mapped[list["Alert"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Chicken(Base):
    __tablename__ = "chickens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    breed: Mapped[str | None] = mapped_column(String(100), nullable=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user: Mapped["User"] = relationship(back_populates="chickens")
    eggs: Mapped[list["Egg"]] = relationship(back_populates="chicken", cascade="all, delete-orphan")


class Egg(Base):
    __tablename__ = "eggs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    count: Mapped[int] = mapped_column(nullable=False)
    chicken_id: Mapped[int | None] = mapped_column(ForeignKey("chickens.id"), nullable=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    chicken: Mapped["Chicken | None"] = relationship(back_populates="eggs")
    user: Mapped["User"] = relationship(back_populates="eggs")


class FeedRecord(Base):
    __tablename__ = "feed_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    feed_type: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    chicken_id: Mapped[int | None] = mapped_column(
        ForeignKey("chickens.id", ondelete="SET NULL"),
        nullable=True,
    )
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user: Mapped["User"] = relationship(back_populates="feed_records")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user: Mapped["User"] = relationship(back_populates="expenses")


class CleaningLog(Base):
    __tablename__ = "cleaning_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    task_type: Mapped[str] = mapped_column(String(100), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user: Mapped["User"] = relationship(back_populates="cleaning_logs")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    alert_type: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user: Mapped["User"] = relationship(back_populates="alerts")
