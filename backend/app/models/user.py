import datetime
from sqlalchemy import Column, String, DateTime, Text
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default="Passenger")  # Passenger, Operator, Administrator
    status = Column(String, default="Active")     # Active, Suspended
    profile_image = Column(Text, nullable=True)
    date_joined = Column(DateTime, default=datetime.datetime.utcnow)
