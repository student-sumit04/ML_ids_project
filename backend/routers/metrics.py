from fastapi import APIRouter

from utils.loader import load_metrics


router = APIRouter(tags=["metrics"])


@router.get("/metrics")
def metrics():
    return load_metrics()
