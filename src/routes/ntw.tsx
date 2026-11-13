import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EventMatch } from "@/components/EventMatch";
import { SiteNav } from "@/components/SiteNav";
import { getPublicEventContext, type NotworkEvent } from "@/lib/event-registry";
import { munichEvent } from "@/lib/munich-event";
import { resolveEventEntry } from "@/lib/event-entry-links";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/ntw")({
  head: () =>
    createSeo({
      title: "Etkinlik anı | notwork",
      description: "Aynı mekân, yeni insanlar ve gerçek zamanlı karşılaşmalar.",
      path: "/ntw",
    }),
  component: NtwPage,
});

export function NtwPage({ german = false, english = false }: { german?: boolean; english?: boolean } = {}) {
  const navigate = useNavigate();
  const [entryCode, setEntryCode] = useState("");
  const [entryError, setEntryError] = useState(false);
  const [activeEvent, setActiveEvent] = useState<NotworkEvent | null>(null);

  useEffect(() => {
    if (german) return;
    let cancelled = false;
    async function refresh() {
      try {
        const { event } = await getPublicEventContext();
        if (!cancelled) {
          setActiveEvent(event.status === "live" && event.entry.isOpen ? event : null);
        }
      } catch {
        if (!cancelled) setActiveEvent(null);
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [german]);

  return (
    <div className="ntw-shell">
      <SiteNav german={german} />
      <main className="ntw-waiting">
        <div className="ntw-scene" aria-hidden="true">
          <svg viewBox="0 0 430 700" preserveAspectRatio="none">
            <path d="M50 80 Q320 90 340 190 T85 510 Q220 700 350 610 M50 80 Q0 370 85 510 M340 190 Q440 400 350 610" />
          </svg>
          <div className="ntw-bubble bubble-one">
            <img src="/community/23.jpg" alt="" />
          </div>
          <div className="ntw-bubble bubble-two">↗</div>
          <div className="ntw-bubble bubble-three">{english ? "hello" : german ? "hallo" : "merhaba"}</div>
          <div className="ntw-bubble bubble-four">
            <img src="/community/17.jpg" alt="" />
          </div>
          <div className="ntw-bubble bubble-five">✳</div>
        </div>
        <div className="ntw-waiting-copy">
          <div className="ntw-glass-mark">ntw</div>
          <p className="ntw-eyebrow">{english ? "Join in" : german ? "Sei dabei" : "o an orada ol"}</p>
          <h1>
            {english ? "New connections" : german ? "Hier entstehen" : "bağlantılar"}
            <br />
            {english ? "start here." : german ? "neue Kontakte." : "birazdan canlanır."}
          </h1>
          <p>
            {english ? "One place · new people" : german ? "Am selben Ort · neue Menschen" : "Aynı mekân · yeni insanlar"}
            <br />
            {english ? "Meet in person" : german ? "Persönliche Begegnungen" : "Gerçek zamanlı karşılaşmalar"}
          </p>
          <form className="ntw-code-entry" onSubmit={(event) => {
            event.preventDefault();
            const entry = resolveEventEntry(entryCode);
            if (!entry) {
              setEntryError(true);
              return;
            }
            void navigate({ to: entry.path });
          }}>
            <label htmlFor="ntw-event-code">{english ? "Event code" : german ? "Eventcode" : "Etkinlik kodu"}</label>
            <div>
              <input
                id="ntw-event-code"
                autoComplete="off"
                autoCapitalize="none"
                maxLength={32}
                required
                value={entryCode}
                onChange={(event) => {
                  setEntryCode(event.target.value);
                  setEntryError(false);
                }}
                aria-invalid={entryError}
                aria-describedby={entryError ? "ntw-code-error" : undefined}
              />
              <button type="submit">{english ? "Enter" : german ? "Öffnen" : "Giriş yap"}</button>
            </div>
            {entryError && (
              <p id="ntw-code-error" role="alert">
                {english ? "Event code not found." : german ? "Eventcode nicht gefunden." : "Etkinlik kodu bulunamadı."}
              </p>
            )}
          </form>
          {activeEvent && (
            <Link className="ntw-availability" to="/linkler" search={{ eventId: activeEvent.id }}>
              {english ? "Open live event ↗" : "Açık etkinliğe gir ↗"}
            </Link>
          )}
          <Link className="ntw-availability" to={english ? "/en/events" : german ? munichEvent.path : "/etkinlikler"}>
            {english ? "Upcoming events ↗" : german ? "4. Dezember · München ↗" : "Yaklaşan etkinlikler ↗"}
          </Link>
        </div>
      </main>
      <div className="ntw-match-demo-wrap">
        <EventMatch embedded german={german} />
      </div>
    </div>
  );
}
