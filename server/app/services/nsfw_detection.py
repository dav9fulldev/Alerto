"""
NSFW Content Detection Module
Hybrid approach: Offline (NudeNet) + Optional Online (OpenAI Moderation API)
"""

import os
import logging
from pathlib import Path
from typing import Dict, Optional
from PIL import Image, ImageFilter
import numpy as np
import requests
from nudenet import NudeDetector

# Configure logging
logger = logging.getLogger(__name__)

# Configuration
NSFW_THRESHOLD = float(os.getenv("NSFW_THRESHOLD", "0.7"))
NSFW_BLOCK_THRESHOLD = float(os.getenv("NSFW_BLOCK_THRESHOLD", "0.85"))
USE_ONLINE_API = os.getenv("USE_ONLINE_MODERATION", "false").lower() == "true"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
BLUR_NSFW = os.getenv("BLUR_NSFW_IMAGES", "true").lower() == "true"
NSFW_LOG_DIR = os.getenv("NSFW_LOG_DIR", "uploads/nsfw_logs")

# Initialize NudeNet detector (lazy loading)
_detector = None


def get_detector():
    """Lazy load the NudeNet detector to save memory"""
    global _detector
    if _detector is None:
        logger.info("Initializing NudeNet detector...")
        try:
            _detector = NudeDetector()
            logger.info("✅ NudeNet detector initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize NudeDetector: {e}")
            raise
    return _detector


def detect_nsfw_offline(image_path: str) -> Dict:
    """
    Detect NSFW content using local NudeNet model (offline)
    
    Returns:
        {
            "nsfw_score": float (0-1),
            "is_nsfw": bool,
            "is_flagged": bool,
            "detection_method": "offline",
            "details": {}
        }
    """
    try:
        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            return {
                "nsfw_score": 0.0,
                "is_nsfw": False,
                "is_flagged": False,
                "detection_method": "offline",
                "error": "Media source not found"
            }

        detector = get_detector()
        
        # Run detection
        logger.info(f"Running offline NSFW detection on: {image_path}")
        detections = detector.detect(image_path)
        
        # Parse results
        nsfw_score = 0.0
        details = {}
        
        if isinstance(detections, dict) and detections:
            # NudeNet returns a dict with detection classes
            for detection in detections.values():
                if isinstance(detection, list):
                    for item in detection:
                        if isinstance(item, dict) and "confidence" in item:
                            score = item["confidence"]
                            nsfw_score = max(nsfw_score, score)
                            details[item.get("class", "unknown")] = score
        
        is_nsfw = nsfw_score >= NSFW_THRESHOLD
        is_flagged = nsfw_score >= NSFW_BLOCK_THRESHOLD
        
        logger.info(f"Offline detection complete - Score: {nsfw_score:.2f}, Flagged: {is_flagged}")
        
        return {
            "nsfw_score": round(nsfw_score, 3),
            "is_nsfw": is_nsfw,
            "is_flagged": is_flagged,
            "detection_method": "offline",
            "details": details
        }
        
    except Exception as e:
        logger.error(f"❌ Offline NSFW detection error: {e}")
        return {
            "nsfw_score": 0.0,
            "is_nsfw": False,
            "is_flagged": False,
            "detection_method": "offline",
            "error": "Analysis failed"
        }


