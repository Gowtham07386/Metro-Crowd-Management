import pandas as pd
from pathlib import Path


# --------------------------------------------------
# PROJECT PATH
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATA_DIR = PROJECT_ROOT / "datasets"


# --------------------------------------------------
# DATASETS
# --------------------------------------------------

datasets = {
    "Crowd Occupancy":
        "01_crowd_occupancy_forecasting.csv",

    "Passenger Flow":
        "02_passenger_flow_forecasting.csv",

    "Crowd Risk":
        "03_crowd_risk_classification.csv",

    "Operational Analytics":
        "05_operational_analytics.csv",

    "Station Master":
        "06_station_master.csv",
}


# --------------------------------------------------
# INSPECT EACH DATASET
# --------------------------------------------------

for name, filename in datasets.items():

    print("\n")
    print("=" * 70)
    print(name)
    print("=" * 70)

    path = DATA_DIR / filename

    df = pd.read_csv(path)

    print("\nShape:")
    print(df.shape)

    print("\nColumns:")
    print(df.columns.tolist())

    print("\nFirst 3 rows:")
    print(df.head(3))

    print("\nMissing values:")
    print(
        df.isnull()
        .sum()
        .sort_values(ascending=False)
        .head(10)
    )

    print("\nDuplicate rows:")
    print(df.duplicated().sum())

    print("\nData types:")
    print(df.dtypes.value_counts())