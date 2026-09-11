from pathlib import Path
import sys
import json
import logging
import traceback

import pandas as pd
from catboost import CatBoostRegressor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ============================================================
# PATHS & SYS.PATH SETUP
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Database & Router imports
try:
    from app.config.config import settings
    from app.database.database import engine, Base, SessionLocal
    from app.services.seed import seed_database
    from app.routers import auth, cities, stations as db_stations, trains, alerts, journey, ai as db_ai, admin, emergency
    HAS_DB = True
except Exception as db_init_err:
    print(f"Database import warning: {db_init_err}")
    HAS_DB = False

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "crowd_occupancy_final.cbm"
)

FEATURE_FILE = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "crowd_final_features.json"
)

DATASET_PATH = (
    PROJECT_ROOT
    / "datasets"
    / "01_crowd_occupancy_forecasting.csv"
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="MetroFlow AI Unified API",
    description="MetroFlow AI Crowd Prediction Backend & PostgreSQL Management System",
    version="1.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE STARTUP & ROUTERS
# ============================================================

@app.on_event("startup")
def startup_db_event():
    if HAS_DB:
        try:
            print("Initializing PostgreSQL database schema...")
            Base.metadata.create_all(bind=engine)
            print("Database tables verified/created successfully.")
            db = SessionLocal()
            try:
                print("Running initial seed for Metro Flow cities and demo data...")
                seed_database(db)
                print("Database seeding completed.")
            finally:
                db.close()
        except Exception as e:
            print(f"Error during startup database setup: {e}")

if HAS_DB:
    api_prefix = getattr(settings, "API_V1_STR", "/api")
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(cities.router, prefix=api_prefix)
    app.include_router(db_stations.router, prefix=api_prefix)
    app.include_router(trains.router, prefix=api_prefix)
    app.include_router(alerts.router, prefix=api_prefix)
    app.include_router(journey.router, prefix=api_prefix)
    app.include_router(db_ai.router, prefix=api_prefix)
    app.include_router(admin.router, prefix=api_prefix)
    app.include_router(emergency.router, prefix=api_prefix)



# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 60)
print("LOADING METROFLOW AI BACKEND")
print("=" * 60)

print("Model path:")
print(MODEL_PATH)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

model = CatBoostRegressor()

model.load_model(MODEL_PATH)

print("Crowd model loaded successfully!")


# ============================================================
# LOAD FEATURE LIST
# ============================================================

if not FEATURE_FILE.exists():
    raise FileNotFoundError(
        f"Feature file not found: {FEATURE_FILE}"
    )

with open(FEATURE_FILE, "r") as file:
    feature_data = json.load(file)


# Support either a plain list or a dictionary
if isinstance(feature_data, list):

    FEATURE_COLUMNS = feature_data

elif isinstance(feature_data, dict):

    if "features" in feature_data:
        FEATURE_COLUMNS = feature_data["features"]

    elif "feature_columns" in feature_data:
        FEATURE_COLUMNS = feature_data["feature_columns"]

    else:
        raise ValueError(
            "Could not find feature list in crowd_final_features.json"
        )

else:

    raise ValueError(
        "Invalid crowd_final_features.json format"
    )


print(
    "Expected model features:",
    len(FEATURE_COLUMNS)
)


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading MetroFlow dataset...")

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found: {DATASET_PATH}"
    )

df = pd.read_csv(
    DATASET_PATH,
    low_memory=False
)

print(
    "Dataset loaded successfully:",
    df.shape
)


# ============================================================
# CLEAN STATION IDS
# ============================================================

if "station_id" not in df.columns:
    raise ValueError(
        "Dataset does not contain station_id"
    )

df["station_id"] = (
    df["station_id"]
    .astype(str)
    .str.strip()
)


# ============================================================
# TIMESTAMP
# ============================================================

if "timestamp" in df.columns:

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )


# ============================================================
# MODEL CATEGORICAL FEATURES
# ============================================================

# Get categorical feature indexes directly
# from the trained CatBoost model.

cat_feature_indexes = (
    model.get_cat_feature_indices()
)

categorical_features = []

for index in cat_feature_indexes:

    if index < len(FEATURE_COLUMNS):

        categorical_features.append(
            FEATURE_COLUMNS[index]
        )


