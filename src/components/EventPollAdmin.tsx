import { useCallback, useEffect, useState } from "react";
import { pollRequest, type PollPayload } from "@/lib/event-poll";

export function EventPollAdmin({ event, password }: { event: string; password: string }) {
  const [data, setData] = useState<PollPayload | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [draft, setDraft] = useState("");
  const load = useCallback(async () => {
    const r = await pollRequest(event, { action: "admin", password });
    setData(r);
    return r;
  }, [event, password]);
  useEffect(() => {
    let current = true;
    setData(null);
    setDraft("");
    const refresh = () => {
      if (!document.hidden)
        void pollRequest(event, { action: "admin", password })
          .then((r) => {
            if (current) setData(r);
          })
          .catch((e) => {
            if (current) setError(e.message);
          });
    };
    refresh();
    const timer = setInterval(refresh, 7000);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [event, password]);
  async function act(action: string, input: Record<string, unknown> = {}) {
    if (!data) return;
    setBusy(true);
    setError("");
    try {
      setData(
        await pollRequest(event, { action, password, revision: data.config.revision, ...input }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem başarısız");
      await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="rounded-3xl border border-primary/25 bg-card p-5 sm:p-7"
      style={{ marginTop: 24 }}
      aria-label="Canlı anket yönetimi"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">ETKİNLİĞE ÖZEL · 5 SORU</p>
          <h2 className="mt-1 text-2xl font-semibold">notwork anket</h2>
        </div>
        <a
          className="rounded-full border px-4 py-2 text-sm"
          target="_blank"
          rel="noreferrer"
          href={`/launch-space-sahne?event=${encodeURIComponent(event)}`}
        >
          Sahne ekranını aç ↗
        </a>
      </div>
      {error ? (
        <p role="alert" className="my-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {!data ? (
        <p className="mt-5">Anket yükleniyor…</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            <strong>{data.total}</strong> yanıt · {data.database.mode} ·{" "}
            {data.config.isOpen ? "Cevap alınıyor" : "Cevap alımı kapalı"} ·{" "}
            {data.config.publishedQuestion === null
              ? "Sahne beklemede"
              : `Sahnede soru ${data.config.publishedQuestion + 1}`}
          </p>
          <div className="my-4 flex flex-wrap gap-2">
            <button
              disabled={busy}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold"
              onClick={() => void act("open", { isOpen: !data.config.isOpen })}
            >
              {data.config.isOpen ? "Yanıt alımını durdur" : "Anketi aç"}
            </button>
            <button
              disabled={busy}
              className="rounded-full border px-4 py-2 text-sm"
              onClick={() => void act("publish", { questionIndex: null })}
            >
              Sahneyi beklemeye al
            </button>
            <button
              disabled={busy}
              className="rounded-full border px-4 py-2 text-sm"
              onClick={() => void load().catch((e) => setError(e.message))}
            >
              Yenile
            </button>
          </div>
          <div className="grid gap-3">
            {data.results?.map((r, i) => (
              <article key={r.question.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">
                    {i + 1}. {r.question.title}
                  </h3>
                  <button
                    disabled={busy}
                    aria-pressed={data.config.publishedQuestion === i}
                    className="shrink-0 rounded-full border border-primary/40 px-3 py-2 text-xs"
                    onClick={() => void act("publish", { questionIndex: i })}
                  >
                    {data.config.publishedQuestion === i ? "Yayında" : "Sahneye ver"}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.counts.map((c) => (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs" key={c.label}>
                      {c.label} · {c.count}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <details className="mt-5 rounded-2xl border p-4">
            <summary className="cursor-pointer text-sm">Taslak soruları düzenle</summary>
            <p className="my-3 text-xs text-muted-foreground">
              Tam 5 soru, her soruda 2–8 seçenek. Yanıt geldikten sonra soru değiştirilmez.
            </p>
            <textarea
              aria-label="Anket soruları JSON"
              className="min-h-72 w-full rounded-xl border bg-background p-3 font-mono text-xs"
              value={draft || JSON.stringify(data.config.questions, null, 2)}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              disabled={busy || data.total > 0}
              className="mt-3 rounded-full border px-4 py-2 text-sm"
              onClick={() => {
                try {
                  void act("configure", {
                    questions: JSON.parse(draft || JSON.stringify(data.config.questions)),
                  });
                } catch {
                  setError("JSON biçimini kontrol et");
                }
              }}
            >
              Soruları kaydet
            </button>
          </details>
          {data.database.mode === "demo" ? (
            <button
              disabled={busy}
              className="mt-4 text-xs text-muted-foreground underline"
              onClick={() => {
                if (confirm("Yalnızca bu etkinliğin demo anket yanıtları silinsin mi?"))
                  void act("reset");
              }}
            >
              Bu etkinliğin demo anketini sıfırla
            </button>
          ) : null}
          <p className="mt-3 break-all text-[11px] text-muted-foreground">
            {data.database.keyPrefix}
          </p>
        </>
      )}
    </section>
  );
}
