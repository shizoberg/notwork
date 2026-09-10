import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "@tanstack/react-router";
import { Clock3, Network, MessageCircle, ArrowLeft } from "lucide-react";
import { getPublicEventContext, type NotworkEvent } from "@/lib/event-registry";
import { SiteNav } from "@/components/SiteNav";

const apps = [
  { key: "five", label: "Five", href: "/five/live", icon: Clock3 },
  { key: "matchlab", label: "MatchLab", href: "/21-agustos/eslesme", icon: Network },
  { key: "wordcloud", label: "WordCloud", href: "/21-agustos/wordcloud", icon: MessageCircle },
] as const;
export function isEventAppPath(path: string) {
  return path === "/linkler" || apps.some((app) => app.href === path);
}

export function EventExperienceShell({ children }: { children: ReactNode }) {
  const { pathname, searchStr } = useLocation();
  const preview = import.meta.env.DEV && new URLSearchParams(searchStr).get("preview") === "event";
  const [event, setEvent] = useState<NotworkEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [entryReady, setEntryReady] = useState(false);
  useEffect(() => {
    const update = (event: Event) => setEntryReady(Boolean((event as CustomEvent).detail));
    window.addEventListener("notwork-entry-ready", update);
    return () => window.removeEventListener("notwork-entry-ready", update);
  }, []);
  useEffect(() => {
    if (preview) {
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
  const visibleApps = preview
    ? [...apps]
    : event
      ? apps.filter((app) => {
          const product = event.products[app.key];
          return (
            product.enabled &&
            product.visible &&
            product.state === "live" &&
            product.dataMode === "live"
          );
        })
      : [];
  const selectedApp = apps.find((app) => app.href === pathname);
  const available = preview || (event && (!selectedApp || visibleApps.includes(selectedApp)));
  if (event && !new URLSearchParams(searchStr).has("eventId"))
    return <Navigate to={pathname} search={{ eventId: event.id }} replace />;
  return (
    <div className="event-minimal">
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
            <span className="ntw-glass-mark">ntw</span>
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
                : "17 Eylül ve 9 Ekim tarihlerinde etkinlik anlarında aktif olacaktır"}
            </p>
            <Link to="/ntw">Etkinlik anına dön ↗</Link>
          </main>
        </>
      )}
      {(pathname !== "/linkler" || entryReady) && (
        <nav
          className="mobile-glass-dock event-app-dock"
          aria-label="Etkinlik uygulamaları"
          style={{ gridTemplateColumns: `repeat(${visibleApps.length + 1},1fr)` }}
        >
          <Link to="/" aria-label="Ana menüye dön">
            <ArrowLeft size={20} />
            <span>notwork</span>
          </Link>
          {visibleApps.map(({ href, key, label, icon: Icon }) => (
            <Link
              key={key}
              to={href}
              search={preview ? { preview: "event" } : { eventId: event!.id }}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={1.65} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
