import csv
import random
import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from app.models import User, City, Station, Train, CrowdAlert, AiPrediction, AnalyticsData, Ticket

LINE_COLOR_MAP = {
    "Red": "#f04438",
    "Red Line": "#f04438",
    "Blue": "#2f5df0",
    "Blue Line": "#2f5df0",
    "Blue Line Branch": "#2563eb",
    "Blue Vaishali Branch": "#2563eb",
    "Green": "#17b26a",
    "Green Line": "#17b26a",
    "Green Kirti Nagar Branch": "#059669",
    "Purple": "#7c5cff",
    "Yellow": "#f7c948",
    "Yellow Line": "#f7c948",
    "Pink": "#f472b6",
    "Pink Line": "#f472b6",
    "Violet": "#a855f7",
    "Violet Line": "#a855f7",
    "Magenta": "#ec4899",
    "Magenta Line": "#ec4899",
    "Orange": "#f98407",
    "Aqua": "#06b6d4",
    "Grey": "#64748b",
    "Grey Line": "#64748b",
    "Dark Red": "#991b1b",
    "Light Blue": "#38bdf8",
    "Line 1": "#2f5df0",
    "Line 2": "#17b26a",
    "Line 2A": "#f7c948",
    "Line 3": "#7c5cff",
    "Line 4": "#f04438",
    "Line 5": "#f472b6",
    "Line 6": "#f98407",
    "Line 7": "#f04438",
    "Airport Express": "#f98407",
    "Rapid Metro": "#3b82f6",
    "Western Metro Line": "#f98407",
    "Central Metro Line": "#7c5cff",
    "Harbour Metro Line": "#17b26a",
    "Thane Metro Line": "#ea580c",
    "Red Dotted Corridor": "#ef4444",
    "Light Blue Corridor": "#38bdf8",
    "N-S Corridor (Elevated)": "#2f5df0",
    "N-S Corridor (Underground)": "#f04438",
    "E-W Corridor": "#991b1b",
    "Kochi Metro": "#f04438",
    "Operational": "#f04438",
    "Under Construction": "#b91c1c",
    "Proposed Metro - Under Construction": "#b91c1c",
    "Proposed": "#2f5df0",
    "Proposed Metro": "#eab308",
    "Proposed Metro Extension": "#f97316",
    "Proposed Metro - Extension": "#f59e0b",
    "Proposed Metro - Extension 2": "#06b6d4",
    "Proposed Metro - Extension 3": "#6366f1",
}

CITY_META = {
    "delhi": {"name": "Delhi Metro", "state": "Delhi", "dailyPassengers": 6500000, "totalTrains": 310},
    "hyderabad": {"name": "Hyderabad Metro", "state": "Telangana", "dailyPassengers": 480000, "totalTrains": 57},
    "bengaluru": {"name": "Bengaluru Metro", "state": "Karnataka", "dailyPassengers": 820000, "totalTrains": 55},
    "mumbai": {"name": "Mumbai Metro", "state": "Maharashtra", "dailyPassengers": 1250000, "totalTrains": 57},
    "chennai": {"name": "Chennai Metro", "state": "Tamil Nadu", "dailyPassengers": 510000, "totalTrains": 52},
    "kolkata": {"name": "Kolkata Metro", "state": "West Bengal", "dailyPassengers": 690000, "totalTrains": 366},
    "lucknow": {"name": "Lucknow Metro", "state": "Uttar Pradesh", "dailyPassengers": 120000, "totalTrains": 20},
    "jaipur": {"name": "Jaipur Metro", "state": "Rajasthan", "dailyPassengers": 60000, "totalTrains": 10},
    "kochi": {"name": "Kochi Metro", "state": "Kerala", "dailyPassengers": 110000, "totalTrains": 25},
    "pune": {"name": "Pune Metro", "state": "Maharashtra", "dailyPassengers": 230000, "totalTrains": 34},
}

