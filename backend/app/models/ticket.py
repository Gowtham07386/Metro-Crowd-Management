import datetime
from sqlalchemy import Column, String, Integer, DateTime, Float
from app.database.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    city_id = Column(String, nullable=False, index=True)
    origin_station = Column(String, nullable=False)
    destination_station = Column(String, nullable=False)
    ticket_type = Column(String, default="Single Journey")
    passenger_count = Column(Integer, default=1)
    fare = Column(Float, nullable=False)
    qr_code = Column(String, nullable=False)
    status = Column(String, default="Active")
    booking_time = Column(DateTime, default=datetime.datetime.utcnow)
