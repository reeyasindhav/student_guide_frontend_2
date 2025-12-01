"use client";
import { useState } from "react";
import { fetchVideos } from "@/services/youtubeApi";
import VideoCardHorizontal from "@/components/VideoCardHorizontal";
import { useRouter } from "next/navigation";

import { fetchSavedVideos } from "@/services/historyApi";
import HistoryListItem from "@/components/HistoryListItem";

function formatISODateToYMD(iso) {
  if (!iso) return "";
  try {
    return iso.split("T")[0];
  } catch (e) {
    return iso;
  }
}

export default function YoutubePage() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState("relevance");
  const [includeShorts, setIncludeShorts] = useState(false);
  const [useGeminiFilter, setUseGeminiFilter] = useState(true);

  const [playing, setPlaying] = useState(null);

  const router = useRouter();

  // Load saved videos once
  useState(() => {
    loadSavedVideos();
  });

  async function loadSavedVideos() {
    setLoadingSaved(true);
    try {
      const data = await fetchSavedVideos();
      setSavedVideos(data);
    } catch (err) {
      console.error("Failed to load saved videos", err);
    } finally {
      setLoadingSaved(false);
    }
  }

  async function saveVideoToDB(video) {
    try {
      const res = await fetch("http://localhost:8000/youtube/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: video.videoId || video.video_id,
          title: video.title,
          channel: video.channelTitle || video.channel,
          thumbnail: video.thumbnails?.medium?.url,
          published_at: video.publishedAt
        }),
      });

      if (!res.ok) throw new Error("Failed to save video");

      await loadSavedVideos(); // refresh sidebar
      alert("Saved!");
    } catch (err) {
      console.error(err);
      alert("Could not save video");
    }
  }

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const vids = await fetchVideos(query, {
        sortBy,
        includeShorts,
        useGeminiFilter,
        maxResults: 3,
      });
      const mapped = vids.map(v => ({
        ...v,
        publishedDate: formatISODateToYMD(v.publishedAt),
      }));
      setVideos(mapped);
    } catch (err) {
      setError(err.message);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  function openPlayer(video) {
    const videoId = video.video_id || video.videoId || video.id || video.videoId?.videoId;
    setPlaying({
      videoId,
      title: video.title,
      channelTitle: video.channel || video.channelTitle,
      viewCount: video.viewCount,
      publishedDate: video.publishedDate,
      description: video.description || "",
    });
  }

  function closePlayer() {
    setPlaying(null);
  }

  function goToSummarize(video) {
    const vid =
      video.videoId ||
      video.video_id ||
      (video.id && typeof video.id === "string"
        ? video.id
        : video.id?.videoId);

    router.push(`/summarizer?videoId=${encodeURIComponent(vid)}`);
  }

  return (
    <div className="flex gap-8 min-h-[calc(100vh-56px)] bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-black dark:to-zinc-900 py-8 px-4">
      {/* ---------- LEFT SIDEBAR ---------- */}
      <aside className="w-72 sticky top-20 self-start bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 h-fit min-h-[300px]">
        <div className="font-bold text-xl text-indigo-700 dark:text-indigo-300 mb-3">Saved Videos</div>

        {loadingSaved && <div className="text-sm text-gray-500">Loading...</div>}
        {!loadingSaved && savedVideos.length === 0 && (
          <div className="text-sm text-gray-400">No saved videos yet.</div>
        )}

        <div className="mt-3 space-y-2">
          {savedVideos.map((item) => (
            <HistoryListItem
              key={item.id}
              item={item}
              subtitle={item.channel}
              onClick={() => openPlayer(item)}
            />
          ))}
        </div>
      </aside>

      {/* ---------- MAIN PANEL ---------- */}
      <main className="flex-1 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">Search JEE/NEET Videos</h1>
          <p className="text-gray-600 dark:text-zinc-400 text-base mb-6">
            Find educational videos — Gemini filters out non-edu content.
          </p>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Search topic e.g. Matrices, Kinematics"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="p-3 border rounded-lg w-full text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <label className="font-medium">
              Sort:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-2 p-2 border rounded-lg bg-white dark:bg-zinc-800"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Upload date</option>
                <option value="viewCount">View count</option>
                <option value="rating">Rating</option>
              </select>
            </label>

            <label className="flex items-center font-medium">
              <input
                type="checkbox"
                checked={includeShorts}
                onChange={(e) => setIncludeShorts(e.target.checked)}
                className="mr-2 accent-indigo-600"
              />
              Include Shorts
            </label>

            <label className="flex items-center font-medium">
              <input
                type="checkbox"
                checked={useGeminiFilter}
                onChange={(e) => setUseGeminiFilter(e.target.checked)}
                className="mr-2 accent-indigo-600"
              />
              Gemini EDU filter
            </label>
          </div>

          {loading && <p className="mt-4 text-indigo-600 font-semibold">Loading...</p>}
          {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}

          <div className="mt-6 space-y-6">
            {videos.map((v) => (
              <VideoCardHorizontal
                key={v.videoId}
                video={v}
                onPlay={() => openPlayer(v)}
                onSummarize={() => goToSummarize(v)}
                onSave={(video) => saveVideoToDB(video)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* ---------- PLAYER MODAL ---------- */}
      {playing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-11/12 md:w-3/5 lg:w-1/2 p-6 max-h-[90vh] overflow-auto shadow-2xl border border-indigo-100 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-bold text-2xl text-indigo-700 dark:text-indigo-300">{playing.title}</h2>
              <button
                className="text-sm text-gray-700 dark:text-zinc-300 p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                onClick={closePlayer}
              >
                Back
              </button>
            </div>

            <div className="mt-3 aspect-video rounded-lg overflow-hidden shadow">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${playing.videoId}`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            <div className="mt-4 text-base text-gray-700 dark:text-zinc-300">
              <p>
                <strong>Channel:</strong> {playing.channelTitle}
              </p>
              <p>
                <strong>Views:</strong> {playing.viewCount}
              </p>
              <p>
                <strong>Published:</strong> {playing.publishedDate}
              </p>

              {playing.description && (
                <div className="mt-3">
                  <strong>Description:</strong>
                  <p className="whitespace-pre-line text-sm mt-1 text-gray-600 dark:text-zinc-400">
                    {playing.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
