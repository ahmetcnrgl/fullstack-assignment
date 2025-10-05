import os, time, requests

_CACHE = {"value": None, "ts": 0.0}
TTL_SEC = 5 * 60  # 5 dakika cache


def _try_fetch_live_price() -> float | None:
    url = os.getenv("GOLD_API_URL")
    if not url:
        return None
    headers = {}
    if os.getenv("GOLD_API_KEY"):
        headers["x-api-key"] = os.getenv("GOLD_API_KEY")

    r = requests.get(url, headers=headers, timeout=10)
    r.raise_for_status()
    data = r.json()
    gram = data.get("pricePerGramUsd") or data.get("gramUsd") or data.get("price")
    if isinstance(gram, (int, float)) and gram > 0:
        return float(gram)
    return None


def get_gold_price_per_gram() -> float:
    now = time.time()
    if _CACHE["value"] and (now - _CACHE["ts"] < TTL_SEC):
        return _CACHE["value"]
    # Try to fetch live price
    try:
        live = _try_fetch_live_price()
        if live:
            _CACHE["value"] = live
            _CACHE["ts"] = now
            return live
    except Exception:
        pass

    # 2) Fallback
    fallback = float(os.getenv("FALLBACK_GOLD_PRICE_PER_GRAM", "0") or "0")
    if fallback > 0:
        _CACHE["value"] = fallback
        _CACHE["ts"] = now
        return fallback

    raise RuntimeError(
        "Gold price unavailable: set GOLD_API_URL or FALLBACK_GOLD_PRICE_PER_GRAM"
    )
