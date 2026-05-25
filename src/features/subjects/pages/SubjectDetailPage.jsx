import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, FileText, Plus, Trash2, MessageSquare, Target, TrendingUp } from "lucide-react";

const SUBJECT = {
  id: 1,
  name: "Machine Learning",
  desc: "Supervised, unsupervised, and reinforcement learning",
  emoji: "🤖",
  docs: [
    { id: 1, name: "Lecture_01.pdf", chunks: 48, status: "indexed" },
    { id: 6, name: "Lab_Report.pdf", chunks: 18, status: "indexed" },
    { id: 7, name: "Midterm_Notes.pdf", chunks: 32, status: "indexed" },
  ],
  stats: { totalChats: 142, accuracy: "91.2%", avgResponse: "1.4s" },
};

export default function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [docs, setDocs] = useState(SUBJECT.docs);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-app opacity-40 mb-5">
        <button onClick={() => navigate("/subjects")} className="hover:opacity-80">Môn học</button>
        <ChevronRight size={12} />
        <span className="text-app opacity-70">{SUBJECT.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl">
          {SUBJECT.emoji}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-app">{SUBJECT.name}</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">{SUBJECT.desc}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: MessageSquare, label: "Total Chats", value: SUBJECT.stats.totalChats, color: "text-emerald-400 bg-emerald-500/10" },
          { icon: Target, label: "Accuracy", value: SUBJECT.stats.accuracy, color: "text-purple-400 bg-purple-500/10" },
          { icon: TrendingUp, label: "Avg Response", value: SUBJECT.stats.avgResponse, color: "text-blue-400 bg-blue-500/10" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-panel border border-app-border rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon size={16} />
            </div>
            <p className="text-lg font-bold text-app">{value}</p>
            <p className="text-xs text-app opacity-50">{label}</p>
          </div>
        ))}
      </div>

      {/* Documents */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <p className="text-sm font-semibold text-app">Assigned Documents ({docs.length})</p>
          <button
            onClick={() => navigate("/documents/upload")}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
          >
            <Plus size={13} /> Add document
          </button>
        </div>
        <div className="divide-y divide-app-border">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <FileText size={15} className="text-app opacity-40 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-app">{doc.name}</p>
                <p className="text-xs text-app opacity-40">{doc.chunks} chunks · {doc.status}</p>
              </div>
              <button
                onClick={() => setDocs((d) => d.filter((x) => x.id !== doc.id))}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
