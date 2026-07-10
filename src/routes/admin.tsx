import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Check,
  Eye,
  MousePointerClick,
  Pencil,
  Plus,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "notwork Admin" }, { name: "robots", content: "noindex, nofollow" }],
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

type NetworkMember = {
  id: string;
  name: string;
  title: string;
  skills: string;
  email: string;
  instagram: string;
  linkedin: string;
  motivation: string;
  contact: string;
  createdAt: string;
  username: string;
};

type ChangeRequest = {
  id: string;
  username: string;
  requestedAt: string;
  current: NetworkMember;
  proposed: NetworkMember;
};

const blankMember: NetworkMember = {
  id: "",
  name: "",
  title: "",
  skills: "",
  email: "",
  instagram: "",
  linkedin: "",
  motivation: "",
  contact: "",
  createdAt: "",
  username: "",
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
  const [members, setMembers] = useState<NetworkMember[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [memberDraft, setMemberDraft] = useState<NetworkMember>(blankMember);
  const [editingUsername, setEditingUsername] = useState("");
  const [networkMessage, setNetworkMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNetwork = async (nextPassword = password) => {
    const response = await fetch("/api/networking/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: nextPassword, action: "list" }),
    });
    if (!response.ok) throw new Error("Networking verisi alınamadı.");
    const data = (await response.json()) as { members: NetworkMember[]; requests: ChangeRequest[] };
    setMembers(data.members);
    setRequests(data.requests);
  };

  const networkAction = async (
    action: "create" | "update" | "delete" | "approve" | "reject",
    payload: Record<string, unknown> = {},
  ) => {
    setNetworkMessage("");
    const response = await fetch("/api/networking/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action, ...payload }),
    });
    if (!response.ok) {
      setNetworkMessage(await response.text());
      return;
    }
    const data = (await response.json()) as { members: NetworkMember[]; requests: ChangeRequest[] };
    setMembers(data.members);
    setRequests(data.requests);
    setMemberDraft(blankMember);
    setEditingUsername("");
    setNetworkMessage("İşlem tamamlandı.");
  };

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
      await loadNetwork(password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Rapor alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const report = useMemo(() => buildReport(events || []), [events]);

  if (events === null) {
    return (
      <main
        data-analytics-ignore
        className="grid min-h-screen place-items-center bg-background px-5 text-foreground"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void loadReport();
          }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg"
        >
          <a href="/" className="font-brand text-2xl">
            notwork
          </a>
          <h1 className="mt-8 text-2xl font-black">Admin paneli</h1>
          <p className="mt-2 text-sm text-foreground/55">
            Trafik, dönüşüm ve networking kayıtlarını yönetmek için şifreni gir.
          </p>
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
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50"
          >
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
            <h1 className="mt-2 text-3xl font-black">Admin paneli</h1>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => void loadReport(range)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                  days === range
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                }`}
              >
                {range} gün
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setEvents(null);
                setPassword("");
              }}
              className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold"
            >
              çıkış
            </button>
          </div>
        </header>

        <section className="mt-7 overflow-hidden rounded-[2rem] border border-primary/25 bg-[radial-gradient(circle_at_top_left,rgba(143,203,208,0.22),transparent_34%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--background)))] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary-deep">
                notwork analytics
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                Trafik komuta merkezi
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-foreground/60">
                Ziyaret, bilet tıklaması, buton davranışı ve sayfada geçirilen süreyi tek ekranda
                takip et.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm">
              <span className="text-foreground/45">Tarih aralığı</span>
              <div className="font-black">{days} gün</div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Metric icon={Users} label="Oturum" value={report.sessions} />
            <Metric icon={Eye} label="Sayfa görüntüleme" value={report.pageViews} />
            <Metric icon={Ticket} label="Bilet tıklaması" value={report.ticketClicks} highlight />
            <Metric
              icon={BarChart3}
              label="Bilet dönüşümü"
              value={`%${report.conversion}`}
              highlight
            />
            <Metric icon={MousePointerClick} label="Toplam tıklama" value={report.clicks} />
            <Metric icon={Activity} label="Ort. süre" value={`${report.averageTime} sn`} />
          </div>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <ChartCard
            title="Günlük trafik akışı"
            description="Sayfa görüntüleme, oturum ve bilet ilgisi"
          >
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={report.timeline}>
                <defs>
                  <linearGradient id="views" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8fcbd0" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#8fcbd0" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="tickets" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))" }} />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  name="Sayfa"
                  stroke="#2f9aa5"
                  fill="url(#views)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  name="Oturum"
                  stroke="#6a7ee8"
                  fill="transparent"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="ticketClicks"
                  name="Bilet"
                  stroke="#d4af37"
                  fill="url(#tickets)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cihaz dağılımı" description="Mobil / tablet / desktop kırılımı">
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={report.devices}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={4}
                >
                  {report.devices.map((entry, index) => (
                    <Cell
                      key={entry.label}
                      fill={["#8fcbd0", "#d4af37", "#6a7ee8", "#ef7b7b"][index % 4]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid gap-2">
              {report.devices.map((device) => (
                <div
                  key={device.label}
                  className="flex justify-between rounded-xl bg-muted/50 px-3 py-2 text-xs"
                >
                  <span>{device.label}</span>
                  <strong>{device.value}</strong>
                </div>
              ))}
            </div>
          </ChartCard>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-3">
          <ChartCard title="Buton takip paneli" description="En çok tıklanan CTA ve linkler">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={report.buttonActions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))" }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#8fcbd0" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ReportList title="En çok görüntülenen sayfalar" rows={report.topPages} />
          <ReportList title="Trafik kaynakları" rows={report.sources} />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <ActionTable title="Buton ve CTA tıklamaları" events={report.buttonEvents} />
          <ActionTable
            title="Son form ve networking aksiyonları"
            events={report.formAndNetworkEvents}
          />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <ReportList title="En çok kullanılan aksiyonlar" rows={report.topActions} />
          <ReportList title="Kaydırma derinliği" rows={report.scrollDepth} suffix=" ulaşım" />
        </section>

        <NetworkingAdmin
          members={members}
          requests={requests}
          draft={memberDraft}
          editingUsername={editingUsername}
          message={networkMessage}
          setDraft={setMemberDraft}
          setEditingUsername={setEditingUsername}
          networkAction={networkAction}
        />

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 font-bold">Son aksiyonlar</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/60 text-xs text-foreground/50">
                <tr>
                  <th className="px-4 py-3">Zaman</th>
                  <th className="px-4 py-3">Aksiyon</th>
                  <th className="px-4 py-3">Sayfa</th>
                  <th className="px-4 py-3">Detay</th>
                  <th className="px-4 py-3">Cihaz</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 100).map((event) => (
                  <tr key={event.id} className="border-t border-border/70">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground/50">
                      {new Date(event.timestamp).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {eventNames[event.type] || event.type}
                    </td>
                    <td className="px-4 py-3">{event.path}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-foreground/60">
                      {event.label ||
                        (event.value
                          ? `${event.value}${event.type === "page_time" ? " sn" : "%"}`
                          : "—")}
                    </td>
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

function NetworkingAdmin({
  members,
  requests,
  draft,
  editingUsername,
  message,
  setDraft,
  setEditingUsername,
  networkAction,
}: {
  members: NetworkMember[];
  requests: ChangeRequest[];
  draft: NetworkMember;
  editingUsername: string;
  message: string;
  setDraft: (member: NetworkMember) => void;
  setEditingUsername: (username: string) => void;
  networkAction: (
    action: "create" | "update" | "delete" | "approve" | "reject",
    payload?: Record<string, unknown>,
  ) => Promise<void>;
}) {
  const set =
    (key: keyof NetworkMember) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft({ ...draft, [key]: event.target.value });

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.25fr]">
      <article className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Networking üyeleri</h2>
            <p className="mt-1 text-sm text-foreground/50">
              Ekle, düzenle, sil. Admin değişiklikleri direkt yayına çıkar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDraft(blankMember);
              setEditingUsername("");
            }}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold"
          >
            <Plus size={14} /> yeni
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void networkAction(editingUsername ? "update" : "create", {
              username: editingUsername || draft.username,
              member: draft,
            });
          }}
          className="mt-5 grid gap-3 sm:grid-cols-2"
        >
          <AdminField
            label="Kullanıcı adı"
            value={draft.username}
            onChange={set("username")}
            disabled={Boolean(editingUsername)}
            required
          />
          <AdminField label="Ad Soyad" value={draft.name} onChange={set("name")} required />
          <AdminField label="Rol" value={draft.title} onChange={set("title")} required />
          <AdminField label="E-posta" value={draft.email} onChange={set("email")} required />
          <AdminField label="Instagram" value={draft.instagram} onChange={set("instagram")} />
          <AdminField label="LinkedIn" value={draft.linkedin} onChange={set("linkedin")} />
          <AdminField
            className="sm:col-span-2"
            label="Yetenekler"
            value={draft.skills}
            onChange={set("skills")}
          />
          <label className="sm:col-span-2 flex flex-col gap-1.5 text-xs text-foreground/60">
            Motivasyon
            <textarea
              value={draft.motivation}
              onChange={set("motivation")}
              rows={3}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {editingUsername ? "kaydı güncelle" : "yeni kayıt ekle"}
          </button>
          {message && (
            <p className="self-center text-sm font-semibold text-primary-deep">{message}</p>
          )}
        </form>
      </article>

      <article className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-xl font-black">Onay bekleyen değişiklikler · {requests.length}</h2>
        <div className="mt-4 grid gap-3">
          {requests.length === 0 && (
            <p className="text-sm text-foreground/45">Bekleyen değişiklik yok.</p>
          )}
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold">{request.current.name}</div>
                  <div className="text-xs text-foreground/45">
                    @{request.username} · {new Date(request.requestedAt).toLocaleString("tr-TR")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void networkAction("approve", { requestId: request.id })}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Check size={14} /> onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => void networkAction("reject", { requestId: request.id })}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold"
                  >
                    <X size={14} /> reddet
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <ChangeBox title="Mevcut" member={request.current} />
                <ChangeBox title="Önerilen" member={request.proposed} />
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-2">
        <div className="border-b border-border px-5 py-4 font-bold">
          Üye listesi · {members.length}
        </div>
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 bg-muted text-xs text-foreground/50">
              <tr>
                <th className="px-4 py-3">Üye</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Sosyal</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.username} className="border-t border-border/70">
                  <td className="px-4 py-3">
                    <div className="font-bold">{member.name}</div>
                    <div className="text-xs text-foreground/45">@{member.username}</div>
                  </td>
                  <td className="px-4 py-3">{member.title}</td>
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3 text-xs text-foreground/55">
                    {member.instagram ? `IG: ${member.instagram}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDraft(member);
                          setEditingUsername(member.username);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="rounded-full border border-border p-2"
                        aria-label={`${member.name} düzenle`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`${member.name} kaydı silinsin mi?`)) {
                            void networkAction("delete", { username: member.username });
                          }
                        }}
                        className="rounded-full border border-border p-2 text-destructive"
                        aria-label={`${member.name} sil`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function AdminField({
  label,
  className = "",
  ...props
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 text-xs text-foreground/60 ${className}`}>
      {label}
      <input
        {...props}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
      />
    </label>
  );
}

function ChangeBox({ title, member }: { title: string; member: NetworkMember }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <div className="mb-2 font-bold">{title}</div>
      <div>{member.name}</div>
      <div>{member.title}</div>
      <div>{member.email}</div>
      <div>{member.instagram ? `@${member.instagram}` : "instagram yok"}</div>
      <div className="mt-1 line-clamp-3 text-foreground/55">
        {member.motivation || "motivasyon yok"}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="mt-1 text-xs text-foreground/45">{description}</p>
        </div>
        <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-deep">
          live
        </div>
      </div>
      {children}
    </article>
  );
}

function ActionTable({ title, events }: { title: string; events: AnalyticsEvent[] }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-black">{title}</h2>
        <p className="mt-1 text-xs text-foreground/45">Son 20 kayıt</p>
      </div>
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="sticky top-0 bg-muted text-xs text-foreground/50">
            <tr>
              <th className="px-4 py-3">Zaman</th>
              <th className="px-4 py-3">Aksiyon</th>
              <th className="px-4 py-3">Sayfa</th>
              <th className="px-4 py-3">Hedef</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 20).map((event) => (
              <tr key={event.id} className="border-t border-border/70">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground/50">
                  {new Date(event.timestamp).toLocaleString("tr-TR")}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {event.label || eventNames[event.type] || event.type}
                </td>
                <td className="px-4 py-3">{event.path}</td>
                <td className="max-w-xs truncate px-4 py-3 text-foreground/55">
                  {event.target || "—"}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-foreground/45">
                  Henüz veri yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${highlight ? "border-primary/40 bg-primary/10" : "border-border bg-card"}`}
    >
      <Icon size={18} className="text-primary-deep" />
      <div className="mt-4 text-2xl font-black">{value}</div>
      <div className="mt-1 text-xs text-foreground/50">{label}</div>
    </article>
  );
}

