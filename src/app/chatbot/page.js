"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";
import { User, Bot } from "lucide-react";
import PDFUploader from "@/components/PDFUploader";
import { askStream, uploadPDF } from "@/services/chatApi";

import {
  fetchChats,
  fetchChatById
} from "@/services/historyApi";
import HistoryListItem from "@/components/HistoryListItem";

export default function ChatbotPage() {
  /* ---------- CHAT STATES ---------- */
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [sources, setSources] = useState([]);

  const [chatId, setChatId] = useState(null);

  const containerRef = useRef(null);

  /* ---------- HISTORY ---------- */
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ===============================
        LOAD HISTORY FROM DB
     =============================== */
  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await fetchChats();
      setHistoryList(data);
    } catch (e) {
      console.error("History load failed:", e);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  /* ===============================
         OPEN A SAVED CHAT
     =============================== */
  async function openChat(id) {
    try {
      const data = await fetchChatById(id);
      setChatId(id);
      setMessages(data.messages || []);
      setStreamingText("");
      setSources([]);
      scrollToBottom();
    } catch (e) {
      console.error("Failed to open chat:", e);
    }
  }

  /* ===============================
         SEND MESSAGE (STREAM)
     =============================== */
  async function sendMessage() {
    if (!userInput.trim()) return;

    // 1) push user message locally (optimistic)
    const updatedMessages = [...messages, { role: "user", text: userInput }];
    setMessages(updatedMessages);
    setUserInput("");
    setStreamingText("");
    setSources([]);

    // 2) ask backend to stream
    let reader, decoder;
    try {
      ({ reader, decoder } = await askStream(userInput, updatedMessages, chatId));
    } catch (err) {
      console.error("Streaming request failed:", err);
      return;
    }

    // 3) read streaming chunks
    let buffer = "";
    let assistantText = "";
    let newChatId = chatId;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        // If a chunk contains a chat id marker (may arrive in tail), extract it
        if (buffer.includes("[CHAT_ID]")) {
          // extract digits after marker (allow newline)
          const parts = buffer.split("[CHAT_ID]");
          // take the last piece after marker (can be trailing)
          const idText = parts[1].trim().split(/\s/)[0];
          const parsed = parseInt(idText);
          if (!isNaN(parsed)) {
            newChatId = parsed;
            setChatId(parsed);
            // refresh history list (shows this convo)
            loadHistory();
          }
          // remove the marker segment from buffer to avoid leaking into message
          buffer = buffer.replace(/\[CHAT_ID\][\s\d]*/g, "");
        }

        // If we have a sources separator, split out final answer and sources
        if (buffer.includes("[SOURCES]")) {
          const [ansPart, srcPart] = buffer.split("[SOURCES]");
          assistantText += ansPart;
          // parse sources lines
          const srcList = srcPart
            .trim()
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s.length > 2);
          setSources(srcList);
          break; // end streaming (we received sources)
        }

        // otherwise keep streaming into assistantText + update UI
        assistantText += chunk;
        setStreamingText(assistantText);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Error while reading stream:", err);
    }

    // 4) finalize: append assistant message (without inline sources)
    const assistantClean = (assistantText || "").trim();
    setMessages([...updatedMessages, { role: "assistant", text: assistantClean }]);
    setStreamingText("");
    scrollToBottom();

    // 5) if backend returned a chat id (newChatId) refresh history
    if (newChatId) {
      setChatId(newChatId);
      await loadHistory();
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 80);
  }

  /* ===============================
            PDF Upload handler
     =============================== */
  async function handleUpload(file) {
    try {
      const res = await uploadPDF(file);
      // show toast or reload history
      loadHistory();
      return res;
    } catch (e) {
      console.error("Upload failure:", e);
      throw e;
    }
  }

  /* ===============================
              UI
     =============================== */
  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-black dark:to-zinc-900 py-8 px-4">
      {/* ---------- LEFT HISTORY BAR ---------- */}
      <aside className="w-72 sticky top-20 self-start bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 h-fit min-h-[300px] border-r border-gray-100 dark:border-zinc-800">
        <div className="font-bold text-xl text-blue-700 dark:text-blue-300 mb-3">Chat History</div>

        {loadingHistory && <p className="text-sm text-gray-500">Loading...</p>}
        {!loadingHistory && historyList.length === 0 && (
          <p className="text-sm text-gray-400">No chats yet.</p>
        )}

        <div className="mt-3 space-y-2">
          {historyList.map((h) => (
            <HistoryListItem
              key={h.id}
              item={{
                ...h,
                title: (h.last_message || "New Chat").slice(0, 40),
              }}
              onClick={() => openChat(h.id)}
            />
          ))}
        </div>
      </aside>

      {/* ---------- MAIN CHAT PANEL ---------- */}
      <div className="flex flex-col flex-1 max-w-3xl mx-auto rounded-xl shadow-lg bg-white dark:bg-zinc-900">
        {/* PDF uploader */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-t-xl">
          <PDFUploader onUploaded={handleUpload} />
        </div>

        {/* MESSAGES */}
        <div
          ref={containerRef}
          className="flex-1 p-6 bg-gray-50 dark:bg-zinc-800 overflow-y-auto rounded-b-xl"
        >
          {messages.map((m, i) => (
            <div className="flex items-end mb-2" key={i}>
              {m.role === "user" ? (
                <div className="flex items-center gap-2 w-full justify-end">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white mr-2">
                    <User size={20} />
                  </span>
                  <ChatMessage role={m.role} text={m.text} />
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full justify-start">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white mr-2">
                    <Bot size={20} />
                  </span>
                  <ChatMessage role={m.role} text={m.text} />
                </div>
              )}
            </div>
          ))}

          {streamingText && (
            <div className="flex items-center gap-2 w-full justify-start">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white mr-2 animate-pulse">
                <Bot size={20} />
              </span>
              <ChatMessage role="assistant" text={streamingText} />
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex rounded-b-xl">
          <input
            className="flex-1 p-3 border rounded-lg bg-gray-100 dark:bg-zinc-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          />

          <button
            onClick={sendMessage}
            className="ml-3 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
