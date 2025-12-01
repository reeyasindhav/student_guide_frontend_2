// frontend/src/services/chatApi.js
const BASE = "http://localhost:8000";

/**
 * askStream(question, history, chatId)
 * - question: string
 * - history: array of {role, text}
 * - chatId: number | null
 *
 * Returns: { reader, decoder } for streaming read loop
 */
export async function askStream(question, history, chatId) {
  const form = new FormData();
  form.append("question", question);
  form.append("history", JSON.stringify(history || []));

  // ALWAYS send chat_id; backend will interpret "" as None/new chat
  form.append("chat_id", chatId ? String(chatId) : "");
  // keep context_files empty by default; frontend can pass JSON string of upload IDs
  form.append("context_files", "[]");

  const res = await fetch(`${BASE}/chatbot/ask-stream`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Backend error:", err);
    throw new Error("Streaming failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  return { reader, decoder };
}

// export async function uploadPDF(file) {
//   const formData = new FormData();
//   formData.append("file", file);

//   const res = await fetch("http://localhost:8000/chatbot/upload", {
//     method: "POST",
//     body: formData,
//   });

//   if (!res.ok) {
//     const txt = await res.text();
//     throw new Error("Upload failed: " + txt);
//   }

//   return res.json();
// }


export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/chatbot/upload", {
    method: "POST",
    body: formData,
  });

  return res.json();
}
