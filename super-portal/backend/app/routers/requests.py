"""Requests: make one, follow it, comment on it, cancel it, and (for admins) approve or reject it."""

import re
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from sqlmodel import Session, col, func, select

from ..auth import AdminUser, CurrentUser, User
from ..db import get_session
from ..models import RequestEvent, ServiceRequest, utc_now
from ..schemas import (
    ApproveIn,
    CommentIn,
    EventOut,
    Page,
    Priority,
    RejectIn,
    RequestDetailOut,
    RequestIn,
    RequestOut,
    RequestStatus,
    RequestType,
)

router = APIRouter(prefix="/api/requests", tags=["requests"])
approvals_router = APIRouter(prefix="/api/approvals", tags=["approvals"])
SessionDep = Annotated[Session, Depends(get_session)]
NUMBER = re.compile(r"(?:REQ-)?(\d{4,})", re.IGNORECASE)


def to_request_out(record: ServiceRequest) -> RequestOut:
    return RequestOut(
        number=record.number,
        type=record.type,
        title=record.title,
        requester_username=record.requester_username,
        requester_name=record.requester_name,
        status=record.status,
        priority=record.priority,
        needed_by=record.needed_by,
        justification=record.justification,
        details=record.details,
        created_at=record.created_at,
        updated_at=record.updated_at,
        decided_by=record.decided_by,
        decided_at=record.decided_at,
        decision_note=record.decision_note,
    )


def title_for(details: dict) -> str:
    """For example "Laptop", "Monitor × 2", "Figma (1 year)" or "HR records: Read only"."""
    if details["type"] == "Equipment":
        return details["item"] if details["quantity"] == 1 else f"{details['item']} × {details['quantity']}"
    if details["type"] == "Software":
        return f"{details['software']} ({details['license']})"
    return f"{details['system']}: {details['level']}"


def _find(session: Session, user: User, number: str) -> ServiceRequest:
    """The request, if this user may see it. Standard users see only their own."""
    match = NUMBER.fullmatch(number.strip())
    record = session.get(ServiceRequest, int(match.group(1)) - 1000) if match else None
    if record is None or (not user.is_admin and record.requester_username != user.username):
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Request not found.")
    return record


def _add_event(session: Session, user: User, record: ServiceRequest, kind: str, text: str = "") -> None:
    session.add(RequestEvent(request_id=record.id, username=user.username, name=user.name, kind=kind, text=text))


def _detail(session: Session, user: User, record: ServiceRequest) -> RequestDetailOut:
    events = session.exec(
        select(RequestEvent)
        .where(col(RequestEvent.request_id) == record.id)
        .order_by(col(RequestEvent.at), col(RequestEvent.id))
    ).all()
    waiting = record.status == "Submitted"
    own = record.requester_username == user.username
    return RequestDetailOut(
        **to_request_out(record).model_dump(),
        events=[EventOut(at=e.at, username=e.username, name=e.name, kind=e.kind, text=e.text) for e in events],
        can_cancel=waiting and own,
        can_decide=waiting and user.is_admin and not own,
        decide_blocked_reason="You can't approve or reject your own request." if waiting and user.is_admin and own else None,
    )


@router.get("", response_model=Page[RequestOut])
def list_requests(
    session: SessionDep,
    user: CurrentUser,
    scope: Literal["mine", "all"] = "mine",
    search: str | None = None,
    status: RequestStatus | None = None,
    type_: Annotated[RequestType | None, Query(alias="type")] = None,
    priority: Priority | None = None,
    requester: str | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
) -> Page[RequestOut]:
    if scope == "all" and not user.is_admin:
        raise HTTPException(http_status.HTTP_403_FORBIDDEN, "Only admins can see everyone's requests.")
    conditions = []
    if scope == "mine":
        conditions.append(col(ServiceRequest.requester_username) == user.username)
    elif requester:
        conditions.append(col(ServiceRequest.requester_username) == requester)
    if search and search.strip():
        number = NUMBER.fullmatch(search.strip())
        if number:
            conditions.append(col(ServiceRequest.id) == int(number.group(1)) - 1000)
        else:
            conditions.append(func.lower(ServiceRequest.title).like(f"%{search.strip().lower()}%"))
    if status:
        conditions.append(col(ServiceRequest.status) == status)
    if type_:
        conditions.append(col(ServiceRequest.type) == type_)
    if priority:
        conditions.append(col(ServiceRequest.priority) == priority)

    count = select(func.count()).select_from(ServiceRequest)
    rows = select(ServiceRequest).order_by(col(ServiceRequest.created_at).desc(), col(ServiceRequest.id).desc())
    if conditions:
        count = count.where(*conditions)
        rows = rows.where(*conditions)
    total = session.exec(count).one()
    records = session.exec(rows.offset((page - 1) * page_size).limit(page_size)).all()
    return Page(items=[to_request_out(r) for r in records], total=total, page=page, page_size=page_size)