def detect_nsfw_online(image_path: str) -> Optional[Dict]:
    """
    Detect NSFW using OpenAI Moderation API (online, optional)
    
    Returns:
        {
            "nsfw_score": float,
            "is_nsfw": bool,
            "detection_method": "online",
            "categories": {}
        } or None if API unavailable
    """
    if not USE_ONLINE_API or not OPENAI_API_KEY:
        return None
    
    try:
        # Read image and encode as base64
        with open(image_path, "rb") as img_file:
            image_data = img_file.read()
        
        # OpenAI Vision API check
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        import base64
        base64_image = base64.b64encode(image_data).decode("utf-8")
        
        # Use Vision API to analyze image (as fallback for moderation)
        payload = {
            "model": "gpt-4-vision-preview",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        },
                        {
                            "type": "text",
                            "text": "Is this image NSFW, contains nudity, or inappropriate content? Answer: yes/no and rate 0-1"
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Simple parsing
            nsfw_score = 0.5 if "yes" in content.lower() else 0.2
            
            logger.info(f"Online moderation complete - Score: {nsfw_score}")
            
            return {
                "nsfw_score": nsfw_score,
                "is_nsfw": nsfw_score > 0.5,
                "detection_method": "online",
                "response": content[:100]
            }
        else:
            logger.warning(f"Online API error: {response.status_code}")
            return None
            
    except Exception as e:
        logger.warning(f"Online NSFW detection failed (fallback to offline): {e}")
        return None


def detect_nsfw_hybrid(image_path: str) -> Dict:
    """
    Hybrid NSFW detection - Offline first + Online optional
    
    Strategy:
    1. Always use offline model (NudeNet)
    2. If online available, compare and use max score
    3. Return comprehensive results
    """
    # Always run offline detection
    offline_result = detect_nsfw_offline(image_path)
    
    if not USE_ONLINE_API:
        return offline_result
    
    # Try online detection for additional confirmation
    online_result = detect_nsfw_online(image_path)
    
    if online_result:
        # Combine results - use the higher score
        combined_score = max(
            offline_result["nsfw_score"],
            online_result["nsfw_score"]
        )
        
        return {
            "nsfw_score": round(combined_score, 3),
            "is_nsfw": combined_score >= NSFW_THRESHOLD,
            "is_flagged": combined_score >= NSFW_BLOCK_THRESHOLD,
            "detection_method": "hybrid",
            "offline_score": offline_result["nsfw_score"],
            "online_score": online_result["nsfw_score"],
            "details": offline_result.get("details", {})
        }
    
    return offline_result


def blur_image(image_path: str, intensity: int = 30) -> bool:
    """
    Blur a sensitive image for display purposes
    
    Args:
        image_path: Path to image
        intensity: Blur radius (higher = more blur)
    
    Returns:
        bool: Success status
    """
    try:
        if not os.path.exists(image_path):
            logger.error(f"Cannot blur - image not found: {image_path}")
            return False
        
        img = Image.open(image_path)
        blurred = img.filter(ImageFilter.GaussianBlur(radius=intensity))
        
        # Save blurred version
        blurred_path = image_path.replace(".jpg", "_blurred.jpg").replace(".png", "_blurred.png")
        blurred.save(blurred_path, quality=85)
        
        logger.info(f"✅ Image blurred: {blurred_path}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Blur operation failed: {e}")
        return False


def log_nsfw_detection(image_path: str, nsfw_result: Dict) -> bool:
    """
    Log NSFW detections for moderation review
    
    Args:
        image_path: Path to flagged image
        nsfw_result: Detection results
    
    Returns:
        bool: Success status
    """
    try:
        os.makedirs(NSFW_LOG_DIR, exist_ok=True)
        
        log_file = os.path.join(NSFW_LOG_DIR, "nsfw_detections.log")
        
        with open(log_file, "a") as f:
            from datetime import datetime
            timestamp = datetime.utcnow().isoformat()
            log_entry = (
                f"{timestamp} | "
                f"Score: {nsfw_result['nsfw_score']} | "
                f"Image: {image_path} | "
                f"Method: {nsfw_result['detection_method']}\n"
            )
            f.write(log_entry)
        
        logger.info(f"✅ NSFW detection logged")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to log NSFW detection: {e}")
        return False


async def validate_image_safety(image_path: str) -> Dict:
    """
    Main validation function for incoming images
    
    Returns:
        {
            "safe": bool,
            "nsfw_score": float,
            "is_flagged": bool,
            "action": "accept" | "flag" | "reject",
            "message": str
        }
    """
    result = detect_nsfw_hybrid(image_path)
    
    # Log all detections
    log_nsfw_detection(image_path, result)
    
    # Determine action
    if result["is_flagged"]:
        action = "reject"
        message = f"Image flagged as NSFW (score: {result['nsfw_score']:.2f})"
        
        # Optionally blur before storage
        if BLUR_NSFW:
            blur_image(image_path)
    elif result["is_nsfw"]:
        action = "flag"
        message = f"Image marked for review (score: {result['nsfw_score']:.2f})"
    else:
        action = "accept"
        message = "Image passed safety check"
    
    return {
        "safe": action == "accept",
        "nsfw_score": result["nsfw_score"],
        "is_flagged": result["is_flagged"],
        "action": action,
        "message": message,
        "detection_method": result["detection_method"]
    }