def get_line_color(line_name: str) -> str:
    if not line_name:
        return "#2f5df0"
    if line_name in LINE_COLOR_MAP:
        return LINE_COLOR_MAP[line_name]
    lower = line_name.lower()
    if "yellow" in lower:
        return "#f7c948"
    if "blue" in lower:
        return "#38bdf8" if "light" in lower else "#2f5df0"
    if "green" in lower:
        return "#17b26a"
    if "purple" in lower:
        return "#7c5cff"
    if "pink" in lower:
        return "#f472b6"
    if "violet" in lower:
        return "#a855f7"
    if "magenta" in lower:
        return "#ec4899"
    if "orange" in lower:
        return "#f98407"
    if "aqua" in lower:
        return "#06b6d4"
    if "grey" in lower or "gray" in lower:
        return "#64748b"
    return "#2f5df0"


def occupancy_to_status(occupancy: int):
    if occupancy >= 85:
        return {"key": "severe", "label": "Severe Overcrowding", "color": "#f04438"}
    elif occupancy >= 65:
        return {"key": "crowded", "label": "Heavy Crowd", "color": "#f98407"}
    elif occupancy >= 40:
        return {"key": "moderate", "label": "Moderate", "color": "#f7c948"}
    else:
        return {"key": "low", "label": "Normal Flow", "color": "#17b26a"}

def load_station_master():
    project_root = Path(__file__).resolve().parents[3]
    csv_path = project_root / "datasets" / "06_station_master.csv"
    
    if not csv_path.exists():
        # Fallback path check
        csv_path = Path("datasets/06_station_master.csv")
    
    stations_by_city = {}
    lines_by_city = {}

    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            city_raw = row["city"].strip()
            city_id = city_raw.lower()
            if city_id not in stations_by_city:
                stations_by_city[city_id] = []
                lines_by_city[city_id] = {}
            
            stations_by_city[city_id].append(row)
            
            line_name = row["line_name"].strip()
            if line_name not in lines_by_city[city_id]:
                lines_by_city[city_id][line_name] = get_line_color(line_name)

    return stations_by_city, lines_by_city

