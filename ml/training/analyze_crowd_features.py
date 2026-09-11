import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# 1. PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

TRAINING_DIR = PROJECT_ROOT / "ml" / "training"

X_PATH = TRAINING_DIR / "crowd_X_train.csv"
Y_PATH = TRAINING_DIR / "crowd_y_train.csv"


# ============================================================
# 2. LOAD DATA
# ============================================================

X = pd.read_csv(X_PATH)
y = pd.read_csv(Y_PATH).squeeze()

print("=" * 70)
print("CROWD MODEL FEATURE ANALYSIS")
print("=" * 70)

print("\nX shape:", X.shape)
print("y shape:", y.shape)


# ============================================================
# 3. BASIC INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("DATA TYPES")
print("=" * 70)

print(X.dtypes.value_counts())


# ============================================================
# 4. MISSING VALUES
# ============================================================

print("\n" + "=" * 70)
print("MISSING VALUES")
print("=" * 70)

missing = X.isnull().sum()

missing = missing[
    missing > 0
].sort_values(
    ascending=False
)

if len(missing) == 0:
    print("No missing values found.")

else:
    print(missing)


# ============================================================
# 5. UNIQUE VALUES
# ============================================================

print("\n" + "=" * 70)
print("UNIQUE VALUES")
print("=" * 70)

unique_info = pd.DataFrame({
    "feature": X.columns,
    "unique_values": [
        X[col].nunique(dropna=False)
        for col in X.columns
    ],
    "dtype": [
        str(X[col].dtype)
        for col in X.columns
    ]
})

print(
    unique_info.to_string(index=False)
)


# ============================================================
# 6. CONSTANT FEATURES
# ============================================================

print("\n" + "=" * 70)
print("CONSTANT FEATURES")
print("=" * 70)

constant_features = [
    col
    for col in X.columns
    if X[col].nunique(dropna=False) <= 1
]

if constant_features:
    for col in constant_features:
        print("-", col)
else:
    print("No constant features found.")


# ============================================================
# 7. NUMERIC CORRELATION WITH TARGET
# ============================================================

print("\n" + "=" * 70)
print("NUMERIC FEATURE CORRELATION WITH TARGET")
print("=" * 70)

numeric_features = X.select_dtypes(
    include=np.number
).columns

correlation_data = []

for col in numeric_features:

    temp = pd.concat(
        [
            X[col],
            y.rename("target")
        ],
        axis=1
    ).dropna()

    if len(temp) > 1:

        correlation = temp[col].corr(
            temp["target"]
        )

        correlation_data.append(
            (col, correlation)
        )


correlation_df = pd.DataFrame(
    correlation_data,
    columns=[
        "feature",
        "correlation"
    ]
)

correlation_df["abs_correlation"] = (
    correlation_df["correlation"].abs()
)

correlation_df = correlation_df.sort_values(
    "abs_correlation",
    ascending=False
)

print(
    correlation_df.to_string(index=False)
)


# ============================================================
# 8. TARGET DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("TARGET DISTRIBUTION")
print("=" * 70)

print(y.describe())


# ============================================================
# 9. SAVE FEATURE ANALYSIS
# ============================================================

OUTPUT_PATH = (
    TRAINING_DIR
    / "crowd_feature_analysis.csv"
)

unique_info.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\nFeature analysis saved to:")
print(OUTPUT_PATH)


# ============================================================
# 10. SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("ANALYSIS COMPLETE")
print("=" * 70)

print("\nTotal features:", len(X.columns))

print(
    "Numeric features:",
    len(numeric_features)
)

print(
    "Categorical features:",
    len(X.columns) - len(numeric_features)
)

print(
    "Constant features:",
    len(constant_features)
)