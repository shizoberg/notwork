import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "@tanstack/react-router";
import { Clock3, Network, MessageCircle } from "lucide-react";
import { getPublicEventContext, type NotworkEvent } from "@/lib/event-registry";
import { SiteNav } from "@/components/SiteNav";
import { previewEvent, useEventPreview } from "@/lib/event-preview";

type EventTransition = {
  title: string;
  detail: string;
  leaving: boolean;
};

const apps = [
  { key: "five", label: "Five", href: "/five/live", icon: Clock3 },
  { key: "wordcloud", label: "WordCloud", href: "/21-agustos/wordcloud", icon: MessageCircle },
  { key: "matchlab", label: "Match", href: "/21-agustos/eslesme", icon: Network },
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
      const now = Date.now();
      setEvent(
        results
          .flatMap((r) => (r.status === "fulfilled" ? [r.value.event] : []))
          .find(
            (e) =>
              e.status === "live" &&
              e.entry.isOpen &&
              now >= Date.parse(e.startsAt) &&
              now < Date.parse(e.endsAt),
          ) || null,
      );
      setLoading(false);
    }
    void load();
    const timer = window.setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [searchStr, preview]);
  const visibleApps =
    preview && !event
      ? [...apps]
      : event
        ? apps
            .filter((app) => {
              const product = event.products[app.key];
              return (
                product.enabled &&
                product.visible &&
                (preview || (product.state === "live" && product.dataMode === "live"))
              );
            })
            .sort((a, b) => event.products[a.key].order - event.products[b.key].order)
        : [];
  const selectedApp = apps.find((app) => app.href === pathname);
  const available = preview || (event && (!selectedApp || visibleApps.includes(selectedApp)));
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
            <img
              src="/brand/notwork-logo.png"
              alt=""
              className="event-transition-logo"
            />
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
      {available ? (
        children
      ) : (
        <>
          <SiteNav />
          <main className="event-closed">
            <span className="ntw-glass-mark">
              <img src="/brand/notwork-logo.png" alt="notwork" />
            </span>
            <h1>
              {loading
                ? "Etkinlik kontrol ediliyor"
                : event
                  ? "Bu uygulama henüz açık değil"
                  : "Etkinlikte buluşalım"}
            </h1>
            <p>
              {event
                ? "Açık uygulamaları aşağıdaki menüden seçebilirsin"
                : "17 Eylül ve 11 Ekim tarihlerinde etkinlik anlarında aktif olacaktır"}
            </p>
            <Link to="/ntw">Etkinlik anına dön ↗</Link>
          </main>
        </>
      )}
      <nav
        className={`mobile-glass-dock event-app-dock ${pathname === "/linkler" ? "event-entry-dock" : ""}`}
        aria-label="Etkinlik uygulamaları"
        style={{ gridTemplateColumns: `repeat(${visibleApps.length + 1},1fr)` }}
      >
        <Link
          to="/linkler"
          search={
            preview
              ? { preview: "event", ...(event ? { eventId: event.id } : {}) }
              : event
                ? { eventId: event.id }
                : {}
          }
          aria-label="Linkler sayfasına dön"
        >
          <img
            src="/brand/notwork-logo.png"
            alt=""
            className="event-dock-logo"
            aria-hidden="true"
          />
          <span>notwork</span>
        </Link>
        {visibleApps.map(({ href, key, label, icon: Icon }) => (
          <Link
            key={key}
            to={href}
            search={
              preview
                ? { preview: "event", ...(event ? { eventId: event.id } : {}) }
                : { eventId: event!.id }
            }
            aria-current={pathname === href ? "page" : undefined}
          >
            <Icon size={22} strokeWidth={1.65} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
