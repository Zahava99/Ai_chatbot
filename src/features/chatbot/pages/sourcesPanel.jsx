import { useEffect, useState } from "react";
import { MessageSquare, PanelLeftClose, PanelLeftOpen, Plus, RefreshCw } from "lucide-react";
import { useChatbotStore } from "@/features/chatbot/store/chatbotStore";
import { fetchConversations } from "@/features/chatbot/api/conversationsApi";
import { cn } from "@/lib/utils";

// TEMPORARY: Sources upload UI is commented out.
// This panel now shows per-subject chat history fetched from the API.
// To restore sources, uncomment the original sections marked below.

export default function SourcesPanel({
  collapsed,
  onToggle,
  activeSessionId,
  onSelectSession,
  subjectId,
}) {
  const createSession = useChatbotStore((s) => s.createSession);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadConversations = async () => {
    if (!subjectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchConversations(subjectId);
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever the subject changes
  useEffect(() => {
    setSessions([]);
    loadConversations();
  }, [subjectId]);

  const handleNewChat = () => {
    if (subjectId) createSession(subjectId);
  };

  if (collapsed) {
    return (
      <section className="flex flex-col items-center pt-3 h-full">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-app opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Expand history"
        >
          <PanelLeftOpen size={16} />
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
        <span className="text-sm font-medium text-app opacity-90">Chat History</span>
        <div className="flex items-center gap-1">
          <button
            onClick={loadConversations}
            disabled={loading || !subjectId}
            className="p-1 rounded-md text-app opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:cursor-not-allowed"
            title="Refresh history"
          >
            <RefreshCw size={13} className={cn(loading && "animate-spin")} />
          </button>
          <button
            onClick={onToggle}
            className="p-1 rounded-md text-app opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Collapse history"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {/* New chat button */}
      {/* ORIGINAL: "Add sources" button was here */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 w-full justify-center py-2 rounded-lg border border-app-border hover:bg-black/5 dark:hover:bg-white/5 text-sm text-app opacity-70 hover:opacity-100 transition-colors"
        >
          <Plus size={14} />
          New chat
        </button>
      </div>

      {/* Session list */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-xs text-red-400 leading-snug">{error}</p>
          <button
            onClick={loadConversations}
            className="text-xs text-app opacity-50 hover:opacity-100 underline underline-offset-2 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex-1 overflow-y-auto py-1 px-3 flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <MessageSquare size={28} className="text-app opacity-20 mb-1" />
          <p className="text-sm text-app opacity-50 leading-snug">No chat history yet</p>
          <p className="text-xs text-app opacity-30 leading-snug">
            Start a new chat above to begin.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession?.(session.id)}
              className={cn(
                "flex items-start gap-3 w-full px-4 py-3 transition-colors text-left",
                session.id === activeSessionId
                  ? "bg-black/8 dark:bg-white/8"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <MessageSquare size={14} className="text-app opacity-40 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-app opacity-80 truncate leading-snug">
                  {session.title}
                </p>
                <p className="text-xs text-app opacity-40 mt-0.5">{session.date}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ORIGINAL empty state — commented out temporarily
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <FileText size={28} className="text-app opacity-20 mb-1" />
        <p className="text-sm text-app opacity-50 leading-snug">
          Saved sources will appear here
        </p>
        <p className="text-xs text-app opacity-30 leading-snug">
          Click Add source above to add PDFs, websites, text, videos, or audio files.
        </p>
      </div>
      */}
    </section>
  );
}
