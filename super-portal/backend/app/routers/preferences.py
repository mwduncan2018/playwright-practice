"""Each user's own settings."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..auth import CurrentUser
from ..db import get_session
from ..models import UserSettings
from ..schemas import SettingsIn, SettingsOut

router = APIRouter(prefix="/api/settings", tags=["settings"])
SessionDep = Annotated[Session, Depends(get_session)]


def settings_for(session: Session, username: str) -> UserSettings:
    """The user's saved settings, or the defaults if they've never saved any."""
    return session.get(UserSettings, username) or UserSettings(username=username)


@router.get("", response_model=SettingsOut)
def get_settings(session: SessionDep, user: CurrentUser) -> SettingsOut:
    return SettingsOut(**settings_for(session, user.username).model_dump(exclude={"username"}))


@router.put("", response_model=SettingsOut)
def save_settings(body: SettingsIn, session: SessionDep, user: CurrentUser) -> SettingsOut:
    saved = settings_for(session, user.username)
    for key, value in body.model_dump().items():
        setattr(saved, key, value)
    session.add(saved)
    session.commit()
    return SettingsOut(**body.model_dump())
