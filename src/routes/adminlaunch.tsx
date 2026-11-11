import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LaunchFlowAdmin } from "@/components/LaunchFlowAdmin";
import { EventPollAdmin } from "@/components/EventPollAdmin";
import { createNoIndexSeo } from "@/lib/seo";
import { novemberEventSlug } from "@/lib/event-poll";
import { NodeMark } from "./launch-space";
import "@/launch-space.css";
export const Route = createFileRoute("/adminlaunch")({
  head: () =>
    createNoIndexSeo({
      title: "launch space · organizatör",
      description: "Yerel etkinlik kontrolü",
      path: "/adminlaunch",
    }),
  component: LaunchAdminPanel,
});
export function LaunchAdminPanel() {
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
  }
  return (
    <div className="launch-space">
      <header className="ls-header">
        <span className="ls-brand">
          <NodeMark />
          launch space
        </span>
        <span className="ls-demo">ORGANİZATÖR</span>
      </header>
      <main className="ls-main">
        <h1>Topluluk hazır mı?</h1>
        {!active ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void signIn().catch((e) => setError(e.message));
            }}
            className="ls-form"
          >
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
            <div className="ls-panel">
              <p className="ls-eyebrow">14 KASIM · LAUNCH SPACE</p>
              <h2>{count} katılımcı</h2>
              <div className="ls-actions">
                <button
                  className="ls-secondary"
                  onClick={() => void load().catch((e) => setError(e.message))}
                >
                  Katılımcıları yenile
                </button>
                <button
                  disabled={busy}
                  className="ls-primary"
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    try {
                      let r = await request("startMatching");
                      while (r.matching.status === "running") r = await request("processMatching");
                      await load();
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Eşleşme başlatılamadı");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Eşleştiriliyor…" : "Herkes hazır · eşleştir"}
                </button>
              </div>
              <p className="ls-caption">
                Aktif eşleşmeler korunur. Yeni katılımcılar ortak havuza katılır.
              </p>
            </div>
            <details className="ls-panel">
              <summary>Katılımcılar ve etkinlik yanıtları ({count})</summary>
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
                    <article
                      key={i}
                      style={{ borderBottom: "1px solid #35373c", padding: "16px 0" }}
                    >
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
            <LaunchFlowAdmin />
            <EventPollAdmin event={novemberEventSlug} password="" />
          </>
        )}
        {active ? (
          <button
            className="ls-back"
            onClick={() =>
              void auth("logout").then(() => {
                setActive(false);
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
