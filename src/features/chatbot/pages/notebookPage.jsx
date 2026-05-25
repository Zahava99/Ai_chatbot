import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NotebookHeader from "@/components/common/notebookHeader";
import SourcesPanel from "./sourcesPanel";
import ChatBotPanel from "./chatBotPanel";
import { useNotebookStore } from "@/features/chatbot/store/notebookStore";
import { cn } from "@/lib/utils";

export default function NotebookPage() {
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const location = useLocation();
  const setActiveNotebook = useNotebookStore((s) => s.setActiveNotebook);

  useEffect(() => {
    if (location.state?.notebookId) {
      setActiveNotebook(location.state.notebookId);
    }
  }, [location.state?.notebookId, setActiveNotebook]);

  return (
    <div className="flex flex-col h-screen bg-notebook text-app overflow-hidden">
      <NotebookHeader />

      <div className="flex-1 overflow-hidden px-4 pb-4 pt-3">
        <div className="flex gap-2 h-full">

          {/* Sources panel */}
          <div
            className={cn(
              "flex flex-col rounded-xl bg-panel border border-app-border overflow-hidden shrink-0 transition-all duration-200",
              sourcesCollapsed ? "w-10" : "w-[632px]"
            )}
          >
            <SourcesPanel
              collapsed={sourcesCollapsed}
              onToggle={() => setSourcesCollapsed((v) => !v)}
            />
          </div>

          {/* Chat panel */}
          <div className="flex-1 flex flex-col rounded-xl bg-panel border border-app-border overflow-hidden min-w-0">
            <ChatBotPanel sourceCount={0} />
          </div>

        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center py-2 shrink-0">
        <p className="text-[11px] text-app opacity-20">
          AI can be inaccurate, please double check its responses.
        </p>
      </div>
    </div>
  );
}
