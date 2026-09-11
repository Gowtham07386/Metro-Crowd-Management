import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.database.database import Base

class CrowdAlert(Base):
    __tablename__ = "crowd_alerts"

    id = Column(String, primary_key=True, index=True)
    city_id = Column(String, ForeignKey("cities.id"), index=True, nullable=False)
    station_name = Column(String, nullable=False)
    severity = Column(String, nullable=False, default="warning")  # critical, warning, info
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    time = Column(DateTime, default=datetime.datetime.utcnow)
    read = Column(Boolean, default=False)
    phone_alert_sent = Column(Boolean, default=True)  # Mobile notification flag
