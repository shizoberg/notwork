import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EventPollAdmin } from "@/components/EventPollAdmin";
import { createNoIndexSeo } from "@/lib/seo";
import { novemberEventSlug } from "@/lib/event-poll";
import { NodeMark } from "./launch-space";
import "@/launch-space.css";
export const Route = createFileRoute("/launch-space-kontrol")({
  head: () =>
    createNoIndexSeo({
      title: "launch space · organizatör",
      description: "Yerel etkinlik kontrolü",
      path: "/launch-space-kontrol",
    }),
  component: Control,
});
function Control() {
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
  async function load() {
    const r = await request("list");
    setCount(r.registrations.length);
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
              void load().catch((e) => setError(e.message));
            }}
            className="ls-form"
          >
            <label>
              Admin şifresi
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
              <p className="ls-eyebrow">14 KASIM · 18.00 · DEMO</p>
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
            <EventPollAdmin event={novemberEventSlug} password={password} />
          </>
        )}
        {error ? (
          <p className="ls-error" role="alert">
            {error}
          </p>
        ) : null}
        <a href="/launch-space" className="ls-back">
          Katılımcı ekranı ↗
        </a>
        <a href="/admin" className="ls-back">
          Genel admin paneli ↗
        </a>
      </main>
    </div>
  );
}
