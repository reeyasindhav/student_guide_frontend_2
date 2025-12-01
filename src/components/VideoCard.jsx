"use client";

import { useState } from "react";
import { Play, Clock, MoreVertical } from "lucide-react";

function formatNumber(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 1) return "Today";
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (days < 30)
      return `${Math.floor(days / 7)} week${
        Math.floor(days / 7) > 1 ? "s" : ""
      } ago`;
    if (days < 365)
      return `${Math.floor(days / 30)} month${
        Math.floor(days / 30) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(days / 365)} year${
      Math.floor(days / 365) > 1 ? "s" : ""
    } ago`;
  } catch (e) {
    return dateString.split("T")[0];
  }
}

export default function VideoCard({
  video,
  onPlay,
  onSummarize,
  onSave,
  isLoading = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col animate-pulse">
        <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const thumbnail =
    video.thumbnails?.medium?.url ||
    video.thumbnails?.default?.url ||
    video.thumbnail;
  const videoId = video.videoId || video.id?.videoId || video.video_id;
  const channelTitle = video.channelTitle || video.channel;
  const viewCount = formatNumber(video.viewCount);
  const publishedDate = formatDate(video.publishedAt || video.published_at);

  return (
    <div
      className="flex flex-col cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
        {!imageError && thumbnail ? (
          <img
            src={thumbnail}
            alt={video.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
            <Play size={40} className="text-gray-400" />
          </div>
        )}

        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 hidden sm:block" />

        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            onClick={() => onPlay?.(video)}
          >
            {video.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {channelTitle}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            {!!viewCount && formatNumber(viewCount) !== "0" && (
              <>
                <span>{formatNumber(viewCount)} views</span>
                <span>•</span>
              </>
            )}
            <span>{publishedDate}</span>
          </div>
        </div>
      </div>

      {isHovered && (
        <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(video);
            }}
            className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Play size={14} fill="currentColor" />
            Play
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSummarize?.(video);
            }}
            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Summarize
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (onSave && !isSaving) {
                setIsSaving(true);
                try {
                  await onSave(video);
                } catch (error) {
                  console.error("Error saving video:", error);
                } finally {
                  setIsSaving(false);
                }
              }
            }}
            disabled={isSaving}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
