"""
Analyse d'une photo avant envoi du rapport : pertinence sinistre + suggestions de champs.
Utilise OpenAI Vision si OPENAI_API_KEY est définie, sinon heuristique locale (Pillow).
"""
from __future__ import annotations

import base64
import io
import json
from typing import Any

import httpx
from PIL import Image

from app.core.config import AI_CLASSIFICATION_MODEL, OPENAI_API_KEY

# Listes canoniques (français) — alignées sur client/src/services/i18n.js (langue fr)
CRISIS_TYPES_FR = [
    "Tremblement de terre",
    "Inondation",
    "Tsunami",
    "Ouragan / Cyclone",
    "Feu de forêt",
    "Explosion",
    "Incident chimique",
    "Conflit",
    "Troubles civils",
]
INFRA_TYPES_FR = [
    "Résidentiel",
    "Commercial",
    "Gouvernemental",
    "Services Publics",
    "Transport",
    "Communautaire",
    "Espaces Publics",
    "Autre",
]
URGENT_NEEDS_FR = [
    "Eau potable",
    "Nourriture",
    "Abris",
    "Médicaments",
    "Vêtements",
    "Électricité",
    "Autre",
    "Déblaiement des routes",
]

_PREVIEW_SYSTEM = """Tu es un assistant ALERTO pour la collecte de signalements de crises humanitaires.
Tu reçois UNE photo censée illustrer un sinistre ou ses impacts.

Tâches :
1) Déterminer si l'image est PERTINENTE pour un signalement de crise (dégâts, inondation, incendie, destruction, personnes affectées, infrastructure endommagée, etc.).
   Si c'est un selfie sans contexte de crise, une nourriture sans sinistre, un écran, du texte seul, ou hors sujet → is_crisis_related = false.
2) Si pertinent (ou doute raisonnable), proposer : niveau de dégâts visible, type de crise le plus probable, type d'infrastructure dominante, un brouillon de description courte en français, et une liste de besoins urgents possibles (0 à 4 items).

Réponds UNIQUEMENT avec un JSON valide, sans markdown, exactement selon ce schéma :
{
  "is_crisis_related": true ou false,
  "relevance_score": nombre entre 0 et 1,
  "damage_level": "minime" ou "partiel" ou "complet",
  "crisis_type_fr": une chaîne EXACTEMENT parmi : """ + json.dumps(CRISIS_TYPES_FR, ensure_ascii=False) + """,
  "infrastructure_type_fr": une chaîne EXACTEMENT parmi : """ + json.dumps(INFRA_TYPES_FR, ensure_ascii=False) + """,
  "description_draft": "1 à 3 phrases en français, style rapport terrain",
  "urgent_needs_fr": tableau de 0 à 4 chaînes, chaque élément EXACTEMENT parmi : """ + json.dumps(URGENT_NEEDS_FR, ensure_ascii=False) + """,
  "analysis_summary": "une courte phrase en français expliquant ton choix"
}

Si is_crisis_related est false, mets quand même des valeurs par défaut prudentes (damage_level partiel, crisis_type_fr "Troubles civils", infrastructure "Autre", description_draft invitant à reprendre une photo du sinistre, urgent_needs_fr [])."""


def _snap_to_allowed(value: str, allowed: list[str], default: str) -> str:
    if value in allowed:
        return value
    vlow = value.strip().lower()
    for a in allowed:
        if a.lower() == vlow:
            return a
    return default


