// frontend/src/services/youtubeApi.js
import { API_BASE_URL } from "../config/api";

export async function fetchVideos(query, opts = {}, signal = null) {
  const params = new URLSearchParams();
  params.set("query", query);
  params.set("max_results", opts.maxResults || 3);
  if (opts.sortBy) params.set("sort_by", opts.sortBy);
  if (opts.includeShorts) params.set("include_shorts", opts.includeShorts);
  if (opts.useGeminiFilter !== undefined)
    params.set("use_gemini_filter", opts.useGeminiFilter);

  const url = `${API_BASE_URL}/youtube/search?${params.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || "Failed to fetch videos");
  }
  const data = await res.json();
  return data.videos;
}
