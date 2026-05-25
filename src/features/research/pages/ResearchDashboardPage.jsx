import { useNavigate } from "react-router-dom";
import { FlaskConical, BarChart3, Target, TrendingUp, Zap, ArrowRight } from "lucide-react";

const METRICS = [
  { label: "Faithfulness", value: 92, color: "bg-emerald-400", textColor: "text-emerald-400" },
  { label: "Context Recall", value: 87, color: "bg-blue-400", textColor: "text-blue-400" },
  { label: "Context Precision", value: 89, color: "bg-purple-400", textColor: "text-purple-400" },
  { label: "Answer Relevancy", value: 95, color: "bg-orange-400", textColor: "text-orange-400" },
];

const QUICK_LINKS = [
  { label: "Benchmark Config", desc: "Setup a new benchmark run", to: "/benchmark", icon: BarChart3, color: "bg-blue-500/10 text-blue-400" },
  { label: "Embedding Comparison", desc: "Compare embedding models", to: "/benchmark/embeddings", icon: Zap, color: "bg-purple-500/10 text-purple-400" },
  { label: "Chunk Strategy", desc: "Compare chunking strategies", to: "/benchmark/chunks", icon: Target, color: "bg-emerald-500/10 text-emerald-400" },
  { label: "Experiment History", desc: "View past benchmark runs", to: "/benchmark/history", icon: TrendingUp, color: "bg-orange-500/10 text-orange-400" },
];

export default function ResearchDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Research Lab</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">RAG evaluation and benchmarking dashboard</p>
      </div>

      {/* RAGAS metrics */}
      <div className="bg-panel border border-app-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-app">Latest RAGAS Scores</p>
          <span className="text-xs text-app opacity-40">Run #12 · May 26, 2026</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {METRICS.map(({ label, value, textColor }) => (
            <div key={label} className="text-center">
              <div className={`text-3xl font-bold ${textColor}`}>{value}%</div>
              <div className="text-xs text-app opacity-50 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="flex flex-col gap-3">
          {METRICS.map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-app opacity-50 w-36 shrink-0">{label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-700`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-xs text-app opacity-60 w-8 text-right shrink-0">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUICK_LINKS.map(({ label, desc, to, icon: Icon, color }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="flex items-center gap-4 bg-panel border border-app-border rounded-xl p-4 hover:border-black/25 dark:hover:border-white/25 transition-all group text-left"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-app">{label}</p>
              <p className="text-xs text-app opacity-50 mt-0.5">{desc}</p>
            </div>
            <ArrowRight size={15} className="text-app opacity-20 group-hover:opacity-60 transition-opacity shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
