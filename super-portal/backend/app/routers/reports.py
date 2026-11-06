"""Reports for admins: request counts by status, type and priority, and how long decisions take."""

from collections import Counter
from typing import Annotated, get_args

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..auth import AdminUser
from ..db import get_session
from ..models import ServiceRequest
from ..schemas import CountOut, Priority, ReportsOut, RequestStatus, RequestType
from .requests import to_request_out

router = APIRouter(prefix="/api/reports", tags=["reports"])
SessionDep = Annotated[Session, Depends(get_session)]


def _counts(values: list[str], labels: tuple[str, ...]) -> list[CountOut]:
    counter = Counter(values)
    return [CountOut(label=label, count=counter[label]) for label in labels]


@router.get("", response_model=ReportsOut)
def reports(session: SessionDep, _user: AdminUser) -> ReportsOut:
    records = session.exec(select(ServiceRequest)).all()
    decided = [r for r in records if r.decided_at is not None]
    hours = [(r.decided_at - r.created_at).total_seconds() / 3600 for r in decided]
    waiting = sorted((r for r in records if r.status == "Submitted"), key=lambda r: (r.created_at, r.id))
    return ReportsOut(
        total=len(records),
        by_status=_counts([r.status for r in records], get_args(RequestStatus)),
        by_type=_counts([r.type for r in records], get_args(RequestType)),
        by_priority=_counts([r.priority for r in records], get_args(Priority)),
        average_decision_hours=round(sum(hours) / len(hours), 1) if hours else None,
        oldest_waiting=to_request_out(waiting[0]) if waiting else None,
    )
