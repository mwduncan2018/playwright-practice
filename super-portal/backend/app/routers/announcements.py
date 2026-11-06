"""Announcements: everyone reads them; admins publish, schedule and delete them."""

from datetime import UTC, datetime, time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi import status as http_status
from sqlmodel import Session, col, select

from ..auth import AdminUser, CurrentUser, User
from ..db import get_session
from ..models import Announcement, utc_now
from ..schemas import AnnouncementIn, AnnouncementOut

router = APIRouter(prefix="/api/announcements", tags=["announcements"])
SessionDep = Annotated[Session, Depends(get_session)]
STANDARD_AUDIENCES = ("Everyone", "Standard users")


def visible_to(user: User, announcement: Announcement, now: datetime) -> bool:
    """Admins see everything, including scheduled ones. Others see published ones meant for them."""
    if user.is_admin:
        return True
    return announcement.publish_at <= now and announcement.audience in STANDARD_AUDIENCES


def to_announcement_out(announcement: Announcement, now: datetime) -> AnnouncementOut:
    return AnnouncementOut(
        id=announcement.id,
        title=announcement.title,
        body=announcement.body,
        audience=announcement.audience,
        pinned=announcement.pinned,
        publish_at=announcement.publish_at,
        author_name=announcement.author_name,
        scheduled=announcement.publish_at > now,
    )


def visible_announcements(session: Session, user: User) -> list[AnnouncementOut]:
    now = utc_now()
    rows = session.exec(
        select(Announcement).order_by(col(Announcement.pinned).desc(), col(Announcement.publish_at).desc())
    ).all()
    return [to_announcement_out(a, now) for a in rows if visible_to(user, a, now)]


def _find(session: Session, user: User, announcement_id: int) -> Announcement:
    announcement = session.get(Announcement, announcement_id)
    if announcement is None or not visible_to(user, announcement, utc_now()):
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Announcement not found.")
    return announcement


@router.get("", response_model=list[AnnouncementOut])
def list_announcements(session: SessionDep, user: CurrentUser) -> list[AnnouncementOut]:
    return visible_announcements(session, user)


@router.get("/{announcement_id}", response_model=AnnouncementOut)
def get_announcement(announcement_id: int, session: SessionDep, user: CurrentUser) -> AnnouncementOut:
    return to_announcement_out(_find(session, user, announcement_id), utc_now())


@router.post("", response_model=AnnouncementOut, status_code=http_status.HTTP_201_CREATED)
def create_announcement(body: AnnouncementIn, session: SessionDep, user: AdminUser) -> AnnouncementOut:
    now = utc_now()
    if body.publish_on is not None and body.publish_on <= now.date():
        raise HTTPException(400, {"field": "publish_on", "message": "Choose a date after today."})
    publish_at = now if body.publish_on is None else datetime.combine(body.publish_on, time(9, 0), tzinfo=UTC)
    announcement = Announcement(
        title=body.title,
        body=body.body,
        audience=body.audience,
        pinned=body.pinned,
        publish_at=publish_at,
        author_username=user.username,
        author_name=user.name,
    )
    session.add(announcement)
    session.commit()
    session.refresh(announcement)
    return to_announcement_out(announcement, now)


@router.delete("/{announcement_id}", status_code=http_status.HTTP_204_NO_CONTENT)
def delete_announcement(announcement_id: int, session: SessionDep, user: AdminUser) -> Response:
    session.delete(_find(session, user, announcement_id))
    session.commit()
    return Response(status_code=http_status.HTTP_204_NO_CONTENT)
