import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
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
  const [eventCode, setEventCode] = useState("");
  const [codeError, setCodeError] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const results = await Promise.allSettled(
        ["17-eylul-2026", "9-ekim-2026"].map((eventSlug) => getPublicEventContext({ eventSlug })),
      );
      if (cancelled) return;
      const live = results
        .flatMap((result) => (result.status === "fulfilled" ? [result.value.event] : []))
        .find((event) => event.status === "live" && event.entry.isOpen);
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
            <span aria-hidden="true">● </span>
            <Link to="/linkler" search={{ event: "17-eylul-2026" }}>
              17 Eylül
            </Link>
            {" · "}
            <Link to="/linkler" search={{ event: "9-ekim-2026" }}>
              11 Ekim
            </Link>
            <br />
            etkinlik anlarında aktif olacaktır
          </div>
          <form
            className="ntw-code-entry"
            onSubmit={(event) => {
              event.preventDefault();
              const code = eventCode.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]/g, "");
              if (code === "17eylul" || code === "11ekim") {
                window.sessionStorage.setItem("ntw-entry-transition", "code");
                window.location.assign(
                  code === "17eylul"
                    ? "/linkler?event=17-eylul-2026"
                    : "/linkler?event=9-ekim-2026",
                );
              } else setCodeError("Kod bulunamadı · 17eylul veya 11ekim yaz");
            }}
          >
            <label htmlFor="ntw-event-code">Etkinlik kodun</label>
            <div>
              <input
                id="ntw-event-code"
                value={eventCode}
                onChange={(event) => {
                  setEventCode(event.target.value);
                  setCodeError("");
                }}
                placeholder="17eylul"
                maxLength={20}
              />
              <button type="submit">gir</button>
            </div>
            {codeError && <p role="alert">{codeError}</p>}
          </form>
        </div>
      </main>
    </div>
  );
}
