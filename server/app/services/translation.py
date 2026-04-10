import os
# Mock translation for MVP if no API key is provided
# In production, use google-cloud-translate or similar
import httpx

async def translate_text(text: str, target_lang: str = "en") -> str:
    """
    Translates text to target language.
    Using a free translation API or mock for MVP.
    """
    if not text:
        return ""
        
    try:
        # For professional architecture, we provide a placeholder for Google Translate API
        # API_KEY = os.getenv("GOOGLE_TRANSLATE_API_KEY")
        
        # MOCK LOGIC for demo:
        # In a real UNDP scenario, this would call a professional API.
        return f"[Translated to {target_lang}]: {text}"
        
    except Exception as e:
        print(f"Translation error: {e}")
        return text # Return original on failure
