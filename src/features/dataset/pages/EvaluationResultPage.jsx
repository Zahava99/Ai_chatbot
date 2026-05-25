import { CheckCircle2, XCircle, AlertCircle, Download } from "lucide-react";

const RESULTS = [
  { id: 1, question: "What is gradient descent?", score: 0.95, correct: true, reason: null },
  { id: 2, question: "Explain backpropagation algorithm.", score: 0.88, correct: true, reason: null },
  { id: 3, question: "What is the difference between CNN and RNN?", score: 0.72, correct: false, reason: "Answer lacked detail on RNN sequential processing" },
  { id: 4, question: "Describe the transformer architecture.", score: 0.91, correct: true, reason: null },
  { id: 5, question: "What is transfer learning?", score: 0.65, correct: false, reason: "Source document not found in retrieval context" },
  { id: 6, question: "Explain the concept of overfitting.", score: 0.93, correct: true, reason: null },
  { id: 7, question: "What is the bias-variance tradeoff?", score: 0.89, correct: true, reason: null },
  { id: 8, question: "How does attention mechanism work?", score: 0.78, correct: false, reason: "Partial answer — missing multi-head attention explanation" },
];

const passed = RESULTS.filter((r) => r.correct).length;
const avgScore = (RESULTS.reduce((a, r) => a + r.score, 0) / RESULTS.length * 100).toFixed(1);

export default function EvaluationResultPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Evaluation Results</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">Testset_50QA_v1 · Run #12</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-panel border border-app-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{passed}/{RESULTS.length}</p>
          <p className="text-xs text-app opacity-50 mt-1">Correct Answers</p>
        </div>
        <div className="bg-panel border border-app-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{avgScore}%</p>
          <p className="text-xs text-app opacity-50 mt-1">Average Score</p>
        </div>
        <div className="bg-panel border border-app-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{RESULTS.length - passed}</p>
          <p className="text-xs text-app opacity-50 mt-1">Failed</p>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              <th className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium">#</th>
              <th className="text-left px-4 py-3 text-xs text-app opacity-40 font-medium">Question</th>
              <th className="text-center px-4 py-3 text-xs text-app opacity-40 font-medium">Score</th>
              <th className="text-center px-4 py-3 text-xs text-app opacity-40 font-medium">Result</th>
              <th className="text-left px-4 py-3 text-xs text-app opacity-40 font-medium">Failure Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {RESULTS.map((r) => (
              <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3 text-xs text-app opacity-30 font-mono">{r.id}</td>
                <td className="px-4 py-3 text-sm text-app max-w-xs">{r.question}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-medium ${r.score >= 0.85 ? "text-emerald-400" : r.score >= 0.75 ? "text-yellow-400" : "text-red-400"}`}>
                    {(r.score * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {r.correct
                    ? <CheckCircle2 size={16} className="text-emerald-400 mx-auto" />
                    : <XCircle size={16} className="text-red-400 mx-auto" />}
                </td>
                <td className="px-4 py-3">
                  {r.reason ? (
                    <div className="flex items-start gap-1.5">
                      <AlertCircle size={13} className="text-yellow-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-app opacity-50">{r.reason}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-app opacity-20">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
