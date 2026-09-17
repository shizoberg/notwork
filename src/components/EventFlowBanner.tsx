import { Bell, Clock3, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  currentEventFlowStep,
  eventProductPaths,
  getEventFlow,
  type EventFlowState,
} from "@/lib/event-flow";
import {
  getEventSelectionFromLocation,
  withEventSelection,
  type EventProductKey,
} from "@/lib/event-registry";
import { useEventPreview } from "@/lib/event-preview";

export function EventFlowBanner({
  product,
  onFlowChange,
}: {
  product?: EventProductKey;
  onFlowChange?: (flow: EventFlowState) => void;
}) {
  const preview = useEventPreview();
  const [flow, setFlow] = useState<EventFlowState | null>(null);
  const [clock, setClock] = useState(Date.now());
  const selection = useMemo(() => getEventSelectionFromLocation(), []);

  useEffect(() => {
    if (preview !== false) return;
    let active = true;
    const refresh = async () => {
      try {
        const next = await getEventFlow(selection);
        if (active) {
          setFlow(next);
          onFlowChange?.(next);
        }
      } catch {
        // The event app stays usable if the live-control layer is temporarily unavailable.
      }
    };
    void refresh();
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 3_000);
    const tick = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => {
      active = false;
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [onFlowChange, preview, selection]);

  const step = currentEventFlowStep(flow);
  const effectiveStatus =
    flow?.status === "running" && flow.endsAt && Date.parse(flow.endsAt) <= clock
      ? "awaiting_advance"
      : flow?.status;

  useEffect(() => {
    if (!product || !flow || preview !== false) return;
    if (effectiveStatus === "completed" || (step && step.product !== product)) {
      const timer = window.setTimeout(() => {
        window.location.assign(withEventSelection("/linkler", selection));
      }, 650);
      return () => window.clearTimeout(timer);
    }
  }, [effectiveStatus, flow, preview, product, selection, step]);

  if (!flow || flow.status === "idle") return null;
  const remainingSeconds = flow.endsAt
    ? Math.max(0, Math.ceil((Date.parse(flow.endsAt) - clock) / 1_000))
    : 0;
  const latestNotice = flow.notices.at(-1);
  const redirecting = Boolean(
    product && (effectiveStatus === "completed" || step?.product !== product),
  );
  const target = step
    ? withEventSelection(eventProductPaths[step.product], selection)
    : withEventSelection("/linkler", selection);

  return (
    <aside className={`event-live-banner${redirecting ? " is-redirecting" : ""}`} role="status">
      <span className="event-live-dot" aria-hidden="true" />
      <Bell size={15} />
      <span className="event-live-copy">
        <strong>
          {effectiveStatus === "completed"
            ? "Etkinlik akışı tamamlandı"
            : redirecting
              ? "Yeni akış Linkler’de hazır"
              : step?.label || "Etkinlik akışı"}
        </strong>
        <small>
          {latestNotice?.text ||
            (effectiveStatus === "awaiting_advance"
              ? "Süre tamamlandı · yeni yönlendirme bekleniyor"
              : "Şu an aktif")}
        </small>
      </span>
      {effectiveStatus === "running" && !redirecting ? (
        <span className="event-live-time">
          <Clock3 size={14} />
          {String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:
          {String(remainingSeconds % 60).padStart(2, "0")}
        </span>
      ) : null}
      {!product && step && effectiveStatus !== "completed" ? (
        <a href={target} className="event-live-action">
          Aç <ArrowRight size={14} />
        </a>
      ) : null}
    </aside>
  );
}
