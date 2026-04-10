from fastapi import APIRouter, HTTPException, File, UploadFile
from app.models.report import Report
from app.core.database import reports_collection
from typing import List
from bson import ObjectId
import datetime, httpx, re, os, shutil, uuid

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_extension = file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join("uploads", file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"url": f"http://localhost:8000/uploads/{file_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_location_details(lat: float, lon: float):
    """Récupère l'adresse ET le numéro de téléphone du bâtiment si disponible"""
    try:
        async with httpx.AsyncClient() as client:
            # zoom=18 pour être précis sur le bâtiment, extratags=1 pour le téléphone
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1&extratags=1"
            headers = {'User-Agent': 'ALERTO_App_Crisis'}
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                addr = data.get('address', {})
                tags = data.get('extratags', {})
                suburb = addr.get('suburb', addr.get('neighbourhood', addr.get('town', '')))
                city = addr.get('city', addr.get('county', ''))
                address_text = f"{suburb}, {city}" if suburb and city else data.get('display_name', 'Lieu inconnu').split(',')[0]
                
                # On cherche le numéro dans différents tags possibles
                phone = tags.get('phone', tags.get('contact:phone', None))
                return address_text, phone
            return "Lieu inconnu", None
    except:
        return "Lieu inconnu", None

# Modifié : Le router est déjà défini en haut

# ... (check_for_duplicate reste le même)
def check_for_duplicate(report_dict):
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

from app.services.translation import translate_text
from app.services.ai_classification import classify_damage

def sanitize_input(text: str) -> str:
    # Supprime les balises HTML/Script
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

@router.post("/")
async def create_report(report: Report):
    try:
        report_dict = report.dict()
        if report_dict.get("description"):
            report_dict["description"] = sanitize_input(report_dict["description"])
            report_dict["translated_description"] = await translate_text(report_dict["description"])
        report_dict["ai_suggested_level"] = await classify_damage(
            report_dict.get("image_url", ""), 
            report_dict.get("description", "")
        )

        # Reverse Geocoding Intelligente : Adresse + Téléphone
        coords = report_dict["location"]["coordinates"]
        addr, phone = await get_location_details(coords[1], coords[0])
        report_dict["text_location"] = addr
        report_dict["contact_phone"] = phone
        if check_for_duplicate(report_dict):
            report_dict["is_duplicate"] = True
            
        result = reports_collection.insert_one(report_dict)
        return {
            "message": "Report created successfully", 
            "id": str(result.inserted_id), 
            "is_duplicate": report_dict.get("is_duplicate", False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_reports():
    try:
        reports = []
        for report in reports_collection.find():
            report["_id"] = str(report["_id"])
            reports.append(report)
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}")
async def get_report(report_id: str):
    try:
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        if report:
            report["_id"] = str(report["_id"])
            return report
        raise HTTPException(status_code=404, detail="Report not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid report ID format")

@router.delete("/{report_id}")
async def delete_report(report_id: str):
    try:
        result = reports_collection.delete_one({"_id": ObjectId(report_id)})
        if result.deleted_count:
            return {"message": "Report deleted successfully"}
        raise HTTPException(status_code=404, detail="Report not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid report ID format")

@router.get("/summary/stats")
async def get_stats():
    try:
        total = reports_collection.count_documents({})
        critical = reports_collection.count_documents({"damage_level": "complet"})
        duplicates = reports_collection.count_documents({"is_duplicate": True})
        
        # Répartition par infrastructure
        pipeline = [
            {"$group": {"_id": "$infrastructure_type", "count": {"$sum": 1}}}
        ]
        infra_dist = list(reports_collection.aggregate(pipeline))
        
        return {
            "total_reports": total,
            "critical_zones": critical,
            "duplicates_detected": duplicates,
            "infrastructure_distribution": {item["_id"]: item["count"] for item in infra_dist}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync-offline")
async def sync_reports(payload: dict):
    # ... (sync logic reste la même)
    reports = payload.get("reports", [])
    if not reports:
        return {"message": "No reports to sync"}
    try:
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
        return {"message": f"Successfully synced {len(result.inserted_ids)} reports"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync error: {str(e)}")