print(
    "Categorical features:",
    len(categorical_features)
)

print(
    "Categorical feature names:"
)

for column in categorical_features:
    print("-", column)


# ============================================================
# REQUEST MODEL
# ============================================================

class PredictionRequest(BaseModel):

    station_id: str


# ============================================================
# PREPARE MODEL INPUT
# ============================================================

def prepare_model_input(row):

    """
    Convert one dataset row into the exact
    62-feature format expected by CatBoost.
    """

    # Convert row into DataFrame
    input_df = pd.DataFrame(
        [row.to_dict()]
    )

    # --------------------------------------------------------
    # ADD MISSING FEATURES
    # --------------------------------------------------------

    for column in FEATURE_COLUMNS:

        if column not in input_df.columns:

            input_df[column] = 0

    # --------------------------------------------------------
    # EXACT FEATURE ORDER
    # --------------------------------------------------------

    input_df = input_df[
        FEATURE_COLUMNS
    ].copy()

    # --------------------------------------------------------
    # CATEGORICAL FEATURES
    # --------------------------------------------------------

    for column in categorical_features:

        input_df[column] = (
            input_df[column]
            .fillna("Unknown")
            .astype(str)
        )

    # --------------------------------------------------------
    # NUMERICAL FEATURES
    # --------------------------------------------------------

    for column in FEATURE_COLUMNS:

        if column not in categorical_features:

            input_df[column] = pd.to_numeric(
                input_df[column],
                errors="coerce"
            )

            input_df[column] = (
                input_df[column]
                .fillna(0)
            )

    return input_df


# ============================================================
# PREDICT FROM DATASET ROW
# ============================================================

def predict_from_row(row):

    input_df = prepare_model_input(
        row
    )

    print(
        "Prediction input shape:",
        input_df.shape
    )

    print(
        "Prediction input columns:",
        len(input_df.columns)
    )

    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    prediction = model.predict(
        input_df
    )[0]

    prediction = float(
        prediction
    )

    # --------------------------------------------------------
    # KEEP BETWEEN 0 AND 100
    # --------------------------------------------------------

    prediction = max(
        0.0,
        min(
            100.0,
            prediction
        )
    )

    return prediction


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "MetroFlow AI API is running",
        "model": "CatBoost Crowd Occupancy",
        "features": len(FEATURE_COLUMNS),
        "dataset_rows": len(df),
        "stations": int(
            df["station_id"].nunique()
        )
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True,
        "dataset_loaded": True,
        "model_features": len(FEATURE_COLUMNS),
        "dataset_rows": len(df),
        "stations": int(
            df["station_id"].nunique()
        )
    }


# ============================================================
# GET STATIONS
# ============================================================