def _heuristic_preview(image_bytes: bytes) -> dict[str, Any]:
    """Fallback sans API : stats image simples + valeurs par défaut."""
    try:
        im = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        im.thumbnail((320, 320))
        px = im.load()
        w, h = im.size
        lum_sum = sat_sum = 0.0
        n = 0
        step = max(1, (w * h) // 4000)
        for y in range(0, h, 4):
            for x in range(0, w, 4):
                r, g, b = px[x, y]
                lum = 0.299 * r + 0.587 * g + 0.114 * b
                lum_sum += lum
                mx = max(r, g, b)
                mn = min(r, g, b)
                sat = 0 if mx == 0 else (mx - mn) / mx
                sat_sum += sat
                n += 1
                if n >= 4000:
                    break
            if n >= 4000:
                break
        avg_lum = lum_sum / max(n, 1)
        avg_sat = sat_sum / max(n, 1)
        damage = "partiel"
        if avg_lum < 72:
            damage = "complet"
        elif avg_lum > 178 and avg_sat < 0.38:
            damage = "minime"
        rel = min(0.88, 0.55 + avg_sat * 0.2)
        return {
            "is_crisis_related": True,
            "relevance_score": round(rel, 2),
            "damage_level": damage,
            "crisis_type_fr": "Inondation",
            "infrastructure_type_fr": "Résidentiel",
            "description_draft": "Dégâts observés sur place — complétez avec les détails précis (lieu, victimes, accès).",
            "urgent_needs_fr": [],
            "analysis_summary": "Analyse locale (sans API) : luminosité et couleurs seules — vérifiez la photo et les champs.",
            "source": "heuristic",
        }
    except Exception as e:
        print(f"[report_preview_ai] Heuristique échouée: {e}")
        return {
            "is_crisis_related": True,
            "relevance_score": 0.5,
            "damage_level": "partiel",
            "crisis_type_fr": "Inondation",
            "infrastructure_type_fr": "Résidentiel",
            "description_draft": "",
            "urgent_needs_fr": [],
            "analysis_summary": "Impossible d'analyser l'image automatiquement. Décrivez la situation manuellement.",
            "source": "fallback",
        }


async def analyze_report_preview(image_bytes: bytes, mime: str = "image/jpeg") -> dict[str, Any]:
    """
    Retourne un dict JSON-sérialisable pour le client (champs *_fr + damage_level + flags).
    """
    if not image_bytes or len(image_bytes) < 32:
        out = _heuristic_preview(image_bytes)
        return out

    if not OPENAI_API_KEY or not OPENAI_API_KEY.strip():
        out = _heuristic_preview(image_bytes)
        return out

    b64 = base64.standard_b64encode(image_bytes).decode("ascii")
    if "png" in mime.lower():
        data_url = f"data:image/png;base64,{b64}"
    elif "webp" in mime.lower():
        data_url = f"data:image/webp;base64,{b64}"
    else:
        data_url = f"data:image/jpeg;base64,{b64}"

    payload = {
        "model": AI_CLASSIFICATION_MODEL,
        "max_tokens": 500,
        "messages": [
            {"role": "system", "content": _PREVIEW_SYSTEM},
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Analyse cette image pour un signalement ALERTO et réponds uniquement avec le JSON demandé.",
                    },
                    {"type": "image_url", "image_url": {"url": data_url, "detail": "low"}},
                ],
            },
        ],
    }

    content = ""
    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        if r.status_code != 200:
            print(f"[report_preview_ai] OpenAI HTTP {r.status_code}: {r.text[:400]}")
            return _heuristic_preview(image_bytes)

        data = r.json()
        content = (
            data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        )
        if not content:
            return _heuristic_preview(image_bytes)

        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)
        parsed = json.loads(content)

        is_rel = bool(parsed.get("is_crisis_related", True))
        rel_score = float(parsed.get("relevance_score", 0.7))
        rel_score = max(0.0, min(1.0, rel_score))

        dmg = str(parsed.get("damage_level", "partiel")).lower().strip()
        if dmg not in ("minime", "partiel", "complet"):
            dmg = "partiel"

        crisis_fr = _snap_to_allowed(
            str(parsed.get("crisis_type_fr", "Inondation")), CRISIS_TYPES_FR, "Inondation"
        )
        infra_fr = _snap_to_allowed(
            str(parsed.get("infrastructure_type_fr", "Résidentiel")),
            INFRA_TYPES_FR,
            "Résidentiel",
        )

        draft = str(parsed.get("description_draft", "")).strip()
        if len(draft) > 1200:
            draft = draft[:1197] + "..."

        raw_needs = parsed.get("urgent_needs_fr") or []
        needs_out: list[str] = []
        if isinstance(raw_needs, list):
            for n in raw_needs[:4]:
                s = _snap_to_allowed(str(n), URGENT_NEEDS_FR, "")
                if s and s not in needs_out:
                    needs_out.append(s)

        summary = str(parsed.get("analysis_summary", "")).strip()[:500]

        return {
            "is_crisis_related": is_rel,
            "relevance_score": round(rel_score, 2),
            "damage_level": dmg,
            "crisis_type_fr": crisis_fr,
            "infrastructure_type_fr": infra_fr,
            "description_draft": draft,
            "urgent_needs_fr": needs_out,
            "analysis_summary": summary,
            "source": "openai",
        }
    except json.JSONDecodeError as e:
        print(f"[report_preview_ai] JSON parse: {e} raw={content[:300]}")
        return _heuristic_preview(image_bytes)
    except Exception as e:
        print(f"[report_preview_ai] Erreur: {e}")
        return _heuristic_preview(image_bytes)
