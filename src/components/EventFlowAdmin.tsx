import { Bell, Check, Clock3, Play, RefreshCcw, SkipForward, Square, Trash2 } from "lucide-react";
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
  const [notice, setNotice] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
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
      if (action === "addNotice") setNotice("");
      setMessage(
        action === "start"
          ? "Akış başladı. Katılımcı ekranlarındaki sayaç aktif."
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
        <button
          type="button"
          disabled={busy}
          onClick={() => void run("get")}
          className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-4 py-2 text-sm font-black"
        >
          <RefreshCcw size={15} /> Yenile
        </button>
      </div>

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

      <div className="mt-5 rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-sm font-black">
          <Bell size={16} /> Canlı bildirim ekle
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={notice}
            maxLength={220}
            onChange={(event) => setNotice(event.target.value)}
            placeholder="Örn. Match için son 10 dakika"
            className="min-w-0 flex-1 rounded-2xl border border-primary/20 bg-background px-4 py-3 text-sm"
          />
          <button
            type="button"
            disabled={busy || !notice.trim()}
            onClick={() => void run("addNotice", { notice })}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground disabled:opacity-40"
          >
            <Check size={16} /> Yayınla
          </button>
        </div>
        <div className="mt-3 grid gap-2">
          {flow?.notices
            .slice()
            .reverse()
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-background/80 px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1">{item.text}</span>
                <button
                  type="button"
                  aria-label="Bildirimi kaldır"
                  disabled={busy}
                  onClick={() => void run("removeNotice", { noticeId: item.id })}
                  className="text-foreground/40 hover:text-destructive"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
        </div>
      </div>
      {message ? <p className="mt-3 text-sm font-bold text-primary-deep">{message}</p> : null}
    </section>
  );
}
