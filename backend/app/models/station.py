from sqlalchemy import Column, String, Integer, ForeignKey
from app.database.database import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(String, primary_key=True, index=True)
    city_id = Column(String, ForeignKey("cities.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    line = Column(String, nullable=False)
    line_color = Column(String, nullable=False)
    occupancy = Column(Integer, nullable=False, default=50)  # Percentage 0-100
    current_crowd = Column(Integer, nullable=False, default=900)
    waiting_time = Column(Integer, nullable=False, default=5)  # minutes
    status = Column(String, nullable=False, default="moderate")  # low, moderate, crowded, severe
    status_label = Column(String, nullable=False, default="Moderate")
    status_color = Column(String, nullable=False, default="#f7c948")
    peak_hours = Column(String, nullable=False, default="08:00 – 10:00")
    line_index = Column(Integer, nullable=False, default=0)
    position_in_line = Column(Integer, nullable=False, default=0)
