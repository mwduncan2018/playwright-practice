"""The activity log, for admins: filter by user, action, type and date."""

from datetime import UTC, date, datetime, time, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, col, func, select

from ..auth import AdminUser
from ..db import get_session
from ..models import Activity
from ..schemas import ActivityAction, ActivityOut, ActivityUser, EntityType, Page

router = APIRouter(prefix="/api/activity", tags=["activity"])
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=Page[ActivityOut])
def list_activity(
    session: SessionDep,
    _user: AdminUser,
    username: str | None = None,
    action: ActivityAction | None = None,
    entity_type: EntityType | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> Page[ActivityOut]:
    conditions = []
    if username:
        conditions.append(col(Activity.username) == username)
    if action:
        conditions.append(col(Activity.action) == action)
    if entity_type:
        conditions.append(col(Activity.entity_type) == entity_type)
    # Dates are UTC days, matching the UTC times the app shows.
    if date_from:
        conditions.append(col(Activity.at) >= datetime.combine(date_from, time.min, tzinfo=UTC))
    if date_to:
        conditions.append(col(Activity.at) < datetime.combine(date_to + timedelta(days=1), time.min, tzinfo=UTC))

    count = select(func.count()).select_from(Activity)
    entries = select(Activity).order_by(col(Activity.at).desc(), col(Activity.id).desc())
    if conditions:
        count = count.where(*conditions)
        entries = entries.where(*conditions)
    total = session.exec(count).one()
    rows = session.exec(entries.offset((page - 1) * page_size).limit(page_size)).all()
    return Page(
        items=[ActivityOut(**row.model_dump()) for row in rows], total=total, page=page, page_size=page_size
    )


@router.get("/users", response_model=list[ActivityUser])
def list_activity_users(session: SessionDep, _user: AdminUser) -> list[ActivityUser]:
    statement = select(Activity.username, Activity.user_display_name).distinct().order_by(col(Activity.username))
    return [ActivityUser(username=username, name=name) for username, name in session.exec(statement).all()]
