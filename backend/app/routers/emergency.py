from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/emergency", tags=["Emergency Assistance"])

class EmergencyAlertRequest(BaseModel):
    station: str
    issueType: str
    description: Optional[str] = ""
    reporterPhone: Optional[str] = ""

@router.get("/contacts/{city_id}")
def get_emergency_contacts(city_id: str):
    return {
        "cityId": city_id,
        "controlRoom": "155370",
        "womenHelpline": "1091",
        "police": "112",
        "medicalEmergency": "108",
        "disasterManagement": "1070"
    }

@router.post("/alert")
def trigger_emergency_alert(payload: EmergencyAlertRequest):
    return {
        "success": True,
        "message": f"Emergency alert dispatched for station '{payload.station}'. Metro Rapid Response unit notified."
    }
