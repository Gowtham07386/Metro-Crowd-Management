from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import Station
from app.schemas.schemas import UpdateStationCrowd
from app.services.seed import occupancy_to_status

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("")
def get_stations(city_id: str = None, city: str = None, db: Session = Depends(get_db)):
    target_city = city_id or city
    if not target_city:
        stations = db.query(Station).all()
    else:
        stations = db.query(Station).filter(Station.city_id.ilike(target_city)).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "line": s.line,
            "lineColor": s.line_color,
            "occupancy": s.occupancy,
            "currentCrowd": s.current_crowd,
            "waitingTime": s.waiting_time,
            "status": s.status,
            "statusLabel": s.status_label,
            "statusColor": s.status_color,
            "peakHours": s.peak_hours
        } for s in stations
    ]

@router.put("/{station_id}/crowd")
def update_station_crowd(station_id: str, payload: UpdateStationCrowd, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found.")

    status_info = occupancy_to_status(payload.occupancy)

    station.occupancy = payload.occupancy
    station.current_crowd = payload.currentCrowd
    station.waiting_time = payload.waitingTime
    station.status = status_info["key"]
    station.status_label = status_info["label"]
    station.status_color = status_info["color"]

    db.commit()
    db.refresh(station)
    return {"message": "Station crowd updated successfully.", "station_id": station_id}
