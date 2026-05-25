import { useNavigate } from "react-router-dom";
import { Download, CheckCircle2, XCircle } from "lucide-react";

const RESULTS = [
  { q: "What is gradient descent?", faithfulness: 0.95, recall: 0.92, precision: 0.90, relevancy: 0.96, pass: true },
  { q: "Explain backpropagation algorithm", faithfulness: 0.88, recall: 0.85, precision: 0.87, relevancy: 0.91, pass: true },
  { q: "What is overfitting?", faithfulness: 0.93, recall: 0.90, precision: 0.92, relevancy: 0.94, pass: true },
  { q: "Describe CNN architecture", faithfulness: 0.72, recall: 0.68, precision: 0.70, relevancy: 0.75, pass: false },
  { q: "What is transfer learning?", faithfulness: 0.91, recall: 0.88, precision: 0.89, relevancy: 0.93, pass: true },
];

const AVG = {
  faithfulness: (RESULTS.reduce((a, r) => a + r.faithfulness, 0) / RESULTS.length).toFixed(2),
  recall: (RESULTS.reduce((a, r) => a + r.recall, 0) / RESULTS.length).toFixed(2),
  precision: (RESULTS.reduce((a, r) => a + r.precision, 0) / RESULTS.length).toFixed(2),
  relevancy: (RESULTS.reduce((a, r) => a + r.relevancy, 0) / RESULTS.length).toFixed(2),
};

export default function RAGASResultPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">RAGAS Benchmark Results</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">Run #12 · May 26, 2026 · Testset_50QA_v1</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Average scores */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Faithfulness", value: AVG.faithfulness, color: "text-emerald-400" },
          { label: "Context Recall", value: AVG.recall, color: "text-blue-400" },
          { label: "Context Precision", value: AVG.precision, color: "text-purple-400" },
          { label: "Answer Relevancy", value: AVG.relevancy, color: "text-orange-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-panel border border-app-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{(value * 100).toFixed(0)}%</p>
            <p className="text-xs text-app opacity-50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Results table */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              <th className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium">Question</th>
              <th className="text-center px-3 py-3 text-xs text-app opacity-40 font-medium">Faith.</th>
              <th className="text-center px-3 py-3 text-xs text-app opacity-40 font-medium">Recall</th>
              <th className="text-center px-3 py-3 text-xs text-app opacity-40 font-medium">Prec.</th>
              <th className="text-center px-3 py-3 text-xs text-app opacity-40 font-medium">Relev.</th>
              <th className="text-center px-3 py-3 text-xs text-app opacity-40 font-medium">Pass</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {RESULTS.map((r, i) => (
              <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3 text-sm text-app max-w-xs truncate">{r.q}</td>
                {["faithfulness", "recall", "precision", "relevancy"].map((m) => (
                  <td key={m} className={`text-center px-3 py-3 text-sm font-medium ${r[m] >= 0.85 ? "text-emerald-400" : r[m] >= 0.75 ? "text-yellow-400" : "text-red-400"}`}>
                    {(r[m] * 100).toFixed(0)}%
                  </td>
                ))}
                <td className="text-center px-3 py-3">
                  {r.pass
                    ? <CheckCircle2 size={16} className="text-emerald-400 mx-auto" />
                    : <XCircle size={16} className="text-red-400 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
