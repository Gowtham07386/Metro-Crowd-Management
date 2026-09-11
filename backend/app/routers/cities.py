from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import City, Station, Train, CrowdAlert, AiPrediction, AnalyticsData, User

router = APIRouter(prefix="/cities", tags=["Cities"])

@router.get("")
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(City).all()
    result = []
    for c in cities:
        result.append({
            "id": c.id,
            "name": c.name,
            "state": c.state,
            "stations": c.stations_count,
            "linesCount": c.lines_count,
            "dailyPassengers": c.daily_passengers,
            "lines": c.lines
        })
    return result

@router.get("/{city_id}")
def get_city_by_id(city_id: str, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found.")
    return {
        "id": city.id,
        "name": city.name,
        "state": city.state,
        "stations": city.stations_count,
        "linesCount": city.lines_count,
        "dailyPassengers": city.daily_passengers,
        "lines": city.lines
    }

@router.get("/{city_id}/full-data")
def get_full_city_data(city_id: str, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found.")

    stations = db.query(Station).filter(Station.city_id == city_id).all()
    trains = db.query(Train).filter(Train.city_id == city_id).all()
    alerts = db.query(CrowdAlert).filter(CrowdAlert.city_id == city_id).order_by(CrowdAlert.time.desc()).all()
    ai_pred = db.query(AiPrediction).filter(AiPrediction.city_id == city_id).first()
    analytics = db.query(AnalyticsData).filter(AnalyticsData.city_id == city_id).first()
    users = db.query(User).limit(10).all()

    formatted_stations = []
    for s in stations:
        formatted_stations.append({
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
            "peakHours": s.peak_hours,
            "lineIndex": s.line_index,
            "positionInLine": s.position_in_line
        })

    formatted_trains = []
    for t in trains:
        formatted_trains.append({
            "id": t.id,
            "line": t.line,
            "lineColor": t.line_color,
            "status": t.status,
            "currentStation": t.current_station,
            "nextStation": t.next_station,
            "load": t.load,
            "capacity": t.capacity,
            "delayMin": t.delay_min,
            "platform": t.platform,
            "frequencyMin": t.frequency_min
        })

    # Sort risk stations by occupancy descending
    sorted_risk = sorted(formatted_stations, key=lambda s: s["occupancy"], reverse=True)[:8]
    risk_stations = []
    for s in sorted_risk:
        occ = s["occupancy"]
        risk_label = "Critical" if occ >= 85 else ("High" if occ >= 65 else ("Medium" if occ >= 40 else "Low"))
        risk_stations.append({**s, "risk": risk_label})


    formatted_alerts = []
    for a in alerts:
        formatted_alerts.append({
            "id": a.id,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "station": a.station_name,
            "time": a.time.isoformat() if a.time else None,
            "read": a.read
        })

    formatted_ai = {
        "peakStation": ai_pred.peak_station if ai_pred else (formatted_stations[0]["name"] if formatted_stations else "Central"),
        "futureCrowd": ai_pred.future_crowd if ai_pred else [],
        "suggestedFrequency": ai_pred.suggested_frequency if ai_pred else "4 min",
        "confidence": ai_pred.confidence if ai_pred else 85,
        "congestionTrend": ai_pred.congestion_trend if ai_pred else "stable"
    }

    formatted_users = []
    for u in users:
        formatted_users.append({
            "id": u.id,
            "name": u.name,
            "role": u.role,
            "email": u.email,
            "status": u.status
        })

    return {
        "city": {
            "id": city.id,
            "name": city.name,
            "state": city.state,
            "stations": city.stations_count,
            "linesCount": city.lines_count,
            "dailyPassengers": city.daily_passengers,
            "lines": city.lines
        },
        "stations": formatted_stations,
        "trains": formatted_trains,
        "hourlyFlow": analytics.hourly_flow if analytics else [],
        "weekly": analytics.weekly if analytics else [],
        "monthly": analytics.monthly if analytics else [],
        "riskStations": risk_stations,
        "alerts": formatted_alerts,
        "aiPrediction": formatted_ai,
        "users": formatted_users
    }
