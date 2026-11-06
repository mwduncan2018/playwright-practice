"""The dashboard: counts, the lowest stock and the latest changes."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session, col, func, select

from ..auth import CurrentUser
from ..db import get_session
from ..models import Category, Product, Supplier
from ..schemas import DashboardOut
from .products import select_products, to_product_out

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=DashboardOut)
def dashboard(session: SessionDep, _user: CurrentUser) -> DashboardOut:
    def count(statement) -> int:
        return session.exec(statement).one()

    low_stock = col(Product.stock) <= col(Product.reorder_level)
    lowest = session.exec(
        select_products().where(low_stock).order_by(col(Product.stock).asc(), col(Product.sku).asc()).limit(5)
    ).all()
    latest = session.exec(
        select_products().order_by(col(Product.updated_at).desc(), col(Product.id).desc()).limit(5)
    ).all()
    return DashboardOut(
        product_count=count(select(func.count()).select_from(Product)),
        active_count=count(select(func.count()).select_from(Product).where(col(Product.status) == "Active")),
        low_stock_count=count(select(func.count()).select_from(Product).where(low_stock)),
        category_count=count(select(func.count()).select_from(Category)),
        supplier_count=count(select(func.count()).select_from(Supplier)),
        low_stock=[to_product_out(*row) for row in lowest],
        recently_updated=[to_product_out(*row) for row in latest],
    )
