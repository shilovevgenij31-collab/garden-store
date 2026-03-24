from datetime import datetime, timedelta, timezone
from decimal import Decimal

import re
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload, noload
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Order, OrderItem, OrderStatus, Product, STATUS_TRANSITIONS
from ..schemas import OrderCreate
from ..core.exceptions import (
    OrderDuplicateError,
    OrderInvalidStatusTransition,
    ProductNotFoundError,
)
from ..core.logging import logger


async def create_order(
    session: AsyncSession,
    data: OrderCreate,
    client_ip: str = "",
    user_agent: str = "",
) -> Order:
    """Create order in a single transaction.

    Steps:
    1. Check for duplicates (same phone + items within 60 seconds)
    2. Validate all product_ids exist and are active
    3. Calculate total from SERVER prices (not client-submitted)
    4. INSERT Order + OrderItems
    5. COMMIT (or ROLLBACK on any error)
    """
    # 1. Duplicate check
    item_ids = sorted([item.product_id for item in data.items])
    item_ids_str = ",".join(str(i) for i in item_ids)

    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=60)
    recent = await session.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(
            Order.customer_phone == data.customer_phone,
            Order.created_at >= cutoff,
        )
    )
    for existing_order in recent.scalars().all():
        existing_ids = sorted([oi.product_id for oi in existing_order.items])
        if ",".join(str(i) for i in existing_ids) == item_ids_str:
            raise OrderDuplicateError()

    # 2. Validate products exist and are active
    product_ids = [item.product_id for item in data.items]
    result = await session.execute(
        select(Product).where(
            Product.id.in_(product_ids),
            Product.is_active == True,
            Product.in_stock == True,
        )
    )
    products = {p.id: p for p in result.scalars().all()}

    for item in data.items:
        if item.product_id not in products:
            raise ProductNotFoundError(item.product_id)

    # 3. Calculate total from SERVER prices
    total = Decimal("0")
    order_items = []
    for item in data.items:
        product = products[item.product_id]
        unit_price = product.price
        total += unit_price * item.quantity
        order_items.append(
            OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=unit_price,
            )
        )

    # 4. Create order in single transaction
    # SQLite: FOR UPDATE not supported. Add for PostgreSQL.
    order = Order(
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_email=data.customer_email,
        notes=data.notes,
        total_amount=total,
        status=OrderStatus.pending,
        items=order_items,
    )
    session.add(order)
    await session.commit()

    # Re-fetch with full eager loading (items → product).
    # populate_existing=True forces SQLAlchemy to overwrite the cached
    # objects in the identity map (expire_on_commit=False keeps stale
    # objects that were never loaded with the product relationship).
    # noload('*') on Product prevents cascading lazy="selectin" from
    # Product.category → Category.children/parent.
    result = await session.execute(
        select(Order)
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .noload('*')
        )
        .where(Order.id == order.id)
        .execution_options(populate_existing=True)
    )
    order = result.scalar_one()

    logger.info(
        "Order #%d created: phone=%s, total=%s, items=%d, ip=%s, ua=%s",
        order.id,
        data.customer_phone,
        total,
        len(order_items),
        client_ip,
        user_agent[:100],
    )

    return order


async def get_order(session: AsyncSession, order_id: int) -> Order | None:
    result = await session.execute(
        select(Order)
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .noload('*')
        )
        .where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


async def get_order_by_public_id(session: AsyncSession, public_id: str) -> Order | None:
    result = await session.execute(
        select(Order)
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .noload('*')
        )
        .where(Order.public_id == public_id)
    )
    return result.scalar_one_or_none()


async def list_orders(
    session: AsyncSession,
    status: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Order], int]:
    query = select(Order)
    if status:
        query = query.where(Order.status == OrderStatus(status))

    count_query = select(func.count()).select_from(query.subquery())
    total = (await session.execute(count_query)).scalar_one()

    offset = (page - 1) * limit
    query = query.options(
        selectinload(Order.items)
        .selectinload(OrderItem.product)
        .noload('*')
    ).order_by(Order.created_at.desc()).offset(offset).limit(limit)
    result = await session.execute(query)
    orders = list(result.scalars().all())

    return orders, total


def _normalize_phone(raw: str) -> str:
    """Strip everything except digits, normalize 8→+7 prefix."""
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("8") and len(digits) == 11:
        digits = "7" + digits[1:]
    return digits


async def find_orders_by_contact(
    session: AsyncSession,
    email: str | None = None,
    phone: str | None = None,
) -> list[Order]:
    """Find orders by customer email and/or phone (OR logic)."""
    conditions = []
    if email:
        conditions.append(func.lower(Order.customer_email) == email.lower().strip())
    if phone:
        # Normalize input phone and compare against both +7 and 8 formats
        digits = _normalize_phone(phone)
        if len(digits) == 11:
            phone_plus7 = f"+7{digits[1:]}"
            phone_8 = f"8{digits[1:]}"
            conditions.append(Order.customer_phone.in_([phone_plus7, phone_8]))
        else:
            conditions.append(Order.customer_phone == phone.strip())

    if not conditions:
        return []

    logger.info("find_orders_by_contact: email=%s, phone=%s, conditions=%d", email, phone, len(conditions))

    result = await session.execute(
        select(Order)
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
        )
        .where(or_(*conditions))
        .order_by(Order.created_at.desc())
    )
    orders = list(result.scalars().all())
    logger.info("find_orders_by_contact: found %d orders", len(orders))
    return orders


async def update_order_status(
    session: AsyncSession, order_id: int, new_status: str
) -> Order:
    order = await get_order(session, order_id)
    if not order:
        from ..core.exceptions import AppError
        raise AppError("Заказ не найден", "ORDER_NOT_FOUND", 404)

    try:
        target = OrderStatus(new_status)
    except ValueError:
        from ..core.exceptions import AppError
        raise AppError(f"Неизвестный статус: {new_status}", "INVALID_STATUS", 400)

    allowed = STATUS_TRANSITIONS.get(order.status, set())
    if target not in allowed:
        raise OrderInvalidStatusTransition(order.status.value, target.value)

    old_status = order.status.value
    order.status = target
    await session.commit()
    await session.refresh(order)

    logger.info(
        "Order #%d status changed: %s → %s",
        order.id,
        old_status,
        target.value,
    )

    return order
