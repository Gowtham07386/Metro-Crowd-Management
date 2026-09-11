import pandas as pd
import numpy as np
from pathlib import Path
from catboost import CatBoostRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import json
from pandas.api.types import is_string_dtype


# ============================================================
# 1. PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

TRAINING_DIR = PROJECT_ROOT / "ml" / "training"
MODEL_DIR = PROJECT_ROOT / "ml" / "models"

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 2. LOAD DATA
# ============================================================

print("=" * 70)
print("FINAL CROWD MODEL TRAINING")
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

X_test = pd.read_csv(
    TRAINING_DIR / "crowd_X_test.csv",
    low_memory=False
)

y_test = pd.read_csv(
    TRAINING_DIR / "crowd_y_test.csv",
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

        X_test = X_test.drop(
            columns=[column]
        )


# ============================================================
# 4. IDENTIFY CATEGORICAL FEATURES
# ============================================================

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

print(
    "Categorical features:",
    len(categorical_features)
)

print(
    "Numerical features:",
    len(X_train.columns) - len(categorical_features)
)


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

    X_test[column] = (
        X_test[column]
        .fillna("Unknown")
        .astype(str)
    )


# ============================================================
# 6. CLEAN NUMERICAL FEATURES
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

    X_test[column] = pd.to_numeric(
        X_test[column],
        errors="coerce"
    )

    median_value = X_train[column].median()

    X_train[column] = X_train[column].fillna(
        median_value
    )

    X_validation[column] = X_validation[column].fillna(
        median_value
    )

    X_test[column] = X_test[column].fillna(
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

y_test = pd.to_numeric(
    y_test,
    errors="coerce"
)


# ============================================================
# 8. FINAL SELECTED PARAMETERS
# ============================================================

BEST_DEPTH = 6
BEST_LEARNING_RATE = 0.05
BEST_L2_LEAF_REG = 5
BEST_ITERATIONS = 1223


# ============================================================
# 9. TRAIN FINAL MODEL
# ============================================================

print("\n" + "=" * 70)
print("TRAINING SELECTED MODEL")
print("=" * 70)

print("\nDepth:", BEST_DEPTH)
print("Learning rate:", BEST_LEARNING_RATE)
print("L2 regularization:", BEST_L2_LEAF_REG)
print("Iterations:", BEST_ITERATIONS)


model = CatBoostRegressor(

    iterations=BEST_ITERATIONS,

    learning_rate=BEST_LEARNING_RATE,

    depth=BEST_DEPTH,

    l2_leaf_reg=BEST_L2_LEAF_REG,

    loss_function="RMSE",

    random_seed=42,

    verbose=200
)


model.fit(

    X_train,

    y_train,

    cat_features=categorical_indices
)


# ============================================================
# 10. VALIDATION EVALUATION
# ============================================================

validation_predictions = model.predict(
    X_validation
)

validation_mae = mean_absolute_error(
    y_validation,
    validation_predictions
)

validation_rmse = np.sqrt(
    mean_squared_error(
        y_validation,
        validation_predictions
    )
)

validation_r2 = r2_score(
    y_validation,
    validation_predictions
)


# ============================================================
# 11. TEST EVALUATION
# ============================================================

test_predictions = model.predict(
    X_test
)

test_mae = mean_absolute_error(
    y_test,
    test_predictions
)

test_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        test_predictions
    )
)

test_r2 = r2_score(
    y_test,
    test_predictions
)


# ============================================================
# 12. DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 70)
print("FINAL MODEL RESULTS")
print("=" * 70)

print("\nVALIDATION")

print(
    f"MAE  : {validation_mae:.4f}"
)

print(
    f"RMSE : {validation_rmse:.4f}"
)

print(
    f"R²   : {validation_r2:.4f}"
)


print("\nTEST")

print(
    f"MAE  : {test_mae:.4f}"
)

print(
    f"RMSE : {test_rmse:.4f}"
)

print(
    f"R²   : {test_r2:.4f}"
)


# ============================================================
# 13. FEATURE IMPORTANCE
# ============================================================

feature_importance = pd.DataFrame({

    "feature": X_train.columns,

    "importance": model.feature_importances_

})

feature_importance = feature_importance.sort_values(
    "importance",
    ascending=False
)


print("\n" + "=" * 70)
print("TOP 20 FEATURE IMPORTANCES")
print("=" * 70)

print(
    feature_importance.head(20).to_string(
        index=False
    )
)


# ============================================================
# 14. SAVE FINAL MODEL
# ============================================================

model_path = (
    MODEL_DIR /
    "crowd_occupancy_final.cbm"
)

model.save_model(
    model_path
)


# ============================================================
# 15. SAVE FEATURE IMPORTANCE
# ============================================================

feature_importance.to_csv(
    TRAINING_DIR /
    "crowd_final_feature_importance.csv",
    index=False
)


# ============================================================
# 16. SAVE METRICS
# ============================================================

metrics = {

    "model": "CatBoostRegressor",

    "target": "next_30min_occupancy_pct",

    "features": len(X_train.columns),

    "categorical_features": len(
        categorical_features
    ),

    "numerical_features": (
        len(X_train.columns)
        - len(categorical_features)
    ),

    "depth": BEST_DEPTH,

    "learning_rate": BEST_LEARNING_RATE,

    "l2_leaf_reg": BEST_L2_LEAF_REG,

    "iterations": BEST_ITERATIONS,

    "validation_mae": float(
        validation_mae
    ),

    "validation_rmse": float(
        validation_rmse
    ),

    "validation_r2": float(
        validation_r2
    ),

    "test_mae": float(
        test_mae
    ),

    "test_rmse": float(
        test_rmse
    ),

    "test_r2": float(
        test_r2
    )
}


with open(
    MODEL_DIR /
    "crowd_final_metrics.json",
    "w"
) as file:

    json.dump(
        metrics,
        file,
        indent=4
    )


# ============================================================
# 17. SAVE FEATURE LIST
# ============================================================

with open(
    MODEL_DIR /
    "crowd_final_features.json",
    "w"
) as file:

    json.dump(
        list(X_train.columns),
        file,
        indent=4
    )


print("\n" + "=" * 70)
print("FINAL MODEL SAVED")
print("=" * 70)

print("\nModel:")
print(model_path)

print("\nMetrics:")
print(
    MODEL_DIR /
    "crowd_final_metrics.json"
)

print("\nFeature importance:")
print(
    TRAINING_DIR /
    "crowd_final_feature_importance.csv"
)