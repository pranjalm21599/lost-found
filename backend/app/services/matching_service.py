import re
from datetime import datetime
from typing import List, Dict, Any
from ..models.item import Item

def tokenize(text: str) -> set[str]:
    if not text:
        return set()
    cleaned = re.sub(r"[^\w\s]", " ", text.lower())
    stop_words = {"the", "a", "an", "is", "in", "at", "of", "on", "and", "or", "for", "with", "my", "to", "this", "it"}
    tokens = {word for word in cleaned.split() if len(word) > 2 and word not in stop_words}
    return tokens

def jaccard_similarity(set_a: set[str], set_b: set[str]) -> float:
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))
    return intersection / union if union > 0 else 0.0

def calculate_match(target_item: Item, candidate_item: Item) -> Dict[str, Any]:
    """
    Compares target_item with candidate_item (opposite item_type: LOST <-> FOUND)
    Returns: { "score": int, "reasons": List[str] }
    """
    score = 0
    reasons: List[str] = []

    # 1. Category comparison (weight: 35)
    if target_item.category.strip().lower() == candidate_item.category.strip().lower():
        score += 35
        reasons.append("Same category")

    # 2. Item name comparison (weight: 30)
    target_name_tokens = tokenize(target_item.item_name)
    cand_name_tokens = tokenize(candidate_item.item_name)
    name_sim = jaccard_similarity(target_name_tokens, cand_name_tokens)

    # Substring check
    t_name_lower = target_item.item_name.strip().lower()
    c_name_lower = candidate_item.item_name.strip().lower()
    if t_name_lower == c_name_lower:
        score += 30
        reasons.append("Identical item name")
    elif t_name_lower in c_name_lower or c_name_lower in t_name_lower:
        score += 25
        reasons.append("Similar item name")
    elif name_sim >= 0.4:
        score += int(name_sim * 25)
        reasons.append("Similar item name")
    elif name_sim > 0.1:
        score += 10
        reasons.append("Partial name match")

    # 3. Location comparison (weight: 15)
    t_loc = target_item.location.strip().lower()
    c_loc = candidate_item.location.strip().lower()
    if t_loc == c_loc:
        score += 15
        reasons.append("Same location")
    else:
        # Check description or current_location for location keywords
        if t_loc in (candidate_item.description or "").lower() or c_loc in (target_item.description or "").lower():
            score += 10
            reasons.append("Nearby or mentioned location")

    # 4. Date comparison (weight: 10)
    try:
        t_date = datetime.strptime(target_item.event_date[:10], "%Y-%m-%d")
        c_date = datetime.strptime(candidate_item.event_date[:10], "%Y-%m-%d")
        day_diff = abs((t_date - c_date).days)
        if day_diff <= 1:
            score += 10
            reasons.append("Same or consecutive date")
        elif day_diff <= 4:
            score += 7
            reasons.append("Similar date (within 4 days)")
        elif day_diff <= 7:
            score += 4
            reasons.append("Reported within the same week")
    except Exception:
        pass

    # 5. Description similarity (weight: 10)
    t_desc_tokens = tokenize(target_item.description)
    c_desc_tokens = tokenize(candidate_item.description)
    desc_sim = jaccard_similarity(t_desc_tokens, c_desc_tokens)
    if desc_sim >= 0.3:
        score += 10
        reasons.append("Similar description keywords")
    elif desc_sim >= 0.15:
        score += 6
        reasons.append("Similar description")

    # Cap score at 100
    final_score = min(100, score)
    return {
        "score": final_score,
        "reasons": reasons
    }

def find_matches_for_item(item: Item, candidate_pool: List[Item], min_score: int = 30) -> List[Dict[str, Any]]:
    matches = []
    for candidate in candidate_pool:
        # Only compare LOST against FOUND or FOUND against LOST
        if candidate.id == item.id:
            continue
        if candidate.item_type == item.item_type:
            continue
        # Closed items or returned items might still be visible or filtered
        result = calculate_match(item, candidate)
        if result["score"] >= min_score:
            matches.append({
                "item": candidate,
                "score": result["score"],
                "reasons": result["reasons"]
            })

    # Sort descending by score
    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches
