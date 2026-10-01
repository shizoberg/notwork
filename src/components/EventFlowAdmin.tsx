import { Clock3, Play, RefreshCcw, SkipForward, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  currentEventFlowStep,
  updateEventFlow,
  type EventFlowState,
  type EventFlowStep,
} from "@/lib/event-flow";
import type { NotworkEvent } from "@/lib/event-registry";

export function EventFlowAdmin({ password, event }: { password: string; event: NotworkEvent }) {
  const [flow, setFlow] = useState<EventFlowState | null>(null);
  const [steps, setSteps] = useState<EventFlowStep[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiProbe, setAiProbe] = useState("");
  const [loadBusy, setLoadBusy] = useState(false);
  const [loadProbe, setLoadProbe] = useState("");
  const [clock, setClock] = useState(Date.now());
  const selection = useMemo(() => ({ event: event.slug }), [event.slug]);

  async function run(
    action: Parameters<typeof updateEventFlow>[2]["action"],
    input: Partial<Parameters<typeof updateEventFlow>[2]> = {},
  ) {
    setBusy(true);
    setMessage("");
    try {
      const next = await updateEventFlow(password, selection, { action, ...input });
      setFlow(next);
      setSteps(next.steps);
      setMessage(
        action === "start"
          ? "Akış başladı. Uygulama sırası aktif."
          : action === "advance"
            ? "Katılımcılar Linkler ekranına yönlendirildi."
            : "Etkinlik akışı güncellendi.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Akış güncellenemedi");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let active = true;
    setFlow(null);
    void updateEventFlow(password, selection, { action: "get" })
      .then((next) => {
        if (!active) return;
        setFlow(next);
        setSteps(next.steps);
      })
      .catch(
        (error) => active && setMessage(error instanceof Error ? error.message : "Akış alınamadı"),
      );
    const tick = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => {
      active = false;
      window.clearInterval(tick);
    };
  }, [password, selection]);

  const current = currentEventFlowStep(flow);
  const remaining = flow?.endsAt
    ? Math.max(0, Math.ceil((Date.parse(flow.endsAt) - clock) / 1_000))
    : 0;
  const running = flow?.status === "running" || flow?.status === "awaiting_advance";

  async function testAiConnection() {
    setAiBusy(true);
    setAiProbe("");
    try {
      const response = await fetch("/api/admin/events/flow", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, event: event.slug, action: "diagnoseAi" }),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = (await response.json()) as {
        ok: boolean;
        model: string;
        durationMs: number;
        reason: string;
        httpStatus: number | null;
        errorCode: string | null;
      };
      setAiProbe(
        result.ok
          ? `OpenAI çalışıyor · ${result.model} · ${result.durationMs} ms`
          : result.errorCode === "credit_balance_exhausted"
            ? "OpenAI API kredisi tükendi. Kredi yüklendiğinde yeniden test et. Eşleştirme yedek algoritmayla devam eder."
            : `OpenAI yanıtı alınamadı · ${result.reason}${result.httpStatus ? ` (${result.httpStatus})` : ""} · ${result.durationMs} ms`,
      );
    } catch (error) {
      setAiProbe(error instanceof Error ? error.message : "OpenAI testi tamamlanamadı");
    } finally {
      setAiBusy(false);
    }
  }

  async function testStorageLoad(sampleSize: 20 | 100) {
    setLoadBusy(true);
    setLoadProbe("");
    try {
      const response = await fetch("/api/admin/events/flow", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, event: event.slug, action: "diagnoseLoad", sampleSize }),
      });
      if (!response.ok) throw new Error(`Altyapı testi tamamlanamadı (${response.status})`);
      const result = (await response.json()) as {
        passed: boolean;
        requested: number;
        fulfilled: number;
        stored: number;
        delayedStored: number;
        initialWriteAccepted: boolean;
        duplicateWriteRejected: boolean;
        seededCount: number | null;
        seededEtagPresent: boolean;
        conditionalWriteAccepted: boolean;
        staleWriteRejected: boolean;
        conditionalCount: number | null;
        durationMs: number;
        p95Ms: number | null;
        failures: string[];
      };
      setLoadProbe(
        `${result.passed ? "Başarılı" : "Hata"} · ${result.fulfilled}/${result.requested} işlem · kaydedilen ${result.stored} (750 ms sonra ${result.delayedStored}) · ilk yazma ${result.initialWriteAccepted ? "evet" : "hayır"} · ikinci ilk-yazma reddi ${result.duplicateWriteRejected ? "evet" : "hayır"} · etag ${result.seededEtagPresent ? "var" : "yok"} · koşullu yazma ${result.conditionalWriteAccepted ? "evet" : "hayır"} · eski etag reddi ${result.staleWriteRejected ? "evet" : "hayır"} · kontrol değeri ${result.conditionalCount ?? "—"} · toplam ${result.durationMs} ms · p95 ${result.p95Ms ?? "—"} ms${result.failures.length ? ` · ${result.failures.join("; ")}` : ""}`,
      );
    } catch (error) {
      setLoadProbe(error instanceof Error ? error.message : "Altyapı testi tamamlanamadı");
    } finally {
      setLoadBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-[2rem] border border-primary/25 bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
            Linkler canlı akışı
          </div>
          <h2 className="mt-1 text-2xl font-black">Uygulama sırası ve sayaç</h2>
          <p className="mt-1 max-w-2xl text-sm text-foreground/55">
            Süre dolunca akış bekler. “Sonraki uygulama” dediğinde açık ekranlar Linkler’e döner;
            katılımcı yeni uygulamayı oradan açar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={aiBusy}
            onClick={() => void testAiConnection()}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-4 py-2 text-sm font-black"
          >
            {aiBusy ? "OpenAI test ediliyor…" : "OpenAI bağlantısını test et"}
          </button>
          <button
            type="button"
            disabled={loadBusy}
            onClick={() => void testStorageLoad(20)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-4 py-2 text-sm font-black"
          >
            {loadBusy ? "Altyapı test ediliyor…" : "20 eşzamanlı işlem testi"}
          </button>
          <button
            type="button"
            disabled={loadBusy}
            onClick={() => void testStorageLoad(100)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-4 py-2 text-sm font-black"
          >
            100 eşzamanlı işlem testi
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("get")}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-4 py-2 text-sm font-black"
          >
            <RefreshCcw size={15} /> Yenile
          </button>
        </div>
      </div>
      {aiProbe ? (
        <p role="status" className="mt-3 text-sm font-bold text-primary-deep">
          {aiProbe}
        </p>
      ) : null}
      {loadProbe ? (
        <p role="status" className="mt-3 text-sm font-bold text-primary-deep">
          {loadProbe}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="grid gap-2">
          {steps.map((step, index) => (
            <div
              key={step.product}
              className={`grid grid-cols-[34px_1fr_94px] items-center gap-3 rounded-2xl border p-3 ${
                current?.product === step.product
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background/65"
              }`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/12 text-xs font-black text-primary-deep">
                {index + 1}
              </span>
              <div>
                <strong className="block text-sm">{step.label}</strong>
                <small className="text-foreground/45">{step.product}</small>
              </div>
              <label className="text-xs font-bold text-foreground/55">
                dakika
                <input
                  type="number"
                  min={1}
                  max={240}
                  disabled={running}
                  value={step.durationMinutes}
                  onChange={(event) =>
                    setSteps((currentSteps) =>
                      currentSteps.map((row) =>
                        row.product === step.product
                          ? { ...row, durationMinutes: Number(event.target.value) }
                          : row,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-primary/20 bg-background px-3 py-2 text-sm font-black"
                />
              </label>
            </div>
          ))}
          <button
            type="button"
            disabled={busy || running || !steps.length}
            onClick={() => void run("configure", { steps })}
            className="justify-self-start rounded-full border border-primary/30 px-4 py-2 text-sm font-black disabled:opacity-40"
          >
            Süreleri kaydet
          </button>
        </div>

        <div className="grid min-w-[220px] content-start gap-3 rounded-[1.5rem] bg-[#0d7598] p-4 text-white">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
            {flow?.status === "completed" ? "tamamlandı" : current ? "aktif bölüm" : "hazır"}
          </span>
          <strong className="text-xl">{current?.label || "Akış başlamadı"}</strong>
          {running ? (
            <div className="flex items-center gap-2 text-3xl font-black tabular-nums">
              <Clock3 size={21} />
              {String(Math.floor(remaining / 60)).padStart(2, "0")}:
              {String(remaining % 60).padStart(2, "0")}
            </div>
          ) : null}
          {!running && flow?.status !== "completed" ? (
            <button
              type="button"
              disabled={busy || !steps.length}
              onClick={() => void run("start")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-[#0d6788]"
            >
              <Play size={16} /> Akışı başlat
            </button>
          ) : null}
          {running ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run("advance")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-[#0d6788]"
            >
              <SkipForward size={16} /> Sonraki uygulama
            </button>
          ) : null}
          {flow && flow.status !== "idle" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(flow.status === "completed" ? "reset" : "complete")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-black"
            >
              {flow.status === "completed" ? <RefreshCcw size={14} /> : <Square size={14} />}
              {flow.status === "completed" ? "Akışı sıfırla" : "Akışı bitir"}
            </button>
          ) : null}
        </div>
      </div>

      {message ? <p className="mt-3 text-sm font-bold text-primary-deep">{message}</p> : null}
    </section>
  );
}
