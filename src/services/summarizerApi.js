import { API_BASE_URL } from "../config/api";

export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/summarizer/upload`, {
    method: "POST",
    body: formData,
  });

  return await res.json();
}

export async function summarizeYoutube(url) {
  const formData = new FormData();
  formData.append("url", url);

  const res = await fetch(`${API_BASE_URL}/summarizer/youtube`, {
    method: "POST",
    body: formData,
  });

  return await res.json();
}

/**
 * Helper: call summarizer by videoId (constructs full youtube URL)
 * videoId can be full id or full url (function normalizes)
 */
export async function summarizeYoutubeById(videoIdOrUrl) {
  let url = String(videoIdOrUrl);
  // if looks like bare id (no https)
  if (!url.startsWith("http")) {
    url = `https://www.youtube.com/watch?v=${encodeURIComponent(url)}`;
  }
  return summarizeYoutube(url);
}
