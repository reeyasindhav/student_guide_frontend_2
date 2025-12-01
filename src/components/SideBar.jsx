"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  fetchSummaries,
  fetchSavedVideos,
  fetchChats,
  fetchAttempts,
} from "@/services/historyApi";

/**
 * SideBar (drawer) - shows different history depending on the active route.
 *
 * Props:
 *  - open: boolean (controls visibility)
 *  - onClose: function (optional) called after a click to close the drawer
 */
export default function SideBar({ open, onClose }) {
  const path = usePathname();
  const router = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        if (path.startsWith("/youtube")) {
          const data = await fetchSavedVideos();
          setItems(data || []);
        } else if (path.startsWith("/summarizer")) {
          const data = await fetchSummaries();
          setItems(data || []);
        } else if (path.startsWith("/chatbot")) {
          const data = await fetchChats();
          setItems(data || []);
        } else if (path.startsWith("/quiz")) {
          // attempts endpoint used for quiz page
          const data = await fetchAttempts();
          setItems(data || []);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Failed to load history for sidebar:", err);
        setItems([]);
      }
    }
    load();
  }, [path]);

  // When an item is clicked, route to the same page with a query param
  function handleClick(item) {
    // ensure item exists
    if (!item) return;

    try {
      if (path.startsWith("/youtube")) {
        // item expected to have video_id
        const vid = item.video_id || item.videoId || item.id;
        if (vid) router.push(`/youtube?videoId=${encodeURIComponent(vid)}`);
      } else if (path.startsWith("/summarizer")) {
        // item expected to have id
        const id = item.id;
        if (id) router.push(`/summarizer?summaryId=${encodeURIComponent(id)}`);
      } else if (path.startsWith("/chatbot")) {
        const id = item.id;
        if (id) router.push(`/chatbot?chatId=${encodeURIComponent(id)}`);
      } else if (path.startsWith("/quiz")) {
        const id = item.id;
        if (id) router.push(`/quiz?attemptId=${encodeURIComponent(id)}`);
      }
    } catch (err) {
      console.error("Navigation error:", err);
    }

    // close drawer if parent provided onClose
    if (typeof onClose === "function") {
      onClose();
    }
  }

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg border-r transform transition-transform duration-300 overflow-y-auto z-30
      ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <h2 className="text-lg font-semibold p-4 border-b bg-gray-50">
        {path.startsWith("/youtube")
          ? "Saved Videos"
          : path.startsWith("/summarizer")
          ? "Summaries"
          : path.startsWith("/chatbot")
          ? "Chat History"
          : path.startsWith("/quiz")
          ? "Quiz Attempts"
          : "History"}
      </h2>

      <div className="p-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-500">No history yet.</p>
        )}

        {items.map((it, index) => (
          <button
            key={index}
            onClick={() => handleClick(it)}
            className="w-full text-left p-3 mb-2 bg-gray-50 rounded hover:bg-gray-100"
          >
            <div className="text-sm font-medium truncate">
              {/* Prefer human-friendly fields */}
              {it.title ||
                (it.last_message ? it.last_message : it.video_id ? it.video_id : `Quiz ${it.id}`)}
            </div>
            <div className="text-xs text-gray-500">
              {it.created_at?.substring(0, 10) || it.saved_at?.substring(0, 10) || ""}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
