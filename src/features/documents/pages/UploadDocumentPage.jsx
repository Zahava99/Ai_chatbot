import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle, ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadDocument } from "@/api/documentApi";
import { getSubjects, getChapters } from "@/api/subjectApi";
import MustChangePasswordBanner from "@/components/common/MustChangePasswordBanner";

const ACCEPTED = [".pdf", ".docx", ".pptx"];

function FileItem({ file, onRemove, onRetry }) {
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
        {file.error && <p className="text-xs text-red-400 mt-1">{file.error}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {statusIcon}
        {file.status === "error" && (
          <button
            onClick={() => onRetry(file.id)}
            title="Retry upload"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        )}
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
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch subjects on mount
  useEffect(() => {
    getSubjects()
      .then((data) => setSubjects(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load subjects:", err))
      .finally(() => setLoadingSubjects(false));
  }, []);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!subjectId) {
      setChapters([]);
      setChapterId("");
      return;
    }
    setLoadingChapters(true);
    setChapterId("");
    getChapters(subjectId)
      .then((data) => setChapters(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load chapters:", err))
      .finally(() => setLoadingChapters(false));
  }, [subjectId]);

  function addFiles(rawFiles) {
    const newFiles = Array.from(rawFiles)
      .filter((f) => ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext)))
      .map((f) => ({
        id: Date.now() + Math.random(),
        name: f.name,
        size: f.size,
        raw: f,
        status: "pending",
        progress: 0,
        error: null,
      }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleUpload() {
    if (!subjectId || !chapterId || !title.trim() || files.length === 0) return;

    setUploading(true);
    setSuccessMessage("");

    const pendingFiles = files.filter((f) => f.status === "pending");

    // Mark all pending as uploading
    setFiles((prev) =>
      prev.map((f) => (f.status === "pending" ? { ...f, status: "uploading", progress: 0, error: null } : f))
    );

    for (const file of pendingFiles) {
      try {
        await uploadDocument(
          file.raw,
          subjectId,
          chapterId,
          title.trim(),
          (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === file.id ? { ...f, progress: Math.min(progress, 99) } : f))
            );
          }
        );
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "done", progress: 100 } : f))
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "error", progress: 0, error: err.message } : f
          )
        );
      }
    }

    setUploading(false);

    // Show success message if all succeeded (temporarily disabled navigation to processing)
    setTimeout(() => {
      setFiles((current) => {
        if (current.every((f) => f.status === "done")) {
          setSuccessMessage("Upload Successfully");
        }
        return current;
      });
    }, 800);
  }

  function handleRetry(fileId) {
    // Reset the file back to pending so it can be re-uploaded
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: "pending", progress: 0, error: null } : f))
    );
  }

  const canUpload =
    files.length > 0 &&
    files.some((f) => f.status === "pending") &&
    subjectId &&
    chapterId &&
    title.trim() &&
    !uploading;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Must Change Password Banner */}
      <MustChangePasswordBanner />

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Upload Documents</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Supported: PDF, DOCX, PPTX</p>
      </div>

      {/* Metadata form */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-app opacity-70 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-app opacity-70 mb-1.5">Subject</label>
          <div className="relative">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={loadingSubjects}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-app-border text-sm text-app outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--panel-bg)" }}
            >
              <option value="">
                {loadingSubjects ? "Loading subjects..." : "Select a subject"}
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id} style={{ backgroundColor: "var(--panel-bg)" }}>
                  {s.code}{s.name ? ` - ${s.name}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
          </div>
        </div>

        {/* Chapter */}
        <div>
          <label className="block text-sm font-medium text-app opacity-70 mb-1.5">Chapter</label>
          <div className="relative">
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              disabled={!subjectId || loadingChapters}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-app-border text-sm text-app outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--panel-bg)" }}
            >
              <option value="">
                {!subjectId
                  ? "Select a subject first"
                  : loadingChapters
                  ? "Loading chapters..."
                  : "Select a chapter"}
              </option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id} style={{ backgroundColor: "var(--panel-bg)" }}>
                  {c.title}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
          </div>
        </div>
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
            <FileItem
              key={f.id}
              file={f}
              onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
              onRetry={handleRetry}
            />
          ))}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="mt-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-emerald-400">{successMessage}</p>
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
          disabled={!canUpload}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Uploading...
            </span>
          ) : (
            `Upload ${files.length > 0 ? `(${files.length})` : ""}`
          )}
        </button>
      </div>
    </div>
  );
}
