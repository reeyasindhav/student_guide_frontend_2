"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { fetchVideos } from "@/services/youtubeApi";
import VideoCard from "@/components/VideoCard";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchSavedVideos } from "@/services/historyApi";
import { API_BASE_URL } from "@/config/api";
import { VideoGridSkeleton } from "@/components/LoadingSkeleton";
import { Filter, Grid, List, X, Loader2 } from "lucide-react";

function formatISODateToYMD(iso) {
  if (!iso) return "";
  try {
    return iso.split("T")[0];
  } catch (e) {
    return iso;
  }
}

function YoutubeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [videos, setVideos] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [sortBy, setSortBy] = useState("relevance");
  const [includeShorts, setIncludeShorts] = useState(false);
  const [useGeminiFilter, setUseGeminiFilter] = useState(false);
  const [playing, setPlaying] = useState(null);

  const searchAbortRef = useRef(null);

  useEffect(() => {
    loadSavedVideos();
  }, []);

  useEffect(() => {
    return () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      searchAbortRef.current = new AbortController();
      handleSearch(initialQuery, searchAbortRef.current.signal);
    }
    return () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, []);

  const loadSavedVideos = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const data = await fetchSavedVideos();
      setSavedVideos(data || []);
    } catch (err) {
      console.error("Failed to load saved videos", err);
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  const saveVideoToDB = useCallback(
    async (video) => {
      const videoId =
        video.videoId || video.video_id || video.id?.videoId || video.id;
      const title = video.title || "Untitled Video";
      const channel = video.channelTitle || video.channel || "Unknown Channel";
      const thumbnail =
        video.thumbnails?.medium?.url ||
        video.thumbnails?.default?.url ||
        video.thumbnail ||
        "";
      const publishedAt =
        video.publishedAt || video.published_at || new Date().toISOString();

      if (!videoId) {
        alert("Error: Video ID is missing. Cannot save video.");
        throw new Error("Video ID is missing");
      }

      const res = await fetch(`${API_BASE_URL}/youtube/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: videoId,
          title: title,
          channel: channel,
          thumbnail: thumbnail,
          published_at: publishedAt,
        }),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ detail: "Failed to save video" }));
        const errorMessage = errorData.detail || "Failed to save video";
        alert(`Could not save video: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const savedData = await res.json();

      console.log("Video saved successfully:", savedData);

      loadSavedVideos().catch((err) => {
        console.error("Failed to refresh saved videos:", err);
      });

      return savedData;
    },
    [loadSavedVideos]
  );

  const handleSearch = useCallback(
    async (searchQuery = query, signal = null) => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      setError(null);
      setVideos([]);

      try {
        const vids = await fetchVideos(
          searchQuery,
          {
            sortBy,
            includeShorts,
            useGeminiFilter,
            maxResults: 20,
          },
          signal
        );

        if (signal?.aborted) return;

        const mapped = vids.map((v) => ({
          ...v,
          publishedDate: formatISODateToYMD(v.publishedAt),
        }));

        setVideos(mapped);

        if (searchQuery !== initialQuery) {
          router.push(`/youtube?q=${encodeURIComponent(searchQuery)}`, {
            scroll: false,
          });
        }
      } catch (err) {
        if (signal?.aborted || err.name === "AbortError") return;
        setError(err.message || "Failed to fetch videos");
        setVideos([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [sortBy, includeShorts, useGeminiFilter, router, initialQuery, query]
  );

  useEffect(() => {
    if (query.trim() && videos.length > 0) {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      searchAbortRef.current = new AbortController();

      const timeoutId = setTimeout(() => {
        handleSearch(query, searchAbortRef.current.signal);
      }, 300);

      return () => {
        clearTimeout(timeoutId);
        if (searchAbortRef.current) {
          searchAbortRef.current.abort();
        }
      };
    }
  }, [sortBy, includeShorts, useGeminiFilter]);

  const openPlayer = useCallback((video) => {
    const videoId =
      video.video_id || video.videoId || video.id || video.videoId?.videoId;
    setPlaying({
      videoId,
      title: video.title,
      channelTitle: video.channel || video.channelTitle,
      viewCount: video.viewCount,
      publishedDate: video.publishedDate,
      description: video.description || "",
    });
  }, []);

  const goToSummarize = useCallback(
    (video) => {
      const vid =
        video.videoId ||
        video.video_id ||
        (video.id && typeof video.id === "string"
          ? video.id
          : video.id?.videoId);
      router.push(`/summarizer?videoId=${encodeURIComponent(vid)}`);
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Saved Videos Section */}
        {(loadingSaved || savedVideos.length > 0) && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {loadingSaved
                  ? "Loading Saved Videos..."
                  : `Your Saved Videos (${savedVideos.length})`}
              </h2>
            </div>
            {loadingSaved ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <VideoCard key={`skeleton-${i}`} isLoading={true} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {savedVideos.map((savedVideo) => {
                  const normalizedVideo = {
                    videoId: savedVideo.video_id,
                    video_id: savedVideo.video_id,
                    id: savedVideo.id,
                    title: savedVideo.title,
                    channelTitle: savedVideo.channel,
                    channel: savedVideo.channel,
                    thumbnails: {
                      medium: { url: savedVideo.thumbnail },
                      default: { url: savedVideo.thumbnail },
                    },
                    thumbnail: savedVideo.thumbnail,
                    publishedAt: savedVideo.published_at,
                    published_at: savedVideo.published_at,
                    viewCount: savedVideo.view_count || 0,
                  };

                  return (
                    <VideoCard
                      key={savedVideo.id || savedVideo.video_id}
                      video={normalizedVideo}
                      onPlay={openPlayer}
                      onSummarize={goToSummarize}
                      onSave={saveVideoToDB}
                    />
                  );
                })}
              </div>
            )}
            {query && !loadingSaved && (
              <div className="my-8 border-t border-gray-200 dark:border-gray-800"></div>
            )}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {query
                ? `Search Results for "${query}"`
                : savedVideos.length > 0
                ? "Discover More Videos"
                : "Discover Educational Videos"}
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Upload date</option>
                    <option value="viewCount">View count</option>
                    <option value="rating">Rating</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeShorts}
                    onChange={(e) => setIncludeShorts(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Include Shorts
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useGeminiFilter}
                    onChange={(e) => setUseGeminiFilter(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Gemini EDU Filter
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {loading && <VideoGridSkeleton count={12} />}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
            }
          >
            {videos.map((v) => (
              <VideoCard
                key={v.videoId || v.id}
                video={v}
                onPlay={openPlayer}
                onSummarize={goToSummarize}
                onSave={saveVideoToDB}
              />
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && query && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No videos found. Try a different search term.
            </p>
          </div>
        )}

        {!loading && videos.length === 0 && !query && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Start Searching for Educational Videos
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Search for topics like "Matrices", "Kinematics", or "Organic
              Chemistry"
            </p>
          </div>
        )}
      </div>

      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPlaying(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-11/12 md:w-4/5 lg:w-3/4 max-w-5xl max-h-[90vh] overflow-auto shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-4">
                  {playing.title}
                </h2>
                <button
                  onClick={() => setPlaying(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="aspect-video rounded-lg overflow-hidden shadow-lg mb-4 bg-black">
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

              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <p>
                  <strong>Channel:</strong> {playing.channelTitle}
                </p>
                <p>
                  <strong>Views:</strong> {playing.viewCount?.toLocaleString()}
                </p>
                {playing.description && (
                  <div className="mt-4">
                    <strong>Description:</strong>
                    <p className="whitespace-pre-line text-sm mt-2 text-gray-600 dark:text-gray-400">
                      {playing.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function YoutubePage() {
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
      <YoutubeContent />
    </Suspense>
  );
}
