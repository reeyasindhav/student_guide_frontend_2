"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { uploadVideo, summarizeYoutubeById } from "@/services/summarizerApi";
import SummaryViewer from "@/components/SummaryViewer";
import { useSearchParams } from "next/navigation";
import { fetchSummaries, fetchSummaryById } from "@/services/historyApi";
import HistoryListItem from "@/components/HistoryListItem";
import { isValidYouTubeUrl, extractVideoId } from "@/utils/urlValidator";
import {
  FileText,
  Upload,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  Video,
  FileVideo,
  X,
} from "lucide-react";

function SummarizerContent() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
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

  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentSummaryId, setCurrentSummaryId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const autoRunRef = useRef(false);
  const searchParams = useSearchParams();
  const fileInputRef = useRef(null);

  // Load sidebar summaries
  const loadHistory = useCallback(
    async (signal = null) => {
      if (loadingHistory) return; // Prevent duplicate calls

      setLoadingHistory(true);
      try {
        const data = await fetchSummaries();
        if (signal?.aborted) return;
        setHistoryList(data || []);
      } catch (err) {
        if (signal?.aborted) return;
        console.error("Failed to load summaries:", err);
        setHistoryList([]);
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

  // Auto-summarize when arriving from YouTube page or open saved summary
  useEffect(() => {
    const videoId = searchParams.get("videoId");
    const summaryId = searchParams.get("summaryId");

    if (videoId && !autoRunRef.current) {
      autoRunRef.current = true;
      setIsAutoStarted(true);
      setUrl("");
      setResult(null);
      handleSummarizeById(videoId);
      return;
    }

    if (summaryId) {
      if (String(currentSummaryId) !== String(summaryId)) {
        openHistorySummary(summaryId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only depend on searchParams to avoid infinite loops

  function startStageAnimation() {
    setStageIndex(0);
    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, stages.length - 1));
    }, 2000);
    return interval;
  }

  // Validate URL on change
  const handleUrlChange = useCallback((value) => {
    setUrl(value);
    setUrlError("");

    if (value.trim() && !isValidYouTubeUrl(value)) {
      setUrlError("Please enter a valid YouTube URL");
    }
  }, []);

  // Summarize from URL
  const handleYoutube = useCallback(async () => {
    const trimmedUrl = url.trim();

    // Validate URL
    if (!trimmedUrl) {
      setUrlError("Please enter a YouTube URL");
      return;
    }

    if (!isValidYouTubeUrl(trimmedUrl)) {
      setUrlError(
        "Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...)"
      );
      return;
    }

    if (isAutoStarted) return;

    setError(null);
    setUrlError("");
    setLoading(true);
    setResult(null);

    const anim = startStageAnimation();
    try {
      const data = await summarizeYoutubeById(trimmedUrl);
      setResult(data.result);
      await loadHistory();
      setUrl(""); // Clear input on success
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      clearInterval(anim);
      setLoading(false);
      setStageIndex(stages.length - 1);
    }
  }, [url, isAutoStarted, loadHistory]);

  // Summarize via videoId (auto-start)
  const handleSummarizeById = useCallback(
    async (videoId) => {
      // Prevent duplicate calls
      if (loading) return;

      setError(null);
      setLoading(true);
      setResult(null);

      const anim = startStageAnimation();
      try {
        const data = await summarizeYoutubeById(videoId);
        setResult(data.result);
        await loadHistory();
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || String(err));
        }
      } finally {
        clearInterval(anim);
        setLoading(false);
        setStageIndex(stages.length - 1);
      }
    },
    [loadHistory, loading]
  );

  // Upload video file
  const handleFileUpload = useCallback(async () => {
    if (!file) return;

    setError(null);
    setLoading(true);
    setResult(null);

    const anim = startStageAnimation();
    try {
      const data = await uploadVideo(file);
      setResult(data.result);
      await loadHistory();
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      clearInterval(anim);
      setLoading(false);
      setStageIndex(stages.length - 1);
    }
  }, [file, loadHistory]);

  // Load summary from sidebar
  const openHistorySummary = useCallback(
    async (id) => {
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
        loadHistory();
      } catch (err) {
        console.error("openHistorySummary error:", err);
        setError("Failed to load saved summary");
      } finally {
        setLoading(false);
      }
    },
    [loadHistory]
  );

  const isValidUrl = url.trim() && isValidYouTubeUrl(url) && !urlError;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] flex">
      {/* Sidebar - History */}
      <aside
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed lg:sticky lg:translate-x-0 top-14 left-0 h-[calc(100vh-3.5rem)] w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 transition-transform duration-200 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={20} />
              Saved Summaries
            </h2>
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
              <FileText
                size={48}
                className="mx-auto text-gray-400 dark:text-gray-600 mb-3"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No summaries yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Create your first summary to get started
              </p>
            </div>
          )}

          <div className="space-y-1">
            {historyList.map((item) => (
              <HistoryListItem
                key={item.id}
                item={item}
                onClick={() => {
                  openHistorySummary(item.id);
                  setShowSidebar(false);
                }}
                subtitle={item.summary_preview}
                active={String(item.id) === String(currentSummaryId)}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <FileText
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Video Summarizer
              </h1>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8">
              {/* Header */}
              <div className="mb-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Convert YouTube videos or upload your own videos into concise
                  study notes, key points, formulas, and practice questions.
                </p>
              </div>

              {/* YouTube URL Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <LinkIcon size={16} className="inline mr-2" />
                  YouTube Video URL
                </label>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="https://youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && isValidUrl && !loading) {
                            handleYoutube();
                          }
                        }}
                        className={`w-full px-4 py-3 pr-10 border rounded-lg text-base transition-all ${
                          urlError
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : isValidUrl
                            ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                            : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2`}
                        disabled={loading || isAutoStarted}
                      />
                      {url && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isValidUrl ? (
                            <CheckCircle size={20} className="text-green-500" />
                          ) : urlError ? (
                            <AlertCircle size={20} className="text-red-500" />
                          ) : null}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleYoutube}
                      disabled={!isValidUrl || loading || isAutoStarted}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Video size={18} />
                          Summarize
                        </>
                      )}
                    </button>
                  </div>
                  {urlError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 animate-in fade-in">
                      <AlertCircle size={16} />
                      <span>{urlError}</span>
                    </div>
                  )}
                  {isValidUrl && !urlError && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in">
                      <CheckCircle size={16} />
                      <span>Valid YouTube URL</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  OR
                </span>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Upload size={16} className="inline mr-2" />
                  Upload Video File
                </label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => setFile(e.target.files[0])}
                      disabled={loading}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleFileUpload}
                    disabled={!file || loading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileVideo size={18} />
                        Upload & Summarize
                      </>
                    )}
                  </button>
                </div>
                {file && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>{file.name}</span>
                    <span className="text-gray-400">
                      ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 animate-in fade-in">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Loader2
                        size={32}
                        className="animate-spin text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Analyzing video... Please wait
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        {stages[stageIndex]}
                      </div>
                      <div className="w-full h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              ((stageIndex + 1) / stages.length) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <AlertCircle
                      size={20}
                      className="text-red-600 dark:text-red-400 flex-shrink-0"
                    />
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && !loading && (
                <div className="mt-8 animate-in fade-in">
                  <SummaryViewer data={result} />
                </div>
              )}

              {/* Empty State */}
              {!result && !loading && !error && (
                <div className="mt-12 text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                    <FileText
                      size={32}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to Summarize
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Paste a YouTube URL or upload a video file to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SummarizerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f] flex items-center justify-center">
          <Loader2
            className="animate-spin text-blue-600 dark:text-blue-400"
            size={48}
          />
        </div>
      }
    >
      <SummarizerContent />
    </Suspense>
  );
}
