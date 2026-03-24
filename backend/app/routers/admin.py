import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.auth import get_admin_user, verify_admin_password, create_admin_token
from ..core.config import settings
from ..core.database import get_session
from ..core.storage import storage
from ..schemas import (
    ProductCreate,
    ProductUpdate,
    ProductRead,
    ProductFilter,
    OrderRead,
    OrderItemRead,
    OrderStatusUpdate,
    PaginatedResponse,
)
from ..services import product_service, order_service

# --- Login router (no auth dependency — rate-limited independently) ---

_limiter = Limiter(key_func=get_remote_address)

login_router = APIRouter(prefix="/api/admin", tags=["admin"])


@login_router.post("/login")
@_limiter.limit(settings.RATE_LIMIT_ADMIN_LOGIN)
async def admin_login(request: Request):
    """Verify admin password and return a signed token."""
    password = request.headers.get("X-Admin-Password", "")
    if not verify_admin_password(password):
        raise HTTPException(status_code=401, detail="Неверный пароль администратора")
    token = create_admin_token()
    return {"status": "ok", "token": token}


# --- Main admin router (all endpoints require auth) ---

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_admin_user)],
)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    url = await storage.save_file(file)
    return {"url": url}


# --- Products CRUD ---


@router.get("/products", response_model=PaginatedResponse[ProductRead])
async def admin_list_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    """List all products including inactive ones (admin view)."""
    filters = ProductFilter()
    products, total = await product_service.get_products(
        session, filters, page, limit, include_inactive=True
    )
    pages = math.ceil(total / limit) if total > 0 else 1
    return PaginatedResponse(
        items=products, total=total, page=page, limit=limit, pages=pages
    )


@router.post("/products", response_model=ProductRead, status_code=201)
async def create_product(
    data: ProductCreate,
    session: AsyncSession = Depends(get_session),
):
    return await product_service.create_product(session, data)


@router.put("/products/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    session: AsyncSession = Depends(get_session),
):
    return await product_service.update_product(session, product_id, data)


@router.delete("/products/{product_id}", response_model=ProductRead)
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
):
    return await product_service.deactivate_product(session, product_id)


# --- Orders ---


@router.get("/orders", response_model=PaginatedResponse[OrderRead])
async def get_orders(
    status: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    orders, total = await order_service.list_orders(session, status, page, limit)
    pages = math.ceil(total / limit) if total > 0 else 1

    items = []
    for order in orders:
        order_items = [
            OrderItemRead(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else "",
                quantity=item.quantity,
                unit_price=item.unit_price,
            )
            for item in order.items
        ]
        items.append(OrderRead(
            id=order.id,
            public_id=order.public_id,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            customer_email=order.customer_email,
            status=order.status.value,
            total_amount=order.total_amount,
            notes=order.notes,
            items=order_items,
            created_at=order.created_at,
        ))

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.put("/orders/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    session: AsyncSession = Depends(get_session),
):
    order = await order_service.update_order_status(session, order_id, data.status)
    order_items = [
        OrderItemRead(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name if item.product else "",
            quantity=item.quantity,
            unit_price=item.unit_price,
        )
        for item in order.items
    ]
    return OrderRead(
        id=order.id,
        public_id=order.public_id,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_email=order.customer_email,
        status=order.status.value,
        total_amount=order.total_amount,
        notes=order.notes,
        items=order_items,
        created_at=order.created_at,
    )
