from sqlalchemy import Column, String, JSON, ForeignKey
from app.database.database import Base

class AnalyticsData(Base):
    __tablename__ = "analytics_data"

    id = Column(String, primary_key=True, index=True)
    city_id = Column(String, ForeignKey("cities.id"), unique=True, index=True, nullable=False)
    hourly_flow = Column(JSON, nullable=False)   # [{hour: '05:00', entries: 1200, exits: 900}, ...]
    weekly = Column(JSON, nullable=False)        # [{day: 'Mon', riders: 650000}, ...]
    monthly = Column(JSON, nullable=False)       # [{month: 'Feb', riders: 18.2}, ...]
