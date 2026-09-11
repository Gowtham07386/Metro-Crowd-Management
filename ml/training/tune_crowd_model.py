import pandas as pd
import numpy as np
from pathlib import Path
from catboost import CatBoostRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ============================================================
# 1. PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

TRAINING_DIR = PROJECT_ROOT / "ml" / "training"


# ============================================================
# 2. LOAD DATA
# ============================================================

print("=" * 70)
print("LOADING CROWD DATA FOR TUNING")
print("=" * 70)

X_train = pd.read_csv(
    TRAINING_DIR / "crowd_X_train.csv",
    low_memory=False
)

y_train = pd.read_csv(
    TRAINING_DIR / "crowd_y_train.csv",
    low_memory=False
).squeeze()

X_validation = pd.read_csv(
    TRAINING_DIR / "crowd_X_validation.csv",
    low_memory=False
)

y_validation = pd.read_csv(
    TRAINING_DIR / "crowd_y_validation.csv",
    low_memory=False
).squeeze()


# ============================================================
# 3. REMOVE CONSTANT FEATURES
# ============================================================

CONSTANT_FEATURES = [
    "zone_sector",
    "scheduled_train_frequency",
    "minute",
    "month",
    "year"
]

for column in CONSTANT_FEATURES:

    if column in X_train.columns:

        X_train = X_train.drop(
            columns=[column]
        )

        X_validation = X_validation.drop(
            columns=[column]
        )


# ============================================================
# 4. IDENTIFY CATEGORICAL FEATURES
# ============================================================

from pandas.api.types import is_string_dtype


categorical_features = [
    column
    for column in X_train.columns
    if is_string_dtype(X_train[column])
]


categorical_indices = [
    X_train.columns.get_loc(column)
    for column in categorical_features
]


print("\nFinal features:", len(X_train.columns))
print("Categorical features:", len(categorical_features))


# ============================================================
# 5. CLEAN CATEGORICAL FEATURES
# ============================================================

for column in categorical_features:

    X_train[column] = (
        X_train[column]
        .fillna("Unknown")
        .astype(str)
    )

    X_validation[column] = (
        X_validation[column]
        .fillna("Unknown")
        .astype(str)
    )


# ============================================================
# 6. CLEAN NUMERIC FEATURES
# ============================================================

numeric_features = [
    column
    for column in X_train.columns
    if column not in categorical_features
]


for column in numeric_features:

    X_train[column] = pd.to_numeric(
        X_train[column],
        errors="coerce"
    )

    X_validation[column] = pd.to_numeric(
        X_validation[column],
        errors="coerce"
    )

    median_value = X_train[column].median()

    X_train[column] = X_train[column].fillna(
        median_value
    )

    X_validation[column] = X_validation[column].fillna(
        median_value
    )


# ============================================================
# 7. CLEAN TARGET
# ============================================================

y_train = pd.to_numeric(
    y_train,
    errors="coerce"
)

y_validation = pd.to_numeric(
    y_validation,
    errors="coerce"
)


# ============================================================
# 8. MODELS TO TEST
# ============================================================

configs = [

    {
        "name": "depth_6",
        "depth": 6,
        "learning_rate": 0.05,
        "l2_leaf_reg": 5
    },

    {
        "name": "depth_7",
        "depth": 7,
        "learning_rate": 0.05,
        "l2_leaf_reg": 5
    },

    {
        "name": "depth_8",
        "depth": 8,
        "learning_rate": 0.05,
        "l2_leaf_reg": 5
    },

    {
        "name": "depth_9",
        "depth": 9,
        "learning_rate": 0.05,
        "l2_leaf_reg": 5
    },

    {
        "name": "depth_8_regularized",
        "depth": 8,
        "learning_rate": 0.05,
        "l2_leaf_reg": 10
    }
]


# ============================================================
# 9. TRAIN MODELS
# ============================================================

results = []


for config in configs:

    print("\n")
    print("=" * 70)
    print("TRAINING:", config["name"])
    print("=" * 70)

    model = CatBoostRegressor(

        iterations=1500,

        learning_rate=config["learning_rate"],

        depth=config["depth"],

        l2_leaf_reg=config["l2_leaf_reg"],

        loss_function="RMSE",

        eval_metric="RMSE",

        random_seed=42,

        verbose=200,

        early_stopping_rounds=100
    )


    model.fit(

        X_train,

        y_train,

        cat_features=categorical_indices,

        eval_set=(
            X_validation,
            y_validation
        ),

        use_best_model=True
    )


    # --------------------------------------------------------
    # VALIDATION PREDICTION
    # --------------------------------------------------------

    predictions = model.predict(
        X_validation
    )


    mae = mean_absolute_error(
        y_validation,
        predictions
    )

    rmse = np.sqrt(
        mean_squared_error(
            y_validation,
            predictions
        )
    )

    r2 = r2_score(
        y_validation,
        predictions
    )


    results.append({

        "model": config["name"],

        "depth": config["depth"],

        "learning_rate": config["learning_rate"],

        "l2_leaf_reg": config["l2_leaf_reg"],

        "best_iteration": model.get_best_iteration(),

        "MAE": mae,

        "RMSE": rmse,

        "R2": r2

    })


    print("\nRESULT")

    print(
        f"MAE  : {mae:.4f}"
    )

    print(
        f"RMSE : {rmse:.4f}"
    )

    print(
        f"R²   : {r2:.4f}"
    )


# ============================================================
# 10. RESULTS TABLE
# ============================================================

results_df = pd.DataFrame(
    results
)

results_df = results_df.sort_values(
    "RMSE"
)


print("\n")
print("=" * 70)
print("TUNING RESULTS")
print("=" * 70)

print(
    results_df.to_string(
        index=False
    )
)


# ============================================================
# 11. SAVE RESULTS
# ============================================================

output_path = (
    TRAINING_DIR
    / "crowd_tuning_results.csv"
)

results_df.to_csv(
    output_path,
    index=False
)


print("\nResults saved to:")

print(output_path)