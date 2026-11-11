import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, CalendarDays, Network, SlidersHorizontal } from "lucide-react";
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
  groups: { id: string; groupName: string; round: number; memberNames: string[] }[];
};

export function LaunchAdminPanel() {
  const [overview, setOverview] = useState<MatchOverview>();
  const [matchError, setMatchError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const [password, setPassword] = useState(""),
    [active, setActive] = useState(false),
    [error, setError] = useState(""),
    [count, setCount] = useState<number | null>(null),
    [busy, setBusy] = useState(false);
  async function request(action: string) {
    const r = await fetch("/api/admin/event-products/network", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, event: novemberEventSlug, password }),
    });
    if (!r.ok) throw Error(await r.text());
    return r.json();
  }
  const [participants, setParticipants] = useState<
    Array<{
      profile: { firstName: string; lastName: string };
      intro: string;
      needs: string;
      offersDetail: string;
    }>
  >([]);
  const [section, setSection] = useState<"event" | "flow" | "match" | "poll">("event");
  const [flow, setFlow] = useState(defaultLaunchFlow);
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
    setCount(r.registrations.length);
    setParticipants(r.registrations);
    setActive(true);
    void getLaunchFlow()
      .then(setFlow)
      .catch(() => {});
  }
  useEffect(() => {
    if (!active || section !== "match") return;
    let current = true;
    let pending = false;
    const refresh = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const result = await request("matchOverview");
        if (current) {
          setOverview(result);
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
    <div className="launch-space">
      <header className="ls-header">
        <span className="ls-brand">
          <NodeMark />
          {flow.organizerName}
        </span>
        <span className="ls-demo">ORGANİZATÖR</span>
      </header>
      <main className={`ls-main ${active && section === "flow" ? "ls-main-wide" : ""}`}>
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
          <>
            <nav className="ls-admin-tabs" aria-label="Etkinlik yönetimi">
              {(
                [
                  ["event", "Etkinlik", CalendarDays],
                  ["flow", "Kayıt ve akış", SlidersHorizontal],
                  ["match", "Match", Network],
                  ["poll", "Anket", BarChart3],
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
            </nav>
            {section === "event" && (
              <>
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
                          <p className="ls-caption">{p.intro}</p>
                          <p className="ls-caption">Katkı: {p.offersDetail}</p>
                          <p className="ls-caption">Aradığı: {p.needs}</p>
                        </article>
                      ))}
                  </div>
                </details>
              </>
            )}
            {section === "match" && (
              <div className="ls-panel">
                <p className="ls-eyebrow">node.games</p>
                <h2>notwork match</h2>
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
                    className="ls-secondary"
                    onClick={() =>
                      void request("matchOverview")
                        .then(setOverview)
                        .catch((e) => setError(e.message))
                    }
                  >
                    Grupları yenile
                  </button>
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
                  Aktif eşleşmeler korunur. Yeni katılımcılar ortak havuza katılır.
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
                            <li key={index}>{name}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
            {section === "flow" && <LaunchFlowAdmin onSaved={setFlow} />}
            {section === "poll" && (
              <EventPollAdmin
                event={novemberEventSlug}
                password=""
                nodes
                organizerName={flow.organizerName}
              />
            )}
          </>
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
