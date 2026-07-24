import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import explain, metrics, predict
from utils.loader import artifact_status


app = FastAPI(
    title="Explainable AI IDS Backend",
    description="FastAPI inference service for CICIDS2018 intrusion detection with SHAP and LIME explainability.",
    version="1.0.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("IDS_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]
cors_origin_regex = os.getenv("IDS_CORS_ORIGIN_REGEX")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "running", "artifacts": artifact_status()}


app.include_router(predict.router)
app.include_router(explain.router)
app.include_router(metrics.router)
