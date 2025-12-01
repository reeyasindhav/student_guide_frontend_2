// frontend/src/services/historyApi.js
const BASE = "http://localhost:8000";

export async function fetchSummaries() {
  const res = await fetch(`${BASE}/history/summaries`);
  if (!res.ok) throw new Error("Failed to load summaries");
  return await res.json();
}

export async function fetchSummaryById(id) {
  const res = await fetch(`${BASE}/history/summaries/${id}`);
  if (!res.ok) throw new Error("Failed to load summary");
  return await res.json();
}

export async function fetchSavedVideos() {
  const res = await fetch(`${BASE}/history/videos`);
  if (!res.ok) throw new Error("Failed to load videos");
  return await res.json();
}

export async function fetchChats() {
  const res = await fetch(`${BASE}/history/chats`);
  if (!res.ok) throw new Error("Failed to load chats");
  return await res.json();
}

export async function fetchQuizzes() {
  const res = await fetch(`${BASE}/history/quizzes`);
  if (!res.ok) throw new Error("Failed to load quizzes");
  return await res.json();
}

export async function fetchAttempts() {
  const res = await fetch(`${BASE}/history/attempts`);
  if (!res.ok) throw new Error("Failed to load attempts");
  return await res.json();
}


/* --------- New helpers --------- */

/** Get full chat by id (expects backend /history/chats/{id}) */
export async function fetchChatById(id) {
  const res = await fetch(`${BASE}/history/chats/${id}`);
  if (!res.ok) throw new Error("Failed to load chat");
  return await res.json();
}

/** Get full attempt detail by id (expects backend /history/attempts/{id}) */
export async function fetchAttemptById(id) {
  const res = await fetch(`${BASE}/history/attempts/${id}`);
  if (!res.ok) throw new Error("Failed to load attempt");
  return await res.json();
}

/** Get saved quiz JSON by quiz id (optional backend /history/quizzes/{id}) */
export async function fetchQuizById(quizId) {
  const res = await fetch(`${BASE}/history/quizzes/${quizId}`);
  if (!res.ok) throw new Error("Failed to load quiz");
  return await res.json();
}