import enum
import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Text, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin


class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    paid = "paid"
    ready = "ready"
    completed = "completed"
    cancelled = "cancelled"
    failed = "failed"


# Valid status transitions
STATUS_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.pending: {OrderStatus.confirmed, OrderStatus.cancelled, OrderStatus.failed},
    OrderStatus.confirmed: {OrderStatus.paid, OrderStatus.cancelled},
    OrderStatus.paid: {OrderStatus.ready, OrderStatus.cancelled},
    OrderStatus.ready: {OrderStatus.completed, OrderStatus.cancelled},
    OrderStatus.completed: set(),
    OrderStatus.cancelled: set(),
    OrderStatus.failed: set(),
}


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    public_id: Mapped[str] = mapped_column(
        String(36), unique=True, index=True,
        default=lambda: str(uuid.uuid4()),
    )
    customer_name: Mapped[str] = mapped_column(String(200))
    customer_phone: Mapped[str] = mapped_column(String(20), index=True)
    customer_email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus), default=OrderStatus.pending, index=True
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", lazy="selectin", cascade="all, delete-orphan"
    )
