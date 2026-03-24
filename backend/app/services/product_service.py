import math
from decimal import Decimal
from typing import Optional

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Product, Category
from ..schemas import ProductCreate, ProductUpdate, ProductFilter
from ..core.exceptions import ProductNotFoundError, CategoryNotFoundError
from ..utils import generate_slug, ensure_unique_slug


async def get_products(
    session: AsyncSession,
    filters: ProductFilter,
    page: int = 1,
    limit: int = 20,
    include_inactive: bool = False,
) -> tuple[list[Product], int]:
    """Get products with filters and pagination. Returns (products, total)."""
    query = select(Product).join(Product.category)

    if not include_inactive:
        query = query.where(Product.is_active == True)

    if filters.category:
        query = query.where(Category.slug == filters.category)
    if filters.min_price is not None:
        query = query.where(Product.price >= filters.min_price)
    if filters.max_price is not None:
        query = query.where(Product.price <= filters.max_price)
    if filters.season:
        query = query.where(Product.season == filters.season)
    if filters.search:
        search_term = f"%{filters.search}%"
        query = query.where(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await session.execute(count_query)).scalar_one()

    # Paginate
    offset = (page - 1) * limit
    query = query.order_by(Product.id).offset(offset).limit(limit)
    result = await session.execute(query)
    products = list(result.scalars().all())

    return products, total


async def get_product(session: AsyncSession, product_id: int) -> Product:
    result = await session.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise ProductNotFoundError(product_id)
    return product


async def get_product_by_slug(session: AsyncSession, slug: str) -> Product:
    result = await session.execute(
        select(Product).where(Product.slug == slug, Product.is_active == True)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise ProductNotFoundError()
    return product


async def create_product(session: AsyncSession, data: ProductCreate) -> Product:
    # Validate category exists
    cat = await session.execute(
        select(Category.id).where(Category.id == data.category_id)
    )
    if cat.scalar_one_or_none() is None:
        raise CategoryNotFoundError(data.category_id)

    # Auto-generate slug if not provided
    slug = data.slug or generate_slug(data.name)
    slug = await ensure_unique_slug(session, Product, slug)

    product = Product(
        name=data.name,
        slug=slug,
        description=data.description,
        price=data.price,
        old_price=data.old_price,
        image_url=data.image_url,
        badge=data.badge,
        in_stock=data.in_stock,
        is_active=data.is_active,
        season=data.season,
        care_instructions=data.care_instructions,
        category_id=data.category_id,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


async def update_product(
    session: AsyncSession, product_id: int, data: ProductUpdate
) -> Product:
    product = await get_product(session, product_id)
    update_data = data.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        cat = await session.execute(
            select(Category.id).where(Category.id == update_data["category_id"])
        )
        if cat.scalar_one_or_none() is None:
            raise CategoryNotFoundError(update_data["category_id"])

    if "name" in update_data and "slug" not in update_data:
        update_data["slug"] = await ensure_unique_slug(
            session, Product, generate_slug(update_data["name"])
        )

    for key, value in update_data.items():
        setattr(product, key, value)

    await session.commit()
    await session.refresh(product)
    return product


async def deactivate_product(session: AsyncSession, product_id: int) -> Product:
    product = await get_product(session, product_id)
    product.is_active = False
    await session.commit()
    await session.refresh(product)
    return product
