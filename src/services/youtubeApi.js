// frontend/src/services/youtubeApi.js
export async function fetchVideos(query, opts = {}) {
  const params = new URLSearchParams();
  params.set("query", query);
  params.set("max_results", opts.maxResults || 3);
  if (opts.sortBy) params.set("sort_by", opts.sortBy);
  if (opts.includeShorts) params.set("include_shorts", opts.includeShorts);
  if (opts.useGeminiFilter !== undefined) params.set("use_gemini_filter", opts.useGeminiFilter);

  const url = `http://localhost:8000/youtube/search?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(()=>({detail: "Unknown error"}));
    throw new Error(err.detail || "Failed to fetch videos");
  }
  const data = await res.json();
  return data.videos;
}