@router.post("", response_model=RequestOut, status_code=http_status.HTTP_201_CREATED)
def create_request(body: RequestIn, session: SessionDep, user: CurrentUser) -> RequestOut:
    details = body.details.model_dump()
    now = utc_now()
    record = ServiceRequest(
        type=details["type"],
        title=title_for(details),
        requester_username=user.username,
        requester_name=user.name,
        status="Submitted",
        priority=body.priority,
        needed_by=body.needed_by,
        justification=body.justification,
        details=details,
        created_at=now,
        updated_at=now,
    )
    session.add(record)
    session.flush()
    _add_event(session, user, record, "Submitted")
    session.commit()
    session.refresh(record)
    return to_request_out(record)


@router.get("/{number}", response_model=RequestDetailOut)
def get_request(number: str, session: SessionDep, user: CurrentUser) -> RequestDetailOut:
    return _detail(session, user, _find(session, user, number))


@router.post("/{number}/comments", response_model=RequestDetailOut, status_code=http_status.HTTP_201_CREATED)
def add_comment(number: str, body: CommentIn, session: SessionDep, user: CurrentUser) -> RequestDetailOut:
    record = _find(session, user, number)
    _add_event(session, user, record, "Comment", body.text)
    record.updated_at = utc_now()
    session.add(record)
    session.commit()
    session.refresh(record)
    return _detail(session, user, record)


@router.post("/{number}/cancel", response_model=RequestDetailOut)
def cancel_request(number: str, session: SessionDep, user: CurrentUser) -> RequestDetailOut:
    record = _find(session, user, number)
    if record.requester_username != user.username:
        raise HTTPException(http_status.HTTP_403_FORBIDDEN, "Only the person who made a request can cancel it.")
    if record.status != "Submitted":
        raise HTTPException(
            http_status.HTTP_409_CONFLICT,
            f"{record.number} is already {record.status.lower()}, so it can't be cancelled.",
        )
    record.status = "Cancelled"
    record.updated_at = utc_now()
    _add_event(session, user, record, "Cancelled")
    session.add(record)
    session.commit()
    session.refresh(record)
    return _detail(session, user, record)


def _decide(session: Session, user: User, number: str, status: str, note: str) -> RequestDetailOut:
    record = _find(session, user, number)
    if record.requester_username == user.username:
        raise HTTPException(http_status.HTTP_403_FORBIDDEN, "You can't approve or reject your own request.")
    if record.status != "Submitted":
        raise HTTPException(http_status.HTTP_409_CONFLICT, f"{record.number} is already {record.status.lower()}.")
    now = utc_now()
    record.status = status
    record.decided_by = user.name
    record.decided_at = now
    record.decision_note = note
    record.updated_at = now
    _add_event(session, user, record, status, note)
    session.add(record)
    session.commit()
    session.refresh(record)
    return _detail(session, user, record)


@router.post("/{number}/approve", response_model=RequestDetailOut)
def approve_request(number: str, body: ApproveIn, session: SessionDep, user: AdminUser) -> RequestDetailOut:
    return _decide(session, user, number, "Approved", body.note)


@router.post("/{number}/reject", response_model=RequestDetailOut)
def reject_request(number: str, body: RejectIn, session: SessionDep, user: AdminUser) -> RequestDetailOut:
    return _decide(session, user, number, "Rejected", body.reason)


@approvals_router.get("", response_model=list[RequestOut])
def list_waiting(
    session: SessionDep, user: AdminUser, type_: Annotated[RequestType | None, Query(alias="type")] = None
) -> list[RequestOut]:
    """Requests waiting for a decision, oldest first. An admin's own requests go to another admin."""
    statement = select(ServiceRequest).where(
        col(ServiceRequest.status) == "Submitted", col(ServiceRequest.requester_username) != user.username
    )
    if type_:
        statement = statement.where(col(ServiceRequest.type) == type_)
    records = session.exec(statement.order_by(col(ServiceRequest.created_at), col(ServiceRequest.id))).all()
    return [to_request_out(r) for r in records]
