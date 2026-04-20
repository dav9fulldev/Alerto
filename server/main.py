from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api.reports import router as reports_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router

tags_metadata = [
    {
        "name": "Authentication",
        "description": "Gestion des accès, inscription et jetons JWT.",
    },
    {
        "name": "Analytics",
        "description": "Statistiques, tendances et modération IA.",
    },
    {
        "name": "Reports",
        "description": "Gestion des signalements de crise sur le terrain.",
    },
]

app = FastAPI(
    title="ALERTO API", 
    version="1.0.0",
    openapi_tags=tags_metadata
)

# CORS doit etre declare AVANT le montage des fichiers statiques
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup uploads directory
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(reports_router, prefix="/reports", tags=["Reports"])

@app.get("/")
async def root():
    return {"message": "ALERTO API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
