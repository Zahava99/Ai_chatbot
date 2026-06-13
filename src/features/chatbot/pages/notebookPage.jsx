import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/common/header";
import SourcesPanel from "./sourcesPanel";
import ChatBotPanel from "./chatBotPanel";
// TEMPORARY: notebookStore replaced by chatbotStore for simulation
// import { useNotebookStore } from "@/features/chatbot/store/notebookStore";
import { useChatbotStore } from "@/features/chatbot/store/chatbotStore";
import { cn } from "@/lib/utils";

export default function NotebookPage() {
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const [newlyCreatedSession, setNewlyCreatedSession] = useState(null);
  const location = useLocation();

  // Subject the student navigated into (set by handleSubjectClick in mainPage)
  const subjectId = location.state?.subjectId ?? null;
  const subjectCode = location.state?.subjectCode ?? null;

  const setActiveSession = useChatbotStore((s) => s.setActiveSession);
  const activeSessionId = useChatbotStore((s) => s.activeSessionId);

  // Reset active session whenever the subject changes so a previous subject's
  // session is never shown in the new subject's chat panel.
  useEffect(() => {
    setActiveSession(null);
  }, [subjectId, setActiveSession]);

  // Called by ChatBotPanel when it creates a new session on first message
  const handleSessionCreated = (session) => {
    setNewlyCreatedSession(session);
  };

  return (
    <div className="flex flex-col h-screen bg-notebook text-app overflow-hidden">
      <Header />

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
              activeSessionId={activeSessionId}
              onSelectSession={setActiveSession}
              subjectId={subjectId}
              newlyCreatedSession={newlyCreatedSession}
            />
          </div>

          {/* Chat panel */}
          <div className="flex-1 flex flex-col rounded-xl bg-panel border border-app-border overflow-hidden min-w-0">
            <ChatBotPanel
              subjectId={subjectId}
              subjectCode={subjectCode}
              onSessionCreated={handleSessionCreated}
            />
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
