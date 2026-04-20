import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "alerto_db"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    
    # Collections
    reports_collection = db["reports"]
    users_collection = db["users"]
    
    # Check connection and create indexes
    # client.admin.command('ping')  # Retiré pour accélérer le démarrage/rechargement
    print("✅ Connexion MongoDB initialisée.")
    
    reports_collection.create_index([("location", "2dsphere")], background=True)
    users_collection.create_index("username", unique=True, background=True)
    
except Exception as e:
    print(f"❌ ERREUR CRITIQUE MONGODB : {str(e)}")
    print("Vérifiez que votre adresse IP est autorisée dans MongoDB Atlas (Network Access).")
    print("Si l'erreur persiste, vous pouvez tester d'ajouter ?tlsAllowInvalidCertificates=true à votre MONGO_URI.")
    reports_collection = None
    users_collection = None
