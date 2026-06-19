import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Search, Loader2, AlertCircle } from "lucide-react";
import { getDocumentChunks, getDocumentById } from "@/api/documentApi";

export default function ChunkViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [docName, setDocName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getDocumentChunks(id),
      getDocumentById(id),
    ])
      .then(([chunksData, docData]) => {
        const items = chunksData?.items ?? (Array.isArray(chunksData) ? chunksData : []);
        setChunks(items);
        setDocName(docData?.title || docData?.originalFileName || `Document #${id}`);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = chunks.filter((c) =>
    (c.content || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-app opacity-40 mb-5">
        <button onClick={() => navigate("/documents")} className="hover:opacity-80">Documents</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate(`/documents_upload/${id}`)} className="hover:opacity-80">{docName || "..."}</button>
        <ChevronRight size={12} />
        <span className="text-app opacity-70">Chunks</span>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-app">Chunk Viewer</h1>
          {!loading && !error && (
            <p className="text-sm text-app opacity-50 mt-0.5">{chunks.length} chunks total</p>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5">
          <Search size={13} className="text-app opacity-40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chunks..."
            className="bg-transparent text-sm text-app placeholder:opacity-30 outline-none w-40"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-app opacity-40 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Chunks grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-app opacity-30">
              {search ? "No chunks match your search." : "No chunks available."}
            </div>
          ) : (
            filtered.map((chunk, idx) => (
              <div
                key={chunk.id ?? idx}
                onClick={() => setSelected(selected === (chunk.id ?? idx) ? null : (chunk.id ?? idx))}
                className={`bg-panel border rounded-xl p-4 cursor-pointer transition-all ${
                  selected === (chunk.id ?? idx)
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-app-border hover:border-black/25 dark:hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-app opacity-40">#{chunk.chunkIndex ?? idx + 1}</span>
                    {chunk.tokenCount && (
                      <>
                        <span className="text-xs text-app opacity-30">·</span>
                        <span className="text-xs text-app opacity-50">{chunk.tokenCount} tokens</span>
                      </>
                    )}
                    {chunk.pageNumber && (
                      <>
                        <span className="text-xs text-app opacity-30">·</span>
                        <span className="text-xs text-app opacity-50">p.{chunk.pageNumber}</span>
                      </>
                    )}
                  </div>
                  {chunk.similarity && (
                    <span className="text-xs text-emerald-400 font-medium">
                      sim: {Number(chunk.similarity).toFixed(3)}
                    </span>
                  )}
                </div>
                <p className={`text-sm text-app opacity-60 leading-relaxed ${selected === (chunk.id ?? idx) ? "" : "line-clamp-3"}`}>
                  {chunk.content || "—"}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
