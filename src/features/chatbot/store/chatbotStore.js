// chatbotStore.js
// TEMPORARY: notebookStore.js is not used while this simulation is active.
// This store manages chat sessions per subject and the messages within each session.

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Simulated data — VNR202 (Vietnamese Revolution)
// ---------------------------------------------------------------------------
const SIM_SUBJECT_ID = "VNR202";

const simulatedSessions = [
  {
    id: "vnr202-session-1",
    subjectId: SIM_SUBJECT_ID,
    title: "Overview of the August Revolution",
    date: "May 28, 2026",
    messages: [
      {
        id: "m1",
        role: "user",
        text: "Can you give me an overview of the August Revolution?",
        timestamp: "2026-05-28T09:00:00Z",
      },
      {
        id: "m2",
        role: "bot",
        text: "The August Revolution (Cách mạng tháng Tám) took place in August 1945. Led by the Việt Minh under Hồ Chí Minh, it resulted in the abdication of Emperor Bảo Đại and the proclamation of the Democratic Republic of Vietnam on September 2, 1945.",
        timestamp: "2026-05-28T09:00:05Z",
      },
      {
        id: "m3",
        role: "user",
        text: "What were the main causes?",
        timestamp: "2026-05-28T09:01:00Z",
      },
      {
        id: "m4",
        role: "bot",
        text: "Key causes included: (1) Japanese occupation weakening French colonial control, (2) widespread famine in 1944–45 fueling popular discontent, (3) the Việt Minh's organized resistance network, and (4) Japan's surrender to the Allies creating a power vacuum the Việt Minh moved quickly to fill.",
        timestamp: "2026-05-28T09:01:06Z",
      },
    ],
  },
  {
    id: "vnr202-session-2",
    subjectId: SIM_SUBJECT_ID,
    title: "Hồ Chí Minh's political ideology",
    date: "May 30, 2026",
    messages: [
      {
        id: "m5",
        role: "user",
        text: "How did Hồ Chí Minh blend Marxism with Vietnamese nationalism?",
        timestamp: "2026-05-30T14:00:00Z",
      },
      {
        id: "m6",
        role: "bot",
        text: "Hồ Chí Minh adapted Marxist-Leninist theory to Vietnamese conditions by prioritising national liberation over class struggle as the immediate goal. He argued that colonised peoples must first achieve independence before socialist construction could begin, making anti-imperialism the unifying force across all social classes.",
        timestamp: "2026-05-30T14:00:08Z",
      },
    ],
  },
  {
    id: "vnr202-session-3",
    subjectId: SIM_SUBJECT_ID,
    title: "Land reform policies 1953–1956",
    date: "Jun 1, 2026",
    messages: [
      {
        id: "m7",
        role: "user",
        text: "What happened during the land reform campaign?",
        timestamp: "2026-06-01T10:00:00Z",
      },
      {
        id: "m8",
        role: "bot",
        text: "The land reform (Cải cách ruộng đất) redistributed land from landlords to poor peasants. However, it was accompanied by mass tribunals that resulted in thousands of wrongful executions and imprisonments. The party later acknowledged errors, and Hồ Chí Minh issued a public apology in 1956.",
        timestamp: "2026-06-01T10:00:09Z",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Simulated bot responses for new messages (keyword-based)
// ---------------------------------------------------------------------------
const BOT_RESPONSES = [
  {
    keywords: ["revolution", "august", "cách mạng"],
    reply:
      "The August Revolution of 1945 was a pivotal moment — the Việt Minh seized power during the brief window after Japan's surrender and before Allied forces arrived to restore French rule.",
  },
  {
    keywords: ["hồ chí minh", "ho chi minh", "ideology", "marxism"],
    reply:
      "Hồ Chí Minh's thought combined Marxist-Leninist principles with Vietnamese patriotism, emphasising that national independence was the prerequisite for socialist development.",
  },
  {
    keywords: ["land reform", "cải cách", "peasant"],
    reply:
      "The 1953–1956 land reform redistributed land to peasants but was marred by excesses. The party later conducted a 'rectification of errors' campaign to address wrongful convictions.",
  },
  {
    keywords: ["french", "colonial", "colonialism"],
    reply:
      "French colonialism in Indochina (1887–1954) exploited resources and suppressed Vietnamese culture, which directly fuelled the independence movements that culminated in the First Indochina War.",
  },
  {
    keywords: ["war", "resistance", "kháng chiến"],
    reply:
      "The resistance wars — first against France (1946–1954) and then against the US-backed South (1955–1975) — are central to the VNR202 curriculum. Each phase built on the political and military lessons of the previous one.",
  },
];

const FALLBACK_REPLY =
  "That's an interesting question about Vietnamese revolutionary history. Could you be more specific? I can help with topics like the August Revolution, Hồ Chí Minh's ideology, land reform, or the resistance wars.";

function simulateBotReply(userText) {
  const lower = userText.toLowerCase();
  for (const { keywords, reply } of BOT_RESPONSES) {
    if (keywords.some((kw) => lower.includes(kw))) return reply;
  }
  return FALLBACK_REPLY;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useChatbotStore = create(
  persist(
    (set, get) => ({
      // All sessions across all subjects
      sessions: simulatedSessions,

      // The session currently open in the chat panel
      activeSessionId: null,

      // ── Session helpers ──────────────────────────────────────────────────

      /** Return sessions belonging to a specific subject */
      getSessionsBySubject: (subjectId) =>
        get().sessions.filter((s) => s.subjectId === subjectId),

      /** Open an existing session */
      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

      /** Get the full active session object */
      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((s) => s.id === activeSessionId) ?? null;
      },

      /** Create a new empty session for a subject and make it active */
      createSession: (subjectId, title = "New conversation") => {
        const newSession = {
          id: `${subjectId}-session-${Date.now()}`,
          subjectId,
          title,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          messages: [],
        };
        set((state) => ({ sessions: [newSession, ...state.sessions] }));
        set({ activeSessionId: newSession.id });
        return newSession.id;
      },

      /** Delete a session */
      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeSessionId:
            state.activeSessionId === sessionId ? null : state.activeSessionId,
        })),

      // ── Message helpers ──────────────────────────────────────────────────

      /** Send a user message and append a simulated bot reply */
      sendMessage: (sessionId, userText) => {
        const userMsg = {
          id: `msg-${Date.now()}-u`,
          role: "user",
          text: userText,
          timestamp: new Date().toISOString(),
        };

        // Append user message immediately
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  // Update session title from first message
                  title:
                    s.messages.length === 0
                      ? userText.slice(0, 50) + (userText.length > 50 ? "…" : "")
                      : s.title,
                  messages: [...s.messages, userMsg],
                }
              : s
          ),
        }));

        // Simulate bot reply after a short delay
        setTimeout(() => {
          const botMsg = {
            id: `msg-${Date.now()}-b`,
            role: "bot",
            text: simulateBotReply(userText),
            timestamp: new Date().toISOString(),
          };
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === sessionId
                ? { ...s, messages: [...s.messages, botMsg] }
                : s
            ),
          }));
        }, 800);
      },
    }),
    {
      name: "chatbot-storage",
    }
  )
);
