import { createFileRoute } from "@tanstack/react-router";
import { Activity, BarChart3, Eye, MousePointerClick, Ticket, Users } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "notwork Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type AnalyticsEvent = {
  id: string;
  timestamp: string;
  type: string;
  path: string;
  sessionId: string;
  label: string;
  target: string;
  value: number;
  referrer: string;
  source: string;
  campaign: string;
  device: string;
};

const eventNames: Record<string, string> = {
  session_start: "Oturum başladı",
  page_view: "Sayfa görüntülendi",
  click: "Tıklama",
  ticket_click: "Bilet butonu",
  scroll_depth: "Kaydırma",
  page_time: "Sayfada geçirilen süre",
  form_submit: "Form gönderimi",
};

function AdminPage() {
  const [password, setPassword] = useState("");
  const [days, setDays] = useState(30);
  const [events, setEvents] = useState<AnalyticsEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async (nextDays = days) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analytics/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, days: nextDays }),
      });
      if (response.status === 401) throw new Error("Şifre yanlış.");
      if (!response.ok) throw new Error("Rapor şu anda alınamadı.");
      const data = (await response.json()) as { events: AnalyticsEvent[] };
      setEvents(data.events);
      setDays(nextDays);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Rapor alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const report = useMemo(() => buildReport(events || []), [events]);

  if (events === null) {
    return (
      <main data-analytics-ignore className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void loadReport();
          }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg"
        >
          <a href="/" className="font-brand text-2xl">notwork</a>
          <h1 className="mt-8 text-2xl font-black">Admin paneli</h1>
          <p className="mt-2 text-sm text-foreground/55">Trafik ve dönüşüm raporlarına erişmek için şifreni gir.</p>
          <label className="mt-6 block text-xs text-foreground/60">
            Şifre
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              required
            />
          </label>
          <button type="submit" disabled={loading} className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">
            {loading ? "giriş yapılıyor…" : "giriş yap"}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main data-analytics-ignore className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-brand text-2xl">notwork</div>
            <h1 className="mt-2 text-3xl font-black">Trafik ve aksiyonlar</h1>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((range) => (
              <button key={range} type="button" onClick={() => void loadReport(range)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${days === range ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                {range} gün
              </button>
            ))}
            <button type="button" onClick={() => { setEvents(null); setPassword(""); }} className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold">çıkış</button>
          </div>
        </header>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Metric icon={Users} label="Oturum" value={report.sessions} />
          <Metric icon={Eye} label="Sayfa görüntüleme" value={report.pageViews} />
          <Metric icon={Ticket} label="Bilet tıklaması" value={report.ticketClicks} highlight />
          <Metric icon={BarChart3} label="Bilet dönüşümü" value={`%${report.conversion}`} highlight />
          <Metric icon={MousePointerClick} label="Toplam tıklama" value={report.clicks} />
          <Metric icon={Activity} label="Ort. süre" value={`${report.averageTime} sn`} />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <ReportList title="En çok görüntülenen sayfalar" rows={report.topPages} />
          <ReportList title="En çok kullanılan aksiyonlar" rows={report.topActions} />
          <ReportList title="Trafik kaynakları" rows={report.sources} />
          <ReportList title="Kaydırma derinliği" rows={report.scrollDepth} suffix=" ulaşım" />
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 font-bold">Son aksiyonlar</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/60 text-xs text-foreground/50">
                <tr><th className="px-4 py-3">Zaman</th><th className="px-4 py-3">Aksiyon</th><th className="px-4 py-3">Sayfa</th><th className="px-4 py-3">Detay</th><th className="px-4 py-3">Cihaz</th></tr>
              </thead>
              <tbody>
                {events.slice(0, 100).map((event) => (
                  <tr key={event.id} className="border-t border-border/70">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground/50">{new Date(event.timestamp).toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-3 font-semibold">{eventNames[event.type] || event.type}</td>
                    <td className="px-4 py-3">{event.path}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-foreground/60">{event.label || (event.value ? `${event.value}${event.type === "page_time" ? " sn" : "%"}` : "—")}</td>
                    <td className="px-4 py-3 text-foreground/50">{event.device || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, highlight = false }: { icon: typeof Users; label: string; value: string | number; highlight?: boolean }) {
  return <article className={`rounded-2xl border p-4 ${highlight ? "border-primary/40 bg-primary/10" : "border-border bg-card"}`}><Icon size={18} className="text-primary-deep" /><div className="mt-4 text-2xl font-black">{value}</div><div className="mt-1 text-xs text-foreground/50">{label}</div></article>;
}

function ReportList({ title, rows, suffix = "" }: { title: string; rows: Array<[string, number]>; suffix?: string }) {
  const maximum = Math.max(1, ...rows.map(([, value]) => value));
  return <article className="rounded-2xl border border-border bg-card p-5"><h2 className="font-bold">{title}</h2><div className="mt-4 grid gap-3">{rows.length ? rows.map(([label, value]) => <div key={label}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate">{label}</span><strong>{value}{suffix}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, (value / maximum) * 100)}%` }} /></div></div>) : <p className="text-sm text-foreground/45">Henüz veri yok.</p>}</div></article>;
}

function buildReport(events: AnalyticsEvent[]) {
  const count = (type: string) => events.filter((event) => event.type === type).length;
  const sessions = new Set(events.filter((event) => event.sessionId).map((event) => event.sessionId)).size;
  const ticketClicks = count("ticket_click");
  const pageTimes = events.filter((event) => event.type === "page_time" && event.value > 0);
  return {
    sessions,
    pageViews: count("page_view"),
    ticketClicks,
    conversion: sessions ? ((ticketClicks / sessions) * 100).toFixed(1) : "0.0",
    clicks: count("click") + ticketClicks,
    averageTime: pageTimes.length ? Math.round(pageTimes.reduce((total, event) => total + event.value, 0) / pageTimes.length) : 0,
    topPages: grouped(events.filter((event) => event.type === "page_view"), (event) => event.path),
    topActions: grouped(events.filter((event) => ["click", "ticket_click", "form_submit"].includes(event.type)), (event) => event.label || event.type),
    sources: grouped(events.filter((event) => event.type === "session_start"), (event) => event.source || event.referrer || "Doğrudan"),
    scrollDepth: grouped(events.filter((event) => event.type === "scroll_depth"), (event) => `${event.value}%`),
  };
}

function grouped(events: AnalyticsEvent[], key: (event: AnalyticsEvent) => string): Array<[string, number]> {
  const values = new Map<string, number>();
  for (const event of events) values.set(key(event), (values.get(key(event)) || 0) + 1);
  return [...values.entries()].sort((first, second) => second[1] - first[1]).slice(0, 8);
}
