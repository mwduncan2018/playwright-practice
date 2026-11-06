"""The home page: the user's open requests, approvals waiting, recent requests and announcements."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session, col, func, select

from ..auth import CurrentUser
from ..db import get_session
from ..models import ServiceRequest
from ..schemas import HomeOut
from .announcements import visible_announcements
from .requests import to_request_out

router = APIRouter(prefix="/api/home", tags=["home"])
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=HomeOut)
def home(session: SessionDep, user: CurrentUser) -> HomeOut:
    mine = col(ServiceRequest.requester_username) == user.username
    waiting = col(ServiceRequest.status) == "Submitted"
    open_count = session.exec(select(func.count()).select_from(ServiceRequest).where(mine, waiting)).one()
    approvals_waiting = None
    if user.is_admin:
        approvals_waiting = session.exec(
            select(func.count()).select_from(ServiceRequest).where(waiting, col(ServiceRequest.requester_username) != user.username)
        ).one()
    recent = session.exec(
        select(ServiceRequest).where(mine).order_by(col(ServiceRequest.created_at).desc(), col(ServiceRequest.id).desc()).limit(5)
    ).all()
    return HomeOut(
        open_count=open_count,
        approvals_waiting=approvals_waiting,
        recent=[to_request_out(r) for r in recent],
        announcements=visible_announcements(session, user)[:3],
    )
