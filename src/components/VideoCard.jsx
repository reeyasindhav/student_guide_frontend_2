// frontend/src/components/VideoCard.jsx
import { useState } from "react";

function formatNumber(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export default function VideoCard({ video, onPlay }) {
  const { title, thumbnails, channelTitle, description, viewCount, likeCount, publishedAt } = video;

  // short description truncated
  const [expanded, setExpanded] = useState(false);
  const shortDesc = description ? description.slice(0, 180) : "";

  return (
    <div className="border rounded-lg p-3 shadow hover:shadow-lg transition">
      <div className="cursor-pointer" onClick={() => onPlay(video)}>
        <img src={thumbnails?.medium?.url || thumbnails?.default?.url} className="w-full rounded-md" alt={title} />
      </div>

      <h3 className="mt-2 font-semibold text-md">{title}</h3>
      <p className="text-sm text-gray-600">{channelTitle} • {formatNumber(viewCount)} views</p>
      <p className="text-xs text-gray-500 mt-2">
        {expanded ? description : shortDesc}{description && description.length > 180 && !expanded && " ... "}
        {description && description.length > 180 && (
          <button className="ml-2 text-blue-600 text-xs" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </p>
      <div className="mt-2 text-xs text-gray-500">
        <span>Likes: {likeCount != null ? formatNumber(likeCount) : "—"}</span>
        <span className="mx-2">•</span>
        <span>Published: <time dateTime={publishedAt}>{publishedAt}</time></span>
      </div>
    </div>
  );
}