function ReportList({
  title,
  rows,
  suffix = "",
}: {
  title: string;
  rows: Array<[string, number]>;
  suffix?: string;
}) {
  const maximum = Math.max(1, ...rows.map(([, value]) => value));
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {rows.length ? (
          rows.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between gap-3 text-xs">
                <span className="truncate">{label}</span>
                <strong>
                  {value}
                  {suffix}
                </strong>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(4, (value / maximum) * 100)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-foreground/45">Henüz veri yok.</p>
        )}
      </div>
    </article>
  );
}

function buildReport(events: AnalyticsEvent[]) {
  const count = (type: string) => events.filter((event) => event.type === type).length;
  const sessions = new Set(
    events.filter((event) => event.sessionId).map((event) => event.sessionId),
  ).size;
  const ticketClicks = count("ticket_click");
  const pageTimes = events.filter((event) => event.type === "page_time" && event.value > 0);
  const buttonEvents = events.filter((event) => ["click", "ticket_click"].includes(event.type));
  const formAndNetworkEvents = events.filter(
    (event) =>
      event.type === "form_submit" ||
      event.path.includes("networking") ||
      event.label.toLocaleLowerCase("tr-TR").includes("ağa ekle") ||
      event.label.toLocaleLowerCase("tr-TR").includes("güncelle"),
  );
  return {
    sessions,
    pageViews: count("page_view"),
    ticketClicks,
    conversion: sessions ? ((ticketClicks / sessions) * 100).toFixed(1) : "0.0",
    clicks: count("click") + ticketClicks,
    averageTime: pageTimes.length
      ? Math.round(pageTimes.reduce((total, event) => total + event.value, 0) / pageTimes.length)
      : 0,
    topPages: grouped(
      events.filter((event) => event.type === "page_view"),
      (event) => event.path,
    ),
    topActions: grouped(
      events.filter((event) => ["click", "ticket_click", "form_submit"].includes(event.type)),
      (event) => event.label || event.type,
    ),
    sources: grouped(
      events.filter((event) => event.type === "session_start"),
      (event) => event.source || event.referrer || "Doğrudan",
    ),
    scrollDepth: grouped(
      events.filter((event) => event.type === "scroll_depth"),
      (event) => `${event.value}%`,
    ),
    devices: grouped(
      events.filter((event) => event.device),
      (event) => event.device,
    ).map(([label, value]) => ({ label, value })),
    buttonActions: grouped(buttonEvents, (event) => event.label || event.target || "Buton").map(
      ([label, value]) => ({ label: label.slice(0, 18), value }),
    ),
    buttonEvents,
    formAndNetworkEvents,
    timeline: buildTimeline(events),
  };
}

function grouped(
  events: AnalyticsEvent[],
  key: (event: AnalyticsEvent) => string,
): Array<[string, number]> {
  const values = new Map<string, number>();
  for (const event of events) values.set(key(event), (values.get(key(event)) || 0) + 1);
  return [...values.entries()].sort((first, second) => second[1] - first[1]).slice(0, 8);
}

function buildTimeline(events: AnalyticsEvent[]) {
  const days = new Map<
    string,
    { day: string; pageViews: number; sessions: number; ticketClicks: number; clicks: number }
  >();
  for (const event of events) {
    const day = new Date(event.timestamp).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
    });
    const row = days.get(day) || { day, pageViews: 0, sessions: 0, ticketClicks: 0, clicks: 0 };
    if (event.type === "page_view") row.pageViews += 1;
    if (event.type === "session_start") row.sessions += 1;
    if (event.type === "ticket_click") row.ticketClicks += 1;
    if (event.type === "click" || event.type === "ticket_click") row.clicks += 1;
    days.set(day, row);
  }
  return [...days.values()].reverse();
}
