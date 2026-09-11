import pandas as pd
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]

path = (
    PROJECT_ROOT
    / "datasets"
    / "01_crowd_occupancy_forecasting.csv"
)

df = pd.read_csv(path)


print("Dataset shape:")
print(df.shape)


print("\nTimestamp examples:")
print(df["timestamp"].head(10))


df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)


print("\nTimestamp data type:")
print(df["timestamp"].dtype)


print("\nInvalid timestamps:")
print(df["timestamp"].isna().sum())


print("\nEarliest timestamp:")
print(df["timestamp"].min())


print("\nLatest timestamp:")
print(df["timestamp"].max())


print("\nRows sorted by timestamp:")

sorted_df = df.sort_values("timestamp")

print(
    sorted_df[
        ["station_id", "station_name", "timestamp"]
    ].head(10)
)