// frontend/src/components/VideoCardHorizontal.jsx
import { useState } from "react";

function formatNumber(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export default function VideoCardHorizontal({
  video,
  onPlay,
  onSummarize,
  onSave,
}) {
  const [expanded, setExpanded] = useState(false);
  const {
    title,
    thumbnails,
    channelTitle,
    description,
    viewCount,
    likeCount,
    publishedAt,
    publishedDate,
  } = video;

  const videoId = video.videoId || video.id?.videoId || video.video_id;

  return (
    <div className="flex gap-4 bg-white p-3 rounded shadow">
      <div className="w-48 cursor-pointer" onClick={() => onPlay(video)}>
        <img
          src={thumbnails?.medium?.url || thumbnails?.default?.url}
          className="w-full h-28 object-cover rounded"
          alt={title}
        />
      </div>

      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="font-semibold">{title}</h3>
          <div className="text-right text-xs text-gray-500">
            {viewCount && <div>{formatNumber(viewCount)} views</div>}
            <div>Published: {publishedDate || publishedAt?.split("T")[0]}</div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-1">{channelTitle}</p>

        <p className="text-sm text-gray-700 mt-2">
          {expanded
            ? description
            : description
            ? description.slice(0, 200)
            : ""}
          {description && description.length > 200 && !expanded && " ... "}
          {description && description.length > 200 && (
            <button
              className="ml-2 text-indigo-600 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </p>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onPlay(video)}
            className="px-3 py-1 border rounded text-sm"
          >
            Play
          </button>

          <button
            onClick={onSummarize}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
          >
            Summarize
          </button>

          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (onSave) {
                try {
                  await onSave(video);
                } catch (error) {
                  console.error("Error saving video:", error);
                }
              }
            }}
            className="px-2 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
