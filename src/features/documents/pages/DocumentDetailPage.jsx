import { useNavigate, useParams } from "react-router-dom";
import { FileText, Cpu, Calendar, Hash, CheckCircle2, Eye, RefreshCw, Trash2, ChevronRight } from "lucide-react";

const DOC = {
  id: 1,
  name: "Lecture_01.pdf",
  subject: "Machine Learning",
  size: "2.4 MB",
  pages: 32,
  chunks: 48,
  model: "multilingual-e5-base",
  chunkSize: 512,
  overlap: 64,
  status: "indexed",
  uploadDate: "May 26, 2026",
  indexedDate: "May 26, 2026",
};

const META_ROWS = [
  { icon: FileText, label: "File name", value: DOC.name },
  { icon: Hash, label: "Chunk count", value: `${DOC.chunks} chunks` },
  { icon: Cpu, label: "Embedding model", value: DOC.model },
  { icon: Calendar, label: "Upload date", value: DOC.uploadDate },
  { icon: Calendar, label: "Indexed date", value: DOC.indexedDate },
  { icon: Hash, label: "Chunk size", value: `${DOC.chunkSize} tokens` },
  { icon: Hash, label: "Overlap", value: `${DOC.overlap} tokens` },
];

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-app opacity-40 mb-5">
        <button onClick={() => navigate("/documents")} className="hover:opacity-80">Documents</button>
        <ChevronRight size={12} />
        <span className="text-app opacity-70">{DOC.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm font-bold">
            PDF
          </div>
          <div>
            <h1 className="text-xl font-semibold text-app">{DOC.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-app opacity-50">{DOC.subject}</span>
              <span className="text-xs text-app opacity-30">·</span>
              <span className="text-xs text-app opacity-50">{DOC.size}</span>
              <span className="text-xs text-app opacity-30">·</span>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium capitalize">
                {DOC.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/documents/${id}/preview`)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">
            <Eye size={14} /> Preview
          </button>
          <button onClick={() => navigate(`/documents/${id}/reindex`)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">
            <RefreshCw size={14} /> Re-index
          </button>
        </div>
      </div>

      {/* Metadata card */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-app-border">
          <p className="text-sm font-semibold text-app">Metadata</p>
        </div>
        <div className="divide-y divide-app-border">
          {META_ROWS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-3">
              <Icon size={15} className="text-app opacity-30 shrink-0" />
              <span className="text-sm text-app opacity-50 w-36 shrink-0">{label}</span>
              <span className="text-sm text-app font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chunks preview */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-app-border">
          <p className="text-sm font-semibold text-app">Chunks Preview</p>
          <button onClick={() => navigate(`/documents/${id}/chunks`)} className="text-xs text-emerald-400 hover:underline">
            View all {DOC.chunks} chunks
          </button>
        </div>
        <div className="divide-y divide-app-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-5 py-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-app opacity-40 font-mono">Chunk #{i}</span>
                <span className="text-xs text-app opacity-30">·</span>
                <span className="text-xs text-app opacity-40">{Math.floor(Math.random() * 100 + 400)} tokens</span>
              </div>
              <p className="text-sm text-app opacity-60 leading-relaxed line-clamp-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
