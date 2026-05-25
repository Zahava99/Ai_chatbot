import { BarChart3 } from "lucide-react";

const MODELS = [
  { name: "multilingual-e5-base", faithfulness: 92, recall: 87, precision: 89, relevancy: 95, latency: 1.2 },
  { name: "bge-m3",               faithfulness: 90, recall: 85, precision: 91, relevancy: 93, latency: 1.5 },
  { name: "PhoBERT",              faithfulness: 84, recall: 80, precision: 83, relevancy: 88, latency: 0.9 },
  { name: "OpenAI embedding",     faithfulness: 96, recall: 93, precision: 94, relevancy: 97, latency: 2.1 },
];

const METRICS = ["faithfulness", "recall", "precision", "relevancy"];
const COLORS = ["bg-emerald-400", "bg-blue-400", "bg-purple-400", "bg-orange-400"];
const TEXT_COLORS = ["text-emerald-400", "text-blue-400", "text-purple-400", "text-orange-400"];

export default function EmbeddingComparisonPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Embedding Model Comparison</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">RAGAS metrics across different embedding models</p>
      </div>

      {/* Grouped bar chart simulation */}
      <div className="bg-panel border border-app-border rounded-xl p-5 mb-6">
        <p className="text-sm font-semibold text-app mb-5">Metrics Comparison</p>
        <div className="flex flex-col gap-6">
          {METRICS.map((metric) => (
            <div key={metric}>
              <p className="text-xs text-app opacity-50 capitalize mb-2">{metric}</p>
              <div className="flex flex-col gap-1.5">
                {MODELS.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className="text-xs text-app opacity-50 w-44 truncate shrink-0">{m.name}</span>
                    <div className="flex-1 h-5 rounded-md bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-md ${COLORS[i]} flex items-center justify-end pr-2 transition-all duration-700`}
                        style={{ width: `${m[metric]}%` }}
                      >
                        <span className="text-xs text-white font-medium">{m[metric]}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              <th className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium">Model</th>
              {METRICS.map((m) => (
                <th key={m} className="text-center px-4 py-3 text-xs text-app opacity-40 font-medium capitalize">{m}</th>
              ))}
              <th className="text-center px-4 py-3 text-xs text-app opacity-40 font-medium">Latency (s)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {MODELS.map((m, i) => (
              <tr key={m.name} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${COLORS[i]}`} />
                    <span className="text-sm font-medium text-app">{m.name}</span>
                  </div>
                </td>
                {METRICS.map((metric) => (
                  <td key={metric} className={`text-center px-4 py-3 text-sm font-medium ${TEXT_COLORS[i]}`}>
                    {m[metric]}%
                  </td>
                ))}
                <td className="text-center px-4 py-3 text-sm text-app opacity-60">{m.latency}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
