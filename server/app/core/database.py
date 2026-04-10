import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "alerto_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
reports_collection = db["reports"]

# Create Geospatial Index
reports_collection.create_index([("location", "2dsphere")])
