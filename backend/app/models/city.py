from sqlalchemy import Column, String, Integer, BigInteger, JSON
from app.database.database import Base

class City(Base):
    __tablename__ = "cities"

    id = Column(String, primary_key=True, index=True)  # e.g., 'delhi', 'hyderabad'
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    stations_count = Column(Integer, nullable=False)
    lines_count = Column(Integer, nullable=False)
    daily_passengers = Column(BigInteger, nullable=False)
    lines = Column(JSON, nullable=False)  # [{name: 'Blue Line', color: '#2f5df0'}, ...]
