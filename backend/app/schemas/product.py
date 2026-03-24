from decimal import Decimal
from typing import Optional, Generic, TypeVar
from pydantic import BaseModel, Field
from .category import CategoryRead

T = TypeVar("T")


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    slug: Optional[str] = None  # Auto-generated if not provided
    description: Optional[str] = None
    price: Decimal = Field(gt=0)
    old_price: Optional[Decimal] = Field(default=None, gt=0)
    image_url: str = "/images/placeholder.jpg"
    badge: Optional[str] = None
    in_stock: bool = True
    is_active: bool = True
    season: Optional[str] = None
    care_instructions: Optional[str] = None
    category_id: int


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, gt=0)
    old_price: Optional[Decimal] = Field(default=None, gt=0)
    image_url: Optional[str] = None
    badge: Optional[str] = None
    in_stock: Optional[bool] = None
    is_active: Optional[bool] = None
    season: Optional[str] = None
    care_instructions: Optional[str] = None
    category_id: Optional[int] = None


class ProductRead(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    price: Decimal
    old_price: Optional[Decimal]
    image_url: str
    badge: Optional[str]
    in_stock: bool
    is_active: bool
    season: Optional[str]
    care_instructions: Optional[str]
    category_id: int
    category: CategoryRead

    model_config = {"from_attributes": True}


class ProductFilter(BaseModel):
    category: Optional[str] = None  # category slug
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    season: Optional[str] = None
    search: Optional[str] = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    pages: int
