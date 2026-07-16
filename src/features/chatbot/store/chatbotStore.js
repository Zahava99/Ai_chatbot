// chatbotStore.js
// Lightweight store — only tracks which session is active.
// All session/message data is fetched from the backend API.

import { create } from "zustand";
// import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Simulated data — DEAD CODE (kept for reference, backend API is used instead)
// ---------------------------------------------------------------------------
// const SIM_SUBJECT_ID = "VNR202";
//
// const simulatedSessions = [
//   {
//     id: "vnr202-session-1",
//     subjectId: SIM_SUBJECT_ID,
//     title: "Overview of the August Revolution",
//     date: "May 28, 2026",
//     messages: [
//       { id: "m1", role: "user", text: "Can you give me an overview of the August Revolution?", timestamp: "2026-05-28T09:00:00Z" },
//       { id: "m2", role: "bot", text: "The August Revolution (Cách mạng tháng Tám) took place in August 1945...", timestamp: "2026-05-28T09:00:05Z" },
//       { id: "m3", role: "user", text: "What were the main causes?", timestamp: "2026-05-28T09:01:00Z" },
//       { id: "m4", role: "bot", text: "Key causes included: (1) Japanese occupation...", timestamp: "2026-05-28T09:01:06Z" },
//     ],
//   },
//   {
//     id: "vnr202-session-2",
//     subjectId: SIM_SUBJECT_ID,
//     title: "Hồ Chí Minh's political ideology",
//     date: "May 30, 2026",
//     messages: [
//       { id: "m5", role: "user", text: "How did Hồ Chí Minh blend Marxism with Vietnamese nationalism?", timestamp: "2026-05-30T14:00:00Z" },
//       { id: "m6", role: "bot", text: "Hồ Chí Minh adapted Marxist-Leninist theory to Vietnamese conditions...", timestamp: "2026-05-30T14:00:08Z" },
//     ],
//   },
//   {
//     id: "vnr202-session-3",
//     subjectId: SIM_SUBJECT_ID,
//     title: "Land reform policies 1953–1956",
//     date: "Jun 1, 2026",
//     messages: [
//       { id: "m7", role: "user", text: "What happened during the land reform campaign?", timestamp: "2026-06-01T10:00:00Z" },
//       { id: "m8", role: "bot", text: "The land reform (Cải cách ruộng đất) redistributed land...", timestamp: "2026-06-01T10:00:09Z" },
//     ],
//   },
// ];

// ---------------------------------------------------------------------------
// Simulated bot responses — DEAD CODE (backend handles responses now)
// ---------------------------------------------------------------------------
// const BOT_RESPONSES = [
//   { keywords: ["revolution", "august", "cách mạng"], reply: "The August Revolution of 1945 was a pivotal moment..." },
//   { keywords: ["hồ chí minh", "ho chi minh", "ideology", "marxism"], reply: "Hồ Chí Minh's thought combined Marxist-Leninist principles..." },
//   { keywords: ["land reform", "cải cách", "peasant"], reply: "The 1953–1956 land reform redistributed land to peasants..." },
//   { keywords: ["french", "colonial", "colonialism"], reply: "French colonialism in Indochina (1887–1954)..." },
//   { keywords: ["war", "resistance", "kháng chiến"], reply: "The resistance wars — first against France (1946–1954)..." },
// ];
//
// const FALLBACK_REPLY = "That's an interesting question about Vietnamese revolutionary history...";
//
// function simulateBotReply(userText) {
//   const lower = userText.toLowerCase();
//   for (const { keywords, reply } of BOT_RESPONSES) {
//     if (keywords.some((kw) => lower.includes(kw))) return reply;
//   }
//   return FALLBACK_REPLY;
// }

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useChatbotStore = create(
  (set, get) => ({
    // The session currently open in the chat panel
    activeSessionId: null,

    /** Open an existing session */
    setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

    // ── DEAD CODE below — kept commented for reference ──────────────────
    // All session/message CRUD is now handled by the backend API
    // (see src/features/chatbot/api/sessionApi.js)

    // sessions: simulatedSessions,
    //
    // /** Return sessions belonging to a specific subject */
    // getSessionsBySubject: (subjectId) =>
    //   get().sessions.filter((s) => s.subjectId === subjectId),
    //
    // /** Get the full active session object */
    // getActiveSession: () => {
    //   const { sessions, activeSessionId } = get();
    //   return sessions.find((s) => s.id === activeSessionId) ?? null;
    // },
    //
    // /** Create a new empty session for a subject and make it active */
    // createSession: (subjectId, title = "New conversation") => {
    //   const newSession = {
    //     id: `${subjectId}-session-${Date.now()}`,
    //     subjectId,
    //     title,
    //     date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    //     messages: [],
    //   };
    //   set((state) => ({ sessions: [newSession, ...state.sessions] }));
    //   set({ activeSessionId: newSession.id });
    //   return newSession.id;
    // },
    //
    // /** Delete a session */
    // deleteSession: (sessionId) =>
    //   set((state) => ({
    //     sessions: state.sessions.filter((s) => s.id !== sessionId),
    //     activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
    //   })),
    //
    // /** Replace a local placeholder session ID with the real backend UUID */
    // promoteSessionId: (localId, realId) =>
    //   set((state) => ({
    //     sessions: state.sessions.map((s) => s.id === localId ? { ...s, id: realId } : s),
    //     activeSessionId: state.activeSessionId === localId ? realId : state.activeSessionId,
    //   })),
    //
    // /** Send a user message and append a simulated bot reply */
    // sendMessage: (sessionId, userText) => {
    //   const userMsg = { id: `msg-${Date.now()}-u`, role: "user", text: userText, timestamp: new Date().toISOString() };
    //   set((state) => ({
    //     sessions: state.sessions.map((s) =>
    //       s.id === sessionId
    //         ? { ...s, title: s.messages.length === 0 ? userText.slice(0, 50) : s.title, messages: [...s.messages, userMsg] }
    //         : s
    //     ),
    //   }));
    //   setTimeout(() => {
    //     const botMsg = { id: `msg-${Date.now()}-b`, role: "bot", text: simulateBotReply(userText), timestamp: new Date().toISOString() };
    //     set((state) => ({
    //       sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, messages: [...s.messages, botMsg] } : s),
    //     }));
    //   }, 800);
    // },
  }),
);
