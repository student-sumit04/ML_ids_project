from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import explain, metrics, predict
from utils.loader import artifact_status


app = FastAPI(
    title="Explainable AI IDS Backend",
    description="FastAPI inference service for CICIDS2018 intrusion detection with SHAP and LIME explainability.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
