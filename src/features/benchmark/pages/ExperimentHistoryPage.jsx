import { useNavigate } from "react-router-dom";
import { Download, Eye, ChevronRight } from "lucide-react";

const RUNS = [
  { id: 12, date: "May 26, 2026", dataset: "Testset_50QA_v1", model: "multilingual-e5-base", chunk: "Semantic", faithfulness: 92, recall: 87, status: "completed" },
  { id: 11, date: "May 24, 2026", dataset: "Testset_50QA_v1", model: "bge-m3", chunk: "Fixed", faithfulness: 90, recall: 85, status: "completed" },
  { id: 10, date: "May 22, 2026", dataset: "Testset_50QA_v2", model: "PhoBERT", chunk: "Recursive", faithfulness: 84, recall: 80, status: "completed" },
  { id: 9,  date: "May 20, 2026", dataset: "Testset_50QA_v1", model: "OpenAI embedding", chunk: "Semantic", faithfulness: 96, recall: 93, status: "completed" },
  { id: 8,  date: "May 18, 2026", dataset: "Testset_50QA_v1", model: "multilingual-e5-base", chunk: "Fixed", faithfulness: 88, recall: 82, status: "failed" },
];

export default function ExperimentHistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Experiment History</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">{RUNS.length} benchmark runs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">
          <Download size={14} /> Export All CSV
        </button>
      </div>

      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              {["Run", "Date", "Dataset", "Embedding Model", "Chunk", "Faithfulness", "Recall", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-app opacity-40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {RUNS.map((r) => (
              <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                <td className="px-4 py-3 text-sm font-mono text-app opacity-60">#{r.id}</td>
                <td className="px-4 py-3 text-sm text-app opacity-60">{r.date}</td>
                <td className="px-4 py-3 text-sm text-app opacity-70">{r.dataset}</td>
                <td className="px-4 py-3 text-sm text-app opacity-70">{r.model}</td>
                <td className="px-4 py-3 text-sm text-app opacity-60">{r.chunk}</td>
                <td className="px-4 py-3 text-sm font-medium text-emerald-400">{r.faithfulness}%</td>
                <td className="px-4 py-3 text-sm font-medium text-blue-400">{r.recall}%</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "completed" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigate("/benchmark/results")}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-app opacity-50 hover:opacity-100 transition-all"
                  >
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
