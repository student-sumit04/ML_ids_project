from dataclasses import dataclass
from functools import lru_cache
import os
from pathlib import Path
from typing import Any

import joblib
import json


BASE_DIR = Path(__file__).resolve().parents[1]
MODELS_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"


@dataclass
class ModelBundle:
    features: list[str]
    label_encoder: Any
    scaler: Any
    xgboost: Any
    isolation: Any
    random_forest: Any | None


def _load_joblib(name: str) -> Any:
    return joblib.load(MODELS_DIR / name)


def _load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def artifact_status() -> dict[str, bool]:
    expected = [
        "features.pkl",
        "label_encoder.pkl",
        "scaler.pkl",
        "xgboost.pkl",
        "isolation.pkl",
        "random_forest.pkl",
        "metrics.json",
    ]
    result_files = ["shap_importance.json", "lime_explanation.json"]
    status = {name: (MODELS_DIR / name).exists() for name in expected}
    status.update({name: (RESULTS_DIR / name).exists() for name in result_files})
    return status


@lru_cache(maxsize=1)
def get_model_bundle() -> ModelBundle:
    random_forest = None
    rf_path = MODELS_DIR / "random_forest.pkl"
    if rf_path.exists() and os.getenv("IDS_ENABLE_RF", "1") != "0":
        random_forest = _load_joblib("random_forest.pkl")

    return ModelBundle(
        features=_load_joblib("features.pkl"),
        label_encoder=_load_joblib("label_encoder.pkl"),
        scaler=_load_joblib("scaler.pkl"),
        xgboost=_load_joblib("xgboost.pkl"),
        isolation=_load_joblib("isolation.pkl"),
        random_forest=random_forest,
    )


def load_metrics() -> dict[str, Any]:
    return _load_json(MODELS_DIR / "metrics.json")


def load_shap_importance() -> list[dict[str, Any]]:
    return _load_json(RESULTS_DIR / "shap_importance.json")


def load_lime_explanation() -> list[dict[str, Any]]:
    return _load_json(RESULTS_DIR / "lime_explanation.json")
