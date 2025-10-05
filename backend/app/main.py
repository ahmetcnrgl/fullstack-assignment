import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
from dotenv import load_dotenv

from .repo import load_products
from .price import calc_price_usd
from .gold import get_gold_price_per_gram
from .filters import filter_products
from .models import ProductOut, ProductsResponse

load_dotenv()  # .env dosyasını yükle

app = FastAPI(title="Products API (FastAPI)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/gold")
def gold():
    return {"goldPricePerGram": get_gold_price_per_gram()}


@app.get("/products", response_model=ProductsResponse)
def products(
    minPrice: float = Query(float("-inf")),
    maxPrice: float = Query(float("inf")),
    minPopularity: float = Query(0.0, ge=0.0, le=1.0),
    maxPopularity: float = Query(1.0, ge=0.0, le=1.0),
):
    gold = get_gold_price_per_gram()
    base = load_products()

    items: list[ProductOut] = []
    for p, price in filter_products(
        base,
        min_price=minPrice,
        max_price=maxPrice,
        min_popularity=minPopularity,
        max_popularity=maxPopularity,
        gold_price_per_gram=gold,
        price_fn=calc_price_usd,
    ):
        items.append(
            ProductOut(
                **p.model_dump(),
                priceUSD=round(price, 2),
                popularity5=round(p.popularityScore * 5, 1),  # 5 üzerinden, 1 ondalık
            )
        )
    return {"goldPricePerGram": gold, "items": items}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8080"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)


@app.get("/img")
async def proxy_image(url: str):
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=15) as resp:
            content = resp.read()
            ct = resp.headers.get("Content-Type", "image/jpeg")
    except (URLError, HTTPError) as e:
        content = bytes(
            [
                137,
                80,
                78,
                71,
                13,
                10,
                26,
                10,
                0,
                0,
                0,
                13,
                73,
                72,
                68,
                82,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                1,
                8,
                6,
                0,
                0,
                0,
                31,
                21,
                196,
                137,
                0,
                0,
                0,
                10,
                73,
                68,
                65,
                84,
                120,
                156,
                99,
                96,
                0,
                0,
                0,
                2,
                0,
                1,
                226,
                33,
                181,
                71,
                0,
                0,
                0,
                0,
                73,
                69,
                78,
                68,
                174,
                66,
                96,
                130,
            ]
        )
        ct = "image/png"
    headers = {"Access-Control-Allow-Origin": "*", "Content-Type": ct}
    return Response(content=content, headers=headers)
