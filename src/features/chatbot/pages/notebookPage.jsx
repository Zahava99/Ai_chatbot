import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NotebookHeader from "@/components/common/notebookHeader";
import SourcesPanel from "./sourcesPanel";
import ChatBotPanel from "./chatBotPanel";
import { useNotebookStore } from "@/features/chatbot/store/notebookStore";

export default function NotebookPage() {
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const location = useLocation();
  const setActiveNotebook = useNotebookStore((s) => s.setActiveNotebook);

  // Set the active notebook from navigation state
  useEffect(() => {
    if (location.state?.notebookId) {
      setActiveNotebook(location.state.notebookId);
    }
  }, [location.state?.notebookId, setActiveNotebook]);

  return (
    <div className="flex flex-col h-screen bg-[#1c1c1f] text-white overflow-hidden">
      {/* Notebook-specific header */}
      <NotebookHeader />

      {/* Both panels inside one padded container, each panel is its own rounded card */}
      <div className="flex-1 overflow-hidden px-4 pb-4 pt-3">
        <div className="flex gap-2 h-full">

          {/* Sources panel — rounded card */}
          <div
            className={`
              flex flex-col rounded-xl bg-[#23272a] border border-white/10 overflow-hidden shrink-0 transition-all duration-200
              ${sourcesCollapsed ? "w-10" : "w-[632px]"}
            `}
          >
            <SourcesPanel
              collapsed={sourcesCollapsed}
              onToggle={() => setSourcesCollapsed((v) => !v)}
            />
          </div>

          {/* Chat panel — rounded card, fills remaining space */}
          <div className="flex-1 flex flex-col rounded-xl bg-[#23272a] border border-white/10 overflow-hidden min-w-0">
            <ChatBotPanel sourceCount={0} />
          </div>

        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center py-2 shrink-0">
        <p className="text-[11px] text-white/20">
          AI can be inaccurate, please double check its responses.
        </p>
      </div>
    </div>
  );
}
