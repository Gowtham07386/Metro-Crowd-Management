import json
import logging
import datetime
from pathlib import Path
import pandas as pd
from pandas.api.types import is_string_dtype

logger = logging.getLogger(__name__)

# Paths
PROJECT_ROOT = Path(__file__).resolve().parents[3]
MODEL_PATH = PROJECT_ROOT / "ml" / "models" / "crowd_occupancy_final.cbm"
FEATURE_FILE = PROJECT_ROOT / "ml" / "models" / "crowd_final_features.json"

_catboost_model = None
_feature_columns = []

def load_ml_model():
    global _catboost_model, _feature_columns
    try:
        if FEATURE_FILE.exists():
            with open(FEATURE_FILE, "r") as f:
                _feature_columns = json.load(f)
        
        if MODEL_PATH.exists():
            from catboost import CatBoostRegressor
            model = CatBoostRegressor()
            model.load_model(str(MODEL_PATH))
            _catboost_model = model
            logger.info("Successfully loaded CatBoost model crowd_occupancy_final.cbm")
    except Exception as e:
        logger.warning(f"Could not load CatBoost model: {e}")

# Attempt to load model at startup
load_ml_model()

def determine_risk_label(occupancy: float) -> str:
    if occupancy >= 85:
        return "Critical"
    elif occupancy >= 65:
        return "High"
    elif occupancy >= 40:
        return "Moderate"
    else:
        return "Low"

