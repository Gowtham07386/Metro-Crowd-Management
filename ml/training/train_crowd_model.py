import pandas as pd
import numpy as np
from pathlib import Path
from catboost import CatBoostRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
from pandas.api.types import is_string_dtype


# ============================================================
# 1. PROJECT PATHS
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
print("LOADING CROWD TRAINING DATA")
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


print("\nTraining:", X_train.shape)
print("Validation:", X_validation.shape)
print("Test:", X_test.shape)


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


print("\n" + "=" * 70)
print("REMOVING CONSTANT FEATURES")
print("=" * 70)

for column in CONSTANT_FEATURES:

    if column in X_train.columns:
        print("Removing:", column)

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

print("\n" + "=" * 70)
print("CATEGORICAL FEATURES")
print("=" * 70)

for column in categorical_features:
    print("-", column)


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


# Fill numerical missing values using training medians

for column in numeric_features:

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
# 8. CATBOOST FEATURE INDICES
# ============================================================

categorical_indices = [
    X_train.columns.get_loc(column)
    for column in categorical_features
]


print("\nNumber of final features:")
print(len(X_train.columns))

print("\nNumber of categorical features:")
print(len(categorical_features))

print("\nNumber of numerical features:")
print(len(numeric_features))


# ============================================================
# 9. CREATE MODEL
# ============================================================

print("\n" + "=" * 70)
print("TRAINING CATBOOST CROWD MODEL")
print("=" * 70)


model = CatBoostRegressor(

    loss_function="RMSE",

    eval_metric="RMSE",

    iterations=1500,

    learning_rate=0.05,

    depth=8,

    l2_leaf_reg=5,

    random_seed=42,

    verbose=100,

    early_stopping_rounds=100
)


# ============================================================
# 10. TRAIN
# ============================================================

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


# ============================================================
# 11. VALIDATION PREDICTION
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
# 12. TEST PREDICTION
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
# 13. DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 70)
print("MODEL PERFORMANCE")
print("=" * 70)

print("\nVALIDATION RESULTS")

print(
    f"MAE  : {validation_mae:.4f}"
)

print(
    f"RMSE : {validation_rmse:.4f}"
)

print(
    f"R²   : {validation_r2:.4f}"
)


print("\nTEST RESULTS")

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
# 14. FEATURE IMPORTANCE
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
# 15. SAVE FEATURE IMPORTANCE
# ============================================================

feature_importance.to_csv(
    TRAINING_DIR / "crowd_feature_importance.csv",
    index=False
)


# ============================================================
# 16. SAVE MODEL
# ============================================================

model_path = (
    MODEL_DIR
    / "crowd_occupancy_catboost.cbm"
)

model.save_model(
    model_path
)


# ============================================================
# 17. SAVE METRICS
# ============================================================

metrics = {

    "model": "CatBoostRegressor",

    "target": "next_30min_occupancy_pct",

    "training_rows": int(len(X_train)),

    "validation_rows": int(len(X_validation)),

    "test_rows": int(len(X_test)),

    "features": int(len(X_train.columns)),

    "categorical_features": int(
        len(categorical_features)
    ),

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
    MODEL_DIR / "crowd_model_metrics.json",
    "w"
) as file:

    json.dump(
        metrics,
        file,
        indent=4
    )


# ============================================================
# 18. SAVE FEATURE LIST
# ============================================================

with open(
    MODEL_DIR / "crowd_model_features.json",
    "w"
) as file:

    json.dump(
        list(X_train.columns),
        file,
        indent=4
    )


# ============================================================
# 19. FINAL MESSAGE
# ============================================================

print("\n" + "=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print("\nModel saved to:")
print(model_path)

print("\nMetrics saved to:")
print(
    MODEL_DIR / "crowd_model_metrics.json"
)

print("\nFeature importance saved to:")
print(
    TRAINING_DIR / "crowd_feature_importance.csv"
)