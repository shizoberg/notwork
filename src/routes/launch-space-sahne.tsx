import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createNoIndexSeo } from "@/lib/seo";
import { pollRequest, novemberEventSlug, type PollPayload } from "@/lib/event-poll";
import { defaultLaunchFlow, getLaunchFlow } from "@/lib/launch-flow";
import { NodeMark } from "./launch-space";
import "@/launch-space.css";
export const Route = createFileRoute("/launch-space-sahne")({
  head: () =>
    createNoIndexSeo({
      title: "launchspace · sahne",
      description: "Topluluğun sesi",
      path: "/launch-space-sahne",
    }),
  component: PollStage,
});
function PollStage() {
  const [brand, setBrand] = useState(defaultLaunchFlow);
  const [launchStage, setLaunchStage] = useState(true);
  const [cloud, setCloud] = useState(false);
  const [data, setData] = useState<PollPayload | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    const event = new URLSearchParams(location.search).get("event") || novemberEventSlug;
    setLaunchStage(event === novemberEventSlug);
    if (event === novemberEventSlug)
      void getLaunchFlow()
        .then((flow) => {
          if (current) setBrand(flow);
        })
        .catch(() => {});
    let pending = false;
    async function refresh() {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const result = await pollRequest(event, { action: "stage" });
        if (current) {
          setData(result);
          setError("");
        }
      } catch (error) {
        if (current) setError(error instanceof Error ? error.message : "Sonuçlar yüklenemedi.");
      } finally {
        pending = false;
      }
    }
    void refresh();
    const timer = setInterval(refresh, 3000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      current = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return (
    <div className="launch-space ls-stage">
      <header className="ls-header">
        <span className="ls-brand">
          {launchStage ? <img className="ls-stage-logo" src={brand.logo} alt="" /> : <NodeMark />}
          {launchStage ? brand.organizerName : "notwork anket"}
        </span>
        <button className="ls-secondary ls-view-switch" onClick={() => setCloud((c) => !c)}>
          {cloud ? "Dağılımı göster" : "Kelime bulutu"}
        </button>
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
      <main className="ls-stage-main">
        {error && (
          <p role="status" className="ls-caption">
            {data ? "Bağlantı yeniden deneniyor…" : error}
          </p>
        )}
        {data?.published ? (
          <section className="ls-enter" key={data.published.question.id}>
            <p className="ls-eyebrow">TOPLULUĞUN SESİ · {data.published.total} YANIT</p>
            <h1 className="ls-stage-title">{data.published.question.title}</h1>
            {cloud ? (
              <div className="ls-wordcloud">
                {data.published.counts.map((c, i) => (
                  <span
                    key={c.label}
                    style={{
                      fontSize: `clamp(23px,${2.2 + (data.total ? (c.count / data.total) * 9 : 0)}vw,84px)`,
                      color: ["#9bc8dc", "#d8c6ff", "#c9e5d9", "#e8d1b5", "#f1eff6"][i % 5],
                    }}
                  >
                    {c.label}
                    <small>{c.count}</small>
                  </span>
                ))}
              </div>
            ) : (
              <div className="ls-result-bars" aria-label="Canlı anket sonuçları">
                {data.published.counts.map((c, index) => {
                  const percent = data.published!.total
                    ? (c.count / data.published!.total) * 100
                    : 0;
                  return (
                    <div
                      className="ls-result-bar"
                      key={c.label}
                      role="meter"
                      aria-label={c.label}
                      aria-valuenow={c.count}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(1, data.published!.total)}
                      aria-valuetext={`${c.count} oy, yüzde ${Math.round(percent)}`}
                    >
                      <div
                        className={`ls-result-fill ls-result-color-${index % 5}`}
                        style={{ width: `${percent}%` }}
                        aria-hidden="true"
                      />
                      <span className="ls-result-name">{c.label}</span>
                      <span className="ls-result-value">
                        <strong>
                          {Math.round(percent)}
                          <small>%</small>
                        </strong>
                        <span>{c.count} oy</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="ls-caption ls-stage-footnote">
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
