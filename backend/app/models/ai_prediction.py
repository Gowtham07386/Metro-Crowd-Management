from sqlalchemy import Column, String, Integer, JSON, ForeignKey
from app.database.database import Base

class AiPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(String, primary_key=True, index=True)
    city_id = Column(String, ForeignKey("cities.id"), unique=True, index=True, nullable=False)
    peak_station = Column(String, nullable=False)
    future_crowd = Column(JSON, nullable=False)  # [{hour: '05:00', predicted: 450}, ...]
    suggested_frequency = Column(String, nullable=False, default="4 min")
    confidence = Column(Integer, nullable=False, default=85)
    congestion_trend = Column(String, nullable=False, default="stable")  # rising, stable, falling
