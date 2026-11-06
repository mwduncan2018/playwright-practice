"""Database tables."""

from datetime import UTC, date, datetime
from typing import Any

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    """The current time in UTC. SQLModel stores datetimes in UTC and returns them marked as UTC."""
    return datetime.now(UTC)


class Person(SQLModel, table=True):
    username: str = Field(primary_key=True)
    name: str
    email: str
    role: str
    title: str
    department: str = Field(index=True)
    location: str
    phone: str


class ServiceRequest(SQLModel, table=True):
    """A request for equipment, software or access. Its number is REQ- followed by 1000 + id."""

    __tablename__ = "service_request"

    id: int | None = Field(default=None, primary_key=True)
    type: str = Field(index=True)
    title: str
    requester_username: str = Field(index=True)
    requester_name: str
    status: str = Field(index=True)
    priority: str
    needed_by: date | None = None
    justification: str
    details: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    created_at: datetime = Field(default_factory=utc_now, index=True)
    updated_at: datetime = Field(default_factory=utc_now)
    decided_by: str | None = None
    decided_at: datetime | None = None
    decision_note: str = ""

    @property
    def number(self) -> str:
        return f"REQ-{1000 + (self.id or 0)}"


class RequestEvent(SQLModel, table=True):
    """One line of a request's history: Submitted, Comment, Approved, Rejected or Cancelled."""

    id: int | None = Field(default=None, primary_key=True)
    request_id: int = Field(foreign_key="service_request.id", index=True)
    at: datetime = Field(default_factory=utc_now)
    username: str
    name: str
    kind: str
    text: str = ""


class Announcement(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    body: str
    audience: str
    pinned: bool = False
    publish_at: datetime = Field(default_factory=utc_now, index=True)
    author_username: str
    author_name: str


class UserSettings(SQLModel, table=True):
    username: str = Field(primary_key=True)
    email_on_decision: bool = True
    email_on_comment: bool = True
    weekly_summary: bool = False
    default_priority: str = "Normal"
    page_size: int = 10
