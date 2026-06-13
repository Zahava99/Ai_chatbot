import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Cpu, Calendar, Hash, Eye, RefreshCw, ChevronRight } from "lucide-react";
import { getDocumentById, reindexDocument } from "@/api/documentApi";

const STATUS_STYLES = {
  indexed: "text-emerald-400 bg-emerald-500/10",
  processing: "text-yellow-400 bg-yellow-500/10",
  error: "text-red-400 bg-red-500/10",
  failed: "text-red-400 bg-red-500/10",
};

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDocumentById(id)
      .then((data) => setDoc(data))
      .catch((err) => console.error("Failed to load document:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReindex = async () => {
    try {
      setReindexing(true);
      await reindexDocument(id);
      const updated = await getDocumentById(id);
      setDoc(updated);
    } catch (err) {
      console.error("Failed to reindex:", err);
    } finally {
      setReindexing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-app opacity-50">Loading...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-red-400">Document not found.</p>
      </div>
    );
  }

  const metaRows = [
    { icon: FileText, label: "File name", value: doc.originalFileName || "No info" },
    // { icon: Hash, label: "Chunk count", value: doc.chunkCount ? `${doc.chunkCount} chunks` : "No info" },
    // { icon: Cpu, label: "Embedding model", value: doc.embeddingModel || "No info" },
    { icon: Calendar, label: "Upload date", value: formatDate(doc.createdAtUtc) },
    { icon: Calendar, label: "Indexed date", value: formatDate(doc.indexedAtUtc) },
    // { icon: Hash, label: "Chunk size", value: doc.chunkSize ? `${doc.chunkSize} tokens` : "No info" },
    // { icon: Hash, label: "Overlap", value: doc.overlap ? `${doc.overlap} tokens` : "No info" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-app opacity-40 mb-5">
        <button onClick={() => navigate("/documents")} className="hover:opacity-80">Documents</button>
        <ChevronRight size={12} />
        <span className="text-app opacity-70">{doc.title || doc.originalFileName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm font-bold uppercase">
            {doc.fileType || "—"}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-app">{doc.title || doc.originalFileName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-app opacity-50">{formatFileSize(doc.sizeBytes)}</span>
              {doc.pageCount && (
                <>
                  <span className="text-xs text-app opacity-30">·</span>
                  <span className="text-xs text-app opacity-50">{doc.pageCount} pages</span>
                </>
              )}
              <span className="text-xs text-app opacity-30">·</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[doc.status] || "text-app opacity-50"}`}>
                {doc.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/documents_upload/${id}/preview`)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">
            <Eye size={14} /> Preview
          </button>
          <button onClick={handleReindex} disabled={reindexing} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors disabled:opacity-40">
            <RefreshCw size={14} className={reindexing ? "animate-spin" : ""} /> {reindexing ? "Re-indexing..." : "Re-index"}
          </button>
        </div>
      </div>

      {/* Metadata card */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-app-border">
          <p className="text-sm font-semibold text-app">Metadata</p>
        </div>
        <div className="divide-y divide-app-border">
          {metaRows.map(({ icon: Icon, label, value }) => (
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
          {doc.chunkCount && (
            <button onClick={() => navigate(`/documents_upload/${id}/chunks`)} className="text-xs text-emerald-400 hover:underline">
              View all {doc.chunkCount} chunks
            </button>
          )}
        </div>
        {!doc.chunkCount ? (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-app opacity-40">No chunks available</p>
          </div>
        ) : (
          <div className="divide-y divide-app-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-app opacity-40 font-mono">Chunk #{i}</span>
                </div>
                <p className="text-sm text-app opacity-60 leading-relaxed line-clamp-3">
                  Chunk content preview...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
