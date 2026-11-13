import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Check, DoorOpen, Network, Presentation, Route, Search, Users, X } from "lucide-react";
import { LaunchEventHeader } from "./LaunchEventHeader";
import type { LaunchFlow } from "@/lib/launch-flow";


type Person = {
  id: string;
  name: string;
  code: string;
  intro: string;
  offers: string[];
  offersDetail: string;
  needs: string;
  isSelf: boolean;
  sent: boolean;
  received: boolean;
};
const pageSize = 20;

function categoryColor(category: string) {
  let hue = 0;
  for (const letter of category.toLocaleLowerCase("tr-TR")) {
    hue = (hue * 31 + letter.charCodeAt(0)) % 360;
  }
  return { "--ls-category-hue": hue } as CSSProperties;
}

export function LaunchSpaceArea({
  event,
  token,
  goal,
  firstName,
  avatar,
  flow,
  datasetId,
  children,
}: {
  event: string;
  token: string;
  goal: string;
  firstName: string;
  avatar?: string;
  flow: LaunchFlow;
  datasetId?: string;
  children?: ReactNode;
}) {
  const [people, setPeople] = useState<Person[]>([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [routeOpen, setRouteOpen] = useState(false);
  const [selected, setSelected] = useState<Person | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  async function request(targetId?: string) {
    const response = await fetch("/api/event-products/network", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        datasetId,
        action: targetId ? "introduce" : "people",
        accessToken: token,
        targetId,
      }),
    });
    if (!response.ok) throw new Error(await response.text());
    return (await response.json()).people as Person[];
  }
  useEffect(() => {
    let active = true;
    void request()
      .then((rows) => {
        if (active) setPeople(rows);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [event, datasetId, token]);
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", escape);
    };
  }, [selected?.id]);
  async function introduce(person: Person) {
    setSending(true);
    setError("");
    try {
      const rows = await request(person.id);
      setPeople(rows);
      setSelected(rows.find((p) => p.id === person.id) || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İstek gönderilemedi");
    } finally {
      setSending(false);
    }
  }
  const filtered = people.filter((p) =>
    `${p.name} ${p.intro} ${p.offers.join(" ")} ${p.needs}`
      .toLocaleLowerCase("tr-TR")
      .includes(query.toLocaleLowerCase("tr-TR")),
  );
  const suggested = people.filter((person) => !person.isSelf && !person.sent).slice(0, 3);
  useEffect(() => {
    if (!routeOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setRouteOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [routeOpen]);
  const incoming = people.filter((p) => p.received && !p.sent);
  return (
    <div className="ls-space-area">
      <LaunchEventHeader flow={flow} avatar={avatar} initials={firstName[0]} />
      <p className="ls-eyebrow">Hoş geldin, {firstName}</p>
      <details className="ls-panel ls-area-info" open>
        <summary>Etkinlik bilgileri</summary>
        <p className="ls-muted ls-flow-copy">{flow.welcomeText}</p>
        <ul className="ls-nodes-votes">
          {flow.schedule.map(({ time, label }, index) => {
            const Icon = index === 0 ? DoorOpen : index === 1 ? Presentation : Network;
            return (
              <li key={index}>
                <strong><Icon size={15} aria-hidden="true" /> {time.replace(":", ".")}</strong>
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
        <h3>Etkinlik amacım</h3>
        <p className="ls-caption">{goal || flow.welcomeText}</p>
        <button className="ls-secondary" onClick={() => setRouteOpen(true)}>
          <Route size={16} /> {flow.routeLabel} <ArrowRight size={15} />
        </button>
      </details>
      {children}
      {incoming.length > 0 && (
        <div className="ls-intro-notice">
          <Users size={17} />
          <span>{incoming.length} kişi seninle tanışmak istiyor</span>
          <button onClick={() => setSelected(incoming[0])}>
            Gör <ArrowRight size={15} />
          </button>
        </div>
      )}
      <div className="ls-directory-heading">
        <h2>Birlikte aynı alandayız.</h2>
        <button
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setError("");
            void request()
              .then(setPeople)
              .catch((e) => setError(e.message))
              .finally(() => setLoading(false));
          }}
        >
          Yenile
        </button>
      </div>
      <label className="ls-people-search">
        <Search size={18} />
        <input
          aria-label="Katılımcı ara"
          placeholder="İsim, alan veya aradığın bağlantı"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(pageSize);
          }}
        />
      </label>
      {error && (
        <p role="alert" className="ls-error">
          {error}
        </p>
      )}
      {loading && people.length === 0 ? (
        <p className="ls-muted" role="status">
          Topluluğun hazırlanıyor…
        </p>
      ) : (
        <div className="ls-people-grid">
          {filtered.slice(0, visibleCount).map((p) => (
            <button
              className="ls-people-card"
              key={p.id}
              style={categoryColor(p.offers[0] || "Katılımcı")}
              onClick={() => setSelected(p)}
              aria-label={`${p.name}${p.isSelf ? " · sen" : ""} · profili aç`}
            >
              <span className="ls-people-avatar">
                {p.name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toLocaleUpperCase("tr-TR")}
              </span>
              <strong>
                {p.name}
                {p.isSelf ? " · sen" : ""}
              </strong>
              <small>{p.offers.join(" · ") || "Katılımcı"}</small>
              {(p.sent || p.received) && (
                <span className="ls-person-status">
                  {p.sent && p.received
                    ? "Tanışma karşılıklı ✓"
                    : p.received
                      ? "Seninle tanışmak istiyor"
                      : p.sent
                        ? "Tanışma isteğin iletildi"
                        : ""}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {visibleCount < filtered.length && (
        <button
          className="ls-people-more"
          onClick={() => setVisibleCount((count) => Math.min(count + pageSize, filtered.length))}
        >
          {Math.min(pageSize, filtered.length - visibleCount)} kişi daha gör
        </button>
      )}
      <p className="ls-caption" aria-live="polite">
        {Math.min(visibleCount, filtered.length)} / {filtered.length} kişi
      </p>
      {!loading && filtered.length === 0 && (
        <p className="ls-muted">Bu aramada kimseyi bulamadık.</p>
      )}
      {routeOpen && (
        <div className="ls-person-overlay" onClick={() => setRouteOpen(false)}>
          <section className="ls-profile-sheet" role="dialog" aria-modal="true"
            aria-label={flow.routeLabel} onClick={(event) => event.stopPropagation()}>
            <button autoFocus className="ls-profile-close" aria-label="Rotayı kapat" onClick={() => setRouteOpen(false)}><X /></button>
            <h2>{flow.routeLabel}</h2>
            <p>{suggested.length ? "Bu kişilerle tanışmak iyi bir başlangıç olabilir." : "Yeni katılımcılar geldikçe tanışabileceğin kişiler burada görünecek."}</p>
            {suggested.map((person) => (
              <button key={person.id} className="ls-secondary" onClick={() => {
                setRouteOpen(false);
                setSelected(person);
              }}>{person.name} <ArrowRight size={15} /></button>
            ))}
          </section>
        </div>
      )}
      {selected && (
        <div className="ls-person-overlay" onClick={() => setSelected(null)}>
          <section
            className="ls-profile-sheet"
            style={categoryColor(selected.offers[0] || "Katılımcı")}
            role="dialog"
            aria-modal="true"
            aria-label={selected.name + " profili"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="ls-profile-close"
              aria-label="Profili kapat"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <span className="ls-people-avatar">{selected.name[0]}</span>
            <h2>{selected.name}</h2>
            <span className="ls-code">{selected.code}</span>
            <p>{selected.intro}</p>
            <small>PAYLAŞABİLECEKLERİ</small>
            <p>{selected.offersDetail || selected.offers.join(" · ")}</p>
            <small>BU BULUŞMADA ARADIĞI</small>
            <p>{selected.needs}</p>
            {!selected.isSelf && (
              <>
                <button
                  className="ls-primary"
                  disabled={sending || selected.sent}
                  onClick={() => void introduce(selected)}
                >
                  {sending ? (
                    "Gönderiliyor…"
                  ) : selected.sent && selected.received ? (
                    <>
                      <Check size={17} /> Tanışma karşılıklı
                    </>
                  ) : selected.sent ? (
                    "Tanışma isteğin iletildi"
                  ) : selected.received ? (
                    "Ben de tanışmak isterim"
                  ) : (
                    "Tanışmak isterim"
                  )}
                </button>
                <p className="ls-caption">
                  Karşılıklı tanışma isteğinde kodlarınızla birbirinizi bulabilirsiniz. Match grubun
                  aynı kalır.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
