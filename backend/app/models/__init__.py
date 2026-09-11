from app.models.user import User
from app.models.city import City
from app.models.station import Station
from app.models.train import Train
from app.models.alert import CrowdAlert
from app.models.ai_prediction import AiPrediction
from app.models.analytics import AnalyticsData
from app.models.otp import OtpRecord
from app.models.ticket import Ticket

__all__ = [
    "User",
    "City",
    "Station",
    "Train",
    "CrowdAlert",
    "AiPrediction",
    "AnalyticsData",
    "OtpRecord",
    "Ticket"
]
