"""Database tables."""

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    """The current time in UTC. SQLModel stores datetimes in UTC and returns them marked as UTC."""
    return datetime.now(UTC)


class Category(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: str = ""


class Supplier(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    contact_name: str = ""
    email: str = ""
    phone: str = ""
    country: str = ""


class Product(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    sku: str = Field(unique=True, index=True)
    name: str = Field(index=True)
    description: str = ""
    category_id: int = Field(foreign_key="category.id", index=True)
    supplier_id: int | None = Field(default=None, foreign_key="supplier.id", index=True)
    price: float
    stock: int
    reorder_level: int
    status: str
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    created_by: str = ""
    updated_by: str = ""


class ProductImage(SQLModel, table=True):
    product_id: int = Field(primary_key=True, foreign_key="product.id")
    content_type: str
    data: bytes


class Activity(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    at: datetime = Field(default_factory=utc_now, index=True)
    username: str = Field(index=True)
    user_display_name: str
    action: str
    entity_type: str
    entity_id: int
    entity_label: str
    details: str = ""
