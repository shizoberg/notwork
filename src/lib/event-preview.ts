import type { NotworkEvent } from "./event-registry";
import { useEffect, useState } from "react";
// Local simulation only: this grants no authorization to server APIs.
export function startEventPreview(event: NotworkEvent) {
  saveEventPreview(event);
  window.location.assign(
    `/linkler?preview=event&step=apps&eventId=${encodeURIComponent(event.id)}`,
  );
}
export function saveEventPreview(event: NotworkEvent) {
  localStorage.setItem("notwork-admin-demo", JSON.stringify({ event }));
}
export function previewEvent(): NotworkEvent | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = JSON.parse(localStorage.getItem("notwork-admin-demo") || "null");
    const search = new URLSearchParams(window.location.search);
    const selected = search.get("eventId") || search.get("event") || search.get("eventSlug");
    if (saved?.event && (selected === saved.event.id || selected === saved.event.slug)) return saved.event;
    if (saved?.event && !selected && !import.meta.env.DEV) return saved.event;
    if (!import.meta.env.DEV || (selected && selected !== "evt_9_ekim_2026" && selected !== "9-ekim-2026")) return null;
    // The local 11 October walkthrough also works before admin preview has saved an event.
    const now = new Date().toISOString();
    return {
      schemaVersion: 1,
      id: "evt_9_ekim_2026",
      slug: "9-ekim-2026",
      title: "11 Ekim Notwork Sahne",
      shortTitle: "11 Ekim",
      startsAt: "2026-10-11T17:00:00.000Z",
      endsAt: "2026-10-11T21:00:00.000Z",
      timezone: "Europe/Istanbul",
      status: "scheduled",
      location: { name: "Rene Lokal", address: "", city: "İzmir", mapUrl: "" },
      entry: { isOpen: true, isPrimary: true, requireRegistration: true, registrationPrompts: {
        introLabel: "Kendini tanıt", introPlaceholder: "",
        offersLabel: "Nasıl katkı sunabilirsin?", offersPlaceholder: "",
        needsLabel: "Kimi arıyorsun?", needsPlaceholder: "",
      } },
      products: {
        matchlab: { enabled: true, visible: true, state: "ready", dataMode: "demo", label: "notwork match", order: 1 },
        wordcloud: { enabled: true, visible: true, state: "ready", dataMode: "demo", label: "ntw.wordcloud", order: 2 },
        five: { enabled: false, visible: false, state: "disabled", dataMode: "demo", label: "ntw.five", order: 3 },
      },
      revision: 1, createdAt: now, updatedAt: now,
    };
  } catch {
    return null;
  }
}
export function isEventPreview() {
  return (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "event" &&
    (import.meta.env.DEV || Boolean(previewEvent()))
  );
}
export function useEventPreview() {
  const [preview, setPreview] = useState<boolean | null>(null);
  useEffect(() => setPreview(isEventPreview()), []);
  return preview;
}