def predict_station_crowd(station_id: str, station_info: dict = None) -> dict:
    now = datetime.datetime.now()
    current_hour = now.hour
    day_name = now.strftime("%A")
    day_num = now.isoweekday()
    
    # Station defaults if not provided
    name = station_info.get("name", "Station") if station_info else "Station"
    city = station_info.get("city", "Delhi") if station_info else "Delhi"
    line = station_info.get("line", "Red Line") if station_info else "Red Line"
    base_occupancy = float(station_info.get("occupancy", 55.0)) if station_info else 55.0
    
    predicted_occupancy = base_occupancy
    
    if _catboost_model and _feature_columns:
        try:
            sample = {
                "station_id": station_id,
                "station_name": name,
                "city": city,
                "metro_line_id": "L1",
                "line_name": line,

                "station_type": "Interchange" if "Interchange" in name else "Regular",
                "poi_category": "Commercial",
                "connecting_transport_modes": "Bus",
                "station_tier": "Tier_1",

                "time_slot": f"{current_hour:02d}:00-{(current_hour+1)%24:02d}:00",
                "day_of_week": day_name,
                "direction": "Inbound",
                "platform_id": "P1",

                "holiday_type": "None",
                "festival_name": "None",
                "weather_condition": "Clear",
                "event_type": "None",
                "peak_period": "Morning Peak" if (8 <= current_hour <= 10) else ("Evening Peak" if (17 <= current_hour <= 20) else "Off-Peak"),

                "platform_congestion_flag": 1 if base_occupancy >= 65 else 0,
                "strike_or_disruption_flag": 0,
                "interchange_flag": 1 if "Interchange" in name else 0,
                "school_college_session_flag": 1,
                "office_hours_flag": 1 if (9 <= current_hour <= 18) else 0,
                "is_holiday": 0,
                "is_festival": 0,
                "is_weekend": 1 if day_num >= 6 else 0,
                "special_event_flag": 0,
                "service_alert_active": 0,

                "num_platforms": 4,
                "train_capacity": 1200,
                "train_arrivals_in_slot": 6,
                "train_headway_minutes": 5.0,
                "num_lifts": 4,
                "num_escalators": 6,

                "day_of_week_number": day_num,
                "day": now.day,

                "num_ticket_counters": 10,
                "num_entry_exit_gates": 12,
                "num_afc_gates": 18,

                "nearby_poi_count": 15,
                "queue_length_at_gate": int(base_occupancy * 1.5),

                "event_distance_km": 2.5,
                "temperature": 28.0,
                "concourse_area_sqm": 5000,

                "rainfall_mm": 0.0,
                "aqi_index": 80,

                "platform_capacity": 1800,
                "max_safe_occupancy": 1500,

                "train_load_factor": base_occupancy / 100.0,

                "token_sales_count": 500,
                "historical_std_dev": 150,

                "avg_dwell_time": 4.5,
                "transfer_count": 300,

                "expected_event_attendance": 0,

                "qr_ticket_taps": 600,

                "current_train_frequency": 8.0,

                "historical_peak_footfall": 3000,
                "historical_avg_footfall": 1800,

                "afc_smart_card_taps": 1200,

                "exit_count": int(base_occupancy * 10),
                "entry_count": int(base_occupancy * 12),

                "hour": current_hour
            }
            
            input_df = pd.DataFrame([sample])
            input_df = input_df[_feature_columns]
            
            categorical_features = [col for col in input_df.columns if is_string_dtype(input_df[col])]
            for col in categorical_features:
                input_df[col] = input_df[col].fillna("Unknown").astype(str)
                
            numeric_features = [col for col in input_df.columns if col not in categorical_features]
            for col in numeric_features:
                input_df[col] = pd.to_numeric(input_df[col], errors="coerce").fillna(0)
                
            raw_pred = _catboost_model.predict(input_df)[0]
            # Ensure model output is reasonable relative to current base occupancy
            predicted_occupancy = float(raw_pred)
            if abs(predicted_occupancy - base_occupancy) > 25:
                predicted_occupancy = base_occupancy * 1.05
        except Exception as e:
            logger.warning(f"Error during CatBoost prediction: {e}")
            predicted_occupancy = base_occupancy * 1.05
    else:
        # Fallback ML curve formula if model loading is bypassed
        peak_factor = 1.10 if (8 <= current_hour <= 10 or 17 <= current_hour <= 20) else 0.98
        predicted_occupancy = min(98.0, max(15.0, base_occupancy * peak_factor))
        
    predicted_occupancy = max(5.0, min(99.0, round(predicted_occupancy, 2)))

    predicted_people = int((predicted_occupancy / 100.0) * 1800)
    waiting_time = round(max(1.0, (predicted_occupancy / 100.0) * 8.5), 1)
    current_freq = max(2, round(10.0 - (predicted_occupancy / 15.0)))
    
    occ_15 = max(5.0, min(99.0, predicted_occupancy * 0.95))
    occ_30 = predicted_occupancy
    occ_45 = max(5.0, min(99.0, predicted_occupancy * 1.06))
    
    recommendation = (
        f"Critical overcrowding predicted ({predicted_occupancy}%). Deploy extra trains and clear concourse gates."
        if predicted_occupancy >= 85 else
        f"Heavy crowd expected ({predicted_occupancy}%). Increase train frequency to 3-4 min intervals."
        if predicted_occupancy >= 65 else
        f"Moderate passenger volume predicted ({predicted_occupancy}%). Maintain standard operational schedule."
        if predicted_occupancy >= 40 else
        f"Normal passenger flow predicted ({predicted_occupancy}%). All lines operating efficiently."
    )
    
    status_label = (
        "Critical Crowd" if predicted_occupancy >= 85 else
        "Heavy Crowd" if predicted_occupancy >= 65 else
        "Moderate Crowd" if predicted_occupancy >= 40 else
        "Normal Flow"
    )
    status_code = (
        "critical" if predicted_occupancy >= 85 else
        "busy" if predicted_occupancy >= 65 else
        "moderate" if predicted_occupancy >= 40 else
        "smooth"
    )

    return {
        "station_id": station_id,
        "station_name": name,
        "predicted_occupancy": predicted_occupancy,
        "prediction": predicted_occupancy,
        "predicted_people": predicted_people,
        "waiting_time": waiting_time,
        "current_train_frequency": current_freq,
        "status_label": status_label,
        "status": status_code,
        "crowd_risk": {
            "15_min": determine_risk_label(occ_15),
            "30_min": determine_risk_label(occ_30),
            "45_min": determine_risk_label(occ_45),
        },
        "ai_recommendation": recommendation
    }
