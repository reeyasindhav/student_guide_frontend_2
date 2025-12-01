"use client";

import { useEffect, useRef, useState } from "react";
import { uploadVideo, summarizeYoutubeById } from "@/services/summarizerApi";
import SummaryViewer from "@/components/SummaryViewer";
import { useSearchParams } from "next/navigation";

import { fetchSummaries, fetchSummaryById } from "@/services/historyApi";
import HistoryListItem from "@/components/HistoryListItem";

export default function SummarizerPage() {
  /* ---------- Existing summarizer states ---------- */
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isAutoStarted, setIsAutoStarted] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const stages = [
    "Queued",
    "Downloading video",
    "Extracting audio",
    "Transcribing audio",
    "Generating summary & notes",
    "Finishing",
  ];

  /* ---------- Sidebar data ---------- */
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // track currently opened summary id (to avoid reloading)
  const [currentSummaryId, setCurrentSummaryId] = useState(null);

  const autoRunRef = useRef(false);
  const searchParams = useSearchParams();

  /* ---------- Load sidebar summaries ---------- */
  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await fetchSummaries();
      setHistoryList(data || []);
    } catch (err) {
      console.error("Failed to load summaries:", err);
      setHistoryList([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  /* ---------- Auto-summarize when arriving from YouTube page or open saved summary ---------- */
  useEffect(() => {
    const videoId = searchParams.get("videoId");
    const summaryId = searchParams.get("summaryId");

    // If a videoId query param exists -> auto-start summarization (only once)
    if (videoId && !autoRunRef.current) {
      autoRunRef.current = true;
      setIsAutoStarted(true);
      setUrl("");
      setResult(null);
      handleSummarizeById(videoId);
      return; // prefer video auto-run over loading summary if both present
    }

    // If a summaryId param exists -> open saved summary (can be repeated)
    if (summaryId) {
      // Avoid refetching if already loaded same id
      if (String(currentSummaryId) !== String(summaryId)) {
        openHistorySummary(summaryId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // intentionally only depends on searchParams

  function startStageAnimation() {
    setStageIndex(0);
    const interval = setInterval(() => {
      setStageIndex(i => Math.min(i + 1, stages.length - 1));
    }, 2000);
    return interval;
  }

  /* ---------- Actions: Summarize from URL ---------- */
  async function handleYoutube() {
    if (!url.trim() || isAutoStarted) return;

    setError(null);
    setLoading(true);
    setResult(null);

    const anim = startStageAnimation();
    try {
      const data = await summarizeYoutubeById(url);
      setResult(data.result);
      await loadHistory(); // refresh sidebar after successful summary save
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      clearInterval(anim);
      setLoading(false);
      setStageIndex(stages.length - 1);
    }
  }

  /* ---------- Actions: Summarize via videoId (auto-start) ---------- */
  async function handleSummarizeById(videoId) {
    setError(null);
    setLoading(true);
    setResult(null);

    const anim = startStageAnimation();
    try {
      const data = await summarizeYoutubeById(videoId);
      setResult(data.result);
      await loadHistory(); // refresh sidebar
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      clearInterval(anim);
      setLoading(false);
      setStageIndex(stages.length - 1);
    }
  }

  /* ---------- Actions: Upload video file ---------- */
  async function handleFileUpload() {
    if (!file) return;

    setError(null);
    setLoading(true);
    setResult(null);

    const anim = startStageAnimation();
    try {
      const data = await uploadVideo(file);
      setResult(data.result);
      await loadHistory(); // refresh sidebar
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      clearInterval(anim);
      setLoading(false);
      setStageIndex(stages.length - 1);
    }
  }

  /* ---------- Load summary from sidebar or query param ---------- */
  async function openHistorySummary(id) {
    if (!id) return;
    setLoading(true);
    try {
      const d = await fetchSummaryById(id);
      setResult({
        summary: d.summary,
        key_points: d.key_points,
        formulas: d.formulas,
        definitions: d.definitions,
        practice_questions: d.practice_questions,
      });
      setCurrentSummaryId(id);
      setError(null);
      // refresh history to reflect possible recent changes
      loadHistory();
    } catch (err) {
      console.error("openHistorySummary error:", err);
      setError("Failed to load saved summary");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="flex gap-8 min-h-[calc(100vh-56px)] bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-black dark:to-zinc-900 py-8 px-4">
      {/* -------- Sidebar (static panel on this page) -------- */}
      <aside className="w-72 sticky top-20 self-start bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-5 h-fit min-h-[300px]">
        <div className="font-bold text-xl text-green-700 dark:text-green-300 mb-3">Saved Summaries</div>

        {loadingHistory && <div className="text-sm text-gray-500">Loading...</div>}
        {!loadingHistory && historyList.length === 0 && (
          <div className="text-sm text-gray-400">No summaries found yet.</div>
        )}

        <div className="mt-3 space-y-2">
          {historyList.map(item => (
            <HistoryListItem
              key={item.id}
              item={item}
              onClick={() => openHistorySummary(item.id)}
              subtitle={item.summary_preview}
              active={String(item.id) === String(currentSummaryId)}
            />
          ))}
        </div>
      </aside>

      {/* -------- Main summarizer panel -------- */}
      <main className="flex-1 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">AI Video Summarizer</h1>
          <p className="text-gray-600 dark:text-zinc-400 text-base mb-6">
            Instantly convert YouTube lectures or your own videos into concise study notes, key points, formulas, and practice questions. Powered by advanced AI.
          </p>

          {/* Input controls */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Paste a YouTube video link</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="border p-3 rounded-lg w-full text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                disabled={loading || isAutoStarted}
              />
              <button
                onClick={handleYoutube}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
                disabled={loading || isAutoStarted}
              >
                Summarize Video
              </button>
            </div>
          </div>

          {/* File upload */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Or upload a local video file</h3>
            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
                className="border p-2 rounded-lg"
              />
              <button
                onClick={handleFileUpload}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                disabled={!file || loading}
              >
                Upload & Summarize
              </button>
            </div>
          </div>

          {/* Loading UI */}
          {loading && (
            <div className="mt-6 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow flex gap-4 items-center border border-green-100 dark:border-zinc-800">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              </div>

              <div>
                <div className="text-base font-semibold text-green-700 dark:text-green-300">
                  Analyzing video... Please wait
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400 mt-1">
                  {stages[stageIndex]}
                </div>
                <div className="mt-2 w-64 h-2 bg-gray-200 dark:bg-zinc-800 rounded">
                  <div
                    className="h-full bg-green-600 rounded"
                    style={{
                      width: `${((stageIndex + 1) / stages.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">{error}</div>
          )}

          {result && !loading && (
            <div className="mt-8">
              <SummaryViewer data={result} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
