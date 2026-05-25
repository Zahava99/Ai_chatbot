import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, Sparkles, Search } from "lucide-react";

const INITIAL_QA = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  question: [
    "What is gradient descent?",
    "Explain the backpropagation algorithm.",
    "What is the difference between CNN and RNN?",
    "Describe the transformer architecture.",
    "What is transfer learning?",
    "Explain the concept of overfitting.",
    "What is the bias-variance tradeoff?",
    "How does attention mechanism work?",
  ][i],
  groundTruth: "Expected answer for this question based on the source documents...",
  expectedSource: `Lecture_0${(i % 3) + 1}.pdf`,
}));

export default function TestsetManagementPage() {
  const navigate = useNavigate();
  const [qaList, setQaList] = useState(INITIAL_QA);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newQ, setNewQ] = useState({ question: "", groundTruth: "", expectedSource: "" });

  const filtered = qaList.filter((q) =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  function addQA() {
    if (!newQ.question.trim()) return;
    setQaList((prev) => [...prev, { id: Date.now(), ...newQ }]);
    setNewQ({ question: "", groundTruth: "", expectedSource: "" });
    setShowCreate(false);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Testset Management</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">{qaList.length} / 50 QA pairs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dataset/evaluation")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors"
          >
            View Results
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            <Plus size={15} /> Add QA Pair
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-panel border border-app-border rounded-xl p-4 mb-5">
        <div className="flex justify-between text-xs text-app opacity-50 mb-2">
          <span>Dataset completion</span>
          <span>{qaList.length} / 50</span>
        </div>
        <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${(qaList.length / 50) * 100}%` }} />
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 mb-4">
        <Search size={15} className="text-app opacity-40 shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none" />
      </div>

      {/* Table */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              <th className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium w-8">#</th>
              <th className="text-left px-4 py-3 text-xs text-app opacity-40 font-medium">Question</th>
              <th className="text-left px-4 py-3 text-xs text-app opacity-40 font-medium">Ground Truth</th>
              <th className="text-left px-4 py-3 text-xs text-app opacity-40 font-medium">Expected Source</th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {filtered.map((qa) => (
              <tr key={qa.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                <td className="px-5 py-3 text-xs text-app opacity-30 font-mono">{qa.id}</td>
                <td className="px-4 py-3 text-sm text-app max-w-xs">{qa.question}</td>
                <td className="px-4 py-3 text-xs text-app opacity-50 max-w-xs truncate">{qa.groundTruth}</td>
                <td className="px-4 py-3 text-xs text-emerald-400">{qa.expectedSource}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => setQaList((prev) => prev.filter((x) => x.id !== qa.id))}
                      className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-base font-semibold text-app mb-4">Add QA Pair</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Question</label>
                <input value={newQ.question} onChange={(e) => setNewQ({ ...newQ, question: e.target.value })} placeholder="Enter question..." className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Ground Truth Answer</label>
                <textarea rows={3} value={newQ.groundTruth} onChange={(e) => setNewQ({ ...newQ, groundTruth: e.target.value })} placeholder="Expected answer..." className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition resize-none" />
              </div>
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Expected Source</label>
                <input value={newQ.expectedSource} onChange={(e) => setNewQ({ ...newQ, expectedSource: e.target.value })} placeholder="e.g. Lecture_01.pdf" className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition" />
              </div>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm hover:bg-emerald-500/10 transition-colors">
                <Sparkles size={14} /> AI Generate Suggestion
              </button>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">Cancel</button>
              <button onClick={addQA} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
