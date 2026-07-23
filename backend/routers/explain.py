from fastapi import APIRouter

from utils.loader import load_lime_explanation, load_shap_importance


router = APIRouter(tags=["explainability"])


@router.get("/explain")
def explain():
    return {
        "shap": load_shap_importance(),
        "lime": load_lime_explanation(),
    }
