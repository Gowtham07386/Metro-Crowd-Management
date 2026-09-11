from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import AnalyticsData, User, Station, Train

router = APIRouter(prefix="/admin", tags=["Admin Management & Analytics"])

@router.get("/analytics/{city_id}")
def get_analytics(city_id: str, db: Session = Depends(get_db)):
    clean_city_id = city_id.lower().replace(" metro", "").strip()
    
    # Query stations for the city or fallback to all stations
    stations = db.query(Station).filter(Station.city_id == clean_city_id).all()
    if not stations:
        stations = db.query(Station).filter(Station.city_id.ilike(f"%{clean_city_id}%")).all()
    if not stations:
        stations = db.query(Station).all()
        
    data = db.query(AnalyticsData).filter(AnalyticsData.city_id == clean_city_id).first()
    
    station_list = []
    high_count = 0
    med_count = 0
    low_count = 0
    total_inflow = 0
    total_outflow = 0
    
    for s in stations:
        entries = s.current_crowd or 850
        exits = int(entries * 0.85)
        net = entries - exits
        total_inflow += entries
        total_outflow += exits
        
        occ = s.occupancy or 50
        if occ >= 75:
            high_count += 1
        elif occ >= 40:
            med_count += 1
        else:
            low_count += 1
            
        next_30 = min(98, max(15, int(occ + (5 if occ > 65 else (-4 if occ < 40 else 2)))))
        next_30_people = int((next_30 / 100.0) * 1800)
        
        station_list.append({
            "id": s.id,
            "name": s.name,
            "line": s.line,
            "lineColor": s.line_color,
            "entryCount": entries,
            "exitCount": exits,
            "netFlow": net,
            "predictedOccupancy": occ,
            "next30MinOccupancy": next_30,
            "predictedPeople": next_30_people,
            "waitingTime": s.waiting_time,
            "status": s.status,
            "statusLabel": s.status_label,
            "statusColor": s.status_color,
            "serviceAlertActive": occ >= 80,
            "platformCongestion": occ >= 70,
            "gateClosureRecommended": occ >= 88
        })
        
    sorted_by_inflow = sorted(station_list, key=lambda x: x["entryCount"], reverse=True)
    sorted_by_occ = sorted(station_list, key=lambda x: x["predictedOccupancy"], reverse=True)
    
    busiest = sorted_by_inflow[0] if sorted_by_inflow else {}
    peak = sorted_by_occ[0] if sorted_by_occ else {}
    
    avg_occ = round(sum(s["predictedOccupancy"] for s in station_list) / max(1, len(station_list)), 2)
    avg_next30 = round(sum(s["next30MinOccupancy"] for s in station_list) / max(1, len(station_list)), 2)
    
    return {
        "cityId": clean_city_id,
        "cityName": f"{clean_city_id.capitalize()} Metro",
        "totalStations": len(station_list),
        "summary": {
            "totalInflow": total_inflow,
            "totalOutflow": total_outflow,
            "netFlow": total_inflow - total_outflow,
            "totalEntries": total_inflow,
            "totalExits": total_outflow,
            "avgOccupancy": avg_occ,
            "avgNext30MinOccupancy": avg_next30,
            "highCrowdStations": high_count,
            "mediumCrowdStations": med_count,
            "lowCrowdStations": low_count,
            "busiestStation": busiest.get("name", "N/A"),
            "peakStation": peak.get("name", "N/A")
        },
        "stations": station_list,
        "peakStation": peak,
        "busiestStation": busiest,
        "hourlyFlow": data.hourly_flow if data else [],
        "weekly": data.weekly if data else [],
        "monthly": data.monthly if data else []
    }

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "role": u.role,
            "email": u.email,
            "phone": u.phone or "",
            "status": u.status,
            "dateJoined": u.date_joined.isoformat() if u.date_joined else None
        } for u in users
    ]

from pydantic import BaseModel
from typing import Optional
import datetime
from app.utils.auth import get_password_hash

class InviteUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Administrator"
    phone: Optional[str] = ""

@router.post("/users/invite")
@router.post("/users")
def invite_user(payload: InviteUserRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email.ilike(payload.email)).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists in the system."
        )
    
    count = db.query(User).count()
    user_id = f"USR-INV-{count + 1}-{int(datetime.datetime.utcnow().timestamp())}"
    hashed_pwd = get_password_hash(payload.password)
    
    new_user = User(
        id=user_id,
        name=payload.name,
        email=payload.email,
        password=hashed_pwd,
        phone=payload.phone or "",
        role=payload.role or "Administrator",
        status="Active",
        date_joined=datetime.datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": f"User {new_user.name} invited successfully and credentials saved.",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "phone": new_user.phone or "",
            "role": new_user.role,
            "status": new_user.status,
            "dateJoined": new_user.date_joined.isoformat() if new_user.date_joined else None
        }
    }

@router.put("/users/{user_id}/status")
def update_user_status(user_id: str, status: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.status = status
    db.commit()
    return {"message": f"User status updated to {status}."}

@router.get("/reports/{city_id}")
def get_reports_summary(city_id: str, db: Session = Depends(get_db)):
    analytics_data = get_analytics(city_id, db)
    total_stations = db.query(Station).filter(Station.city_id == city_id).count()
    crowded_stations = db.query(Station).filter(Station.city_id == city_id, Station.occupancy >= 65).count()
    total_trains = db.query(Train).filter(Train.city_id == city_id).count()
    active_trains = db.query(Train).filter(Train.city_id == city_id, Train.status == "Running").count()

    response = dict(analytics_data)
    response.update({
        "cityId": city_id,
        "totalStations": total_stations or analytics_data.get("totalStations", 0),
        "crowdedStations": crowded_stations,
        "totalTrains": total_trains,
        "activeTrains": active_trains,
        "efficiencyScore": "94%",
        "peakCongestionWindow": "08:15 AM - 09:45 AM"
    })
    return response
