export type Metric = {
  accuracy: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
};

export type MetricsResponse = Record<string, Metric>;

export type ExplainResponse = {
  shap: Array<{ feature: string; importance: number }>;
  lime: Array<{ feature: string; impact: number }>;
};

export type PredictionRow = {
  row: number;
  prediction: string;
  confidence: number;
  model: string;
  xgboost_prediction: string;
  random_forest_prediction: string | null;
  anomaly_detected: boolean;
  anomaly_score: number;
};

export type PredictionSummary = {
  total_predictions: number;
  detected_attacks: number;
  normal_traffic_percentage: number;
  attack_distribution: Record<string, number>;
};

export type PredictionResponse = {
  filename: string;
  prediction: string | null;
  confidence: number | null;
  model: string | null;
  xgboost_prediction?: string | null;
  random_forest_prediction?: string | null;
  total_rows: number;
  summary: PredictionSummary;
  model_summaries?: {
    ensemble: PredictionSummary;
    xgboost: PredictionSummary;
    random_forest: PredictionSummary | null;
  };
  predictions: PredictionRow[];
  warnings: string[];
};
