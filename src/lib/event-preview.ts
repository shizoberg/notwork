import type { NotworkEvent } from "./event-registry";
import { useEffect, useState } from "react";
// Local simulation only: this grants no authorization to server APIs.
export function startEventPreview(event: NotworkEvent) {
  saveEventPreview(event);
  window.location.assign(`/linkler?preview=event&eventId=${encodeURIComponent(event.id)}`);
}
export function saveEventPreview(event: NotworkEvent) {
  localStorage.setItem("notwork-admin-demo", JSON.stringify({ event }));
}
export function previewEvent(): NotworkEvent | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = JSON.parse(localStorage.getItem("notwork-admin-demo") || "null");
    const selected = new URLSearchParams(window.location.search).get("eventId");
    return saved?.event && (!selected || selected === saved.event.id) ? saved.event : null;
  } catch { return null; }
}
export function isEventPreview() {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "event" && (import.meta.env.DEV || Boolean(previewEvent()));
}
export function useEventPreview() {
  const [preview, setPreview] = useState<boolean | null>(null);
  useEffect(() => setPreview(isEventPreview()), []);
  return preview;
}