def seed_database(db: Session):
    # 1. Seed Default User Accounts (Passengers and Admins)
    default_users = [
        {
            "id": "USR-DEMO",
            "name": "Demo User",
            "email": "demo@metroflow.app",
            "password": "MetroFlow@123",
            "phone": "+91 90000 00000",
            "role": "Passenger",
            "status": "Active"
        },
        {
            "id": "USR-PASSENGER",
            "name": "Rahul Sharma",
            "email": "passenger@metroflow.app",
            "password": "Passenger@123",
            "phone": "+91 98765 43210",
            "role": "Passenger",
            "status": "Active"
        },
        {
            "id": "USR-ADMIN",
            "name": "System Administrator",
            "email": "admin@metroflow.app",
            "password": "Admin@123",
            "phone": "+91 99999 11111",
            "role": "Administrator",
            "status": "Active"
        },
        {
            "id": "USR-OPERATOR",
            "name": "Station Manager (Kashmere Gate)",
            "email": "operator@metroflow.app",
            "password": "Operator@123",
            "phone": "+91 98888 22222",
            "role": "Operator",
            "status": "Active"
        }
    ]

    for u_data in default_users:
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing:
            user_obj = User(
                id=u_data["id"],
                name=u_data["name"],
                email=u_data["email"],
                password=u_data["password"],
                phone=u_data["phone"],
                role=u_data["role"],
                status=u_data["status"],
                date_joined=datetime.datetime.utcnow()
            )
            db.add(user_obj)
    db.commit()

    # 2. Parse Station Master CSV
    stations_by_city, lines_by_city = load_station_master()

    # 3. Seed Each City and its Real Metro Data
    for city_id, station_rows in stations_by_city.items():
        meta = CITY_META.get(city_id, {
            "name": f"{city_id.capitalize()} Metro",
            "state": "India",
            "dailyPassengers": 500000
        })

        lines_list = [{"name": name, "color": color} for name, color in lines_by_city[city_id].items()]
        
        # Check or update city record
        existing_city = db.query(City).filter(City.id == city_id).first()
        if not existing_city:
            city_obj = City(
                id=city_id,
                name=meta["name"],
                state=meta["state"],
                stations_count=len(station_rows),
                lines_count=len(lines_list),
                daily_passengers=meta["dailyPassengers"],
                lines=lines_list
            )
            db.add(city_obj)
            db.commit()
        else:
            existing_city.stations_count = len(station_rows)
            existing_city.lines_count = len(lines_list)
            existing_city.lines = lines_list
            db.commit()

        # Seed/Update Stations for city from station_master.csv
        random.seed(city_id)
        created_stations = []

        for idx, row in enumerate(station_rows):
            st_id = row["station_id"].strip()
            st_name = row["station_name"].strip()
            line_name = row["line_name"].strip()
            line_color = get_line_color(line_name)
            
            existing_st = db.query(Station).filter(Station.id == st_id).first()
            
            occupancy = random.randint(20, 92)
            status_info = occupancy_to_status(occupancy)
            current_crowd = int((occupancy / 100) * 1800)
            waiting_time = round(max(1, random.randint(2, 10)), 1)
            
            if not existing_st:
                station = Station(
                    id=st_id,
                    city_id=city_id,
                    name=st_name,
                    line=line_name,
                    line_color=line_color,
                    occupancy=occupancy,
                    current_crowd=current_crowd,
                    waiting_time=waiting_time,
                    status=status_info["key"],
                    status_label=status_info["label"],
                    status_color=status_info["color"],
                    peak_hours="08:00 – 10:00" if idx % 2 == 0 else "17:30 – 19:30",
                    line_index=0,
                    position_in_line=idx
                )
                db.add(station)
                created_stations.append(station)
            else:
                existing_st.name = st_name
                existing_st.line = line_name
                existing_st.line_color = line_color
                created_stations.append(existing_st)

        db.commit()

        # Delete any synthetic stations for this city that aren't in station_master
        master_ids = {r["station_id"].strip() for r in station_rows}
        db.query(Station).filter(Station.city_id == city_id, ~Station.id.in_(master_ids)).delete(synchronize_session=False)
        db.commit()

        # Seed Trains matching totalTrains meta
        total_trains_target = meta.get("totalTrains", 30)
        existing_trains = db.query(Train).filter(Train.city_id == city_id).count()
        if existing_trains < total_trains_target:
            db.query(Train).filter(Train.city_id == city_id).delete(synchronize_session=False)
            db.commit()
            for t_idx in range(total_trains_target):
                line = lines_list[t_idx % len(lines_list)]
                line_stations = [s for s in created_stations if s.line == line["name"]]
                curr_st = line_stations[t_idx % len(line_stations)].name if line_stations else "Terminal"
                next_st = line_stations[(t_idx + 1) % len(line_stations)].name if line_stations else "Terminal"
                status_val = "Running" if t_idx % 7 != 0 else ("Delayed" if t_idx % 14 == 0 else "Maintenance")
                train = Train(
                    id=f"{city_id.upper()}-TRN-{t_idx + 1:03d}",
                    city_id=city_id,
                    line=line["name"],
                    line_color=line["color"],
                    status=status_val,
                    current_station=curr_st,
                    next_station=next_st,
                    load=0 if status_val == "Maintenance" else random.randint(400, 1600),
                    capacity=1800,
                    delay_min=random.randint(3, 10) if status_val == "Delayed" else 0,
                    platform=f"P{(t_idx % 2) + 1}",
                    frequency_min=random.randint(4, 7)
                )
                db.add(train)
            db.commit()

        # Seed Hourly, Weekly, Monthly Analytics
        existing_analytics = db.query(AnalyticsData).filter(AnalyticsData.city_id == city_id).first()
        if not existing_analytics:
            hourly_flow = []
            hours = ['05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00']
            daily_p = meta["dailyPassengers"]
            for h in hours:
                base = int(daily_p / 18)
                entries = int(base * (0.8 + random.random() * 0.4))
                exits = int(base * (0.7 + random.random() * 0.5))
                hourly_flow.append({"hour": h, "entries": entries, "exits": exits})

            weekly = [{"day": day, "riders": int(daily_p * (0.75 if i>=5 else 1.0) * (0.9 + random.random()*0.2))} for i, day in enumerate(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])]
            monthly = [{"month": m, "riders": round((daily_p * 28 * (0.9 + random.random()*0.2)) / 1_000_000, 1)} for m in ['Feb','Mar','Apr','May','Jun','Jul']]

            analytics = AnalyticsData(
                id=f"{city_id}-analytics",
                city_id=city_id,
                hourly_flow=hourly_flow,
                weekly=weekly,
                monthly=monthly
            )
            db.add(analytics)

        # Seed AI Predictions
        existing_ai = db.query(AiPrediction).filter(AiPrediction.city_id == city_id).first()
        if not existing_ai:
            top_station = sorted(created_stations, key=lambda s: s.occupancy, reverse=True)[0] if created_stations else None
            peak_name = top_station.name if top_station else "Central Station"
            hourly = existing_analytics.hourly_flow if existing_analytics else []
            future_crowd = [{"hour": h["hour"], "predicted": int(h["entries"] * 1.1)} for h in hourly]
            
            ai_pred = AiPrediction(
                id=f"{city_id}-ai",
                city_id=city_id,
                peak_station=peak_name,
                future_crowd=future_crowd,
                suggested_frequency="4 min",
                confidence=88,
                congestion_trend="rising"
            )
            db.add(ai_pred)

        db.commit()

        # Seed sample ticket
        existing_ticket = db.query(Ticket).filter(Ticket.user_id == "USR-DEMO").first()
        if not existing_ticket and created_stations and len(created_stations) >= 2:
            st1, st2 = created_stations[0].name, created_stations[1].name
            t = Ticket(
                id=f"TCK-{city_id.upper()}-001",
                user_id="USR-DEMO",
                city_id=city_id,
                origin_station=st1,
                destination_station=st2,
                ticket_type="Single Journey",
                passenger_count=1,
                fare=40.0,
                qr_code=f"QR-{city_id.upper()}-DEMO-001",
                status="Active",
                booking_time=datetime.datetime.utcnow()
            )
            db.add(t)
            db.commit()

        # Refresh/Seed Crowd Alerts for city
        refresh_city_alerts(city_id, db)

