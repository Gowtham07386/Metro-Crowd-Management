from sqlalchemy import Column, String, Integer, ForeignKey
from app.database.database import Base

class Train(Base):
    __tablename__ = "trains"

    id = Column(String, primary_key=True, index=True)
    city_id = Column(String, ForeignKey("cities.id"), index=True, nullable=False)
    line = Column(String, nullable=False)
    line_color = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Running")  # Running, Delayed, Maintenance
    current_station = Column(String, nullable=False)
    next_station = Column(String, nullable=False)
    load = Column(Integer, nullable=False, default=800)
    capacity = Column(Integer, nullable=False, default=1800)
    delay_min = Column(Integer, nullable=False, default=0)
    platform = Column(String, nullable=False, default="P1")
    frequency_min = Column(Integer, nullable=False, default=5)
