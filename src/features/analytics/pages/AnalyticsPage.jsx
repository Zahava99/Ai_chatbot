const BAR_DATA = [
  { label: "Mon", questions: 42, accuracy: 91 },
  { label: "Tue", questions: 68, accuracy: 93 },
  { label: "Wed", questions: 55, accuracy: 89 },
  { label: "Thu", questions: 80, accuracy: 95 },
  { label: "Fri", questions: 72, accuracy: 92 },
  { label: "Sat", questions: 30, accuracy: 88 },
  { label: "Sun", questions: 25, accuracy: 90 },
];

const RADAR_METRICS = [
  { label: "Faithfulness", value: 92 },
  { label: "Recall", value: 87 },
  { label: "Precision", value: 89 },
  { label: "Relevancy", value: 95 },
  { label: "Latency", value: 78 },
  { label: "Coverage", value: 84 },
];

const HEATMAP_SUBJECTS = ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Algorithms"];
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getHeatColor(v) {
  if (v > 80) return "bg-emerald-500";
  if (v > 60) return "bg-emerald-400/70";
  if (v > 40) return "bg-emerald-300/50";
  if (v > 20) return "bg-emerald-200/30";
  return "bg-black/10 dark:bg-white/5";
}

export default function AnalyticsPage() {
  const maxQ = Math.max(...BAR_DATA.map((d) => d.questions));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Analytics</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Usage and performance visualization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart — questions per day */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-5">Questions per Day (this week)</p>
          <div className="flex items-end gap-2 h-36">
            {BAR_DATA.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-app opacity-40">{d.questions}</span>
                <div
                  className="w-full rounded-t-md bg-emerald-400/70 hover:bg-emerald-400 transition-colors"
                  style={{ height: `${(d.questions / maxQ) * 100}%` }}
                />
                <span className="text-xs text-app opacity-40">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart — RAGAS metrics (CSS approximation) */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-4">RAGAS Radar</p>
          <div className="flex flex-col gap-2.5">
            {RADAR_METRICS.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-app opacity-50 w-24 shrink-0">{label}</span>
                <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-400" style={{ width: `${value}%` }} />
                </div>
                <span className="text-xs text-purple-400 font-medium w-8 text-right">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap — activity by subject × day */}
      <div className="bg-panel border border-app-border rounded-xl p-5">
        <p className="text-sm font-semibold text-app mb-4">Activity Heatmap (Questions by Subject)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left pr-4 py-1 text-app opacity-40 font-medium w-36">Subject</th>
                {HEATMAP_DAYS.map((d) => (
                  <th key={d} className="text-center px-1 py-1 text-app opacity-40 font-medium">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEATMAP_SUBJECTS.map((subj) => (
                <tr key={subj}>
                  <td className="pr-4 py-1 text-app opacity-60 text-xs">{subj}</td>
                  {HEATMAP_DAYS.map((d) => {
                    const v = Math.floor(Math.random() * 100);
                    return (
                      <td key={d} className="px-1 py-1">
                        <div
                          className={`w-7 h-7 rounded-md ${getHeatColor(v)} mx-auto`}
                          title={`${v} questions`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-app opacity-30">Less</span>
            {[5, 25, 50, 75, 90].map((v) => (
              <div key={v} className={`w-4 h-4 rounded-sm ${getHeatColor(v)}`} />
            ))}
            <span className="text-xs text-app opacity-30">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
