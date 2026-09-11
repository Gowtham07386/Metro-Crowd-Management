from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import Train

router = APIRouter(prefix="/trains", tags=["Trains"])

@router.get("")
def get_trains(city_id: str, db: Session = Depends(get_db)):
    trains = db.query(Train).filter(Train.city_id == city_id).all()
    return [
        {
            "id": t.id,
            "line": t.line,
            "lineColor": t.line_color,
            "status": t.status,
            "currentStation": t.current_station,
            "nextStation": t.next_station,
            "load": t.load,
            "capacity": t.capacity,
            "delayMin": t.delay_min,
            "platform": t.platform,
            "frequencyMin": t.frequency_min
        } for t in trains
    ]

@router.put("/{train_id}")
def update_train(train_id: str, status: str = None, load: int = None, delay_min: int = None, db: Session = Depends(get_db)):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found.")

    if status is not None:
        train.status = status
    if load is not None:
        train.load = load
    if delay_min is not None:
        train.delay_min = delay_min

    db.commit()
    return {"message": "Train updated successfully."}
