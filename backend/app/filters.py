from typing import Iterable, Callable
from .models import Product


def filter_products(
    products: Iterable[Product],
    *,
    min_price: float,
    max_price: float,
    min_popularity: float,
    max_popularity: float,
    gold_price_per_gram: float,
    price_fn: Callable[[float, float, float], float],
):
    for p in products:
        price = price_fn(p.popularityScore, p.weight, gold_price_per_gram)
        if not (min_price <= price <= max_price):
            continue
        if not (min_popularity <= p.popularityScore <= max_popularity):
            continue
        yield p, price
