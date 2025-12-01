import { API_BASE_URL } from "../config/api";

export async function saveVideoToHistory(video) {
  const res = await fetch(`${API_BASE_URL}/youtube/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      video_id: video.videoId || video.id?.videoId,
      title: video.title,
      channel: video.channelTitle,
      published_at: video.publishedAt,
      thumbnail: video.thumbnails?.medium?.url,
    }),
  });

  if (!res.ok) throw new Error("Failed to save video");
  return await res.json();
}
