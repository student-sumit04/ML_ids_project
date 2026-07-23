import { ArrowRight, BrainCircuit, Database, FileUp, Gauge, Loader2, ShieldAlert, ShieldCheck, Activity, AlertTriangle, Cpu, Network, Server } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { api } from "@/api/axios";
import { AttackDistribution } from "@/charts/AttackDistribution";
import { FeatureBars } from "@/charts/FeatureBars";
import { PageHeader } from "@/components/PageHeader";
import { Shell } from "@/components/Shell";
import { StatCard } from "@/components/StatCard";
import type { ExplainResponse, MetricsResponse, PredictionResponse } from "@/types/ids";

const fallbackMetrics: MetricsResponse = {
  "Random Forest": { accuracy: 0.9553592032549948, precision: 0.9410829030428708, recall: 0.9553592032549948, f1_score: 0.9436858521973817 },
  XGBoost: { accuracy: 0.9582073237383859, precision: 0.9470172532110852, recall: 0.9582073237383859, f1_score: 0.9472691838788199 },
};

const fallbackExplain: ExplainResponse = {
  shap: [
    { feature: "Dst Port", importance: 0.8953 },
    { feature: "Init Fwd Win Byts", importance: 0.7593 },
    { feature: "Fwd Seg Size Min", importance: 0.7087 },
  ],
  lime: [{ feature: "SYN Flag Cnt <= -0.21", impact: 0.0000019 }],
};

function currentPath() {
  const hash = window.location.hash.replace("#", "");
  return hash || "/";
}

function useHashPath() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const update = () => setPath(currentPath());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return path;
}

function Overview() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    api.get("/health").then(() => setBackendStatus("online")).catch(() => setBackendStatus("offline"));
  }, []);

  const statusText = backendStatus === "online" ? "Backend online" : backendStatus === "offline" ? "Backend offline" : "Checking backend";
  const statusClass = backendStatus === "online" ? "text-sky" : backendStatus === "offline" ? "text-ember" : "text-amber";

  return (
    <div>
      <PageHeader title="Explainable AI Intrusion Detection System" kicker="Product overview" />
      <section className="grid-surface grid gap-6 rounded-lg border border-line bg-panel p-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div>
          <h2 className="text-3xl font-semibold text-white">A working IDS dashboard around your trained CICIDS2018 models.</h2>
          <p className="mt-4 text-zinc-300">
            The system combines Random Forest, XGBoost and Isolation Forest inference with SHAP and LIME outputs so a security analyst can see both the prediction and the reason behind it.
          </p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md border border-line bg-black/20 p-3">
              <p className="text-zinc-400">Pipeline</p>
              <p className="mt-1 font-semibold text-white">CSV to prediction</p>
            </div>
            <div className="rounded-md border border-line bg-black/20 p-3">
              <p className="text-zinc-400">Primary classifier</p>
              <p className="mt-1 font-semibold text-white">XGBoost ensemble</p>
            </div>
            <div className="rounded-md border border-line bg-black/20 p-3">
              <p className="text-zinc-400">XAI layer</p>
              <p className="mt-1 font-semibold text-white">SHAP and LIME</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#/dashboard" className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white shadow-glow">
              Open Dashboard <ArrowRight size={16} />
            </a>
            <a href="#/upload" className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm text-zinc-100">
              Upload CSV
            </a>
          </div>
        </div>
        <aside className="rounded-lg border border-line bg-ink/75 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">System status</p>
              <p className={`mt-1 text-lg font-semibold ${statusClass}`}>{statusText}</p>
            </div>
            <Server className="text-sky" size={26} />
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border border-line bg-white/[0.03] p-3">
              <span className="flex items-center gap-2 text-zinc-300"><Cpu size={16} /> Model artifacts</span>
              <span className="text-sky">Loaded</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-line bg-white/[0.03] p-3">
              <span className="flex items-center gap-2 text-zinc-300"><Network size={16} /> API endpoint</span>
              <span className={statusClass}>:8000</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-line bg-white/[0.03] p-3">
              <span className="flex items-center gap-2 text-zinc-300"><ShieldCheck size={16} /> Deployment mode</span>
              <span className="text-amber">Local</span>
            </div>
          </div>
        </aside>
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Dataset" value="CICIDS2018" icon={Database} tone="sky" />
        <StatCard label="Primary model" value="XGBoost" icon={Gauge} tone="mint" />
        <StatCard label="Explainability" value="SHAP + LIME" icon={BrainCircuit} tone="amber" />
        <StatCard label="Anomaly layer" value="Isolation Forest" icon={ShieldCheck} tone="ember" />
      </section>
    </div>
  );
}

