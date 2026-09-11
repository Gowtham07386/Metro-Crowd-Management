import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config.config import settings
from app.database.database import engine, Base, SessionLocal, get_db
from app.services.seed import seed_database
from app.routers import auth, cities, stations, trains, alerts, journey, ai, admin, emergency

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI Backend for Metro Flow - Metro Crowd Management & Peak Hour Mobile Alert System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import asyncio
from app.services.seed import seed_database, update_live_occupancies_and_alerts

async def periodic_5min_crowd_updater():
    while True:
        await asyncio.sleep(300)
        try:
            logger.info("Executing 5-minute periodic crowd occupancy & alerts update...")
            db = SessionLocal()
            try:
                update_live_occupancies_and_alerts(db)
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error in 5-minute crowd updater: {e}")

# Startup Event: Create DB tables and seed data
@app.on_event("startup")
def on_startup():
    logger.info("Initializing database schema...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
        db = SessionLocal()
        try:
            logger.info("Running initial seed for Metro Flow cities and demo data...")
            seed_database(db)
            logger.info("Database seeding completed.")
        finally:
            db.close()
        # Launch 5-minute periodic update task
        asyncio.create_task(periodic_5min_crowd_updater())
    except Exception as e:
        logger.error(f"Error during startup database setup: {e}")


# Include Routers under settings.API_V1_STR (/api)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(cities.router, prefix=settings.API_V1_STR)
app.include_router(stations.router, prefix=settings.API_V1_STR)
app.include_router(trains.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(journey.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(emergency.router, prefix=settings.API_V1_STR)

@app.post(f"{settings.API_V1_STR}/predict")
def predict_endpoint(payload: dict = None, db: Session = Depends(get_db)):
    from app.services.ml_service import predict_station_crowd
    from app.models import Station
    payload = payload or {}
    station_id = payload.get("station_id") or payload.get("stationId") or "ST001"
    
    station = db.query(Station).filter(Station.id == station_id).first()
    info = None
    if station:
        info = {
            "name": station.name,
            "city": station.city_id,
            "line": station.line,
            "occupancy": station.occupancy,
            "current_crowd": station.current_crowd,
            "waiting_time": station.waiting_time,
        }
    return predict_station_crowd(station_id, info)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs": "/docs",
        "message": "Metro Flow FastAPI Backend is running with PostgreSQL."
    }
