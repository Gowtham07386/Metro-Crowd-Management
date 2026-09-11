import pandas as pd
from pathlib import Path
from catboost import CatBoostRegressor
from pandas.api.types import is_string_dtype
import json


# ============================================================
# 1. PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

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


# ============================================================
# 2. LOAD MODEL
# ============================================================

print("=" * 60)
print("LOADING METROFLOW CROWD MODEL")
print("=" * 60)

model = CatBoostRegressor()

model.load_model(MODEL_PATH)

print("Model loaded successfully!")


# ============================================================
# 3. LOAD FEATURE LIST
# ============================================================

with open(FEATURE_FILE, "r") as file:
    feature_columns = json.load(file)

print("Expected features:", len(feature_columns))


# ============================================================
# 4. SAMPLE INPUT
# ============================================================

sample = {
    "station_id": "ST001",
    "station_name": "Sample Station",
    "city": "Hyderabad",
    "metro_line_id": "L1",
    "line_name": "Red Line",

    "station_type": "Interchange",
    "poi_category": "Commercial",
    "connecting_transport_modes": "Bus",
    "station_tier": "Tier_1",

    "time_slot": "08:00-09:00",
    "day_of_week": "Monday",
    "direction": "Inbound",
    "platform_id": "P1",

    "holiday_type": "None",
    "festival_name": "None",
    "weather_condition": "Clear",
    "event_type": "None",
    "peak_period": "Morning Peak",

    "platform_congestion_flag": 1,
    "strike_or_disruption_flag": 0,
    "interchange_flag": 1,
    "school_college_session_flag": 1,
    "office_hours_flag": 1,
    "is_holiday": 0,
    "is_festival": 0,
    "is_weekend": 0,
    "special_event_flag": 0,
    "service_alert_active": 0,

    "num_platforms": 4,
    "train_capacity": 1200,

    "train_arrivals_in_slot": 6,
    "train_headway_minutes": 5.0,

    "num_lifts": 4,
    "num_escalators": 6,

    "day_of_week_number": 1,
    "day": 10,

    "num_ticket_counters": 10,
    "num_entry_exit_gates": 12,
    "num_afc_gates": 18,

    "nearby_poi_count": 15,
    "queue_length_at_gate": 120,

    "event_distance_km": 2.5,

    "temperature": 28.0,
    "concourse_area_sqm": 5000,

    "rainfall_mm": 0.0,
    "aqi_index": 80,

    "platform_capacity": 1800,
    "max_safe_occupancy": 1500,

    "train_load_factor": 0.75,

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

    "exit_count": 800,
    "entry_count": 1100,

    "hour": 8
}


# ============================================================
# 5. CREATE DATAFRAME
# ============================================================

print("\nCreating input dataframe...")

input_df = pd.DataFrame([sample])

print("Input columns:", len(input_df.columns))


# ============================================================
# 6. CHECK MISSING FEATURES
# ============================================================

missing_features = [
    column
    for column in feature_columns
    if column not in input_df.columns
]

if missing_features:

    print("\nMissing features:")

    for column in missing_features:
        print("-", column)

    raise ValueError(
        "Input does not contain all required model features."
    )


print("All required features are present.")


# ============================================================
# 7. KEEP EXACT TRAINING FEATURE ORDER
# ============================================================

input_df = input_df[feature_columns]

print("Feature order matched successfully.")


# ============================================================
# 8. IDENTIFY CATEGORICAL FEATURES
# ============================================================

categorical_features = [
    column
    for column in input_df.columns
    if is_string_dtype(input_df[column])
]

print(
    "Categorical features detected:",
    len(categorical_features)
)


# ============================================================
# 9. CLEAN CATEGORICAL FEATURES
# ============================================================

for column in categorical_features:

    input_df[column] = (
        input_df[column]
        .fillna("Unknown")
        .astype(str)
    )


# ============================================================
# 10. CLEAN NUMERICAL FEATURES
# ============================================================

numeric_features = [
    column
    for column in input_df.columns
    if column not in categorical_features
]

print(
    "Numerical features detected:",
    len(numeric_features)
)


for column in numeric_features:

    input_df[column] = pd.to_numeric(
        input_df[column],
        errors="coerce"
    )

    input_df[column] = input_df[column].fillna(0)


print("Input preprocessing completed.")


# ============================================================
# 11. PREDICTION
# ============================================================

print("\nCalling model prediction...")

prediction = model.predict(input_df)[0]

print("Model prediction completed.")

print("Raw prediction:", prediction)

prediction = float(prediction)

print("Converted prediction:", prediction)

if prediction < 40:
    status = "Low"
elif prediction < 70:
    status = "Moderate"
else:
    status = "High"

print("\n" + "=" * 60)
print("METROFLOW CROWD PREDICTION")
print("=" * 60)
print(f"Predicted occupancy (next 30 min): {prediction:.2f}%")
print(f"Crowd status: {status}")
print("=" * 60)


# ============================================================
# 12. LIMIT OCCUPANCY TO 0–100
# ============================================================

#prediction = max(
 #   0,
  #  min(100, float(prediction))
#)


# ============================================================
# 13. DETERMINE CROWD STATUS
# ============================================================

if prediction < 40:

    status = "Low"

elif prediction < 70:

    status = "Moderate"

else:

    status = "High"


# ============================================================
# 14. DISPLAY RESULT
# ============================================================

print("\n" + "=" * 60)
print("METROFLOW CROWD PREDICTION")
print("=" * 60)

print(
    f"Predicted occupancy (next 30 min): "
    f"{prediction:.2f}%"
)

print(
    f"Crowd status: {status}"
)

print("=" * 60)