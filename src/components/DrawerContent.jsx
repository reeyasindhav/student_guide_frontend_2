"use client";
import { useEffect, useState } from "react";
import {
  fetchSummaries,
  fetchSavedVideos,
  fetchChats,
  fetchAttempts,
} from "@/services/historyApi";

export default function DrawerContent({ pathname }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      if (pathname.startsWith("/youtube")) {
        const data = await fetchSavedVideos();
        setItems(data);
      } else if (pathname.startsWith("/summarizer")) {
        const data = await fetchSummaries();
        setItems(data);                   
      } else if (pathname.startsWith("/chatbot")) {
        const data = await fetchChats();
        setItems(data);
      } else if (pathname.startsWith("/quiz")) {
        const data = await fetchAttempts();
        setItems(data);
      } else {
        setItems([]);
      }
    }
    load();
  }, [pathname]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">
        {pathname.startsWith("/youtube") && "Saved Videos"}
        {pathname.startsWith("/summarizer") && "Summaries"}
        {pathname.startsWith("/chatbot") && "Chat History"}
        {pathname.startsWith("/quiz") && "Quiz Attempts"}
      </h2>

      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="p-3 rounded bg-gray-50 border hover:bg-gray-100 cursor-pointer"
          >
            <p className="font-medium text-sm">
              {it.title || it.last_message || `Record #${it.id}`}
            </p>
            <p className="text-xs text-gray-500">
              {it.created_at || it.saved_at}
            </p>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-gray-500 text-sm">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}
