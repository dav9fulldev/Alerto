from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api.reports import router as reports_router

app = FastAPI(title="ALERTO API", version="1.0.0")

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
app.include_router(reports_router, prefix="/reports", tags=["Reports"])

@app.get("/")
async def root():
    return {"message": "ALERTO API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
