import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NotebookHeader from "@/components/common/notebookHeader";
import SourcesPanel from "./sourcesPanel";
import ChatBotPanel from "./chatBotPanel";
// TEMPORARY: notebookStore replaced by chatbotStore for simulation
// import { useNotebookStore } from "@/features/chatbot/store/notebookStore";
import { useChatbotStore } from "@/features/chatbot/store/chatbotStore";
import { cn } from "@/lib/utils";

export default function NotebookPage() {
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const location = useLocation();

  // Subject the student navigated into (set by handleSubjectClick in mainPage)
  const subjectId = location.state?.subjectId ?? null;

  // Select the raw array — never call a function inside a Zustand selector
  // as it returns a new reference every render and causes an infinite loop
  const allSessions = useChatbotStore((s) => s.sessions);
  const setActiveSession = useChatbotStore((s) => s.setActiveSession);
  const activeSessionId = useChatbotStore((s) => s.activeSessionId);

  // Reset active session whenever the subject changes so a previous subject's
  // session is never shown in the new subject's chat panel.
  useEffect(() => {
    setActiveSession(null);
  }, [subjectId, setActiveSession]);

  // Filter outside the selector so the result is stable via useMemo
  const sessions = useMemo(
    () => allSessions.filter((s) => s.subjectId === (subjectId ?? "")),
    [allSessions, subjectId]
  );

  return (
    <div className="flex flex-col h-screen bg-notebook text-app overflow-hidden">
      <NotebookHeader />

      <div className="flex-1 overflow-hidden px-4 pb-4 pt-3">
        <div className="flex gap-2 h-full">

          {/* History / sources panel */}
          <div
            className={cn(
              "flex flex-col rounded-xl bg-panel border border-app-border overflow-hidden shrink-0 transition-all duration-200",
              sourcesCollapsed ? "w-10" : "w-[260px]"
            )}
          >
            <SourcesPanel
              collapsed={sourcesCollapsed}
              onToggle={() => setSourcesCollapsed((v) => !v)}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={setActiveSession}
              subjectId={subjectId}
            />
          </div>

          {/* Chat panel */}
          <div className="flex-1 flex flex-col rounded-xl bg-panel border border-app-border overflow-hidden min-w-0">
            <ChatBotPanel subjectId={subjectId} />
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
