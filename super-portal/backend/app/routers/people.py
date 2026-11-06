"""The people directory."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status as http_status
from sqlmodel import Session, col, func, or_, select

from ..auth import CurrentUser
from ..db import get_session
from ..models import Person
from ..schemas import PersonOut

router = APIRouter(prefix="/api/people", tags=["people"])
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=list[PersonOut])
def list_people(
    session: SessionDep, _user: CurrentUser, search: str | None = None, department: str | None = None
) -> list[PersonOut]:
    statement = select(Person).order_by(col(Person.name))
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        statement = statement.where(
            or_(
                func.lower(Person.name).like(term),
                func.lower(Person.username).like(term),
                func.lower(Person.title).like(term),
            )
        )
    if department:
        statement = statement.where(col(Person.department) == department)
    return [PersonOut(**person.model_dump()) for person in session.exec(statement).all()]


@router.get("/departments", response_model=list[str])
def list_departments(session: SessionDep, _user: CurrentUser) -> list[str]:
    return list(session.exec(select(Person.department).distinct().order_by(col(Person.department))).all())


@router.get("/{username}", response_model=PersonOut)
def get_person(username: str, session: SessionDep, _user: CurrentUser) -> PersonOut:
    person = session.get(Person, username)
    if person is None:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Person not found.")
    return PersonOut(**person.model_dump())
