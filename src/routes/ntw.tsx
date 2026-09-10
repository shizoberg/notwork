import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { getPublicEventContext, type NotworkEvent } from "@/lib/event-registry";
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

function NtwPage() {
  const [activeEvent, setActiveEvent] = useState<NotworkEvent | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const results = await Promise.allSettled(
        ["17-eylul-2026", "9-ekim-2026"].map((eventSlug) => getPublicEventContext({ eventSlug })),
      );
      if (cancelled) return;
      const now = Date.now();
      const live = results
        .flatMap((result) => (result.status === "fulfilled" ? [result.value.event] : []))
        .find(
          (event) =>
            event.status === "live" &&
            event.entry.isOpen &&
            now >= Date.parse(event.startsAt) &&
            now < Date.parse(event.endsAt),
        );
      setActiveEvent(live || null);
    }
    void refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);
  if (activeEvent) return <Navigate to="/linkler" search={{ eventId: activeEvent.id }} replace />;
  return (
    <div className="ntw-shell">
      <SiteNav />
      <main className="ntw-waiting">
        <div className="ntw-scene" aria-hidden="true">
          <svg viewBox="0 0 430 700" preserveAspectRatio="none">
            <path d="M50 80 Q320 90 340 190 T85 510 Q220 700 350 610 M50 80 Q0 370 85 510 M340 190 Q440 400 350 610" />
          </svg>
          <div className="ntw-bubble bubble-one">
            <img src="/community/23.jpg" alt="" />
          </div>
          <div className="ntw-bubble bubble-two">↗</div>
          <div className="ntw-bubble bubble-three">merhaba</div>
          <div className="ntw-bubble bubble-four">
            <img src="/community/17.jpg" alt="" />
          </div>
          <div className="ntw-bubble bubble-five">✳</div>
        </div>
        <div className="ntw-waiting-copy">
          <div className="ntw-glass-mark">ntw</div>
          <p className="ntw-eyebrow">o an orada ol</p>
          <h1>
            bağlantılar
            <br />
            birazdan canlanır.
          </h1>
          <p>
            Aynı mekân · yeni insanlar
            <br />
            Gerçek zamanlı karşılaşmalar
          </p>
          <div className="ntw-availability">
            <span aria-hidden="true">● </span>17 Eylül ve 9 Ekim tarihlerinde
            <br />
            etkinlik anlarında aktif olacaktır
          </div>
        </div>
      </main>
    </div>
  );
}
