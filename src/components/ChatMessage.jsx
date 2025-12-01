"use client";

import { User, Bot, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatMessage({ role, text, isStreaming = false }) {
  const isUser = role === "user";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (isStreaming) {
      setDisplayedText(text);
    } else {
      setDisplayedText(text);
    }
  }, [text, isStreaming]);

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "justify-end" : "justify-start"
      } animate-in fade-in slide-in-from-bottom-2`}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Bot size={18} className="text-white" />
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"} max-w-[80%] md:max-w-[70%]`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {displayedText.split("\n").map((line, i, arr) => (
              <p
                key={i}
                className={`${
                  i < arr.length - 1 ? "mb-2" : ""
                } leading-relaxed whitespace-pre-wrap break-words`}
              >
                {line || "\u00A0"}
              </p>
            ))}
          </div>
        </div>

        {isStreaming && (
          <div className="flex items-center gap-1 px-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg">
            <User size={18} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
