/**
 * Validates if a string is a valid YouTube URL
 * Supports various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function isValidYouTubeUrl(url) {
  if (!url || typeof url !== "string") return false;

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;

  // YouTube URL patterns
  const patterns = [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/, // Main YouTube domains
    /^https?:\/\/m\.youtube\.com\/.+/, // Mobile YouTube
  ];

  // Check if it matches any YouTube pattern
  const isYouTubeDomain = patterns.some((pattern) => pattern.test(trimmedUrl));

  if (!isYouTubeDomain) return false;

  // Extract video ID to verify it's a valid video URL
  const videoId = extractVideoId(trimmedUrl);
  return videoId !== null && videoId.length > 0;
}

/**
 * Extracts video ID from YouTube URL
 * Returns null if not a valid YouTube URL
 */
export function extractVideoId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if a string is a valid URL (any URL)
 */
export function isValidUrl(url) {
  if (!url || typeof url !== "string") return false;

  try {
    const urlObj = new URL(url.trim());
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}
