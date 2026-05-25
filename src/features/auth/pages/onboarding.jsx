import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Upload, MessageSquare, FlaskConical } from "lucide-react";

const SLIDES = [
  {
    icon: Upload,
    color: "bg-blue-500/10 text-blue-400",
    title: "Upload Your Documents",
    description:
      "Upload PDFs, DOCX, and PPTX files. Our system automatically parses, chunks, and embeds them into a vector database for intelligent retrieval.",
    visual: (
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {["Lecture_01.pdf", "Chapter_3.docx", "Slides_Week5.pptx"].map((f, i) => (
          <div key={f} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-app-border">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-bold">
              {f.split(".")[1].toUpperCase()}
            </div>
            <span className="text-sm text-app opacity-70 flex-1">{f}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: MessageSquare,
    color: "bg-emerald-500/10 text-emerald-400",
    title: "Ask AI Anything",
    description:
      "Chat with your documents using natural language. Get accurate answers with citations pointing to the exact source paragraphs.",
    visual: (
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div className="self-end px-4 py-2.5 rounded-2xl rounded-br-sm bg-emerald-600 text-white text-sm max-w-[80%]">
          What is the main topic of Chapter 3?
        </div>
        <div className="self-start px-4 py-2.5 rounded-2xl rounded-bl-sm bg-black/5 dark:bg-white/5 border border-app-border text-sm text-app opacity-80 max-w-[85%]">
          Chapter 3 covers <span className="text-emerald-400 font-medium">neural network architectures</span>... <span className="text-xs opacity-50">[Source: Chapter_3.docx, p.12]</span>
        </div>
      </div>
    ),
  },
  {
    icon: FlaskConical,
    color: "bg-purple-500/10 text-purple-400",
    title: "Research & Benchmark",
    description:
      "Compare embedding models, chunking strategies, and evaluate RAG performance using RAGAS metrics — Faithfulness, Recall, Precision, and Relevancy.",
    visual: (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {[
          { label: "Faithfulness", value: 92, color: "bg-emerald-400" },
          { label: "Context Recall", value: 87, color: "bg-blue-400" },
          { label: "Answer Relevancy", value: 95, color: "bg-purple-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-app opacity-60">
              <span>{label}</span>
              <span>{value}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[current];
  const Icon = slide.icon;

  function finish() {
    localStorage.setItem("onboarding_done", "1");
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-4">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-emerald-500" : "w-1.5 bg-black/20 dark:bg-white/20"}`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="bg-panel border border-app-border rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl ${slide.color} flex items-center justify-center`}>
          <Icon size={26} />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-app mb-2">{slide.title}</h2>
          <p className="text-sm text-app opacity-50 leading-relaxed">{slide.description}</p>
        </div>

        {/* Visual */}
        <div className="w-full flex justify-center py-2">{slide.visual}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between w-full mt-2">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-1.5 text-sm text-app opacity-50 hover:opacity-100 disabled:opacity-20 transition-opacity"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {current < SLIDES.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={finish}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              Get Started <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <button onClick={finish} className="mt-6 text-sm text-app opacity-30 hover:opacity-60 transition-opacity">
        Skip onboarding
      </button>
    </div>
  );
}
