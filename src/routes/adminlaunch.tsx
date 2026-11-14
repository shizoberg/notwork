import { MatchReportAdmin } from "@/components/launch-space/MatchReportAdmin";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Database,
  Megaphone,
  Network,
  SlidersHorizontal,
} from "lucide-react";
import { LaunchAnnouncementAdmin } from "@/components/launch-space/LaunchAnnouncementAdmin";
import { LaunchDatasetAdmin } from "@/components/launch-space/LaunchDatasetAdmin";
import { LaunchEventHeader } from "@/components/launch-space/LaunchEventHeader";
import { defaultLaunchFlow, getLaunchFlow } from "@/lib/launch-flow";
import { LaunchFlowAdmin } from "@/components/LaunchFlowAdmin";
import { EventPollAdmin } from "@/components/EventPollAdmin";
import { createNoIndexSeo } from "@/lib/seo";
import { novemberEventSlug } from "@/lib/event-poll";
import { NodeMark } from "./launch-space";
import "@/launch-space.css";
export const Route = createFileRoute("/adminlaunch")({
  head: () =>
    createNoIndexSeo({
      title: "launchspace · organizatör",
      description: "Yerel etkinlik kontrolü",
      path: "/adminlaunch",
    }),
  component: LaunchAdminPanel,
});
type MatchOverview = {
  registeredCount: number;
  matching: { status: "waiting" | "running" | "open"; total: number; processed: number };
  groups: { id: string; groupName: string; round: number; memberNames: string[]; approvedMemberNames?: string[] }[];
};

