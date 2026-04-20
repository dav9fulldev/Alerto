"""
Configuration for ALERTO API
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Database
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "alerto")

# NSFW Detection Configuration
NSFW_ENABLED = os.getenv("NSFW_ENABLED", "true").lower() == "true"
NSFW_THRESHOLD = float(os.getenv("NSFW_THRESHOLD", "0.7"))  # Flag for review
NSFW_BLOCK_THRESHOLD = float(os.getenv("NSFW_BLOCK_THRESHOLD", "0.85"))  # Reject image
USE_ONLINE_MODERATION = os.getenv("USE_ONLINE_MODERATION", "false").lower() == "true"
BLUR_NSFW_IMAGES = os.getenv("BLUR_NSFW_IMAGES", "true").lower() == "true"
NSFW_LOG_DIR = os.getenv("NSFW_LOG_DIR", "uploads/nsfw_logs")

# Optional: OpenAI API for online moderation
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# API Configuration
API_TITLE = "ALERTO Crisis Mapping API"
API_VERSION = "1.0.0"
API_DESCRIPTION = "Real-time crisis response system with AI-powered damage assessment"

# Translation Configuration
GOOGLE_TRANSLATE_ENABLED = os.getenv("GOOGLE_TRANSLATE_ENABLED", "true").lower() == "true"

# File Upload Configuration
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 10 * 1024 * 1024))  # 10MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
