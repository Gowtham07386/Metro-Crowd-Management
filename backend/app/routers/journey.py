import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import Station
from app.schemas.schemas import JourneyPlanRequest

router = APIRouter(prefix="/journey", tags=["Journey Planner"])

@router.post("/plan")
def plan_journey(payload: JourneyPlanRequest, db: Session = Depends(get_db)):
    origin = db.query(Station).filter(Station.id == payload.originStationId).first()
    dest = db.query(Station).filter(Station.id == payload.destinationStationId).first()

    if not origin or not dest:
        raise HTTPException(status_code=400, detail="Invalid origin or destination station.")

    # Calculate distance and estimated travel time
    stations_in_city = db.query(Station).filter(Station.city_id == payload.cityId).all()

    pos1 = origin.position_in_line
    pos2 = dest.position_in_line
    stops_count = max(1, abs(pos1 - pos2) + 2)

    distance = round(stops_count * 2.4, 1)
    estimated_mins = stops_count * 3 + 4
    total_fare = min(60, max(10, stops_count * 8))

    # Route steps
    steps = [
        {
            "stationName": origin.name,
            "line": origin.line,
            "lineColor": origin.line_color,
            "crowdStatus": origin.status_label,
            "interchange": False
        }
    ]

    # Add intermediate stations
    middle_stations = [s for s in stations_in_city if s.id not in (origin.id, dest.id)]
    random.seed(f"{origin.id}-{dest.id}")
    sample_mids = random.sample(middle_stations, min(len(middle_stations), stops_count - 1))

    for idx, mid in enumerate(sample_mids):
        is_interchange = (idx == len(sample_mids) // 2) if len(sample_mids) > 2 else False
        steps.append({
            "stationName": mid.name,
            "line": mid.line,
            "lineColor": mid.line_color,
            "crowdStatus": mid.status_label,
            "interchange": is_interchange
        })

    steps.append({
        "stationName": dest.name,
        "line": dest.line,
        "lineColor": dest.line_color,
        "crowdStatus": dest.status_label,
        "interchange": False
    })

    crowd_level = dest.status_label
    optimal_time = "Post-Peak (After 10:30 AM)" if dest.occupancy > 70 else "Optimal Now"

    return {
        "origin": origin.name,
        "destination": dest.name,
        "distanceKm": distance,
        "estimatedMins": estimated_mins,
        "totalFare": total_fare,
        "crowdLevel": crowd_level,
        "optimalTime": optimal_time,
        "steps": steps
    }

from app.models.ticket import Ticket
from app.schemas.schemas import BookTicketRequest
import datetime

@router.post("/book-ticket")
def book_ticket(payload: BookTicketRequest, db: Session = Depends(get_db)):
    ticket_id = f"TCK-{int(datetime.datetime.utcnow().timestamp())}-{random.randint(1000, 9999)}"
    qr_data = f"METROFLOW:{payload.cityId}:{payload.originStation}:{payload.destinationStation}:{ticket_id}"

    ticket = Ticket(
        id=ticket_id,
        user_id=payload.userId,
        city_id=payload.cityId,
        origin_station=payload.originStation,
        destination_station=payload.destinationStation,
        ticket_type=payload.ticketType or "Single Journey",
        passenger_count=payload.passengerCount or 1,
        fare=payload.fare,
        qr_code=qr_data,
        status="Active",
        booking_time=datetime.datetime.utcnow()
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return {
        "message": "Ticket booked successfully and stored in PostgreSQL database.",
        "ticket": {
            "id": ticket.id,
            "cityId": ticket.city_id,
            "originStation": ticket.origin_station,
            "destinationStation": ticket.destination_station,
            "ticketType": ticket.ticket_type,
            "passengerCount": ticket.passenger_count,
            "fare": ticket.fare,
            "qrCode": ticket.qr_code,
            "status": ticket.status,
            "bookingTime": ticket.booking_time.isoformat()
        }
    }

@router.get("/tickets")
def get_user_tickets(userId: str = None, cityId: str = None, db: Session = Depends(get_db)):
    query = db.query(Ticket)
    if userId:
        query = query.filter(Ticket.user_id == userId)
    if cityId:
        query = query.filter(Ticket.city_id == cityId)
    
    tickets = query.order_by(Ticket.booking_time.desc()).all()
    return [
        {
            "id": t.id,
            "cityId": t.city_id,
            "originStation": t.origin_station,
            "destinationStation": t.destination_station,
            "ticketType": t.ticket_type,
            "passengerCount": t.passenger_count,
            "fare": t.fare,
            "qrCode": t.qr_code,
            "status": t.status,
            "bookingTime": t.booking_time.isoformat() if t.booking_time else None
        } for t in tickets
    ]