export function LaunchAdminPanel() {
  const [previewKey, setPreviewKey] = useState(0);
  const [datasetId, setDatasetId] = useState<string>();
  const [overview, setOverview] = useState<MatchOverview>();
  const [matchError, setMatchError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const [password, setPassword] = useState(""),
    [active, setActive] = useState(false),
    [error, setError] = useState(""),
    [count, setCount] = useState<number | null>(null),
    [busy, setBusy] = useState(false);
  async function request(action: string, extra: Record<string, unknown> = {}) {
    const r = await fetch("/api/admin/event-products/network", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        ...extra,
        event: novemberEventSlug,
        password,
        datasetId: ["startMatching", "processMatching", "recoverParticipant"].includes(action) ? datasetId : undefined,
      }),
    });
    if (!r.ok) throw Error(await r.text());
    return r.json();
  }
  const [participants, setParticipants] = useState<
    Array<{
      participant: { id: string };
      profile: { firstName: string; lastName: string };
      intro: string;
      jobTitle?: string;
      needs: string;
      offersDetail: string;
    }>
  >([]);
  const [section, setSection] = useState<
    "event" | "flow" | "match" | "poll" | "database" | "announcement" | "report"
  >("event");
  const [flow, setFlow] = useState(defaultLaunchFlow);
  const [recovery, setRecovery] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [username, setUsername] = useState("");
  async function auth(action: string) {
    const r = await fetch("/api/launch-admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, username, password }),
    });
    if (!r.ok) throw Error(await r.text());
    return r.json();
  }
  useEffect(() => {
    void auth("me")
      .then((r) => {
        if (r.authenticated) void load().catch((e) => setError(e.message));
      })
      .catch(() => {});
  }, []);
  async function signIn() {
    await auth("login");
    setPassword("");
    await load();
  }
  async function load() {
    const r = await request("list");
    setDatasetId(r.database.datasetId);
    setCount(r.registrations.length);
    setParticipants(r.registrations);
    setActive(true);
    void getLaunchFlow()
      .then(setFlow)
      .catch(() => {});
  }
  useEffect(() => {
    if (!active || (section !== "match" && section !== "event")) return;
    let current = true;
    let pending = false;
    const refresh = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const result = await request("matchOverview");
        if (current) {
          setOverview(result);
          if (result.database.datasetId) setDatasetId(result.database.datasetId);
          setMatchError("");
        }
      } catch {
        if (current) setMatchError("Grup listesi yenilenemedi. Tekrar denenecek.");
      } finally {
        pending = false;
      }
    };
    void refresh();
    const timer = setInterval(refresh, 5000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      current = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [active, section]);

  return (
    <div className={`launch-space ls-organizer${active ? " ls-organizer-active" : ""}`}>
      <header className="ls-header">
        <span className="ls-brand">
          <NodeMark />
          {flow.organizerName}
        </span>
        <span className="ls-demo">ORGANİZATÖR</span>
      </header>
      <main className="ls-main">
        <LaunchEventHeader flow={flow} />
        {!active ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void signIn().catch((e) => setError(e.message));
            }}
            className="ls-form"
          >
            <h2>Organizatör girişi</h2>
            <label>
              Kullanıcı adı
              <input
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              Şifre
              <input
                type="password"
                disabled={!hydrated}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <button disabled={!hydrated} className="ls-primary">
              Kontrol panelini aç
            </button>
          </form>
        ) : (
          <div className="ls-studio-layout">
            <nav className="ls-admin-tabs" aria-label="Etkinlik yönetimi">
              {(
                [
                  ["event", "Genel bakış", CalendarDays],
                  ["flow", "Kayıt ve akış", SlidersHorizontal],
                  ["match", "Match", Network],
                  ["poll", "Anket", BarChart3],
                  ["report", "Eşleşme raporu", BarChart3],
                  ["database", "Veri setleri", Database],
                  ["announcement", "Duyuru", Megaphone],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  aria-current={section === id ? "page" : undefined}
                  onClick={() => setSection(id)}
                >
                  <Icon size={17} /> {label}
                </button>
              ))}
              <a href="https://nodes-app.com/rehber" target="_blank" rel="noreferrer">Katılımcı rehberi ↗</a>
            </nav>
            <div className="ls-studio-content">
            <div className="ls-studio-toolbar"><span>Etkinlik stüdyosu</span><button className="ls-secondary" onClick={() => { setPreviewKey(k => k + 1); void load().catch(e => setError(e.message)); }}>Görünümü yenile</button></div>
            {section === "event" && (
              <>
                <section className="ls-system-map" aria-label="Canlı veri akışı">
                  <div><small>Kayıtlı</small><strong>{count ?? "—"}</strong><span>Katılımcı</span></div>
                  <div><small>Eşleşen</small><strong>{overview ? overview.groups.reduce((n,g) => n + g.memberNames.length, 0) : "—"}</strong><span>Aktif gruplarda</span></div>
                  <div><small>Gruplar</small><strong>{overview?.groups.length ?? "—"}</strong><span>Özel grup sohbeti</span></div>
                  <p>Kayıt → Katılımcı havuzu → Match → Yeni tur</p>
                  <p>Aktif veri seti: <code>{datasetId || "Yükleniyor"}</code></p>
                </section>
                <section className="ls-panel">
                  <p className="ls-eyebrow">Etkinlik bilgileri</p>
                  <h2>Etkinlik amacı</h2>
                  <p className="ls-muted ls-flow-copy">{flow.welcomeText}</p>
                  <ul className="ls-nodes-votes">
                    {flow.schedule.map(({ time, label }, index) => (
                      <li key={index}>
                        <strong>{time.replace(":", ".")}</strong>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                  <a className="ls-secondary" href="/launch-space" target="_blank" rel="noreferrer">
                    Katılımcı ekranını aç ↗
                  </a>
                </section>
                <details className="ls-panel">
                  <summary>Kayıtlı kişiler ({count})</summary>
                  <label>
                    Katılımcı ara
                    <input value={query} onChange={(e) => setQuery(e.target.value)} />
                  </label>
                  <div style={{ maxHeight: 440, overflow: "auto" }}>
                    {participants
                      .filter((p) =>
                        (p.profile.firstName + " " + p.profile.lastName)
                          .toLocaleLowerCase("tr-TR")
                          .includes(query.toLocaleLowerCase("tr-TR")),
                      )
                      .map((p, i) => (
                        <article key={i} className="ls-flow-question">
                          <strong>
                            {p.profile.firstName} {p.profile.lastName}
                          </strong>
                          {p.jobTitle && <p className="ls-caption">{p.jobTitle}</p>}
                          {p.intro && <p className="ls-caption">{p.intro}</p>}
                          {p.offersDetail && <p className="ls-caption">Katkı: {p.offersDetail}</p>}
                          {p.needs && <p className="ls-caption">Aradığı: {p.needs}</p>}
                          <button className="ls-secondary" type="button" onClick={async () => {
                            try { const result = await request("recoverParticipant", { participantId: p.participant.id }); setRecovery(values => ({ ...values, [p.participant.id]: result.path })); }
                            catch(e) { setError(e instanceof Error ? e.message : "Giriş kurtarılamadı"); }
                          }}>Girişi kurtar · {p.profile.firstName} {p.profile.lastName}</button>
                          {recovery[p.participant.id] && <p><a className="ls-secondary" href={recovery[p.participant.id]} target="_blank" rel="noreferrer">{p.profile.firstName} için oturumu aç ↗</a><small> Tek kullanımlık · 15 dakika · yalnızca bu katılımcıyla paylaş.</small></p>}
                        </article>
                      ))}
                  </div>
                </details>
              </>
            )}
            {section === "match" && (
              <div className="ls-panel">
                <p className="ls-eyebrow">node.games</p>
                <h2>Nodes Match</h2>
                <p className="ls-caption">
                  {overview?.registeredCount ?? count} kayıtlı katılımcı ·{" "}
                  {overview?.groups.length ?? 0} aktif grup
                </p>
                {overview?.matching.status === "running" && (
                  <p className="ls-caption" role="status">
                    {overview.matching.processed} / {overview.matching.total} katılımcı işlendi
                  </p>
                )}
                <div className="ls-actions">
                  <button
                    disabled={busy}
                    className="ls-primary"
                    onClick={async () => {
                      setBusy(true);
                      setError("");
                      try {
                        let r = await request("startMatching");
                        while (r.matching.status === "running") {
                          r = await request("processMatching");
                          await request("matchOverview")
                            .then(setOverview)
                            .catch(() => {});
                        }
                        setOverview(await request("matchOverview"));
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Eşleşme başlatılamadı");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {busy ? "Eşleştiriliyor…" : "Eşleşmeleri başlat"}
                  </button>
                </div>
                <p className="ls-caption">
                  Canlı veri setinde ilk 20 kayıt tamamlanınca otomatik başlar. Sonrasında yeni gelenler boşta olanlarla eşleşir; mevcut gruplar korunur. Test veri setinde manuel başlatılır.
                </p>
                {matchError && (
                  <p className="ls-caption" role="status">
                    {matchError}
                  </p>
                )}
                <h3>Aktif gruplar</h3>
                {!overview ? (
                  <p className="ls-caption">Gruplar yükleniyor…</p>
                ) : overview.groups.length === 0 ? (
                  <p className="ls-caption">Henüz aktif grup yok.</p>
                ) : (
                  <div className="ls-live-groups">
                    {overview.groups.map((group) => (
                      <article key={group.id}>
                        <strong>{group.groupName}</strong>
                        <span className="ls-caption">{group.round}. tur</span>
                        <ul>
                          {group.memberNames.map((name, index) => (
                            <li key={index}>{name}{group.approvedMemberNames?.includes(name) ? " · ✓ Onayladı" : ""}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
            {section === "report" && <MatchReportAdmin event={novemberEventSlug} password={password} />}
            {section === "announcement" && <LaunchAnnouncementAdmin key={datasetId} />}
            {section === "database" && (
              <LaunchDatasetAdmin
                switchingDisabled={busy}
                onActiveChanged={(dataset) => {
                  setOverview(undefined);
                  setDatasetId(dataset.id);
                  setCount(0);
                  setParticipants([]);
                  void load().catch((e) => setError(e.message));
                }}
              />
            )}
            {section === "flow" && <LaunchFlowAdmin onSaved={(next) => { setFlow(next); setPreviewKey(k => k + 1); }} />}
            {section === "poll" && (
              <EventPollAdmin
                key={datasetId}
                event={novemberEventSlug}
                password=""
                nodes
                organizerName={flow.organizerName}
              />
            )}
            </div>
            <aside className="ls-studio-phone" aria-label="Mobil katılımcı ekranı">
              <h2>Katılımcının gördüğü ekran</h2>
              <p>Kaydedilmiş canlı görünüm. Bu ekrandaki kayıt ve oy işlemleri seçili veri setine yazılır.</p>
              <iframe key={previewKey} src="/launch-space" title="Katılımcı mobil önizlemesi" />
              <a href="/launch-space" target="_blank" rel="noreferrer">Tam ekran aç ↗</a>
            </aside>
          </div>
        )}
        {active ? (
          <button
            className="ls-back"
            onClick={() =>
              void auth("logout").then(() => {
                setActive(false);
                setSection("event");
                setPassword("");
              })
            }
          >
            Çıkış yap
          </button>
        ) : null}
        {error ? (
          <p className="ls-error" role="alert">
            {error}
          </p>
        ) : null}
        <a href="/launch-space" className="ls-back">
          Katılımcı ekranı ↗
        </a>
      </main>
    </div>
  );
}
