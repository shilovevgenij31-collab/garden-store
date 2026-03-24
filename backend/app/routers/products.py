import math
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.database import get_session
from ..schemas import ProductRead, ProductFilter, PaginatedResponse
from ..services import product_service

router = APIRouter(prefix="/api/products", tags=["products"])
limiter = Limiter(key_func=get_remote_address)


@router.get("", response_model=PaginatedResponse[ProductRead])
@limiter.limit(settings.RATE_LIMIT_PRODUCTS)
async def get_products(
    request: Request,
    category: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    season: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    filters = ProductFilter(
        category=category,
        min_price=min_price,
        max_price=max_price,
        season=season,
        search=search,
    )
    products, total = await product_service.get_products(session, filters, page, limit)
    pages = math.ceil(total / limit) if total > 0 else 1
    return PaginatedResponse(
        items=products,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.get("/slug/{slug}", response_model=ProductRead)
async def get_product_by_slug(
    slug: str,
    session: AsyncSession = Depends(get_session),
):
    return await product_service.get_product_by_slug(session, slug)


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
):
    return await product_service.get_product(session, product_id)