@app.get("/stations")
def get_stations(city: str | None = None):
    try:
        print("\n" + "=" * 60)
        print("GET STATIONS")
        print("=" * 60)

        filtered_df = df.copy()

        if city:
            city_name = city.strip()
            print("Requested city:", city_name)

            filtered_df = filtered_df[
                filtered_df["city"].astype(str).str.strip().str.lower()
                == city_name.lower()
            ]
        else:
            print("No city supplied - returning all stations.")

        if filtered_df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No stations found for city '{city}'."
            )

        if "timestamp" in filtered_df.columns:
            latest_records = (
                filtered_df.sort_values("timestamp")
                .groupby("station_id", as_index=False)
                .tail(1)
            )
        else:
            latest_records = (
                filtered_df.groupby("station_id", as_index=False).tail(1)
            )

        stations = []

        for _, row in latest_records.iterrows():
            station_id = str(row.get("station_id", "")).strip()

            try:
                prediction = predict_from_row(row)
            except Exception as prediction_error:
                print("Prediction failed for station:", station_id)
                print(str(prediction_error))
                prediction = 0.0

            prediction = max(0.0, min(100.0, float(prediction)))

            if prediction < 40:
                status, status_label, density = "smooth", "Smooth", "Low"
            elif prediction < 70:
                status, status_label, density = "moderate", "Moderate", "Medium"
            else:
                status, status_label, density = "busy", "Busy", "High"

            entry_count = pd.to_numeric(row.get("entry_count", 0), errors="coerce")
            exit_count = pd.to_numeric(row.get("exit_count", 0), errors="coerce")
            queue_length = pd.to_numeric(row.get("queue_length_at_gate", 0), errors="coerce")
            max_safe = pd.to_numeric(row.get("max_safe_occupancy", 0), errors="coerce")
            train_frequency = pd.to_numeric(row.get("current_train_frequency", 0), errors="coerce")

            entry_count = 0 if pd.isna(entry_count) else int(entry_count)
            exit_count = 0 if pd.isna(exit_count) else int(exit_count)
            queue_length = 0 if pd.isna(queue_length) else float(queue_length)
            max_safe = 0 if pd.isna(max_safe) else float(max_safe)
            train_frequency = 0 if pd.isna(train_frequency) else float(train_frequency)

            current_crowd = max(0, entry_count - exit_count)
            waiting_time = round(max(1, queue_length / 25), 1)

            timestamp = row.get("timestamp", None)
            if pd.isna(timestamp):
                timestamp = None
            elif timestamp is not None:
                timestamp = str(timestamp)

            stations.append({
                "id": station_id,
                "name": str(row.get("station_name", "Unknown Station")),
                "city": str(row.get("city", "Unknown")),
                "line": str(row.get("line_name", "")),
                "metroLineId": str(row.get("metro_line_id", "")),
                "occupancy": round(prediction, 2),
                "currentCrowd": current_crowd,
                "waitingTime": waiting_time,
                "status": status,
                "statusLabel": status_label,
                "timestamp": timestamp,
                "maxSafeOccupancy": max_safe,
                "crowdDensityLevel": density,
                "currentTrainFrequency": train_frequency
            })

        print("Returning stations:", len(stations))

        return {
            "stations": stations,
            "total_stations": len(stations),
            "city": city
        }

    except HTTPException:
        raise
    except Exception as e:
        print("STATIONS ERROR:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# SCHEDULING RECOMMENDATION
# ============================================================

def build_scheduling_recommendation(
    prediction,
    status_label,
    line_name,
):
    if prediction >= 70:
        current_trains = 7
        recommended_trains = 10

        return {
            "action": "Increase frequency",
            "line": str(line_name or ""),
            "current_trains_per_10_min": current_trains,
            "recommended_trains_per_10_min": recommended_trains,
            "predicted_crowd_percent": round(
                prediction,
                2,
            ),
            "reason": (
                f"Crowd is high ({prediction:.2f}% predicted occupancy). "
                f"It is better to increase train frequency from "
                f"{current_trains} trains per 10 minutes to "
                f"{recommended_trains} trains per 10 minutes to reduce "
                f"platform congestion and waiting time."
            ),
            "message": (
                f"Crowd is high. Increase train frequency from "
                f"{current_trains} trains per 10 minutes to "
                f"{recommended_trains} trains per 10 minutes."
            ),
        }

    return None


# ============================================================
# MAIN PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
def predict_crowd(
    request: PredictionRequest
):

    try:

        station_id = (
            request.station_id
            .strip()
        )

        print("\n" + "=" * 60)
        print("PREDICTION REQUEST")
        print("=" * 60)

        print(
            "Requested station:",
            station_id
        )

        # ----------------------------------------------------
        # FIND STATION
        # ----------------------------------------------------

        station_data = df[
            df["station_id"]
            .astype(str)
            .str.strip()
            == station_id
        ]

        print(
            "Matching rows:",
            len(station_data)
        )

        if station_data.empty:

            raise HTTPException(
                status_code=404,
                detail=(
                    f"Station '{station_id}' "
                    "not found."
                )
            )

        # ----------------------------------------------------
        # LATEST RECORD
        # ----------------------------------------------------

        if "timestamp" in station_data.columns:

            station_data = (
                station_data
                .sort_values("timestamp")
            )

        row = station_data.iloc[-1]

        print(
            "Station found:",
            row.get(
                "station_id",
                ""
            )
        )

        print(
            "Station name:",
            row.get(
                "station_name",
                ""
            )
        )

        # ----------------------------------------------------
        # PREDICTION
        # ----------------------------------------------------

        prediction = predict_from_row(
            row
        )

        print(
            "Prediction:",
            prediction
        )

        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        if prediction < 40:

            status = "LOW"
            status_label = "Low"

        elif prediction < 70:

            status = "MODERATE"
            status_label = "Moderate"

        else:

            status = "HIGH"
            status_label = "High"

        # ----------------------------------------------------
        # SAFE OCCUPANCY
        # ----------------------------------------------------

        max_safe = pd.to_numeric(
            row.get(
                "max_safe_occupancy",
                0
            ),
            errors="coerce"
        )

        if pd.isna(max_safe):
            max_safe = 0

        max_safe = float(
            max_safe
        )

        # ----------------------------------------------------
        # PREDICTED PEOPLE
        # ----------------------------------------------------

        predicted_people = int(
            round(
                max_safe
                * prediction
                / 100
            )
        )

        # ----------------------------------------------------
        # ENTRY / EXIT
        # ----------------------------------------------------

        entry_count = pd.to_numeric(
            row.get(
                "entry_count",
                0
            ),
            errors="coerce"
        )

        exit_count = pd.to_numeric(
            row.get(
                "exit_count",
                0
            ),
            errors="coerce"
        )

        if pd.isna(entry_count):
            entry_count = 0

        if pd.isna(exit_count):
            exit_count = 0

        entry_count = int(
            entry_count
        )

        exit_count = int(
            exit_count
        )

        # ----------------------------------------------------
        # WAITING TIME
        # ----------------------------------------------------

        queue_length = pd.to_numeric(
            row.get(
                "queue_length_at_gate",
                0
            ),
            errors="coerce"
        )

        if pd.isna(queue_length):
            queue_length = 0

        waiting_time = round(
            max(
                1,
                float(queue_length) / 25
            ),
            1
        )

        # ----------------------------------------------------
        # TRAIN FREQUENCY
        # ----------------------------------------------------

        train_frequency = pd.to_numeric(
            row.get(
                "current_train_frequency",
                0
            ),
            errors="coerce"
        )

        if pd.isna(train_frequency):
            train_frequency = 0

        train_frequency = float(
            train_frequency
        )

        line_name = str(
            row.get(
                "line_name",
                "",
            )
        )

        scheduling = build_scheduling_recommendation(
            prediction,
            status_label,
            line_name,
        )

        default_recommendation = (
            f"Predicted occupancy for "
            f"the next 30 minutes is "
            f"{prediction:.2f}%. "
            f"Crowd level is "
            f"{status_label}."
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {

            "station_id":
                station_id,

            "station_name": str(
                row.get(
                    "station_name",
                    "Unknown Station"
                )
            ),

            "city": str(
                row.get(
                    "city",
                    "Unknown"
                )
            ),

            "line": str(
                row.get(
                    "line_name",
                    ""
                )
            ),

            "prediction":
                round(
                    prediction,
                    2
                ),

            "predicted_occupancy":
                round(
                    prediction,
                    2
                ),

            "status":
                status,

            "status_label":
                status_label,

            "predicted_people":
                predicted_people,

            "waiting_time":
                waiting_time,

            "current_train_frequency":
                train_frequency,

            "max_safe_occupancy":
                max_safe,

            "entry_count":
                entry_count,

            "exit_count":
                exit_count,

            "prediction_horizon":
                "next 30 minutes",

            "crowd_risk": {

                "15_min":
                    status,

                "30_min":
                    status,

                "45_min":
                    status
            },

            "ai_recommendation": (
                scheduling["message"]
                if scheduling
                else default_recommendation
            ),

            "scheduling_recommendation":
                scheduling,
        }

    except HTTPException:

        raise

    except Exception as e:

        print("\n" + "=" * 70)
        print("PREDICTION ERROR")
        print("=" * 70)

        traceback.print_exc()

        print("=" * 70)

        raise HTTPException(
            status_code=500,
            detail={
                "error_type":
                    type(e).__name__,

                "error_message":
                    str(e),

                "traceback":
                    traceback.format_exc()
            }
        )


# ============================================================
# CROWD PREDICTION ALIAS
# ============================================================

@app.post("/predict/crowd")
def predict_crowd_alias(
    request: PredictionRequest
):

    return predict_crowd(
        request
    )


# ============================================================
# TRAFFIC ANALYSIS REPORT ENDPOINT
# ============================================================

@app.get("/traffic-analysis")
def get_traffic_analysis(city: str | None = None):
    try:
        cityName = (city or "Hyderabad").strip()
        print("\n" + "=" * 60)
        print("GET TRAFFIC ANALYSIS:", cityName)
        print("=" * 60)

        filtered_df = df.copy()

        if "city" in filtered_df.columns:
            city_matches = filtered_df[
                filtered_df["city"].astype(str).str.strip().str.lower() == cityName.lower()
            ]
            if not city_matches.empty:
                filtered_df = city_matches

        if "timestamp" in filtered_df.columns:
            latest_records = (
                filtered_df.sort_values("timestamp")
                .groupby("station_id", as_index=False)
                .tail(1)
            )
        else:
            latest_records = filtered_df.groupby("station_id", as_index=False).tail(1)

        station_list = []
        total_inflow = 0
        total_outflow = 0
        occupancy_sum = 0.0

        for _, row in latest_records.iterrows():
            st_id = str(row.get("station_id", "")).strip()
            st_name = str(row.get("station_name", "Unknown Station"))
            st_city = str(row.get("city", cityName))
            st_line = str(row.get("line_name", ""))

            try:
                pred = predict_from_row(row)
            except Exception as pe:
                print(f"Traffic analysis prediction error for {st_id}: {pe}")
                pred = 0.0

            pred = max(0.0, min(100.0, float(pred)))
            entry_count = int(pd.to_numeric(row.get("entry_count", 0), errors="coerce") or 0)
            exit_count = int(pd.to_numeric(row.get("exit_count", 0), errors="coerce") or 0)
            queue_length = float(pd.to_numeric(row.get("queue_length_at_gate", 0), errors="coerce") or 0)
            max_safe = float(pd.to_numeric(row.get("max_safe_occupancy", 0), errors="coerce") or 0)

            total_inflow += entry_count
            total_outflow += exit_count
            occupancy_sum += pred

            if pred < 40:
                status, status_label = "smooth", "Smooth"
            elif pred < 70:
                status, status_label = "moderate", "Moderate"
            else:
                status, status_label = "busy", "Busy"

            station_list.append({
                "id": st_id,
                "name": st_name,
                "city": st_city,
                "line": st_line,
                "occupancy": round(pred, 2),
                "predictedOccupancy": round(pred, 2),
                "currentCrowd": max(0, entry_count - exit_count),
                "waitingTime": round(max(1, queue_length / 25), 1),
                "status": status,
                "statusLabel": status_label,
                "entryCount": entry_count,
                "exitCount": exit_count,
                "entry_count": entry_count,
                "exit_count": exit_count,
                "queueLength": queue_length,
                "maxSafeOccupancy": max_safe
            })

        count = len(station_list)
        avg_occupancy = round(occupancy_sum / count, 2) if count > 0 else 0.0

        sorted_by_occ = sorted(station_list, key=lambda x: x["occupancy"], reverse=True)
        sorted_by_flow = sorted(station_list, key=lambda x: x["entryCount"] + x["exitCount"], reverse=True)

        peak_st = sorted_by_occ[0] if sorted_by_occ else {}
        busiest_st = sorted_by_flow[0] if sorted_by_flow else {}

        top_inflow = sorted(station_list, key=lambda x: x["entryCount"], reverse=True)[:8]
        top_occupancy = sorted_by_occ[:8]

        return {
            "city": cityName,
            "summary": {
                "totalInflow": total_inflow,
                "totalOutflow": total_outflow,
                "netFlow": total_inflow - total_outflow,
                "avgOccupancy": avg_occupancy
            },
            "totalStations": count,
            "stations": station_list,
            "topInflowStations": top_inflow,
            "topOccupancyStations": top_occupancy,
            "peakStation": {
                "name": peak_st.get("name", "Central Station"),
                "occupancy": peak_st.get("occupancy", 0),
                "predictedOccupancy": peak_st.get("occupancy", 0),
                "time": "Peak Hour (08:00 - 10:00)"
            },
            "busiestStation": {
                "name": busiest_st.get("name", "Central Station"),
                "inflow": busiest_st.get("entryCount", 0),
                "outflow": busiest_st.get("exitCount", 0)
            }
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))