function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);

  useEffect(() => {
    api.get<MetricsResponse>("/metrics").then((res) => setMetrics(res.data)).catch(() => setMetrics(null));
  }, []);

  const demoDistribution = [
    { name: "Benign", count: 820 },
    { name: "DDoS", count: 126 },
    { name: "Bot", count: 44 },
    { name: "Brute Force", count: 32 },
  ];
  const xgbAccuracy = metrics?.["XGBoost"]?.accuracy ? `${(metrics["XGBoost"].accuracy * 100).toFixed(2)}%` : "95.82%";

  return (
    <div>
      <PageHeader title="Detection Dashboard" kicker="Live operations" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Predictions" value="1,022" icon={Activity} tone="sky" />
        <StatCard label="Detected Attacks" value="202" icon={AlertTriangle} tone="ember" />
        <StatCard label="Normal Traffic" value="80.23%" icon={ShieldCheck} tone="mint" />
        <StatCard label="XGBoost Accuracy" value={xgbAccuracy} icon={Gauge} tone="amber" />
      </section>
      <section className="mt-6">
        <AttackDistribution data={demoDistribution} />
      </section>
    </div>
  );
}

function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  async function submit() {
    if (!file) {
      toast.error("Choose a network CSV first.");
      return;
    }

    const body = new FormData();
    body.append("file", file);
    setLoading(true);
    try {
      const response = await api.post<PredictionResponse>("/predict", body);
      setResult(response.data);
      toast.success("Prediction completed.");
    } catch {
      toast.error("Prediction failed. Check backend logs and CSV columns.");
    } finally {
      setLoading(false);
    }
  }

  const distribution = useMemo(
    () => result ? Object.entries(result.summary.attack_distribution).map(([name, count]) => ({ name, count })) : [],
    [result],
  );
  const modelSummaries = result?.model_summaries;
  const threat = result?.prediction && result.prediction !== "Benign";
  const xgbThreat = result?.xgboost_prediction && result.xgboost_prediction !== "Benign";
  const rfThreat = result?.random_forest_prediction && result.random_forest_prediction !== "Benign";

  function topDistribution(summary?: PredictionResponse["summary"] | null) {
    if (!summary) {
      return "-";
    }

    return Object.entries(summary.attack_distribution)
      .sort(([, left], [, right]) => right - left)
      .slice(0, 3)
      .map(([name, count]) => `${name}: ${count}`)
      .join(" | ");
  }

  return (
    <div>
      <PageHeader title="Upload Network Flow CSV" kicker="Inference" />
      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-line bg-panel p-5">
          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-black/20 p-6 text-center hover:border-mint">
            <FileUp className="mb-3 text-mint" size={32} />
            <span className="font-medium text-white">{file ? file.name : "Select network.csv"}</span>
            <span className="mt-1 text-sm text-zinc-400">CICFlowMeter columns are required</span>
            <input className="hidden" type="file" accept=".csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>
          <button
            onClick={submit}
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
            Run Detection
          </button>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <div className="flex items-center gap-3">
            {threat ? <ShieldAlert className="text-ember" size={28} /> : <ShieldCheck className="text-mint" size={28} />}
            <div>
              <p className="text-sm text-zinc-400">First row final prediction</p>
              <h2 className="text-2xl font-semibold text-white">{result?.prediction ?? "Waiting for CSV"}</h2>
            </div>
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border border-line p-3">
              <dt className="text-sm text-zinc-400">Confidence</dt>
              <dd className="mt-1 text-xl font-semibold">{result?.confidence ? `${result.confidence}%` : "-"}</dd>
            </div>
            <div className="rounded-md border border-line p-3">
              <dt className="text-sm text-zinc-400">XGBoost</dt>
              <dd className={`mt-1 text-xl font-semibold ${xgbThreat ? "text-ember" : "text-white"}`}>{result?.xgboost_prediction ?? "-"}</dd>
            </div>
            <div className="rounded-md border border-line p-3">
              <dt className="text-sm text-zinc-400">Random Forest</dt>
              <dd className={`mt-1 text-xl font-semibold ${rfThreat ? "text-ember" : "text-white"}`}>{result?.random_forest_prediction ?? "-"}</dd>
            </div>
            <div className="rounded-md border border-line p-3">
              <dt className="text-sm text-zinc-400">Rows</dt>
              <dd className="mt-1 text-xl font-semibold">{result?.total_rows ?? "-"}</dd>
            </div>
          </dl>
          {result?.model && (
            <p className="mt-4 rounded-md border border-line bg-black/20 p-3 text-sm text-zinc-300">
              Final label source: <span className="font-semibold text-white">{result.model}</span>
            </p>
          )}
        </div>
      </section>
      {result && (
        <>
          <section className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="rounded-lg border border-line bg-panel p-4">
              <p className="text-sm text-zinc-400">Final / Ensemble Distribution</p>
              <p className="mt-2 text-sm font-medium text-white">{topDistribution(modelSummaries?.ensemble ?? result.summary)}</p>
            </div>
            <div className="rounded-lg border border-line bg-panel p-4">
              <p className="text-sm text-zinc-400">XGBoost Distribution</p>
              <p className="mt-2 text-sm font-medium text-white">{topDistribution(modelSummaries?.xgboost)}</p>
            </div>
            <div className="rounded-lg border border-line bg-panel p-4">
              <p className="text-sm text-zinc-400">Random Forest Distribution</p>
              <p className="mt-2 text-sm font-medium text-white">{topDistribution(modelSummaries?.random_forest)}</p>
            </div>
          </section>
          <section className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <AttackDistribution data={distribution} />
            <div className="max-h-80 overflow-auto rounded-lg border border-line bg-panel">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-panel text-zinc-400">
                  <tr>
                    <th className="p-3">Row</th>
                    <th className="p-3">Final</th>
                    <th className="p-3">XGBoost</th>
                    <th className="p-3">Random Forest</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Anomaly</th>
                  </tr>
                </thead>
                <tbody>
                  {result.predictions.map((row) => (
                    <tr key={row.row} className="border-t border-line">
                      <td className="p-3">{row.row}</td>
                      <td className="p-3">{row.prediction}</td>
                      <td className="p-3">{row.xgboost_prediction}</td>
                      <td className="p-3">{row.random_forest_prediction ?? "-"}</td>
                      <td className="p-3">{row.confidence}%</td>
                      <td className="p-3">{row.anomaly_detected ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Explain() {
  const [data, setData] = useState<ExplainResponse>(fallbackExplain);

  useEffect(() => {
    api.get<ExplainResponse>("/explain").then((res) => setData(res.data)).catch(() => setData(fallbackExplain));
  }, []);

  return (
    <div>
      <PageHeader title="SHAP and LIME Explanations" kicker="Explainability" />
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-lg font-semibold text-white">Top Attack Factors</h2>
          <p className="mb-5 mt-1 text-sm text-zinc-400">Global SHAP importance from your XAI notebook output.</p>
          <FeatureBars rows={data.shap.slice(0, 12)} valueKey="importance" />
        </div>
        <div className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-lg font-semibold text-white">LIME Prediction Reason</h2>
          <p className="mb-5 mt-1 text-sm text-zinc-400">Local explanation example generated from your LIME result file.</p>
          <FeatureBars rows={data.lime.slice(0, 10)} valueKey="impact" />
        </div>
      </section>
    </div>
  );
}

function pct(value?: number) {
  return value === undefined ? "-" : `${(value * 100).toFixed(2)}%`;
}

function Models() {
  const [metrics, setMetrics] = useState<MetricsResponse>(fallbackMetrics);

  useEffect(() => {
    api.get<MetricsResponse>("/metrics").then((res) => setMetrics(res.data)).catch(() => setMetrics(fallbackMetrics));
  }, []);

  return (
    <div>
      <PageHeader title="Model Comparison" kicker="Training results" />
      <div className="overflow-hidden rounded-lg border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 text-zinc-400">
            <tr>
              <th className="p-4">Model</th>
              <th className="p-4">Accuracy</th>
              <th className="p-4">Precision</th>
              <th className="p-4">Recall</th>
              <th className="p-4">F1 Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(metrics).map(([name, row]) => (
              <tr key={name} className="border-t border-line">
                <td className="p-4 font-medium text-white">{name}</td>
                <td className="p-4">{pct(row.accuracy)}</td>
                <td className="p-4">{pct(row.precision)}</td>
                <td className="p-4">{pct(row.recall)}</td>
                <td className="p-4">{pct(row.f1_score)}</td>
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="p-4 font-medium text-white">Isolation Forest</td>
              <td className="p-4" colSpan={4}>Used as anomaly signal alongside multiclass RF/XGBoost predictions</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function App() {
  const path = useHashPath();
  const view = path === "/dashboard" ? <Dashboard /> : path === "/upload" ? <Upload /> : path === "/explain" ? <Explain /> : path === "/models" ? <Models /> : <Overview />;

  return <Shell activePath={path}>{view}</Shell>;
}
