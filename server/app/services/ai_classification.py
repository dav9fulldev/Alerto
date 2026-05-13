"""
Classification des dégâts : vision LLM si OPENAI_API_KEY est définie, sinon heuristique MVP.
"""
from __future__ import annotations

import base64
import json
import os
import random
import re
from pathlib import Path
from typing import Optional

import httpx

from app.core.config import AI_CLASSIFICATION_MODEL, OPENAI_API_KEY

_SYSTEM_PROMPT = """Tu es un expert en évaluation rapide de dégâts lors de crises humanitaires (inondations, incendies, conflits, effondrements).
À partir de la photo et éventuellement d'une courte description, détermine le NIVEAU DE DÉGÂTS visible sur les biens / infrastructures.

Réponds UNIQUEMENT avec un JSON valide, sans markdown, de la forme :
{"damage_level":"minime"|"partiel"|"complet","confidence":0.0-1.0,"summary":"une phrase courte en français"}

Définitions :
- minime : impacts légers, peu de structures touchées, récupération rapide possible.
- partiel : dégâts significatifs mais zone/partiellement détruite, besoins importants.
- complet : destruction massive, danger structurel majeur, ou zone largement inhabitable.

Si l'image est floue ou hors sujet, reste prudent : privilégie "partiel" avec confidence basse et explique dans summary."""


def _resolve_image_path(image_url: str) -> Optional[Path]:
    if not image_url:
        return None
    if image_url.startswith("/uploads/"):
        base = Path(os.getcwd())
        rel = image_url.lstrip("/")
        p = base / rel
        if p.is_file():
            return p
    if image_url.startswith("http://") or image_url.startswith("https://"):
        return None  # on pourrait fetch ; pour l'instant upload local uniquement
    return None


async def _fetch_image_as_data_url(image_url: str) -> Optional[str]:
    """Retourne data:image/...;base64,... pour les fichiers locaux /uploads/."""
    path = _resolve_image_path(image_url)
    if not path:
        return None
    try:
        data = path.read_bytes()
        ext = path.suffix.lower().strip(".")
        mime = "jpeg" if ext in ("jpg", "jpeg") else "png" if ext == "png" else "webp" if ext == "webp" else "jpeg"
        b64 = base64.standard_b64encode(data).decode("ascii")
        return f"data:image/{mime};base64,{b64}"
    except Exception as e:
        print(f"[ai_classification] Lecture image impossible: {e}")
        return None


def _fallback_keyword_and_random(description: str) -> str:
    text = (description or "").lower()
    if any(k in text for k in ["détruit", "total", "effondré", "complet", "destruction"]):
        return "complet"
    if any(k in text for k in ["fissure", "partiel", "endommagé", "moyen"]):
        return "partiel"
    if any(k in text for k in ["léger", "minime", "peu", "vitre"]):
        return "minime"
    return random.choice(["minime", "partiel", "complet"])


async def _openai_classify_damage(image_url: str, description: str = "") -> Optional[str]:
    if not OPENAI_API_KEY or not OPENAI_API_KEY.strip():
        return None

    data_url = await _fetch_image_as_data_url(image_url)
    if not data_url:
        print("[ai_classification] Pas de fichier image local pour la vision API, fallback.")
        return None

    user_text = (
        "Description fournie par le rapporteur (peut être vide) :\n"
        f"{description.strip() or '(aucune)'}\n\n"
        "Analyse la photo et réponds uniquement avec le JSON demandé."
    )

    payload = {
        "model": AI_CLASSIFICATION_MODEL,
        "max_tokens": 250,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_text},
                    {"type": "image_url", "image_url": {"url": data_url, "detail": "low"}},
                ],
            },
        ],
    }

    try:
        content = ""
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        if r.status_code != 200:
            print(f"[ai_classification] OpenAI HTTP {r.status_code}: {r.text[:500]}")
            return None

        data = r.json()
        content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if not content:
            return None

        # Retirer éventuels blocs ```json
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

        parsed = json.loads(content)
        level = parsed.get("damage_level", "").lower().strip()
        if level in ("minime", "partiel", "complet"):
            conf = parsed.get("confidence")
            summ = parsed.get("summary", "")
            print(f"[ai_classification] Vision OK → {level} (confidence={conf}) {summ[:80]}")
            return level
        print(f"[ai_classification] JSON inattendu: {parsed}")
        return None
    except json.JSONDecodeError as e:
        print(f"[ai_classification] Parse JSON OpenAI: {e} — raw: {content[:300] if content else ''}")
        return None
    except Exception as e:
        print(f"[ai_classification] Erreur OpenAI: {e}")
        return None


async def classify_damage(image_url: str, description: str = "") -> str:
    """
    Retourne minime | partiel | complet.
    Utilise l'API OpenAI Vision si OPENAI_API_KEY est configurée et que l'image locale existe.
    Sinon : mots-clés dans la description, puis tirage aléatoire (comportement MVP historique).
    """
    vision_result = await _openai_classify_damage(image_url, description)
    if vision_result:
        return vision_result

    return _fallback_keyword_and_random(description)
