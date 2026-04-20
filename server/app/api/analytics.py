from fastapi import APIRouter, HTTPException, Depends
from app.core.database import reports_collection
from app.core.security import get_current_user
from app.models.user import User
from bson import ObjectId
import datetime

router = APIRouter()

@router.get("/stats")
async def get_stats(current_user: User = Depends(get_current_user)):
    """Récupère les statistiques globales des rapports (Accès sécurisé)"""
    try:
        if reports_collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        print(f"User {current_user.username} consulte les stats")
        total = reports_collection.count_documents({})
        critical = reports_collection.count_documents({"damage_level": "complet"})
        duplicates = reports_collection.count_documents({"is_duplicate": True})
        nsfw_flagged = reports_collection.count_documents({"is_flagged": True})
        nsfw_detected = reports_collection.count_documents({"is_nsfw": True})
        
        # Répartition par infrastructure
        infra_pipeline = [
            {"$group": {"_id": "$infrastructure_type", "count": {"$sum": 1}}}
        ]
        infra_dist = list(reports_collection.aggregate(infra_pipeline))
        
        # Répartition par type de crise
        crisis_pipeline = [
            {"$group": {"_id": "$crisis_type", "count": {"$sum": 1}}}
        ]
        crisis_dist = list(reports_collection.aggregate(crisis_pipeline))
        
        # Distribution des scores NSFW
        nsfw_pipeline = [
            {"$match": {"nsfw_score": {"$gt": 0}}},
            {"$bucketAuto": {"groupBy": "$nsfw_score", "buckets": 5}}
        ]
        nsfw_dist = list(reports_collection.aggregate(nsfw_pipeline))
        
        return {
            "total_reports": total,
            "critical_zones": critical,
            "duplicates_detected": duplicates,
            "nsfw_flagged": nsfw_flagged,
            "nsfw_detected": nsfw_detected,
            "infrastructure_distribution": {item["_id"]: item["count"] for item in infra_dist},
            "crisis_distribution": {item["_id"]: item["count"] for item in crisis_dist},
            "nsfw_score_distribution": nsfw_dist
        }
    except Exception as e:
        print(f"ERREUR GET_STATS: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/nsfw-review")
async def get_nsfw_reports(current_user: User = Depends(get_current_user)):
    """Récupère les rapports marqués pour révision NSFW (Accès sécurisé)"""
    try:
        if reports_collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        print(f"User {current_user.username} accède à la revue NSFW")
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
        
        return {
            "count": len(flagged_reports),
            "flagged_reports": flagged_reports
        }
    except Exception as e:
        print(f"ERREUR GET_NSFW_REPORTS: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/trends")
async def get_trends(current_user: User = Depends(get_current_user)):
    """Analyse temporelle des rapports sur les 7 derniers jours (Accès sécurisé)"""
    try:
        if reports_collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
        
        pipeline = [
            {"$match": {"created_at": {"$gte": seven_days_ago}}},
            {"$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"},
                    "day": {"$dayOfMonth": "$created_at"}
                },
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}}
        ]
        
        results = list(reports_collection.aggregate(pipeline))
        trends = []
        for r in results:
            date_str = f"{r['_id']['year']}-{r['_id']['month']:02d}-{r['_id']['day']:02d}"
            trends.append({"date": date_str, "count": r["count"]})
            
        return trends
    except Exception as e:
        print(f"ERREUR GET_TRENDS: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
