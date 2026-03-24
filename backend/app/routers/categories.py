from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_session
from ..models import Category, Product
from ..schemas import CategoryRead

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
async def get_categories(session: AsyncSession = Depends(get_session)):
    # Get categories with active product count
    result = await session.execute(
        select(
            Category,
            func.count(Product.id).label("product_count"),
        )
        .outerjoin(Product, (Product.category_id == Category.id) & (Product.is_active == True))
        .group_by(Category.id)
        .order_by(Category.sort_order)
    )
    categories = []
    for row in result.all():
        cat = row[0]
        cat.product_count = row[1]
        categories.append(cat)

    return categories
