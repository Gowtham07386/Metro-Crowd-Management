import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# 1. PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = (
    PROJECT_ROOT
    / "datasets"
    / "01_crowd_occupancy_forecasting.csv"
)


# ============================================================
# 2. LOAD DATA
# ============================================================

print("Loading crowd dataset...")

df = pd.read_csv(DATA_PATH)

print("Original shape:", df.shape)


# ============================================================
# 3. CONVERT TIMESTAMP
# ============================================================

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)


# Remove rows where timestamp could not be converted
df = df.dropna(subset=["timestamp"])


# ============================================================
# 4. SORT CHRONOLOGICALLY
# ============================================================

df = df.sort_values(
    by="timestamp"
).reset_index(drop=True)


print("\nTime range:")
print("Start:", df["timestamp"].min())
print("End  :", df["timestamp"].max())


# ============================================================
# 5. CREATE TIME FEATURES
# ============================================================

df["hour"] = df["timestamp"].dt.hour

df["minute"] = df["timestamp"].dt.minute

df["day"] = df["timestamp"].dt.day

df["month"] = df["timestamp"].dt.month

df["year"] = df["timestamp"].dt.year

df["day_of_week_number"] = (
    df["timestamp"].dt.dayofweek
)


# ============================================================
# 6. CREATE PEAK-HOUR FEATURE
# ============================================================

def get_peak_period(hour):

    if 7 <= hour <= 10:
        return "Morning Peak"

    elif 17 <= hour <= 20:
        return "Evening Peak"

    else:
        return "Normal"


df["peak_period"] = df["hour"].apply(
    get_peak_period
)


# ============================================================
# 7. CHECK TARGET
# ============================================================

TARGET = "next_30min_occupancy_pct"

print("\nTarget:", TARGET)

print("\nTarget statistics:")

print(
    df[TARGET].describe()
)


# ============================================================
# 8. CHECK MISSING VALUES
# ============================================================

print("\nTop missing-value columns:")

missing = (
    df.isnull()
    .sum()
    .sort_values(ascending=False)
)

print(
    missing.head(15)
)


# ============================================================
# 9. CHECK DUPLICATES
# ============================================================

duplicates = df.duplicated().sum()

print("\nDuplicate rows:", duplicates)


# ============================================================
# 10. CHECK TARGET RANGE
# ============================================================

print("\nTarget minimum:", df[TARGET].min())

print("Target maximum:", df[TARGET].max())


# ============================================================
# 11. REMOVE IMPOSSIBLE TARGET VALUES
# ============================================================

df = df[
    (df[TARGET] >= 0)
    & (df[TARGET] <= 100)
].copy()


# ============================================================
# 12. FINAL INFORMATION
# ============================================================

print("\nFinal shape:", df.shape)

print("\nColumns after preprocessing:")

for column in df.columns:

    print(column)


# ============================================================
# 13. SAVE PREPARED DATASET
# ============================================================

OUTPUT_DIR = (
    PROJECT_ROOT
    / "ml"
    / "evaluation"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

OUTPUT_PATH = (
    OUTPUT_DIR
    / "crowd_prepared.csv"
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\nPrepared dataset saved to:")

print(OUTPUT_PATH)