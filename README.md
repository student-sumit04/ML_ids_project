# Explainable AI Intrusion Detection Dashboard

Explainable AI IDS is a full-stack intrusion detection dashboard built around trained CICIDS2018 machine learning artifacts. It combines a React/Vite analyst interface with a FastAPI inference backend so users can upload network-flow CSV files, classify traffic, review attack distributions, compare model metrics, and inspect SHAP/LIME explanations.

The project is intended to turn model-training work into a usable security analytics product. The backend serves the saved classifiers and explanation artifacts, while the frontend presents the results in a workflow that is easier for analysts, students, and evaluators to understand.

## Table of Contents

- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Machine Learning Pipeline](#machine-learning-pipeline)
- [Model Artifacts](#model-artifacts)
- [Frontend Application](#frontend-application)
- [Backend API](#backend-api)
- [Setup Requirements](#setup-requirements)
- [Running Locally](#running-locally)
- [Running with Docker Compose](#running-with-docker-compose)
- [CSV Input Format](#csv-input-format)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Deployment Notes](#deployment-notes)

## Core Features

- CSV-based network-flow intrusion detection using CICFlowMeter-compatible columns.
- Supervised multiclass attack prediction with XGBoost as the primary classifier.
- Optional Random Forest prediction support for comparison and agreement display.
- Isolation Forest anomaly signal returned alongside supervised predictions.
- SHAP global feature-importance display from saved explainability output.
- LIME local explanation display from saved explanation output.
- Model-metric comparison for Random Forest and XGBoost.
- FastAPI backend with health, prediction, metrics, and explanation endpoints.
- React dashboard with overview, analytics, upload, explainability, and model views.
- Docker-ready backend and Docker Compose workflow for running the full stack.

## System Architecture

The project has two main services:

1. **Frontend**
   - Built with React, TypeScript, Vite, Tailwind CSS, Recharts, Axios, and Lucide icons.
   - Runs on `http://localhost:3000` during local development.
   - Calls the backend API through `VITE_API_URL`, defaulting to `http://localhost:8000`.
   - Uses hash-based routes so it can run as a static client application.

2. **Backend**
   - Built with FastAPI and Python.
   - Runs on `http://localhost:8000`.
   - Loads saved model artifacts from `backend/models`.
   - Loads saved SHAP and LIME outputs from `backend/results`.
   - Accepts CSV uploads, aligns columns to the trained feature list, scales values, runs model inference, and returns summarized predictions.

High-level request flow:

```text
User uploads CSV in React UI
        |
        v
POST /predict on FastAPI backend
        |
        v
Column cleaning and feature alignment
        |
        v
Scaler transformation
        |
        v
XGBoost prediction + optional Random Forest prediction
        |
        v
Isolation Forest anomaly scoring
        |
        v
Prediction summary and row-level results returned to frontend
```

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite 6
- Tailwind CSS
- Axios
- Recharts
- Lucide React
- React Hot Toast

### Backend

- Python 3.11
- FastAPI
- Uvicorn
- Pandas
- NumPy
- scikit-learn
- XGBoost
- Joblib
- python-multipart

### Machine Learning and Explainability

- CICIDS2018 network-flow dataset
- Random Forest classifier
- XGBoost classifier
- Isolation Forest anomaly detector
- SHAP global feature importance
- LIME local explanation output

## Project Structure

```text
Explainable-AI-IDS/
  README.md
  package.json
  package-lock.json
  vite.config.ts
  tsconfig.json
  tailwind.config.ts
  postcss.config.js
  docker-compose.yml
  .env.example

  src/
    App.tsx
    main.tsx
    styles.css
    api/
      axios.ts
    app/
      layout.tsx
      dashboard/layout.tsx
      explain/layout.tsx
      models/layout.tsx
    charts/
      AttackDistribution.tsx
      FeatureBars.tsx
    components/
      PageHeader.tsx
      Shell.tsx
      StatCard.tsx
    types/
      ids.ts

  backend/
    main.py
    Dockerfile
    requirements.txt
    requirements-xai-dev.txt
    test_sample.csv
    routers/
      predict.py
      explain.py
      metrics.py
    utils/
      loader.py
      preprocess.py
    models/
      features.pkl
      label_encoder.pkl
      scaler.pkl
      xgboost.pkl
      isolation.pkl
      random_forest.pkl
      metrics.json
    results/
      shap_importance.json
      lime_explanation.json
      prediction_example.json

  ml-notebooks/
    02-model-training-ids2018.ipynb
    03-xai-shap-lime-ids2018.ipynb
    notebook1.ipynb

  source-archives/
    results_lime.zip
    results_training_testing.zip
```

Generated folders such as `node_modules`, `.next`, and `dist` are not part of the source architecture, even if they exist in a local working copy.

## Machine Learning Pipeline

The project expects artifacts produced from a CICIDS2018 training pipeline. The notebooks in `ml-notebooks` are used for model training and explainability work.

The inference pipeline is:

1. Read the uploaded CSV file with Pandas.
2. Strip whitespace from column names.
3. Drop label columns if present, including `Label`, `label`, `Attack`, or `attack`.
4. Verify that every required trained feature exists in the CSV.
5. Select only the trained feature columns from `features.pkl`.
6. Limit inference to the first 5,000 rows.
7. Replace infinite values with missing values.
8. Convert all feature values to numeric form.
9. Fill remaining missing values with `0`.
10. Apply the saved scaler from `scaler.pkl`.
11. Run XGBoost multiclass prediction.
12. Run Random Forest prediction if the artifact is available and enabled.
13. Build an ensemble label, preferring Random Forest only when it agrees with XGBoost.
14. Run Isolation Forest to identify anomalous rows.
15. Return row-level results and a summary to the frontend.

The response returns row-level prediction details for the first 500 rows, while the summary is calculated from all rows processed by the backend.

## Model Artifacts

The backend expects these files in `backend/models`:

| File | Purpose |
| --- | --- |
| `features.pkl` | Ordered list of feature columns used during training. |
| `label_encoder.pkl` | Encoder used to convert model class IDs back to readable labels. |
| `scaler.pkl` | Fitted scaler used to transform incoming feature values. |
| `xgboost.pkl` | Primary supervised multiclass classifier. |
| `isolation.pkl` | Isolation Forest model used for anomaly detection. |
| `random_forest.pkl` | Optional supervised classifier used for agreement/comparison. |
| `metrics.json` | Saved evaluation metrics displayed by the dashboard. |

The backend also expects these files in `backend/results`:

| File | Purpose |
| --- | --- |
| `shap_importance.json` | Global SHAP feature-importance rows for the explainability screen. |
| `lime_explanation.json` | LIME explanation rows for the explainability screen. |
| `prediction_example.json` | Example prediction output kept for reference. |

The health endpoint reports whether the expected artifacts are present.

## Frontend Application

The frontend is a client-rendered Vite application. It uses hash routes, so navigation is handled inside the browser without a server-side router.

Available screens:

| Route | Screen | Purpose |
| --- | --- | --- |
| `#/` | Overview | Shows the product summary, backend status, dataset, model, and XAI overview. |
| `#/dashboard` | Detection Dashboard | Displays high-level traffic and model metric cards with attack distribution visualization. |
| `#/upload` | Upload | Lets the user upload a CICFlowMeter-compatible CSV and review predictions. |
| `#/explain` | Explain | Shows SHAP global importance and LIME explanation bars. |
| `#/models` | Models | Compares saved Random Forest and XGBoost metrics. |

The frontend API client is defined in `src/api/axios.ts`:

```ts
baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000"
```

If the backend runs somewhere other than `localhost:8000`, set `VITE_API_URL` before starting or building the frontend.

## Backend API

The FastAPI application is defined in `backend/main.py`. CORS is configured for:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

### `GET /health`

Checks whether the backend is running and reports artifact availability.

Example response:

```json
{
  "status": "running",
  "artifacts": {
    "features.pkl": true,
    "label_encoder.pkl": true,
    "scaler.pkl": true,
    "xgboost.pkl": true,
    "isolation.pkl": true,
    "random_forest.pkl": true,
    "metrics.json": true,
    "shap_importance.json": true,
    "lime_explanation.json": true
  }
}
```

### `POST /predict`

Accepts a CSV file upload and returns intrusion-detection predictions.

Request type:

- `multipart/form-data`
- Field name: `file`
- File type: `.csv`

Example with `curl`:

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@backend/test_sample.csv"
```

Important behavior:

- The uploaded file must end with `.csv`.
- The CSV must include all features listed in `features.pkl`.
- Extra columns are ignored.
- Known label columns are dropped automatically.
- At most 5,000 rows are processed per request.
- Row-level details are returned for the first 500 processed rows.
- Random Forest can be disabled with `IDS_ENABLE_RF=0`.

Example response shape:

```json
{
  "filename": "test_sample.csv",
  "prediction": "Benign",
  "confidence": 98.41,
  "model": "RF + XGBoost",
  "total_rows": 100,
  "summary": {
    "total_predictions": 100,
    "detected_attacks": 12,
    "normal_traffic_percentage": 88.0,
    "attack_distribution": {
      "Benign": 88,
      "DDoS": 12
    }
  },
  "predictions": [
    {
      "row": 1,
      "prediction": "Benign",
      "confidence": 98.41,
      "model": "RF + XGBoost",
      "xgboost_prediction": "Benign",
      "random_forest_prediction": "Benign",
      "anomaly_detected": false,
      "anomaly_score": -0.041255
    }
  ],
  "warnings": []
}
```

### `GET /metrics`

Returns saved model evaluation metrics from `backend/models/metrics.json`.

Current metrics included in this project:

| Model | Accuracy | Precision | Recall | F1 Score |
| --- | ---: | ---: | ---: | ---: |
| Random Forest | 95.54% | 94.11% | 95.54% | 94.37% |
| XGBoost | 95.82% | 94.70% | 95.82% | 94.73% |

### `GET /explain`

Returns saved SHAP and LIME explanation data from `backend/results`.

Response shape:

```json
{
  "shap": [
    {
      "feature": "Dst Port",
      "importance": 0.8953
    }
  ],
  "lime": [
    {
      "feature": "SYN Flag Cnt <= -0.21",
      "impact": 0.0000019
    }
  ]
}
```

## Setup Requirements

Install these tools before running the project:

- Node.js 22 or a compatible modern Node.js version.
- npm.
- Python 3.11.
- pip.
- Docker and Docker Compose, if using the container workflow.

For local Python development, using a virtual environment is recommended.

## Running Locally

Open two terminals from the project root.

### 1. Start the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

On macOS or Linux, activate the virtual environment with:

```bash
source .venv/bin/activate
```

Confirm that the backend is running:

```bash
curl http://localhost:8000/health
```

FastAPI interactive documentation is available at:

```text
http://localhost:8000/docs
```

### 2. Start the frontend

```bash
npm install
npm run dev
```

Open the application:

```text
http://localhost:3000
```

## Running with Docker Compose

From the project root:

```bash
docker compose up --build
```

This starts:

- Backend on `http://localhost:8000`
- Frontend on `http://localhost:3000`

The Docker Compose file passes:

```text
VITE_API_URL=http://localhost:8000
IDS_ENABLE_RF=1
```

The frontend service uses a Node image, installs npm dependencies, and runs the Vite development server. The backend service builds from `backend/Dockerfile`.

## CSV Input Format

The prediction endpoint expects a CSV with the same CICFlowMeter feature columns used during model training. The authoritative column list is stored in:

```text
backend/models/features.pkl
```

Input rules:

- Column names are stripped of leading and trailing spaces.
- Extra columns are allowed and ignored.
- `Label`, `label`, `Attack`, and `attack` columns are automatically removed.
- Missing required feature columns cause a `422` response.
- Non-numeric values are coerced to missing values and then filled with `0`.
- Infinite values are replaced and filled with `0`.

A sample CSV is available at:

```text
backend/test_sample.csv
```

## Configuration

### Frontend Environment Variables

Create a `.env` file in the project root if you need to override the backend URL:

```text
VITE_API_URL=http://localhost:8000
```

An example is provided in `.env.example`.

### Backend Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `IDS_ENABLE_RF` | `1` | Set to `0` to skip loading `random_forest.pkl`. This is useful when memory is limited or the Random Forest artifact is unavailable. |

## Development Workflow

Useful frontend commands:

```bash
npm run dev
npm run build
npm run start
```

What they do:

- `npm run dev` starts the Vite dev server on `127.0.0.1:3000`.
- `npm run build` type-checks the project and creates a production build.
- `npm run start` previews the production build locally.

Useful backend commands:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

For notebook or explainability development that recomputes SHAP/LIME outputs:

```bash
cd backend
pip install -r requirements-xai-dev.txt
```

## Troubleshooting

### Backend health check fails

Make sure the backend is running:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Then visit:

```text
http://localhost:8000/health
```

### Frontend cannot reach the backend

Check that `VITE_API_URL` points to the backend:

```text
VITE_API_URL=http://localhost:8000
```

Also make sure the frontend is running on an origin allowed by the backend CORS settings, such as `http://localhost:3000` or `http://127.0.0.1:3000`.

### CSV upload returns `400`

The uploaded file may not be a valid CSV or may not have a `.csv` extension.

### CSV upload returns `422`

The CSV is missing required trained feature columns. Compare the CSV columns with the feature list stored in `backend/models/features.pkl`.

### Prediction is slow or memory usage is high

The Random Forest artifact can be large. Disable it when needed:

```bash
IDS_ENABLE_RF=0 uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

On Windows PowerShell:

```powershell
$env:IDS_ENABLE_RF="0"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### SHAP or LIME data does not appear

Confirm these files exist:

```text
backend/results/shap_importance.json
backend/results/lime_explanation.json
```

If they are missing, regenerate them from the explainability notebook and place the exported JSON files in `backend/results`.

## Deployment Notes

- Keep large model files out of normal source-control workflows when deploying to cloud environments.
- Mount model files into `backend/models` or upload them through object storage, a release artifact, or the hosting provider's file mechanism.
- Ensure `VITE_API_URL` points to the deployed backend URL before building the frontend.
- Update backend CORS origins if the deployed frontend uses a different domain.
- Consider disabling Random Forest with `IDS_ENABLE_RF=0` on memory-constrained servers.
- Use HTTPS and authentication before exposing the prediction API outside a trusted environment.

## Summary

Explainable AI IDS connects trained CICIDS2018 models to a working web application. It supports CSV inference, supervised attack classification, anomaly detection, saved model metrics, and explainability views, making the model outputs easier to inspect and present as a complete intrusion detection system.
