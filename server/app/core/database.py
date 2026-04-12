import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "alerto_db"

try:
    client = MongoClient(MONGO_URI, connectTimeoutMS=5000, serverSelectionTimeoutMS=5000)
    # Test the connection
    client.admin.command('ping')
    db = client[DB_NAME]
    
    # Collections
    reports_collection = db["reports"]
    
    # Create Geospatial Index
    try:
        reports_collection.create_index([("location", "2dsphere")])
    except Exception as e:
        print(f"Warning: Could not create index: {e}")
except ServerSelectionTimeoutError:
    print("Warning: MongoDB connection failed. Server will start but database operations may fail.")
    # Create a dummy client for now
    client = None
    db = None
    reports_collection = None
except Exception as e:
    print(f"Warning: MongoDB initialization error: {e}")
    client = None
    db = None
    reports_collection = None
