import sys
from pathlib import Path

# Add backend directory to python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.database.database import engine, Base, SessionLocal
from app.models import User, City, Station, Train, Ticket
from app.services.seed import seed_database

print("Connecting to PostgreSQL database...")
Base.metadata.create_all(bind=engine)
print("Database schema created/verified.")

db = SessionLocal()
print("Seeding database...")
seed_database(db)
print("Database seeded successfully.")

print("--- Database Record Counts ---")
print('Users count:', db.query(User).count())
print('Cities count:', db.query(City).count())
print('Stations count:', db.query(Station).count())
print('Trains count:', db.query(Train).count())
print('Tickets count:', db.query(Ticket).count())

print("\n--- Available User Accounts ---")
users = db.query(User).all()
for u in users:
    print(f"Role: {u.role} | Email: {u.email} | Password: {u.password} | Name: {u.name}")

db.close()
