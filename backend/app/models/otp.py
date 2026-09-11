import datetime
from sqlalchemy import Column, String, DateTime
from app.database.database import Base

class OtpRecord(Base):
    __tablename__ = "otp_records"

    id = Column(String, primary_key=True, index=True)
    phone = Column(String, nullable=False, index=True)
    code = Column(String, nullable=False)
    employee_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
