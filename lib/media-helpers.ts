export function getAssetBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:9991/api/v1").replace(
    "/api/v1",
    "",
  );
}

export function getAssetUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${getAssetBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isNoteMedia(type: string) {
  return type === "pdf" || type === "image";
}

export function isTutorialMedia(type: string) {
  return type === "video" || type === "voice";
}
