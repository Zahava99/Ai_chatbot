const COMPARISON = [
  { metric: "Accuracy",  rag: 92, finetuned: 89, unit: "%" },
  { metric: "Latency",   rag: 1.4, finetuned: 0.6, unit: "s", lowerBetter: true },
  { metric: "Cost/1K Q", rag: 0.12, finetuned: 0.04, unit: "$", lowerBetter: true },
  { metric: "Faithfulness", rag: 94, finetuned: 78, unit: "%" },
  { metric: "Hallucination Rate", rag: 3, finetuned: 14, unit: "%", lowerBetter: true },
];

export default function FineTunedVsRAGPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Fine-tuned vs RAG</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Head-to-head comparison of model approaches</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-5">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" /><span className="text-sm text-app opacity-60">RAG (multilingual-e5-base)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400" /><span className="text-sm text-app opacity-60">Fine-tuned (PhoBERT)</span></div>
      </div>

      {/* Comparison bars */}
      <div className="bg-panel border border-app-border rounded-xl p-5 mb-6 flex flex-col gap-6">
        {COMPARISON.map(({ metric, rag, finetuned, unit, lowerBetter }) => {
          const ragWins = lowerBetter ? rag <= finetuned : rag >= finetuned;
          const max = Math.max(rag, finetuned) * 1.1;
          return (
            <div key={metric}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-app">{metric}</span>
                {lowerBetter && <span className="text-xs text-app opacity-30">lower is better</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-app opacity-50 w-20 shrink-0">RAG</span>
                  <div className="flex-1 h-5 rounded-md bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-md flex items-center justify-end pr-2 ${ragWins ? "bg-emerald-400" : "bg-emerald-400/50"}`}
                      style={{ width: `${(rag / max) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{rag}{unit}</span>
                    </div>
                  </div>
                  {ragWins && <span className="text-xs text-emerald-400 shrink-0">✓ Better</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-app opacity-50 w-20 shrink-0">Fine-tuned</span>
                  <div className="flex-1 h-5 rounded-md bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-md flex items-center justify-end pr-2 ${!ragWins ? "bg-blue-400" : "bg-blue-400/50"}`}
                      style={{ width: `${(finetuned / max) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{finetuned}{unit}</span>
                    </div>
                  </div>
                  {!ragWins && <span className="text-xs text-blue-400 shrink-0">✓ Better</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-emerald-400 mb-2">RAG Advantages</p>
          <ul className="text-xs text-app opacity-60 space-y-1">
            <li>• Higher accuracy on domain-specific Q&A</li>
            <li>• Better faithfulness to source documents</li>
            <li>• Lower hallucination rate</li>
            <li>• No retraining needed for new documents</li>
          </ul>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-400 mb-2">Fine-tuned Advantages</p>
          <ul className="text-xs text-app opacity-60 space-y-1">
            <li>• Lower latency per query</li>
            <li>• Lower cost at scale</li>
            <li>• Better for fixed knowledge domains</li>
            <li>• No retrieval overhead</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
