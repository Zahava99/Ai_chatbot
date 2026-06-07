const STRATEGIES = [
  { name: "Fixed chunk",     faithfulness: 88, recall: 82, precision: 85, relevancy: 90, avgTokens: 512, chunks: 48 },
  { name: "Semantic chunk",  faithfulness: 93, recall: 89, precision: 91, relevancy: 94, avgTokens: 380, chunks: 62 },
  { name: "Recursive chunk", faithfulness: 91, recall: 87, precision: 90, relevancy: 93, avgTokens: 445, chunks: 55 },
];

const METRICS = ["faithfulness", "recall", "precision", "relevancy"];
const COLORS = ["bg-blue-400", "bg-emerald-400", "bg-purple-400"];
const TEXT_COLORS = ["text-blue-400", "text-emerald-400", "text-purple-400"];

export default function ChunkStrategyPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Chunk Strategy Comparison</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Compare Fixed, Semantic, and Recursive chunking</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {STRATEGIES.map((s, i) => (
          <div key={s.name} className="bg-panel border border-app-border rounded-xl p-5">
            <div className={`w-2 h-2 rounded-full ${COLORS[i]} mb-3`} />
            <p className="text-base font-semibold text-app mb-1">{s.name}</p>
            <p className="text-xs text-app opacity-40 mb-4">Avg {s.avgTokens} tokens · {s.chunks} chunks</p>
            <div className="flex flex-col gap-2">
              {METRICS.map((m) => (
                <div key={m} className="flex items-center gap-2">
                  <span className="text-xs text-app opacity-50 w-20 capitalize">{m}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${COLORS[i]}`} style={{ width: `${s[m]}%` }} />
                  </div>
                  <span className={`text-xs font-medium ${TEXT_COLORS[i]} w-8 text-right`}>{s[m]}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              <th className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium">Strategy</th>
              {METRICS.map((m) => (
                <th key={m} className="text-center px-4 py-3 text-xs text-app opacity-40 font-medium capitalize">{m}</th>
              ))}
              <th className="text-center px-4 py-3 text-xs text-app opacity-40 font-medium">Avg Tokens</th>
              <th className="text-center px-4 py-3 text-xs text-app opacity-40 font-medium">Chunks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {STRATEGIES.map((s, i) => (
              <tr key={s.name} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${COLORS[i]}`} />
                    <span className="text-sm font-medium text-app">{s.name}</span>
                  </div>
                </td>
                {METRICS.map((m) => (
                  <td key={m} className={`text-center px-4 py-3 text-sm font-medium ${TEXT_COLORS[i]}`}>{s[m]}%</td>
                ))}
                <td className="text-center px-4 py-3 text-sm text-app opacity-60">{s.avgTokens}</td>
                <td className="text-center px-4 py-3 text-sm text-app opacity-60">{s.chunks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
