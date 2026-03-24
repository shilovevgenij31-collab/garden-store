from pydantic import BaseModel, Field
from typing import Optional


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=100)
    icon: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: int = 0


class CategoryRead(BaseModel):
    id: int
    name: str
    slug: str
    icon: Optional[str]
    parent_id: Optional[int]
    sort_order: int
    product_count: int = 0

    model_config = {"from_attributes": True}
