from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database.database import get_db
from app.models import AiPrediction, Station
from app.services.ml_service import predict_station_crowd

router = APIRouter(prefix="/ai", tags=["AI Predictive Analytics"])

class PredictRequest(BaseModel):
    station_id: Optional[str] = None
    city_id: Optional[str] = None

@router.get("/predictions/{city_id}")
def get_ai_predictions(city_id: str, db: Session = Depends(get_db)):
    pred = db.query(AiPrediction).filter(AiPrediction.city_id == city_id).first()
    if not pred:
        top_st = db.query(Station).filter(Station.city_id == city_id).order_by(Station.occupancy.desc()).first()
        peak_name = top_st.name if top_st else "Central Station"
        return {
            "peakStation": peak_name,
            "futureCrowd": [],
            "suggestedFrequency": "4 min",
            "confidence": 88,
            "congestionTrend": "stable"
        }
    return {
        "peakStation": pred.peak_station,
        "futureCrowd": pred.future_crowd,
        "suggestedFrequency": pred.suggested_frequency,
        "confidence": pred.confidence,
        "congestionTrend": pred.congestion_trend
    }

@router.get("/predict/{station_id}")
def predict_crowd_get(station_id: str, db: Session = Depends(get_db)):
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

@router.post("/predict")
def predict_crowd_post(payload: PredictRequest, db: Session = Depends(get_db)):
    st_id = payload.station_id or "ST001"
    station = db.query(Station).filter(Station.id == st_id).first()
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
    return predict_station_crowd(st_id, info)
