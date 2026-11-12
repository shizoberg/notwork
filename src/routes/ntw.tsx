import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EventMatch } from "@/components/EventMatch";
import { SiteNav } from "@/components/SiteNav";
import { getPublicEventContext, type NotworkEvent } from "@/lib/event-registry";
import { munichEvent } from "@/lib/munich-event";
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

export function NtwPage({ german = false }: { german?: boolean } = {}) {
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

  if (!german && activeEvent) {
    return <Navigate to="/linkler" search={{ eventId: activeEvent.id }} replace />;
  }

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
          <div className="ntw-bubble bubble-three">{german ? "hallo" : "merhaba"}</div>
          <div className="ntw-bubble bubble-four">
            <img src="/community/17.jpg" alt="" />
          </div>
          <div className="ntw-bubble bubble-five">✳</div>
        </div>
        <div className="ntw-waiting-copy">
          <div className="ntw-glass-mark">ntw</div>
          <p className="ntw-eyebrow">{german ? "Sei dabei" : "o an orada ol"}</p>
          <h1>
            {german ? "Hier entstehen" : "bağlantılar"}
            <br />
            {german ? "neue Kontakte." : "birazdan canlanır."}
          </h1>
          <p>
            {german ? "Am selben Ort · neue Menschen" : "Aynı mekân · yeni insanlar"}
            <br />
            {german ? "Persönliche Begegnungen" : "Gerçek zamanlı karşılaşmalar"}
          </p>
          <Link className="ntw-availability" to={german ? munichEvent.path : "/etkinlikler"}>
            {german ? "4. Dezember · München ↗" : "Yaklaşan etkinlikler ↗"}
          </Link>
        </div>
      </main>
      <div className="ntw-match-demo-wrap">
        <EventMatch embedded german={german} />
      </div>
    </div>
  );
}
