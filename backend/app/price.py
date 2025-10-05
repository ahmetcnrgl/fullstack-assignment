def calc_price_usd(
    popularity_score: float, weight_g: float, gold_price_per_gram: float
) -> float:
    # Görev brief: price = (popularityScore + 1) * weight * goldPrice
    return (popularity_score + 1.0) * weight_g * gold_price_per_gram
