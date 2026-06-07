import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "parsing", label: "Parsing", desc: "Extracting text and structure from document" },
  { id: "chunking", label: "Chunking", desc: "Splitting content into semantic chunks" },
  { id: "embedding", label: "Embedding", desc: "Generating vector embeddings with multilingual-e5-base" },
  { id: "indexing", label: "Indexing", desc: "Storing vectors in the database" },
];

export default function UploadProcessingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep >= STEPS.length) return;
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 1500);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const done = currentStep >= STEPS.length;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-app">Processing Document</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Please wait while we process your file.</p>
      </div>

      <div className="bg-panel border border-app-border rounded-2xl p-6">
        {/* File info */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-app-border">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-bold">
            PDF
          </div>
          <div>
            <p className="text-sm font-medium text-app">Lecture_01.pdf</p>
            <p className="text-xs text-app opacity-40">2.4 MB · Uploaded just now</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-4">
          {STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Icon */}
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 size={20} className="text-blue-400 animate-spin" />
                  ) : (
                    <Circle size={20} className="text-app opacity-20" />
                  )}
                </div>
                {/* Text */}
                <div className="flex-1">
                  <p className={cn("text-sm font-medium", isDone ? "text-app opacity-60" : isActive ? "text-app" : "text-app opacity-30")}>
                    {step.label}
                  </p>
                  <p className={cn("text-xs mt-0.5", isDone ? "text-app opacity-30" : isActive ? "text-app opacity-50" : "text-app opacity-20")}>
                    {step.desc}
                  </p>
                </div>
                {/* Status */}
                {isDone && <span className="text-xs text-emerald-400 shrink-0">Done</span>}
                {isActive && <span className="text-xs text-blue-400 shrink-0">Running...</span>}
              </div>
            );
          })}
        </div>

        {/* Done state */}
        {done && (
          <div className="mt-6 pt-5 border-t border-app-border flex flex-col items-center gap-3">
            <CheckCircle2 size={32} className="text-emerald-400" />
            <p className="text-sm font-semibold text-app">Processing Complete!</p>
            <p className="text-xs text-app opacity-50">48 chunks created · 48 vectors indexed</p>
            <button
              onClick={() => navigate("/documents/1")}
              className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              View Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
