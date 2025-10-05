import json, pathlib
from .models import Product

DATA_PATH = pathlib.Path(__file__).with_name("data") / "products.json"


def load_products() -> list[Product]:
    raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    return [Product(**p) for p in raw]
