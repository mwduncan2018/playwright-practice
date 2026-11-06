"""Products: a filtered, sorted, paged list; CSV export; create, change and delete; images."""

import csv
import io
from datetime import UTC, datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, UploadFile
from fastapi import status as http_status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, col, func, or_, select

from ..activity_log import describe_changes, record
from ..auth import AdminUser, CurrentUser
from ..db import get_session
from ..models import Category, Product, ProductImage, Supplier, utc_now
from ..schemas import Page, ProductIn, ProductOut, ProductStatus

router = APIRouter(prefix="/api/products", tags=["products"])
SessionDep = Annotated[Session, Depends(get_session)]
SortField = Literal["sku", "name", "category", "supplier", "price", "stock", "status", "updated_at"]
MAX_IMAGE_BYTES = 1024 * 1024
CHANGE_LABELS = {
    "sku": "SKU",
    "name": "Name",
    "category": "Category",
    "supplier": "Supplier",
    "price": "Price",
    "stock": "Stock",
    "reorder_level": "Reorder level",
    "status": "Status",
    "description": "Description",
}


class ProductQuery:
    """The filters and sort order that the list and the CSV export share."""

    def __init__(
        self,
        search: str | None = None,
        category_id: int | None = None,
        supplier_id: int | None = None,
        status: ProductStatus | None = None,
        low_stock: bool = False,
        min_price: Annotated[float | None, Query(ge=0)] = None,
        max_price: Annotated[float | None, Query(ge=0)] = None,
        sort: SortField = "name",
        order: Literal["asc", "desc"] = "asc",
    ) -> None:
        self.search = (search or "").strip()
        self.category_id = category_id
        self.supplier_id = supplier_id
        self.status = status
        self.low_stock = low_stock
        self.min_price = min_price
        self.max_price = max_price
        self.sort = sort
        self.order = order

    def apply(self, statement):
        conditions = []
        if self.search:
            term = "%" + self.search.lower().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
            conditions.append(
                or_(func.lower(Product.name).like(term, escape="\\"), func.lower(Product.sku).like(term, escape="\\"))
            )
        if self.category_id is not None:
            conditions.append(col(Product.category_id) == self.category_id)
        if self.supplier_id is not None:
            conditions.append(col(Product.supplier_id) == self.supplier_id)
        if self.status is not None:
            conditions.append(col(Product.status) == self.status)
        if self.low_stock:
            conditions.append(col(Product.stock) <= col(Product.reorder_level))
        if self.min_price is not None:
            conditions.append(col(Product.price) >= self.min_price)
        if self.max_price is not None:
            conditions.append(col(Product.price) <= self.max_price)
        return statement.where(*conditions) if conditions else statement

    def order_by(self) -> list:
        columns = {
            "sku": col(Product.sku),
            "name": func.lower(Product.name),
            "category": func.lower(Category.name),
            "supplier": func.lower(Supplier.name),
            "price": col(Product.price),
            "stock": col(Product.stock),
            "status": col(Product.status),
            "updated_at": col(Product.updated_at),
        }
        column = columns[self.sort]
        return [column.asc() if self.order == "asc" else column.desc(), col(Product.id).asc()]


QueryDep = Annotated[ProductQuery, Depends()]


def select_products():
    """Products with their category and supplier names, and whether they have an image."""
    return (
        select(Product, Category.name, Supplier.name, ProductImage.product_id)
        .join(Category, col(Product.category_id) == col(Category.id))
        .outerjoin(Supplier, col(Product.supplier_id) == col(Supplier.id))
        .outerjoin(ProductImage, col(ProductImage.product_id) == col(Product.id))
    )


def to_product_out(product: Product, category_name: str, supplier_name: str | None, image_id: int | None) -> ProductOut:
    has_image = image_id is not None
    return ProductOut(
        id=product.id,
        sku=product.sku,
        name=product.name,
        description=product.description,
        category_id=product.category_id,
        category_name=category_name,
        supplier_id=product.supplier_id,
        supplier_name=supplier_name,
        price=product.price,
        stock=product.stock,
        reorder_level=product.reorder_level,
        status=product.status,
        low_stock=product.stock <= product.reorder_level,
        has_image=has_image,
        image_url=f"/api/products/{product.id}/image?v={int(product.updated_at.timestamp())}" if has_image else None,
        created_at=product.created_at,
        updated_at=product.updated_at,
        created_by=product.created_by,
        updated_by=product.updated_by,
    )


def _load(session: Session, product_id: int) -> ProductOut:
    row = session.exec(select_products().where(col(Product.id) == product_id)).first()
    if row is None:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Product not found.")
    return to_product_out(*row)


def _get(session: Session, product_id: int) -> Product:
    product = session.get(Product, product_id)
    if product is None:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Product not found.")
    return product


def _field_error(code: int, field: str, message: str) -> HTTPException:
    return HTTPException(code, {"field": field, "message": message})


def _check(session: Session, body: ProductIn, product_id: int | None = None) -> None:
    if session.get(Category, body.category_id) is None:
        raise _field_error(400, "category_id", "Choose a category that exists.")
    if body.supplier_id is not None and session.get(Supplier, body.supplier_id) is None:
        raise _field_error(400, "supplier_id", "Choose a supplier that exists.")
    existing = session.exec(select(Product).where(col(Product.sku) == body.sku)).first()
    if existing is not None and existing.id != product_id:
        raise _sku_taken(body.sku)


def _sku_taken(sku: str) -> HTTPException:
    return _field_error(http_status.HTTP_409_CONFLICT, "sku", f"Another product already uses SKU {sku}.")


