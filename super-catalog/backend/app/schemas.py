"""What the API accepts and returns."""

from datetime import UTC, datetime
from typing import Annotated, Generic, Literal, TypeVar

from pydantic import BaseModel, Field, PlainSerializer, StringConstraints


def _as_utc_text(value: datetime) -> str:
    aware = value if value.tzinfo is not None else value.replace(tzinfo=UTC)
    return aware.astimezone(UTC).isoformat().replace("+00:00", "Z")


UtcDatetime = Annotated[datetime, PlainSerializer(_as_utc_text, return_type=str)]
ProductStatus = Literal["Active", "Draft", "Discontinued"]
ActivityAction = Literal["Created", "Updated", "Deleted"]
EntityType = Literal["Product", "Category", "Supplier"]

Sku = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^[A-Z]{3}-\d{4}$")]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
CategoryName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)]
LongText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)]
Email = Annotated[
    str, StringConstraints(strip_whitespace=True, max_length=200, pattern=r"^(|[^@\s]+@[^@\s]+\.[^@\s]+)$")
]

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


class ProductIn(BaseModel):
    sku: Sku
    name: Name
    description: LongText = ""
    category_id: int
    supplier_id: int | None = None
    price: float = Field(gt=0, le=100_000)
    stock: int = Field(ge=0, le=1_000_000)
    reorder_level: int = Field(ge=0, le=1_000_000)
    status: ProductStatus


class ProductOut(BaseModel):
    id: int
    sku: str
    name: str
    description: str
    category_id: int
    category_name: str
    supplier_id: int | None
    supplier_name: str | None
    price: float
    stock: int
    reorder_level: int
    status: str
    low_stock: bool
    has_image: bool
    image_url: str | None
    created_at: UtcDatetime
    updated_at: UtcDatetime
    created_by: str
    updated_by: str


class CategoryIn(BaseModel):
    name: CategoryName
    description: ShortText = ""


class CategoryOut(BaseModel):
    id: int
    name: str
    description: str
    product_count: int


class SupplierIn(BaseModel):
    name: Name
    contact_name: ShortText = ""
    email: Email = ""
    phone: ShortText = ""
    country: ShortText = ""


class SupplierOut(BaseModel):
    id: int
    name: str
    contact_name: str
    email: str
    phone: str
    country: str
    product_count: int


class ActivityOut(BaseModel):
    id: int
    at: UtcDatetime
    username: str
    user_display_name: str
    action: str
    entity_type: str
    entity_id: int
    entity_label: str
    details: str


class ActivityUser(BaseModel):
    username: str
    name: str


class DashboardOut(BaseModel):
    product_count: int
    active_count: int
    low_stock_count: int
    category_count: int
    supplier_count: int
    low_stock: list[ProductOut]
    recently_updated: list[ProductOut]


class MeOut(BaseModel):
    username: str
    name: str
    email: str
    roles: list[str]
    is_admin: bool
