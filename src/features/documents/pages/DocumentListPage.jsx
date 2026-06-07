import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Search, LayoutGrid, List, Upload, Filter,
  ChevronDown, MoreVertical, Eye, Trash2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOCS = [
  { id: 1, name: "Lecture_01.pdf", subject: "Machine Learning", size: "2.4 MB", chunks: 48, model: "multilingual-e5-base", status: "indexed", date: "May 26, 2026" },
  { id: 2, name: "Chapter_3.docx", subject: "Deep Learning", size: "1.1 MB", chunks: 22, model: "multilingual-e5-base", status: "indexed", date: "May 25, 2026" },
  { id: 3, name: "Slides_Week5.pptx", subject: "NLP", size: "5.8 MB", chunks: 0, model: "—", status: "processing", date: "May 25, 2026" },
  { id: 4, name: "Research_Paper.pdf", subject: "Computer Vision", size: "3.2 MB", chunks: 0, model: "—", status: "error", date: "May 24, 2026" },
  { id: 5, name: "Textbook_Ch7.pdf", subject: "Algorithms", size: "8.1 MB", chunks: 134, model: "bge-m3", status: "indexed", date: "May 23, 2026" },
  { id: 6, name: "Lab_Report.pdf", subject: "Machine Learning", size: "0.9 MB", chunks: 18, model: "multilingual-e5-base", status: "indexed", date: "May 22, 2026" },
];

const STATUS_STYLES = {
  indexed: "text-emerald-400 bg-emerald-500/10",
  processing: "text-yellow-400 bg-yellow-500/10",
  error: "text-red-400 bg-red-500/10",
};

function DocMenu({ onView, onReindex, onDelete }) {
  return (
    <div className="absolute right-0 top-full mt-1 w-40 bg-panel border border-app-border rounded-xl shadow-xl z-50 py-1">
      <button onClick={onView} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        <Eye size={14} /> View
      </button>
      <button onClick={onReindex} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        <RefreshCw size={14} /> Re-index
      </button>
      <button onClick={onDelete} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/5 transition-colors">
        <Trash2 size={14} /> Delete
      </button>
    </div>
  );
}

export default function DocumentListPage() {
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const navigate = useNavigate();

  const filtered = DOCS.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Tài liệu</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">{DOCS.length} documents total</p>
        </div>
        <button
          onClick={() => navigate("/documents/upload")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
        >
          <Upload size={15} /> Upload
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-app-border bg-black/5 dark:bg-white/5">
          <Search size={15} className="text-app opacity-40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-app-border text-sm text-app opacity-60 hover:opacity-100 transition-colors">
          <Filter size={14} /> Filter
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-app-border text-sm text-app opacity-60 hover:opacity-100 transition-colors">
          Sort <ChevronDown size={14} />
        </button>
        <div className="flex items-center bg-black/10 dark:bg-white/10 rounded-lg p-0.5">
          <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md transition-colors text-app", view === "table" ? "bg-black/10 dark:bg-white/20" : "opacity-50 hover:opacity-100")}>
            <List size={15} />
          </button>
          <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-md transition-colors text-app", view === "grid" ? "bg-black/10 dark:bg-white/20" : "opacity-50 hover:opacity-100")}>
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* Table view */}
      {view === "table" && (
        <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app-border">
                {["Name", "Subject", "Chunks", "Model", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-app opacity-40 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileText size={15} className="text-app opacity-40 shrink-0" />
                      <span className="font-medium text-app">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-app opacity-60">{doc.subject}</td>
                  <td className="px-4 py-3 text-app opacity-60">{doc.chunks || "—"}</td>
                  <td className="px-4 py-3 text-app opacity-50 text-xs">{doc.model}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", STATUS_STYLES[doc.status])}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-app opacity-40 text-xs">{doc.date}</td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === doc.id ? null : doc.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-app transition-all"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {openMenu === doc.id && (
                      <DocMenu
                        onView={() => { navigate(`/documents/${doc.id}`); setOpenMenu(null); }}
                        onReindex={() => { navigate(`/documents/${doc.id}/reindex`); setOpenMenu(null); }}
                        onDelete={() => { setDeleteModal(doc); setOpenMenu(null); }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="bg-panel border border-app-border rounded-xl p-4 hover:border-black/25 dark:hover:border-white/25 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <FileText size={28} className="text-app opacity-40" />
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", STATUS_STYLES[doc.status])}>
                  {doc.status}
                </span>
              </div>
              <p className="text-sm font-medium text-app truncate">{doc.name}</p>
              <p className="text-xs text-app opacity-40 mt-1">{doc.subject} · {doc.size}</p>
              <p className="text-xs text-app opacity-30 mt-0.5">{doc.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-app mb-1">Delete Document</h3>
            <p className="text-sm text-app opacity-50 mb-5">
              This will permanently delete <strong className="text-app opacity-80">{deleteModal.name}</strong> and all its vector embeddings. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
