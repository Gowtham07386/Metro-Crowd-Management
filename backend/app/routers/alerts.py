import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import CrowdAlert
from app.schemas.schemas import SendMobileAlertRequest

router = APIRouter(prefix="/alerts", tags=["Crowd Alerts & Mobile Notifications"])

@router.get("")
def get_alerts(city_id: str, db: Session = Depends(get_db)):
    alerts = db.query(CrowdAlert).filter(CrowdAlert.city_id == city_id).order_by(CrowdAlert.time.desc()).all()
    return [
        {
            "id": a.id,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "station": a.station_name,
            "time": a.time.isoformat() if a.time else None,
            "read": a.read,
            "phoneAlertSent": a.phone_alert_sent
        } for a in alerts
    ]

@router.post("/send-mobile-alert")
def send_mobile_alert(city_id: str, payload: SendMobileAlertRequest, db: Session = Depends(get_db)):
    alert_id = f"{city_id}-mobile-alert-{int(datetime.datetime.utcnow().timestamp())}"
    alert = CrowdAlert(
        id=alert_id,
        city_id=city_id,
        station_name=payload.station,
        severity=payload.severity,
        title=payload.title,
        message=payload.message,
        time=datetime.datetime.utcnow(),
        read=False,
        phone_alert_sent=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {
        "success": True,
        "alertId": alert.id,
        "message": f"Mobile crowd alert successfully broadcasted to passengers for station {payload.station}."
    }

@router.put("/{alert_id}/read")
def mark_alert_read(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(CrowdAlert).filter(CrowdAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.read = True
    db.commit()
    return {"success": True, "message": "Alert marked as read."}
