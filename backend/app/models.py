from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class Product(BaseModel):
    name: str
    popularityScore: float = Field(ge=0, le=1)  # 0..1 aralığı
    weight: float = Field(ge=0)  # gram
    images: Dict[str, str]


class ProductOut(Product):
    priceUSD: float
    popularity5: float


class ProductsResponse(BaseModel):
    goldPricePerGram: float
    items: List[ProductOut]
