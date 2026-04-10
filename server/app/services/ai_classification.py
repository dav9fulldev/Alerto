import random

async def classify_damage(image_url: str, description: str = "") -> str:
    """
    Simulates an AI model classifying damage based on image content and text context.
    In a production UNDP setup, this would load a PyTorch or TensorFlow model.
    """
    # Keyword-based simulation for the MVP/Demo
    text = description.lower()
    
    if any(k in text for k in ["détruit", "total", "effondré", "complet", "destruction"]):
        return "complet"
    elif any(k in text for k in ["fissure", "partiel", "endommagé", "moyen"]):
        return "partiel"
    elif any(k in text for k in ["léger", "minime", "peu", "vitre"]):
        return "minime"
    
    # Fallback/Random for demo purposes if no keywords
    return random.choice(["minime", "partiel", "complet"])
