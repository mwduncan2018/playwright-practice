"""Categories: list with product counts; create, change and delete."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi import status as http_status
from sqlmodel import Session, col, func, select

from ..activity_log import describe_changes, record
from ..auth import AdminUser, CurrentUser
from ..db import get_session
from ..models import Category, Product
from ..schemas import CategoryIn, CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])
SessionDep = Annotated[Session, Depends(get_session)]


def _with_counts(session: Session, category_id: int | None = None) -> list[CategoryOut]:
    statement = (
        select(Category, func.count(col(Product.id)))
        .outerjoin(Product, col(Product.category_id) == col(Category.id))
        .group_by(col(Category.id))
        .order_by(func.lower(Category.name))
    )
    if category_id is not None:
        statement = statement.where(col(Category.id) == category_id)
    return [
        CategoryOut(id=category.id, name=category.name, description=category.description, product_count=count)
        for category, count in session.exec(statement).all()
    ]


def _get(session: Session, category_id: int) -> Category:
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Category not found.")
    return category


def _check_name_free(session: Session, name: str, category_id: int | None = None) -> None:
    existing = session.exec(select(Category).where(func.lower(Category.name) == name.lower())).first()
    if existing is not None and existing.id != category_id:
        raise HTTPException(
            http_status.HTTP_409_CONFLICT, {"field": "name", "message": f"A category named {name} already exists."}
        )


@router.get("", response_model=list[CategoryOut])
def list_categories(session: SessionDep, _user: CurrentUser) -> list[CategoryOut]:
    return _with_counts(session)


@router.post("", response_model=CategoryOut, status_code=http_status.HTTP_201_CREATED)
def create_category(body: CategoryIn, session: SessionDep, user: AdminUser) -> CategoryOut:
    _check_name_free(session, body.name)
    category = Category(name=body.name, description=body.description)
    session.add(category)
    session.flush()
    record(session, user, "Created", "Category", category.id, category.name)
    session.commit()
    return _with_counts(session, category.id)[0]


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, body: CategoryIn, session: SessionDep, user: AdminUser) -> CategoryOut:
    category = _get(session, category_id)
    _check_name_free(session, body.name, category_id)
    before = {"name": category.name, "description": category.description}
    category.name = body.name
    category.description = body.description
    changes = describe_changes(before, body.model_dump(), {"name": "Name", "description": "Description"})
    if changes:
        record(session, user, "Updated", "Category", category_id, category.name, changes)
    session.add(category)
    session.commit()
    return _with_counts(session, category_id)[0]


@router.delete("/{category_id}", status_code=http_status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, session: SessionDep, user: AdminUser) -> Response:
    category = _get(session, category_id)
    count = session.exec(select(func.count()).select_from(Product).where(col(Product.category_id) == category_id)).one()
    if count:
        products = "1 product" if count == 1 else f"{count} products"
        raise HTTPException(
            http_status.HTTP_409_CONFLICT,
            {"message": f"{category.name} has {products}, so it can't be deleted. Move or delete them first."},
        )
    session.delete(category)
    record(session, user, "Deleted", "Category", category_id, category.name)
    session.commit()
    return Response(status_code=http_status.HTTP_204_NO_CONTENT)
