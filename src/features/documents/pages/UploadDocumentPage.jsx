import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = [".pdf", ".docx", ".pptx"];

function FileItem({ file, onRemove }) {
  const ext = file.name.split(".").pop().toUpperCase();
  const statusIcon = {
    pending: <div className="w-4 h-4 rounded-full border-2 border-app-border" />,
    uploading: <Loader2 size={14} className="text-blue-400 animate-spin" />,
    done: <CheckCircle2 size={14} className="text-emerald-400" />,
    error: <AlertCircle size={14} className="text-red-400" />,
  }[file.status];

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-app-border bg-black/5 dark:bg-white/5">
      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
        {ext}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-app truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", file.status === "done" ? "bg-emerald-400" : file.status === "error" ? "bg-red-400" : "bg-blue-400")}
              style={{ width: `${file.progress}%` }}
            />
          </div>
          <span className="text-xs text-app opacity-40 shrink-0">{file.progress}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {statusIcon}
        <button onClick={() => onRemove(file.id)} className="text-app opacity-30 hover:opacity-70 transition-opacity">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function UploadDocumentPage() {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function addFiles(rawFiles) {
    const newFiles = Array.from(rawFiles)
      .filter((f) => ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext)))
      .map((f) => ({
        id: Date.now() + Math.random(),
        name: f.name,
        size: f.size,
        status: "pending",
        progress: 0,
      }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function handleUpload() {
    // Simulate upload progress
    setFiles((prev) =>
      prev.map((f) => (f.status === "pending" ? { ...f, status: "uploading", progress: 0 } : f))
    );
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prev) => prev.map((f) => ({ ...f, status: "done", progress: 100 })));
        setTimeout(() => navigate("/documents_upload/processing"), 800);
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.status === "uploading" ? { ...f, progress: Math.min(Math.round(progress), 99) } : f))
        );
      }
    }, 300);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Upload Documents</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Supported: PDF, DOCX, PPTX</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
          dragging
            ? "border-emerald-500 bg-emerald-500/5"
            : "border-app-border hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/5"
        )}
      >
        <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
          <Upload size={24} className="text-app opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-app">Drop files here or click to browse</p>
          <p className="text-xs text-app opacity-40 mt-1">PDF, DOCX, PPTX · Max 50MB per file</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.pptx"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-sm font-medium text-app opacity-60 mb-1">{files.length} file(s) selected</p>
          {files.map((f) => (
            <FileItem key={f.id} file={f} onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate("/documents")}
          className="flex-1 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || files.every((f) => f.status !== "pending")}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          Upload {files.length > 0 ? `(${files.length})` : ""}
        </button>
      </div>
    </div>
  );
}
