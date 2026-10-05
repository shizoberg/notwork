import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "@tanstack/react-router";
import { Home, Network, MessagesSquare, Sparkles } from "lucide-react";
import { getPublicEventContext, withEventSelection, type NotworkEvent } from "@/lib/event-registry";
import { previewEvent, useEventPreview } from "@/lib/event-preview";
import { syncEventSessionAliases } from "@/lib/event-session";

type EventTransition = {
  title: string;
  detail: string;
  leaving: boolean;
};

const apps = [
  { href: "/five/live", key: "five", label: "Five", icon: MessagesSquare },
  { href: "/21-agustos/wordcloud", key: "wordcloud", label: "Wordcloud", icon: Sparkles },
  { href: "/21-agustos/eslesme", key: "matchlab", label: "Match", icon: Network },
] as const;
export function isEventAppPath(path: string) {
  return path === "/linkler" || apps.some((app) => app.href === path);
}

export function EventExperienceShell({ children }: { children: ReactNode }) {
  const { pathname, searchStr } = useLocation();
  const preview = useEventPreview();
  const [event, setEvent] = useState<NotworkEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [transition, setTransition] = useState<EventTransition | null>(null);
  useEffect(() => {
    let next: Omit<EventTransition, "leaving"> | null = null;
    if (pathname === "/five/live") {
      next = { title: "eşleşmen bulunuyor", detail: "problem masan hazırlanıyor" };
    } else if (pathname === "/21-agustos/eslesme") {
      next = { title: "eşleşmen bulunuyor", detail: "yeni bağlantılar aranıyor" };
    } else if (pathname === "/21-agustos/wordcloud") {
      next = { title: "ortak fikirler açılıyor", detail: "kelimeler bir araya geliyor" };
    } else if (
      pathname === "/linkler" &&
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("ntw-entry-transition") === "code"
    ) {
      window.sessionStorage.removeItem("ntw-entry-transition");
      next = { title: "etkinlik açılıyor", detail: "notwork zamanı" };
    }

    if (!next) {
      setTransition(null);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTransition({ ...next, leaving: false });
    const fadeTimer = window.setTimeout(
      () => setTransition((current) => (current ? { ...current, leaving: true } : null)),
      reducedMotion ? 80 : 1_180,
    );
    const removeTimer = window.setTimeout(() => setTransition(null), reducedMotion ? 140 : 1_480);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [pathname]);

  useEffect(() => {
    if (preview === null) return;
    if (preview) {
      setEvent(previewEvent());
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setEvent(null);
    async function load() {
      const params = new URLSearchParams(searchStr);
      const selected = params.get("eventId")
        ? { eventId: params.get("eventId")! }
        : params.get("eventSlug") || params.get("event")
          ? { eventSlug: (params.get("eventSlug") || params.get("event"))! }
          : null;
      const choices = selected
        ? [selected]
        : [{ eventSlug: "17-eylul-2026" }, { eventSlug: "9-ekim-2026" }];
      const results = await Promise.allSettled(choices.map(getPublicEventContext));
      if (cancelled) return;
      const candidates = results.flatMap((r) => (r.status === "fulfilled" ? [r.value.event] : []));
      const activeEvent = selected
        ? candidates[0] || null
        : candidates.find((candidate) => candidate.entry.isOpen && candidate.status === "live") ||
          candidates.find((candidate) => candidate.entry.isOpen) ||
          candidates[0] || null;
      // Restore both identifiers before mounting apps that read their session once.
      if (activeEvent) syncEventSessionAliases(localStorage, activeEvent);
      setEvent(activeEvent);
      setLoading(false);
    }
    void load();
    const timer = window.setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pathname, searchStr, preview]);
  if (!preview && event && !new URLSearchParams(searchStr).has("eventId"))
    return <Navigate to={pathname} search={{ eventId: event.id }} replace />;
  return (
    <div className="event-minimal">
      {transition && (
        <div
          className={`event-route-transition${transition.leaving ? " is-leaving" : ""}`}
          role="status"
          aria-live="polite"
        >
          <div className="event-route-transition-visual" aria-hidden="true">
            <span className="event-route-transition-orbit orbit-one" />
            <span className="event-route-transition-orbit orbit-two" />
            <span className="event-route-transition-dot dot-one" />
            <span className="event-route-transition-dot dot-two" />
            <span className="event-route-transition-dot dot-three" />
            <span className="event-route-transition-bridge bridge-one" />
            <span className="event-route-transition-bridge bridge-two" />
            <img src="/brand/notwork-logo.png" alt="" className="event-transition-logo" />
          </div>
          <p>{transition.title}</p>
          <small>{transition.detail}</small>
          <span className="event-route-transition-progress" aria-hidden="true">
            <i />
          </span>
        </div>
      )}
      {preview && (
        <p className="px-4 py-2 text-center text-xs text-primary-deep">
          Etkinlik önizlemesi · yalnızca bu cihazda
        </p>
      )}
      {children}
      <nav className={`mobile-glass-dock event-app-dock${pathname === "/linkler" ? " event-entry-dock" : ""}`} aria-label="Etkinlik uygulamaları">
        {[
          { href: "/linkler", label: "Ana ekran", icon: Home },
          ...apps.filter((app) => event
            ? event.products[app.key].enabled && event.products[app.key].visible && event.products[app.key].state !== "disabled"
            : app.href === pathname)
            .sort((a, b) => (event?.products[a.key].order ?? 0) - (event?.products[b.key].order ?? 0)),
        ].map((app) => {
          const Icon = app.icon;
          const href = preview
            ? `${event ? withEventSelection(app.href, { eventId: event.id }) : app.href}${event ? "&" : "?"}preview=event`
            : event
              ? withEventSelection(app.href, { eventId: event.id })
              : app.href;
          return (
            <Link key={app.href} to={href} aria-current={pathname === app.href ? "page" : undefined}>
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>{app.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
