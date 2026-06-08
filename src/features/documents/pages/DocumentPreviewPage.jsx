import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, X } from "lucide-react";

const TOTAL_PAGES = 32;

export default function DocumentPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-app-border bg-panel shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/documents_upload/${id}`)} className="text-app opacity-50 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
          <span className="text-sm font-medium text-app">Lecture_01.pdf</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-app-border bg-black/5 dark:bg-white/5">
            <Search size={13} className="text-app opacity-40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search text..."
              className="bg-transparent text-sm text-app placeholder:opacity-30 outline-none w-36"
            />
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-1.5 rounded-md text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <ZoomOut size={14} />
            </button>
            <span className="text-xs text-app opacity-50 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-1.5 rounded-md text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Page nav */}
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md text-app opacity-50 hover:opacity-100 disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-app opacity-60 px-1">
              {page} / {TOTAL_PAGES}
            </span>
            <button onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))} disabled={page === TOTAL_PAGES} className="p-1.5 rounded-md text-app opacity-50 hover:opacity-100 disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Page viewer */}
      <div className="flex-1 overflow-auto bg-[#1a1a1a] flex items-start justify-center p-8">
        <div
          className="bg-white rounded-lg shadow-2xl transition-all duration-200"
          style={{ width: `${zoom * 5.5}px`, minHeight: `${zoom * 7.5}px` }}
        >
          {/* Simulated PDF page */}
          <div className="p-8 text-gray-800">
            <h2 className="text-xl font-bold mb-4">Lecture 01 — Introduction to Machine Learning</h2>
            <p className="text-sm leading-relaxed mb-3">
              Machine learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed.
            </p>
            {/* Highlighted chunk */}
            <p className="text-sm leading-relaxed mb-3 bg-yellow-200 px-1 rounded">
              The primary aim of machine learning is to allow computers to learn automatically without human intervention or assistance and adjust actions accordingly.
            </p>
            <p className="text-sm leading-relaxed mb-3">
              Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves. The process begins with observations or data, such as examples, direct experience, or instruction.
            </p>
            <p className="text-sm text-gray-400 mt-8 text-center">Page {page} of {TOTAL_PAGES}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
