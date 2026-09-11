import pandas as pd
from pathlib import Path
from pandas.api.types import is_string_dtype


# ============================================================
# 1. PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

INPUT_PATH = (
    PROJECT_ROOT
    / "evaluation"
    / "crowd_prepared.csv"
)

OUTPUT_DIR = (
    PROJECT_ROOT
    / "training"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 2. LOAD PREPARED DATA
# ============================================================

print("Loading prepared crowd dataset...")

df = pd.read_csv(
    INPUT_PATH,
    low_memory=False
)

print("Original shape:", df.shape)


# ============================================================
# 3. CONVERT TIMESTAMP
# ============================================================

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

df = df.dropna(
    subset=["timestamp"]
)


# ============================================================
# 4. SORT CHRONOLOGICALLY
# ============================================================

df = df.sort_values(
    "timestamp"
).reset_index(drop=True)


# ============================================================
# 5. TARGET
# ============================================================

TARGET = "next_30min_occupancy_pct"


# ============================================================
# 6. REMOVE DATA LEAKAGE
# ============================================================

# These values represent future information or downstream
# decisions and should NOT be given to the crowd model.

LEAKAGE_COLUMNS = [
    "next_15min_inflow",
    "next_15min_outflow",
    "next_30min_occupancy_pct",
    "recommended_action",
    "net_flow",
]


existing_leakage = [
    col
    for col in LEAKAGE_COLUMNS
    if col in df.columns
]

print("\nRemoving leakage columns:")

for col in existing_leakage:
    print(" -", col)


# ============================================================
# 7. CREATE X AND y
# ============================================================

X = df.drop(
    columns=existing_leakage
)

y = df[TARGET]


# ============================================================
# 8. REMOVE RAW TIMESTAMP
# ============================================================

# We already created:
# hour
# minute
# day
# month
# year
# day_of_week_number
# peak_period
#
# Therefore the raw datetime itself is not needed by the model.

if "timestamp" in X.columns:

    X = X.drop(
        columns=["timestamp"]
    )


# ============================================================
# 9. REMOVE DATE STRING
# ============================================================

# The original date column is redundant because timestamp
# already provided the required time features.

if "date" in X.columns:

    X = X.drop(
        columns=["date"]
    )


# ============================================================
# 10. HANDLE CATEGORICAL VALUES
# ============================================================

categorical_columns = []

for column in X.columns:

    if is_string_dtype(X[column]):

        categorical_columns.append(column)

        X[column] = (
            X[column]
            .fillna("Unknown")
            .astype(str)
        )

# ============================================================
# 11. PRINT FEATURE INFORMATION
# ============================================================

print("\nTotal input features:", len(X.columns))

print("\nCategorical features:")

for col in categorical_columns:
    print(" -", col)


numeric_columns = [
    col
    for col in X.columns
    if col not in categorical_columns
]

print("\nNumeric features:", len(numeric_columns))


# ============================================================
# 12. CHRONOLOGICAL TRAIN / VALIDATION / TEST SPLIT
# ============================================================

total_rows = len(X)

train_end = int(
    total_rows * 0.70
)

validation_end = int(
    total_rows * 0.85
)


X_train = X.iloc[
    :train_end
].copy()

y_train = y.iloc[
    :train_end
].copy()


X_validation = X.iloc[
    train_end:validation_end
].copy()

y_validation = y.iloc[
    train_end:validation_end
].copy()


X_test = X.iloc[
    validation_end:
].copy()

y_test = y.iloc[
    validation_end:
].copy()


# ============================================================
# 13. DISPLAY SPLIT INFORMATION
# ============================================================

print("\n==========================================")
print("DATA SPLIT")
print("==========================================")

print(
    "Training:",
    len(X_train)
)

print(
    "Validation:",
    len(X_validation)
)

print(
    "Testing:",
    len(X_test)
)


# ============================================================
# 14. DISPLAY TIME RANGES
# ============================================================

print("\n==========================================")
print("TIME RANGES")
print("==========================================")


print(
    "\nTraining:"
)

print(
    df["timestamp"].iloc[0],
    "to",
    df["timestamp"].iloc[train_end - 1]
)


print(
    "\nValidation:"
)

print(
    df["timestamp"].iloc[train_end],
    "to",
    df["timestamp"].iloc[validation_end - 1]
)


print(
    "\nTesting:"
)

print(
    df["timestamp"].iloc[validation_end],
    "to",
    df["timestamp"].iloc[-1]
)


# ============================================================
# 15. SAVE TRAINING DATA
# ============================================================

X_train.to_csv(
    OUTPUT_DIR / "crowd_X_train.csv",
    index=False
)

y_train.to_csv(
    OUTPUT_DIR / "crowd_y_train.csv",
    index=False
)


# ============================================================
# 16. SAVE VALIDATION DATA
# ============================================================

X_validation.to_csv(
    OUTPUT_DIR / "crowd_X_validation.csv",
    index=False
)

y_validation.to_csv(
    OUTPUT_DIR / "crowd_y_validation.csv",
    index=False
)


# ============================================================
# 17. SAVE TEST DATA
# ============================================================

X_test.to_csv(
    OUTPUT_DIR / "crowd_X_test.csv",
    index=False
)

y_test.to_csv(
    OUTPUT_DIR / "crowd_y_test.csv",
    index=False
)


# ============================================================
# 18. SAVE FEATURE LIST
# ============================================================

feature_info = pd.DataFrame({

    "feature": X.columns,

    "data_type": [
        str(X[col].dtype)
        for col in X.columns
    ],

    "is_categorical": [
        col in categorical_columns
        for col in X.columns
    ]

})

feature_info.to_csv(
    OUTPUT_DIR / "crowd_feature_info.csv",
    index=False
)


# ============================================================
# 19. FINAL MESSAGE
# ============================================================

print("\n==========================================")
print("PREPARATION COMPLETE")
print("==========================================")

print(
    "\nFiles saved inside:"
)

print(OUTPUT_DIR)

print(
    "\nReady for model training."
)