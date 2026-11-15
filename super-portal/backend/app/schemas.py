"""What the API accepts and returns, including the rules each kind of request must follow."""

from datetime import UTC, date, datetime, timedelta
from typing import Annotated, Any, Generic, Literal, TypeVar

from pydantic import BaseModel, Field, PlainSerializer, StringConstraints, field_validator, model_validator


def _as_utc_text(value: datetime) -> str:
    aware = value if value.tzinfo is not None else value.replace(tzinfo=UTC)
    return aware.astimezone(UTC).isoformat().replace("+00:00", "Z")


UtcDatetime = Annotated[datetime, PlainSerializer(_as_utc_text, return_type=str)]

EQUIPMENT_ITEMS = ("Laptop", "Monitor", "Keyboard", "Mouse", "Headset", "Docking station", "Webcam")
SOFTWARE = ("Adobe Acrobat Pro", "Figma", "JetBrains IntelliJ IDEA", "Microsoft Visio", "Miro", "Tableau")
SYSTEMS = ("Customer CRM", "Finance reporting", "HR records", "Production database", "Source code repository")
LICENSES = ("1 month", "6 months", "1 year")
ACCESS_LEVELS = ("Read only", "Read and write", "Administrator")
DELIVERY_METHODS = {"Desk": "Deliver to my desk", "Ship": "Ship to an address", "Pickup": "Pick up at the IT desk"}

Priority = Literal["Low", "Normal", "High", "Urgent"]
RequestType = Literal["Equipment", "Software", "Access"]
RequestStatus = Literal["Submitted", "Approved", "Rejected", "Cancelled"]
Audience = Literal["Everyone", "Admins", "Standard users"]


def _text(min_length: int, max_length: int):
    return StringConstraints(strip_whitespace=True, min_length=min_length, max_length=max_length)


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


class EquipmentDetails(BaseModel):
    type: Literal["Equipment"]
    item: Literal[EQUIPMENT_ITEMS]
    quantity: int = Field(ge=1, le=10)
    delivery: Literal["Desk", "Ship", "Pickup"]
    address: Annotated[str, _text(0, 300)] = ""

    @model_validator(mode="after")
    def address_when_shipping(self):
        if self.delivery == "Ship" and len(self.address) < 10:
            raise ValueError("Enter the full delivery address.")
        if self.delivery != "Ship":
            self.address = ""
        return self


class SoftwareDetails(BaseModel):
    type: Literal["Software"]
    software: Literal[SOFTWARE]
    license: Literal[LICENSES]
    seats: int = Field(ge=1, le=50)


class AccessDetails(BaseModel):
    type: Literal["Access"]
    system: Literal[SYSTEMS]
    level: Literal[ACCESS_LEVELS]
    security_justification: Annotated[str, _text(0, 1000)] = ""
    training_completed: bool = False

    @model_validator(mode="after")
    def security_review(self):
        """Administrator access needs a reason and completed security training."""
        if self.level == "Administrator":
            if len(self.security_justification) < 20:
                raise ValueError("Explain in at least 20 characters why you need administrator access.")
            if not self.training_completed:
                raise ValueError("Confirm that you've completed security training.")
        else:
            self.security_justification = ""
            self.training_completed = False
        return self


Details = Annotated[EquipmentDetails | SoftwareDetails | AccessDetails, Field(discriminator="type")]


class RequestIn(BaseModel):
    details: Details
    priority: Priority
    needed_by: date | None = None
    justification: Annotated[str, _text(10, 1000)]

    @field_validator("needed_by")
    @classmethod
    def not_in_the_past(cls, value: date | None) -> date | None:
        # A day's grace, so "today" in a time zone behind UTC is still accepted.
        if value is not None and value < datetime.now(UTC).date() - timedelta(days=1):
            raise ValueError("Choose today or a later date.")
        return value


class RequestOut(BaseModel):
    number: str
    type: str
    title: str
    requester_username: str
    requester_name: str
    status: str
    priority: str
    needed_by: date | None
    justification: str
    details: dict[str, Any]
    created_at: UtcDatetime
    updated_at: UtcDatetime
    decided_by: str | None
    decided_at: UtcDatetime | None
    decision_note: str


class EventOut(BaseModel):
    at: UtcDatetime
    username: str
    name: str
    kind: str
    text: str


class RequestDetailOut(RequestOut):
    events: list[EventOut]
    can_cancel: bool
    can_decide: bool
    decide_blocked_reason: str | None


class ApproveIn(BaseModel):
    note: Annotated[str, _text(0, 500)] = ""


class RejectIn(BaseModel):
    reason: Annotated[str, _text(5, 500)]


class CommentIn(BaseModel):
    text: Annotated[str, _text(1, 1000)]


class AnnouncementIn(BaseModel):
    title: Annotated[str, _text(1, 120)]
    body: Annotated[str, _text(1, 2000)]
    audience: Audience
    pinned: bool = False
    publish_on: date | None = None
    """Leave out to publish now. Otherwise a date after today (UTC), published at 09:00 UTC."""


class AnnouncementOut(BaseModel):
    id: int
    title: str
    body: str
    audience: str
    pinned: bool
    publish_at: UtcDatetime
    author_name: str
    scheduled: bool


class PersonOut(BaseModel):
    username: str
    name: str
    email: str
    role: str
    title: str
    department: str
    location: str
    phone: str


class SettingsIn(BaseModel):
    email_on_decision: bool
    email_on_comment: bool
    weekly_summary: bool
    default_priority: Priority
    page_size: Literal[10, 25, 50, 100]


class SettingsOut(SettingsIn):
    pass


class HomeOut(BaseModel):
    open_count: int
    approvals_waiting: int | None
    recent: list[RequestOut]
    announcements: list[AnnouncementOut]


class CountOut(BaseModel):
    label: str
    count: int


class ReportsOut(BaseModel):
    total: int
    by_status: list[CountOut]
    by_type: list[CountOut]
    by_priority: list[CountOut]
    average_decision_hours: float | None
    oldest_waiting: RequestOut | None


class MeOut(BaseModel):
    username: str
    name: str
    email: str
    roles: list[str]
    is_admin: bool
