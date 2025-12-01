"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "@/components/ChatMessage";
import {
  User,
  Bot,
  Send,
  Paperclip,
  Loader2,
  MessageSquare,
  Plus,
  X,
} from "lucide-react";
import PDFUploader from "@/components/PDFUploader";
import { askStream, uploadPDF } from "@/services/chatApi";
import { fetchChats, fetchChatById } from "@/services/historyApi";
import HistoryListItem from "@/components/HistoryListItem";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [sources, setSources] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const loadHistory = useCallback(
    async (signal = null) => {
      if (loadingHistory) return; // Prevent duplicate calls

      setLoadingHistory(true);
      try {
        const data = await fetchChats();
        if (signal?.aborted) return;
        setHistoryList(data || []);
      } catch (e) {
        if (signal?.aborted) return;
        console.error("History load failed:", e);
      } finally {
        if (!signal?.aborted) {
          setLoadingHistory(false);
        }
      }
    },
    [loadingHistory]
  );

  useEffect(() => {
    const abortController = new AbortController();
    loadHistory(abortController.signal);
    return () => abortController.abort();
  }, []); // Only load once on mount

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  const openChat = useCallback(
    async (id) => {
      setLoadingChat(true);
      try {
        const data = await fetchChatById(id);
        setChatId(id);
        setMessages(data.messages || []);
        setStreamingText("");
        setSources([]);
        // Scroll after a brief delay to ensure DOM is updated
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } catch (e) {
        console.error("Failed to open chat:", e);
        alert("Failed to load chat. Please try again.");
      } finally {
        setLoadingChat(false);
      }
    },
    [scrollToBottom]
  );

  const startNewChat = useCallback(() => {
    setChatId(null);
    setMessages([]);
    setStreamingText("");
    setSources([]);
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    const inputText = userInput.trim();
    const updatedMessages = [...messages, { role: "user", text: inputText }];
    setMessages(updatedMessages);
    setUserInput("");
    setStreamingText("");
    setSources([]);
    setIsLoading(true);

    let reader, decoder;
    try {
      ({ reader, decoder } = await askStream(
        inputText,
        updatedMessages,
        chatId
      ));
    } catch (err) {
      console.error("Streaming request failed:", err);
      setMessages([
        ...messages,
        {
          role: "assistant",
          text: "Sorry, I encountered an error. Please try again.",
        },
      ]);
      setIsLoading(false);
      return;
    }

    let buffer = "";
    let assistantText = "";
    let newChatId = chatId;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        if (buffer.includes("[CHAT_ID]")) {
          const parts = buffer.split("[CHAT_ID]");
          const idText = parts[1]?.trim().split(/\s/)[0];
          const parsed = parseInt(idText);
          if (!isNaN(parsed)) {
            newChatId = parsed;
            setChatId(parsed);
            loadHistory();
          }
          buffer = buffer.replace(/\[CHAT_ID\][\s\d]*/g, "");
        }

        if (buffer.includes("[SOURCES]")) {
          const [ansPart, srcPart] = buffer.split("[SOURCES]");
          assistantText += ansPart;
          const srcList = srcPart
            .trim()
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s.length > 2);
          setSources(srcList);
          break;
        }

        assistantText += chunk;
        setStreamingText(assistantText);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Error while reading stream:", err);
      const assistantClean = (assistantText || "").trim();
      if (assistantClean) {
        setMessages([
          ...updatedMessages,
          { role: "assistant", text: assistantClean },
        ]);
      } else {
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            text: "Sorry, I encountered an error while processing your request. Please try again.",
          },
        ]);
      }
      setStreamingText("");
      scrollToBottom();
      setIsLoading(false);
      return;
    }

    const assistantClean = (assistantText || "").trim();
    setMessages([
      ...updatedMessages,
      { role: "assistant", text: assistantClean },
    ]);
    setStreamingText("");
    scrollToBottom();
    setIsLoading(false);

    if (newChatId) {
      setChatId(newChatId);
      await loadHistory();
    }
  }, [userInput, messages, chatId, isLoading, loadHistory, scrollToBottom]);

  const handleUpload = useCallback(
    async (file) => {
      try {
        const res = await uploadPDF(file);
        loadHistory();
        return res;
      } catch (e) {
        console.error("Upload failure:", e);
        throw e;
      }
    },
    [loadHistory]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  return (
    <div className=" bg-white dark:bg-[#0f0f0f] flex">
      {/* Sidebar - Chat History */}
      <aside
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed lg:sticky lg:translate-x-0 top-14 left-0 h-[calc(100vh-3.5rem)] w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 transition-transform duration-200 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={20} />
              Chat History
            </h2>
            <button
              onClick={startNewChat}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X size={16} className="inline mr-1" />
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingHistory && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          )}

          {!loadingHistory && historyList.length === 0 && (
            <div className="text-center py-12 px-4">
              <MessageSquare
                size={48}
                className="mx-auto text-gray-400 dark:text-gray-600 mb-3"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No chat history yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Start a new conversation to begin
              </p>
            </div>
          )}

          <div className="space-y-1">
            {historyList.map((h) => (
              <HistoryListItem
                key={h.id}
                item={{
                  ...h,
                  title: (h.last_message || "New Chat").slice(0, 50),
                }}
                onClick={() => {
                  openChat(h.id);
                  setShowSidebar(false);
                }}
                active={h.id === chatId}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <MessageSquare
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Tutor Chat
              </h1>
            </div>
            <button
              onClick={startNewChat}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>
        </div>

        {/* PDF Uploader */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <PDFUploader onUploaded={handleUpload} />
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] px-4 py-6"
        >
          {loadingChat && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2
                  size={48}
                  className="animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400">
                  Loading chat...
                </p>
              </div>
            </div>
          )}

          {!loadingChat && (
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.length === 0 && !streamingText && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                    <Bot
                      size={40}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Start a Conversation
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Ask me anything about your studies, and I'll help you learn!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "Explain quantum mechanics",
                      "Help with calculus",
                      "What is photosynthesis?",
                      "Solve this equation",
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setUserInput(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <ChatMessage key={i} role={m.role} text={m.text} />
              ))}

              {streamingText && (
                <ChatMessage
                  role="assistant"
                  text={streamingText}
                  isStreaming
                />
              )}

              {/* {sources.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Sources:
                  </h3>
                  <ul className="space-y-1">
                    {sources.map((src, i) => (
                      <li
                        key={i}
                        className="text-xs text-blue-700 dark:text-blue-300"
                      >
                        • {src}
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your question here... (Press Enter to send, Shift+Enter for new line)"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[52px] max-h-32"
                  rows={1}
                  disabled={isLoading}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {userInput.trim() && (
                    <span className="text-xs text-gray-400">
                      {userInput.length} chars
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!userInput.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
