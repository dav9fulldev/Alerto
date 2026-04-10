from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.reports import router as reports_router

app = FastAPI(title="ALERTO API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(reports_router, prefix="/reports", tags=["Reports"])

@app.get("/")
async def root():
    return {"message": "ALERTO API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
