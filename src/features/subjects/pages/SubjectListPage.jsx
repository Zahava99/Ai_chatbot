import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, FileText, MessageSquare, MoreVertical } from "lucide-react";

const SUBJECTS = [
  { id: 1, name: "Machine Learning", desc: "Supervised, unsupervised, and reinforcement learning", docs: 8, chats: 142, color: "bg-blue-500/10 text-blue-400", emoji: "🤖" },
  { id: 2, name: "Deep Learning", desc: "Neural networks, CNNs, RNNs, Transformers", docs: 5, chats: 89, color: "bg-purple-500/10 text-purple-400", emoji: "🧠" },
  { id: 3, name: "NLP", desc: "Natural language processing and text analysis", docs: 4, chats: 67, color: "bg-emerald-500/10 text-emerald-400", emoji: "💬" },
  { id: 4, name: "Computer Vision", desc: "Image recognition, object detection, segmentation", docs: 3, chats: 45, color: "bg-orange-500/10 text-orange-400", emoji: "👁️" },
  { id: 5, name: "Algorithms", desc: "Data structures, sorting, graph algorithms", docs: 4, chats: 98, color: "bg-red-500/10 text-red-400", emoji: "⚡" },
];

export default function SubjectListPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Môn học</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">{SUBJECTS.length} subjects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} /> New Subject
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {SUBJECTS.map((s) => (
          <div
            key={s.id}
            onClick={() => navigate(`/subjects/${s.id}`)}
            className="bg-panel border border-app-border rounded-xl p-5 hover:border-black/25 dark:hover:border-white/25 cursor-pointer transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center text-xl`}>
                {s.emoji}
              </div>
              <button
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-app opacity-40 hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              >
                <MoreVertical size={15} />
              </button>
            </div>
            <h3 className="text-base font-semibold text-app mb-1">{s.name}</h3>
            <p className="text-xs text-app opacity-50 leading-snug mb-4">{s.desc}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-app opacity-50">
                <FileText size={13} />
                <span>{s.docs} docs</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-app opacity-50">
                <MessageSquare size={13} />
                <span>{s.chats} chats</span>
              </div>
            </div>
          </div>
        ))}

        {/* Create card */}
        <button
          onClick={() => setShowCreate(true)}
          className="border-2 border-dashed border-app-border rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all group min-h-[180px]"
        >
          <div className="w-10 h-10 rounded-full border-2 border-app-border group-hover:border-black/40 dark:group-hover:border-white/60 flex items-center justify-center transition-colors">
            <Plus size={18} className="text-app opacity-50 group-hover:opacity-80" />
          </div>
          <span className="text-sm text-app opacity-50 group-hover:opacity-80 transition-colors">Create new subject</span>
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-semibold text-app mb-4">Create Subject</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Subject Name</label>
                <input placeholder="e.g. Machine Learning" className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Brief description..." className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">Cancel</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
