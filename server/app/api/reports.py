from fastapi import APIRouter, HTTPException, File, UploadFile
from app.models.report import Report
from app.core.database import reports_collection
from typing import List
from bson import ObjectId
import datetime, httpx, re, os, shutil, uuid

router = APIRouter()

# ============ UPLOAD ============
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    print(f"📥 Réception d'un fichier : {file.filename}")
    try:
        abs_path = os.path.abspath("uploads")
        if not os.path.exists(abs_path):
            os.makedirs(abs_path)
            
        file_extension = file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"
        target_path = os.path.join(abs_path, file_name)
        
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"✅ Fichier sauvegardé dans : {target_path}")
        return {"url": f"/uploads/{file_name}"}
    except Exception as e:
        print(f"❌ ERREUR UPLOAD : {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ HELPERS ============
async def get_location_details(lat: float, lon: float):
    """Récupère l'adresse ET le numéro de téléphone du bâtiment si disponible"""
    try:
        async with httpx.AsyncClient() as client:
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1&extratags=1"
            headers = {'User-Agent': 'ALERTO_App_Crisis'}
            response = await client.get(url, headers=headers, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                addr = data.get('address', {})
                tags = data.get('extratags', {})
                suburb = addr.get('suburb', addr.get('neighbourhood', addr.get('town', '')))
                city = addr.get('city', addr.get('county', ''))
                address_text = f"{suburb}, {city}" if suburb and city else data.get('display_name', 'Lieu inconnu').split(',')[0]
                phone = tags.get('phone', tags.get('contact:phone', None))
                return address_text, phone
            return "Lieu inconnu", None
    except Exception as e:
        print(f"⚠️ Geocoding error: {e}")
        return "Lieu inconnu", None

def check_for_duplicate(report_dict):
    """Vérifie si un rapport similaire existe dans la dernière heure"""
    if reports_collection is None:
        return False
    try:
        one_hour_ago = datetime.datetime.utcnow() - datetime.timedelta(hours=1)
        location_query = report_dict["location"]
        query = {
            "location": {
                "$near": {
                    "$geometry": location_query,
                    "$maxDistance": 50
                }
            },
            "created_at": {"$gt": one_hour_ago},
            "crisis_type": report_dict["crisis_type"]
        }
        duplicate = reports_collection.find_one(query)
        return True if duplicate else False
    except Exception as e:
        print(f"⚠️ Duplicate check error: {e}")
        return False

def sanitize_input(text: str) -> str:
    """Supprime les balises HTML/Script"""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

# ============ SERVICES IMPORTS ============
from app.services.translation import translate_text
from app.services.ai_classification import classify_damage
from app.services.nsfw_detection import validate_image_safety
from app.core.config import NSFW_ENABLED, NSFW_BLOCK_THRESHOLD

# ============ ROUTES ============

@router.post("/")
async def create_report(report: Report):
    """Crée un nouveau rapport de crise avec validation NSFW"""
    try:
        if reports_collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
        report_dict = report.dict()
        if report_dict.get("description"):
            report_dict["description"] = sanitize_input(report_dict["description"])
            report_dict["translated_description"] = await translate_text(report_dict["description"])
        
        # ============ NSFW DETECTION ============
        if NSFW_ENABLED and report_dict.get("image_url"):
            image_path = report_dict["image_url"]
            
            # Convert URL to local path if it's an upload path
            if image_path.startswith("/uploads/"):
                image_path = os.path.join("uploads", image_path.split("/uploads/")[1])
            
            print(f"🔍 Vérification NSFW pour: {image_path}")
            
            if os.path.exists(image_path):
                safety_check = await validate_image_safety(image_path)
                
                # Store NSFW results in report
                report_dict["nsfw_score"] = safety_check["nsfw_score"]
                report_dict["is_nsfw"] = not safety_check["safe"]
                report_dict["is_flagged"] = safety_check["is_flagged"]
                report_dict["nsfw_detection_method"] = safety_check["detection_method"]
                
                print(f"📊 NSFW Score: {safety_check['nsfw_score']:.2f} | Action: {safety_check['action']}")
                
                # Reject if flagged as inappropriate
                if safety_check["action"] == "reject":
                    print(f"❌ Image rejetée - NSFW")
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Image rejected: {safety_check['message']}"
                    )
                elif safety_check["action"] == "flag":
                    print(f"⚠️ Image marquée pour révision")
                    report_dict["is_flagged"] = True
            else:
                print(f"⚠️ Image non trouvée pour vérification NSFW: {image_path}")
        
        # ============ AI CLASSIFICATION ============
        report_dict["ai_suggested_level"] = await classify_damage(
            report_dict.get("image_url", ""), 
            report_dict.get("description", "")
        )
        report_dict["created_at"] = datetime.datetime.utcnow()

        # ============ REVERSE GEOCODING ============
        coords = report_dict["location"]["coordinates"]
        print(f"🌍 Recherche de localisation pour : {coords}")
        addr, phone = await get_location_details(coords[1], coords[0])
        report_dict["text_location"] = addr
        report_dict["contact_phone"] = phone
        print(f"🏠 Lieu trouvé : {addr} | Tél : {phone}")
        
        # ============ DUPLICATE CHECK ============
        if check_for_duplicate(report_dict):
            report_dict["is_duplicate"] = True
            print("⚠️ Doublon détecté.")
        
        # ============ SAVE REPORT ============        
        result = reports_collection.insert_one(report_dict)
        print(f"🚀 Rapport enregistré avec succès ! ID: {result.inserted_id}")
        return {
            "message": "Report created successfully", 
            "id": str(result.inserted_id), 
            "is_duplicate": report_dict.get("is_duplicate", False),
            "nsfw_score": report_dict.get("nsfw_score", 0.0),
            "is_flagged": report_dict.get("is_flagged", False)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERREUR CREATE_REPORT: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/stats")
async def get_stats():
    """Récupère les statistiques des rapports"""
    try:
        if reports_collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        print(f"📊 Calcul des stats...")
        total = reports_collection.count_documents({})
        critical = reports_collection.count_documents({"damage_level": "complet"})
        duplicates = reports_collection.count_documents({"is_duplicate": True})
        nsfw_flagged = reports_collection.count_documents({"is_flagged": True})
        nsfw_detected = reports_collection.count_documents({"is_nsfw": True})
        
        # Répartition par infrastructure
        pipeline = [
            {"$group": {"_id": "$infrastructure_type", "count": {"$sum": 1}}}
        ]
        infra_dist = list(reports_collection.aggregate(pipeline))
        
        # NSFW Score distribution
        nsfw_pipeline = [
            {"$match": {"nsfw_score": {"$gt": 0}}},
            {"$bucketAuto": {"groupBy": "$nsfw_score", "buckets": 5}}
        ]
        nsfw_dist = list(reports_collection.aggregate(nsfw_pipeline))
        
        print(f"✅ Stats calculées: {total} rapports")
        return {
            "total_reports": total,
            "critical_zones": critical,
            "duplicates_detected": duplicates,
            "nsfw_flagged": nsfw_flagged,
            "nsfw_detected": nsfw_detected,
            "infrastructure_distribution": {item["_id"]: item["count"] for item in infra_dist},
            "nsfw_score_distribution": nsfw_dist
        }
    except Exception as e:
        print(f"❌ ERREUR GET_STATS: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/nsfw-review")
async def get_nsfw_reports():
    """Récupère les rapports flaggés pour révision NSFW"""
    try:
        if reports_collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        print(f"🔍 Récupération des rapports NSFW flaggés...")
        flagged_reports = []
        
        for report in reports_collection.find({"is_flagged": True}).sort("nsfw_score", -1):
            report["_id"] = str(report["_id"])
            flagged_reports.append({
                "id": report["_id"],
                "image_url": report.get("image_url"),
                "nsfw_score": report.get("nsfw_score", 0),
                "nsfw_detection_method": report.get("nsfw_detection_method"),
                "description": report.get("description", "")[:100],
                "location": report.get("text_location"),
                "created_at": report.get("created_at")
            })
        
        print(f"✅ {len(flagged_reports)} rapports flaggés trouvés")
        return {
            "count": len(flagged_reports),
            "flagged_reports": flagged_reports
        }
    except Exception as e:
        print(f"❌ ERREUR GET_NSFW_REPORTS: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}")
async def get_report(report_id: str):
    """Récupère un rapport spécifique par ID"""
    try:
        if reports_collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        print(f"🔍 Recherche du rapport : {report_id}")
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        if report:
            report["_id"] = str(report["_id"])
            print(f"✅ Rapport trouvé")
            return report
        raise HTTPException(status_code=404, detail="Report not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        print(f"❌ ERREUR GET_REPORT: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid report ID format")

@router.get("/")
async def get_reports():
    """Récupère tous les rapports"""
    try:
        if reports_collection is None:
            print("❌ reports_collection est None!")
            raise HTTPException(status_code=500, detail="Database connection failed")
        print(f"📊 Récupération des reports...")
        reports = []
        for report in reports_collection.find():
            report["_id"] = str(report["_id"])
            reports.append(report)
        print(f"✅ {len(reports)} reports trouvés")
        return reports
    except Exception as e:
        print(f"❌ ERREUR GET_REPORTS: {str(e)}")
        print(f"Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{report_id}")
async def delete_report(report_id: str):
    """Supprime un rapport"""
    try:
        if reports_collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        result = reports_collection.delete_one({"_id": ObjectId(report_id)})
        if result.deleted_count:
            print(f"🗑️ Rapport {report_id} supprimé")
            return {"message": "Report deleted successfully"}
        raise HTTPException(status_code=404, detail="Report not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        print(f"❌ ERREUR DELETE_REPORT: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid report ID format")

@router.post("/sync-offline")
async def sync_reports(payload: dict):
    """Synchronise les rapports hors ligne"""
    reports = payload.get("reports", [])
    if not reports:
        return {"message": "No reports to sync"}
    try:
        if reports_collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        to_insert = []
        for r in reports:
            r.pop('id', None)
            r.pop('timestamp', None)
            if check_for_duplicate(r):
                r["is_duplicate"] = True
            if isinstance(r.get('created_at'), str):
                r['created_at'] = datetime.datetime.fromisoformat(r['created_at'].replace('Z', '+00:00'))
            to_insert.append(r)
        result = reports_collection.insert_many(to_insert)
        print(f"✅ {len(result.inserted_ids)} rapports synchronisés")
        return {"message": f"Successfully synced {len(result.inserted_ids)} reports"}
    except Exception as e:
        print(f"❌ ERREUR SYNC: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sync error: {str(e)}")