def _commit(session: Session, sku: str) -> None:
    """Commit, turning a SKU that another request took in the meantime into the usual error."""
    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        raise _sku_taken(sku) from error


def _snapshot(session: Session, product: Product) -> dict[str, object]:
    category = session.get(Category, product.category_id)
    supplier = session.get(Supplier, product.supplier_id) if product.supplier_id is not None else None
    return {
        "sku": product.sku,
        "name": product.name,
        "category": category.name if category else None,
        "supplier": supplier.name if supplier else None,
        "price": product.price,
        "stock": product.stock,
        "reorder_level": product.reorder_level,
        "status": product.status,
        "description": product.description,
    }


def _values(body: ProductIn) -> dict[str, object]:
    values = body.model_dump()
    values["price"] = round(body.price, 2)
    return values


@router.get("", response_model=Page[ProductOut])
def list_products(
    session: SessionDep,
    _user: CurrentUser,
    query: QueryDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
) -> Page[ProductOut]:
    total = session.exec(query.apply(select(func.count()).select_from(Product))).one()
    rows = session.exec(
        query.apply(select_products()).order_by(*query.order_by()).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return Page(items=[to_product_out(*row) for row in rows], total=total, page=page, page_size=page_size)


@router.get("/export.csv", response_class=Response)
def export_products(session: SessionDep, _user: CurrentUser, query: QueryDep) -> Response:
    rows = session.exec(query.apply(select_products()).order_by(*query.order_by())).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(["SKU", "Name", "Category", "Supplier", "Price", "Stock", "Reorder level", "Status", "Last updated (UTC)"])
    for product, category_name, supplier_name, _image in rows:
        writer.writerow(
            [
                product.sku,
                product.name,
                category_name,
                supplier_name or "",
                f"{product.price:.2f}",
                product.stock,
                product.reorder_level,
                product.status,
                product.updated_at.strftime("%Y-%m-%d %H:%M"),
            ]
        )
    filename = f"products-{datetime.now(UTC):%Y-%m-%d}.csv"
    return Response(
        buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, session: SessionDep, _user: CurrentUser) -> ProductOut:
    return _load(session, product_id)


@router.post("", response_model=ProductOut, status_code=http_status.HTTP_201_CREATED)
def create_product(body: ProductIn, session: SessionDep, user: AdminUser) -> ProductOut:
    _check(session, body)
    now = utc_now()
    product = Product(**_values(body), created_at=now, updated_at=now, created_by=user.name, updated_by=user.name)
    session.add(product)
    try:
        session.flush()
    except IntegrityError as error:
        session.rollback()
        raise _sku_taken(body.sku) from error
    record(session, user, "Created", "Product", product.id, f"{product.sku} {product.name}")
    _commit(session, body.sku)
    return _load(session, product.id)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, body: ProductIn, session: SessionDep, user: AdminUser) -> ProductOut:
    product = _get(session, product_id)
    _check(session, body, product_id)
    before = _snapshot(session, product)
    for key, value in _values(body).items():
        setattr(product, key, value)
    changes = describe_changes(before, _snapshot(session, product), CHANGE_LABELS, frozenset({"description"}))
    if changes:
        product.updated_at = utc_now()
        product.updated_by = user.name
        record(session, user, "Updated", "Product", product_id, f"{product.sku} {product.name}", changes)
    session.add(product)
    _commit(session, body.sku)
    return _load(session, product_id)


@router.delete("/{product_id}", status_code=http_status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, session: SessionDep, user: AdminUser) -> Response:
    product = _get(session, product_id)
    image = session.get(ProductImage, product_id)
    if image is not None:
        session.delete(image)
        session.flush()
    label = f"{product.sku} {product.name}"
    session.delete(product)
    record(session, user, "Deleted", "Product", product_id, label)
    session.commit()
    return Response(status_code=http_status.HTTP_204_NO_CONTENT)


def _image_type(data: bytes) -> str | None:
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    return None


@router.put("/{product_id}/image", response_model=ProductOut)
def upload_image(product_id: int, file: UploadFile, session: SessionDep, user: AdminUser) -> ProductOut:
    product = _get(session, product_id)
    data = file.file.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise _field_error(400, "image", "Choose an image of 1 MB or less.")
    content_type = _image_type(data)
    if content_type is None:
        raise _field_error(400, "image", "Choose a PNG or JPEG image.")
    image = session.get(ProductImage, product_id)
    details = "Image replaced" if image is not None else "Image added"
    if image is None:
        session.add(ProductImage(product_id=product_id, content_type=content_type, data=data))
    else:
        image.content_type = content_type
        image.data = data
        session.add(image)
    product.updated_at = utc_now()
    product.updated_by = user.name
    session.add(product)
    record(session, user, "Updated", "Product", product_id, f"{product.sku} {product.name}", details)
    session.commit()
    return _load(session, product_id)


@router.delete("/{product_id}/image", response_model=ProductOut)
def remove_image(product_id: int, session: SessionDep, user: AdminUser) -> ProductOut:
    product = _get(session, product_id)
    image = session.get(ProductImage, product_id)
    if image is None:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "This product has no image.")
    session.delete(image)
    product.updated_at = utc_now()
    product.updated_by = user.name
    session.add(product)
    record(session, user, "Updated", "Product", product_id, f"{product.sku} {product.name}", "Image removed")
    session.commit()
    return _load(session, product_id)


@router.get("/{product_id}/image", response_class=Response)
def get_image(product_id: int, session: SessionDep) -> Response:
    """Public, so an <img> tag can show it without a token."""
    image = session.get(ProductImage, product_id)
    if image is None:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "This product has no image.")
    return Response(image.data, media_type=image.content_type, headers={"Cache-Control": "private, max-age=3600"})
