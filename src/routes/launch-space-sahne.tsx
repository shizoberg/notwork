import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createNoIndexSeo } from "@/lib/seo";
import { pollRequest, novemberEventSlug, type PollPayload } from "@/lib/event-poll";
import { NodeMark } from "./launch-space";
import "@/launch-space.css";
export const Route = createFileRoute("/launch-space-sahne")({
  head: () =>
    createNoIndexSeo({
      title: "notwork anket · sahne",
      description: "Topluluğun sesi",
      path: "/launch-space-sahne",
    }),
  component: PollStage,
});
function PollStage() {
  const [data, setData] = useState<PollPayload | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    const event = new URLSearchParams(location.search).get("event") || novemberEventSlug;
    const refresh = () => {
      if (!document.hidden)
        void pollRequest(event, { action: "stage" })
          .then((r) => {
            if (current) {
              setData(r);
              setError("");
            }
          })
          .catch((e) => {
            if (current) setError(e.message);
          });
    };
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, []);
  return (
    <div className="launch-space ls-stage">
      <header className="ls-header">
        <span className="ls-brand">
          <NodeMark />
          notwork anket
        </span>
        <span className="ls-demo">{data?.database.mode || "demo"}</span>
        <button
          className="ls-secondary"
          onClick={() => {
            if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
            else void document.exitFullscreen?.();
          }}
        >
          Tam ekran
        </button>
      </header>
      <main style={{ maxWidth: 1200, margin: "auto", padding: "4vh 5vw" }}>
        {error ? (
          <p role="alert">{error}</p>
        ) : data?.published ? (
          <section className="ls-enter" key={data.published.question.id}>
            <p className="ls-eyebrow">TOPLULUĞUN SESİ · {data.published.total} YANIT</p>
            <h1 style={{ fontSize: "clamp(32px,4.6vw,74px)" }}>{data.published.question.title}</h1>
            <div style={{ display: "grid", gap: 20, marginTop: 40 }}>
              {data.published.counts.map((c) => (
                <div key={c.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "clamp(18px,2.2vw,32px)",
                      gap: 16,
                    }}
                  >
                    <span>{c.label}</span>
                    <strong>
                      {data.total ? Math.round((c.count / data.total) * 100) : 0}%{" "}
                      <small style={{ fontSize: 13, color: "#a6a8af" }}>({c.count})</small>
                    </strong>
                  </div>
                  <div
                    style={{ height: 12, background: "#242b34", borderRadius: 20, marginTop: 9 }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${data.total ? (c.count / data.total) * 100 : 0}%`,
                        background: "linear-gradient(90deg,#367781,#bce2f2)",
                        borderRadius: 20,
                        transition: "width .7s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="ls-caption" style={{ marginTop: 34 }}>
              Yalnızca toplu sonuçlar gösterilir · isimler ve kişisel yanıtlar sahnede paylaşılmaz.
            </p>
          </section>
        ) : (
          <section className="ls-center" style={{ paddingTop: "12vh" }}>
            <div className="ls-orbit ls-search">
              <NodeMark />
            </div>
            <h1>
              Bir topluluk.
              <br />
              <span>Birçok ses.</span>
            </h1>
            <p className="ls-muted">Sonuçlar birazdan burada.</p>
          </section>
        )}
      </main>
    </div>
  );
}
