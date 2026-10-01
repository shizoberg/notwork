import { useEffect, useMemo, useState } from "react";
import { currentEventFlowStep, getEventFlow, type EventFlowState } from "@/lib/event-flow";
import {
  getEventSelectionFromLocation,
  withEventSelection,
  type EventProductKey,
} from "@/lib/event-registry";
import { previewEvent, useEventPreview } from "@/lib/event-preview";

export function EventFlowBanner({
  product,
  onFlowChange,
}: {
  product?: EventProductKey;
  onFlowChange?: (flow: EventFlowState) => void;
}) {
  const preview = useEventPreview();
  const [flow, setFlow] = useState<EventFlowState | null>(null);
  const selection = useMemo(() => getEventSelectionFromLocation(), []);

  useEffect(() => {
    if (preview === true) {
      const event = previewEvent();
      if (!event) return;
      const steps = Object.entries(event.products)
        .filter(([, config]) => config.enabled && config.visible)
        .sort(([, left], [, right]) => left.order - right.order)
        .map(([productKey, config]) => ({
          product: productKey as EventProductKey,
          label: config.label,
          durationMinutes: productKey === "five" ? 90 : 60,
        }));
      const now = new Date();
      const demoFlow: EventFlowState = {
        version: 1,
        eventId: event.id,
        eventSlug: event.slug,
        status: "running",
        steps,
        currentStepIndex: 0,
        startedAt: now.toISOString(),
        endsAt: new Date(now.getTime() + (steps[0]?.durationMinutes || 60) * 60_000).toISOString(),
        notices: [],
        updatedAt: now.toISOString(),
        serverNow: now.toISOString(),
      };
      setFlow(demoFlow);
      onFlowChange?.(demoFlow);
      return;
    }
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
    }, 15_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [onFlowChange, preview, selection]);

  const step = currentEventFlowStep(flow);
  useEffect(() => {
    if (!product || !flow || preview !== false) return;
    if (flow.status === "completed" || (step && step.product !== product)) {
      const timer = window.setTimeout(() => {
        window.location.assign(withEventSelection("/linkler", selection));
      }, 650);
      return () => window.clearTimeout(timer);
    }
  }, [flow, preview, product, selection, step]);

  return null;
}
