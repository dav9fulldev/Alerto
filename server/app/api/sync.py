from fastapi import APIRouter, HTTPException
from app.models.report import Report
from app.core.database import reports_collection
from typing import List

router = APIRouter()

class SyncRequest(Report):
    source: str = "offline"

@router.post("/sync-offline")
async def sync_reports(payload: dict):
    # payload: {"reports": [...]}
    reports = payload.get("reports", [])
    if not reports:
        return {"message": "No reports to sync"}
    
    try:
        # We strip the internal 'id' from IndexedDB and 'timestamp' before inserting to Mongo
        to_insert = []
        for r in reports:
            # Clean up IndexedDB specific fields
            r.pop('id', None)
            r.pop('timestamp', None)
            to_insert.append(r)
            
        result = reports_collection.insert_many(to_insert)
        return {
            "message": f"Successfully synced {len(result.inserted_ids)} reports",
            "synced_count": len(result.inserted_ids)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync error: {str(e)}")
