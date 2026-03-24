from decimal import Decimal
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator
import re


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=200)
    customer_phone: str = Field(pattern=r"^(\+7|8)\d{10}$")
    customer_email: Optional[str] = Field(default=None, max_length=200)

    @field_validator("customer_email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("Некорректный формат email")
        return v
    notes: Optional[str] = None
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    product_name: str = ""
    quantity: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderRead(BaseModel):
    id: int
    public_id: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str]
    status: str
    total_amount: Decimal
    notes: Optional[str]
    items: list[OrderItemRead]
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid = {"pending", "confirmed", "paid", "ready", "completed", "cancelled", "failed"}
        if v not in valid:
            raise ValueError(f"Недопустимый статус: {v}")
        return v