def refresh_city_alerts(city_id: str, db: Session):
    stations = db.query(Station).filter(Station.city_id == city_id).all()
    high_crowd_stations = [s for s in stations if s.occupancy >= 65]
    high_crowd_stations.sort(key=lambda s: s.occupancy, reverse=True)

    # Clean existing auto alerts for city
    db.query(CrowdAlert).filter(
        CrowdAlert.city_id == city_id,
        CrowdAlert.id.like(f"{city_id}-auto-alert-%")
    ).delete(synchronize_session=False)

    for i, s in enumerate(high_crowd_stations[:6]):
        severity = "critical" if s.occupancy >= 85 else "warning"
        title = f"{'Peak Overcrowding' if s.occupancy >= 85 else 'High Demand Alert'} — {s.name}"
        msg = f"{s.name} is currently at {s.occupancy}% crowd capacity on the {s.line} with an estimated wait time of {s.waiting_time} mins."
        alert = CrowdAlert(
            id=f"{city_id}-auto-alert-{i+1}",
            city_id=city_id,
            station_name=s.name,
            severity=severity,
            title=title,
            message=msg,
            time=datetime.datetime.utcnow() - datetime.timedelta(minutes=i*5),
            read=False,
            phone_alert_sent=True
        )
        db.add(alert)
    db.commit()

def update_live_occupancies_and_alerts(db: Session):
    """
    Executes every 5 minutes to simulate real-time crowd fluctuations (+/- 2% to 5%)
    and update current_crowd, waiting_time, status, and alerts in the DB.
    """
    stations = db.query(Station).all()
    city_ids = set()
    for s in stations:
        city_ids.add(s.city_id)
        delta = random.choice([-5, -4, -3, -2, 2, 3, 4, 5])
        new_occ = max(15, min(98, s.occupancy + delta))
        s.occupancy = new_occ
        s.current_crowd = int((new_occ / 100.0) * 1800)
        s.waiting_time = round(max(1.0, (new_occ / 100.0) * 8.5), 1)
        st_info = occupancy_to_status(new_occ)
        s.status = st_info["key"]
        s.status_label = st_info["label"]
        s.status_color = st_info["color"]

    db.commit()

    for cid in city_ids:
        refresh_city_alerts(cid, db)

