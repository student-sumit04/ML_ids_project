from typing import Any

import numpy as np
import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from utils.loader import get_model_bundle
from utils.preprocess import prepare_features


router = APIRouter(tags=["prediction"])


def _confidence(model: Any, matrix: np.ndarray) -> np.ndarray:
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(matrix)
        return probabilities.max(axis=1) * 100
    return np.full(matrix.shape[0], 0.0)


def _summarize(labels: list[str]) -> dict[str, Any]:
    counts = pd.Series(labels).value_counts().to_dict()
    benign = counts.get("Benign", 0)
    total = len(labels)
    attacks = total - benign
    normal_pct = round((benign / total) * 100, 2) if total else 0
    return {
        "total_predictions": total,
        "detected_attacks": attacks,
        "normal_traffic_percentage": normal_pct,
        "attack_distribution": counts,
    }


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a CSV file generated with CICFlowMeter-compatible columns.")

    try:
        frame = pd.read_csv(file.file, nrows=5000)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read CSV: {exc}") from exc

    bundle = get_model_bundle()
    try:
        features = prepare_features(frame, bundle.features)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    scaled = bundle.scaler.transform(features)
    xgb_raw = bundle.xgboost.predict(scaled)
    xgb_labels = bundle.label_encoder.inverse_transform(xgb_raw.astype(int)).tolist()
    xgb_confidence = _confidence(bundle.xgboost, scaled)

    rf_labels: list[str | None] = [None] * len(xgb_labels)
    rf_warning = None
    rf_model = bundle.random_forest
    if rf_model is not None:
        try:
            rf_raw = rf_model.predict(scaled)
            rf_labels = bundle.label_encoder.inverse_transform(rf_raw.astype(int)).tolist()
        except Exception as exc:
            rf_warning = f"Random Forest unavailable during this request: {exc}"

    ensemble_labels = []
    for index, xgb_label in enumerate(xgb_labels):
        rf_label = rf_labels[index]
        ensemble_labels.append(rf_label if rf_label == xgb_label else xgb_label)

    anomaly_raw = bundle.isolation.predict(scaled)
    anomaly_score = (-bundle.isolation.decision_function(scaled)).round(6)

    rows = []
    for index, label in enumerate(ensemble_labels[:500]):
        rows.append(
            {
                "row": index + 1,
                "prediction": label,
                "confidence": round(float(xgb_confidence[index]), 2),
                "model": "XGBoost" if rf_labels[index] != xgb_labels[index] else "RF + XGBoost",
                "xgboost_prediction": xgb_labels[index],
                "random_forest_prediction": rf_labels[index],
                "anomaly_detected": bool(anomaly_raw[index] == -1),
                "anomaly_score": float(anomaly_score[index]),
            }
        )

    first = rows[0] if rows else {}
    rf_summary = _summarize([label for label in rf_labels if label is not None]) if any(rf_labels) else None
    return {
        "filename": file.filename,
        "prediction": first.get("prediction"),
        "confidence": first.get("confidence"),
        "model": first.get("model"),
        "xgboost_prediction": first.get("xgboost_prediction"),
        "random_forest_prediction": first.get("random_forest_prediction"),
        "total_rows": len(ensemble_labels),
        "summary": _summarize(ensemble_labels),
        "model_summaries": {
            "ensemble": _summarize(ensemble_labels),
            "xgboost": _summarize(xgb_labels),
            "random_forest": rf_summary,
        },
        "predictions": rows,
        "warnings": [rf_warning] if rf_warning else [],
    }
