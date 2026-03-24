from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.database import get_session
from ..core.exceptions import AppError
from ..core.logging import logger
from ..schemas import OrderCreate, OrderRead, OrderItemRead
from ..services import order_service

router = APIRouter(prefix="/api/orders", tags=["orders"])
limiter = Limiter(key_func=get_remote_address)


@router.post("", response_model=OrderRead, status_code=201)
@limiter.limit(settings.RATE_LIMIT_ORDERS)
async def create_order(
    data: OrderCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    client_ip = request.client.host if request.client else ""
    user_agent = request.headers.get("user-agent", "")

    order = await order_service.create_order(
        session, data, client_ip=client_ip, user_agent=user_agent
    )
    return _order_to_response(order)


@router.get("/by-contact", response_model=list[OrderRead])
@limiter.limit("10/minute")
async def get_orders_by_contact(
    request: Request,
    email: Optional[str] = Query(default=None),
    phone: Optional[str] = Query(default=None),
    session: AsyncSession = Depends(get_session),
):
    if not email and not phone:
        raise AppError("Укажите email или телефон", "MISSING_CONTACT", 400)

    logger.info("GET /by-contact: email=%s, phone=%s", email, phone)
    orders = await order_service.find_orders_by_contact(session, email=email, phone=phone)
    return [_order_to_response(o) for o in orders]


@router.get("/{public_id}", response_model=OrderRead)
async def get_order(
    public_id: str,
    session: AsyncSession = Depends(get_session),
):
    order = await order_service.get_order_by_public_id(session, public_id)
    if not order:
        raise AppError("Заказ не найден", "ORDER_NOT_FOUND", 404)
    return _order_to_response(order)


def _order_to_response(order) -> OrderRead:
    items = [
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
        items=items,
        created_at=order.created_at,
    )
