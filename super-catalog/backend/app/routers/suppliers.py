"""Suppliers: a filtered list with product counts; create, change and delete."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi import status as http_status
from sqlmodel import Session, col, func, or_, select

from ..activity_log import describe_changes, record
from ..auth import AdminUser, CurrentUser
from ..db import get_session
from ..models import Product, Supplier
from ..schemas import SupplierIn, SupplierOut

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])
SessionDep = Annotated[Session, Depends(get_session)]
LABELS = {"name": "Name", "contact_name": "Contact", "email": "Email", "phone": "Phone", "country": "Country"}


def _with_counts(session: Session, *conditions) -> list[SupplierOut]:
    statement = (
        select(Supplier, func.count(col(Product.id)))
        .outerjoin(Product, col(Product.supplier_id) == col(Supplier.id))
        .group_by(col(Supplier.id))
        .order_by(func.lower(Supplier.name))
    )
    if conditions:
        statement = statement.where(*conditions)
    return [SupplierOut(**supplier.model_dump(), product_count=count) for supplier, count in session.exec(statement).all()]


def _get(session: Session, supplier_id: int) -> Supplier:
    supplier = session.get(Supplier, supplier_id)
    if supplier is None:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Supplier not found.")
    return supplier


def _check_name_free(session: Session, name: str, supplier_id: int | None = None) -> None:
    existing = session.exec(select(Supplier).where(func.lower(Supplier.name) == name.lower())).first()
    if existing is not None and existing.id != supplier_id:
        raise HTTPException(
            http_status.HTTP_409_CONFLICT, {"field": "name", "message": f"A supplier named {name} already exists."}
        )


@router.get("", response_model=list[SupplierOut])
def list_suppliers(
    session: SessionDep, _user: CurrentUser, search: str | None = None, country: str | None = None
) -> list[SupplierOut]:
    conditions = []
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        conditions.append(or_(func.lower(Supplier.name).like(term), func.lower(Supplier.contact_name).like(term)))
    if country:
        conditions.append(col(Supplier.country) == country)
    return _with_counts(session, *conditions)


@router.get("/countries", response_model=list[str])
def list_countries(session: SessionDep, _user: CurrentUser) -> list[str]:
    statement = select(Supplier.country).where(col(Supplier.country) != "").distinct().order_by(col(Supplier.country))
    return list(session.exec(statement).all())


@router.get("/{supplier_id}", response_model=SupplierOut)
def get_supplier(supplier_id: int, session: SessionDep, _user: CurrentUser) -> SupplierOut:
    _get(session, supplier_id)
    return _with_counts(session, col(Supplier.id) == supplier_id)[0]


@router.post("", response_model=SupplierOut, status_code=http_status.HTTP_201_CREATED)
def create_supplier(body: SupplierIn, session: SessionDep, user: AdminUser) -> SupplierOut:
    _check_name_free(session, body.name)
    supplier = Supplier(**body.model_dump())
    session.add(supplier)
    session.flush()
    record(session, user, "Created", "Supplier", supplier.id, supplier.name)
    session.commit()
    return get_supplier(supplier.id, session, user)


@router.put("/{supplier_id}", response_model=SupplierOut)
def update_supplier(supplier_id: int, body: SupplierIn, session: SessionDep, user: AdminUser) -> SupplierOut:
    supplier = _get(session, supplier_id)
    _check_name_free(session, body.name, supplier_id)
    before = supplier.model_dump()
    for key, value in body.model_dump().items():
        setattr(supplier, key, value)
    changes = describe_changes(before, supplier.model_dump(), LABELS)
    if changes:
        record(session, user, "Updated", "Supplier", supplier_id, supplier.name, changes)
    session.add(supplier)
    session.commit()
    return get_supplier(supplier_id, session, user)


@router.delete("/{supplier_id}", status_code=http_status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int, session: SessionDep, user: AdminUser) -> Response:
    supplier = _get(session, supplier_id)
    count = session.exec(select(func.count()).select_from(Product).where(col(Product.supplier_id) == supplier_id)).one()
    if count:
        products = "1 product" if count == 1 else f"{count} products"
        raise HTTPException(
            http_status.HTTP_409_CONFLICT,
            {"message": f"{supplier.name} supplies {products}, so it can't be deleted. Change or delete them first."},
        )
    session.delete(supplier)
    record(session, user, "Deleted", "Supplier", supplier_id, supplier.name)
    session.commit()
    return Response(status_code=http_status.HTTP_204_NO_CONTENT)
