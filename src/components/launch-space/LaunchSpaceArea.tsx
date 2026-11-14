import { LaunchAvatar } from "./LaunchAvatar";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Check, CircleHelp, RefreshCw, Bell, ArrowRight, DoorOpen, Network, Presentation, Route, Search, Users, X } from "lucide-react";
import { LaunchEventHeader } from "./LaunchEventHeader";
import type { LaunchFlow } from "@/lib/launch-flow";


type Proposal = { at: string; updatedAt?: string; place?: string; message?: string };

type Person = {
  id: string;
  name: string;
  code: string;
  intro: string;
  jobTitle?: string;
  offers: string[];
  offersDetail: string;
  needs: string;
  isSelf: boolean;
  sent: boolean;
  received: boolean;
  incoming?: Proposal;
  outgoing?: Proposal;
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [inbox, setInbox] = useState(false);
  const [meetingPlace, setMeetingPlace] = useState("");
  const [meetingMessage, setMeetingMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [personPhoto, setPersonPhoto] = useState("");
  const [routeOpen, setRouteOpen] = useState(false);
  const [selected, setSelected] = useState<Person | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonPending, setReasonPending] = useState(false);

  useEffect(() => {
    setReason("");
    setReasonPending(false);
  }, [selected?.id]);

  async function showReason(person: Person) {
    setReasonPending(true);
    try {
      const response = await fetch("/api/event-products/network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, datasetId, action: "introductionReason", accessToken: token, targetId: person.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setReason(data.reason ? `${person.id}:${data.reason}` : "");
      }
    } catch {
      setReason("");
    } finally {
      setReasonPending(false);
    }
  }
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
        ...(targetId ? { meetingPlace, introductionMessage: meetingMessage } : {}),
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
    let active = true;
    const timer = setInterval(() => {
      if (!document.hidden) void request().then((rows) => { if (active) setPeople(rows); }).catch(() => {});
    }, 15000);
    return () => { active = false; clearInterval(timer); };
  }, [event, datasetId, token]);
  useEffect(() => {
    setMeetingPlace(selected?.outgoing?.place || "");
    setMeetingMessage(selected?.outgoing?.message || "");
    setEditing(false);
    setPersonPhoto("");
    if (!selected) return;
    let active = true;
    void fetch("/api/event-products/network", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, datasetId, action: "launchProfilePhoto", accessToken: token, targetId: selected.id }),
    }).then((response) => response.ok ? response.json() : null).then((data) => {
      if (active && data?.photo) setPersonPhoto(data.photo);
    }).catch(() => {});
    return () => { active = false; };
  }, [selected?.id, datasetId, event, token]);
  useEffect(() => {
    if (!selected && !routeOpen && !inbox) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSelected(null); setRouteOpen(false); setInbox(false); }
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", escape);
    };
  }, [selected?.id, routeOpen, inbox]);
  async function introduce(person: Person) {
    setSending(true);
    setError("");
    try {
      const rows = await request(person.id);
      setPeople(rows);
      setSelected(rows.find((p) => p.id === person.id) || null);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İstek gönderilemedi");
    } finally {
      setSending(false);
    }
  }
  const filtered = people.filter((p) =>
    `${p.name} ${p.jobTitle || ""} ${p.intro} ${p.offers.join(" ")} ${p.needs}`
      .toLocaleLowerCase("tr-TR")
      .includes(query.toLocaleLowerCase("tr-TR")),
  );
  const self = people.find((person) => person.isSelf);
  const words = (value: string) => new Set(value.toLocaleLowerCase("tr-TR").match(/[\p{L}]{4,}/gu) || []);
  const needs = words(self?.needs || "");
  const score = (person: Person) => [...words(`${person.offers.join(" ")} ${person.offersDetail}`)]
    .filter((word) => needs.has(word)).length;
  const suggested = people.filter((person) => !person.isSelf && !person.sent)
    .sort((a, b) => score(b) - score(a)).slice(0, 3);
  const requests = people.filter((person) => person.sent || person.received);
  const formatTime = (value: string) => new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short", timeStyle: "short", timeZone: "Europe/Istanbul",
  }).format(new Date(value));
  const incoming = people.filter((p) => p.received && !p.sent);
  return (
    <div className="ls-space-area">
      <LaunchEventHeader flow={flow} avatar={avatar} initials={firstName[0]} />
      <p className="ls-eyebrow">Hoş geldin, {firstName}</p>
      <button className="ls-secondary ls-dialog-action" onClick={() => {
        setInbox(true);
        void request().then(setPeople).catch(() => {});
      }}>
        <Users size={17} /> Tanışma isteklerim {incoming.length > 0 && <span className="ls-inbox-badge" aria-label={`${incoming.length} yeni tanışma isteği`}><Bell size={15} /><strong>{incoming.length}</strong></span>}
        <ArrowRight size={16} />
      </button>
      <details className="ls-panel ls-area-info">
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
      </details>
      <section className="ls-panel ls-route-card">
        <h3>Etkinlik amacım</h3>
        <p className="ls-caption">{goal || flow.welcomeText}</p>
        <button className="ls-secondary ls-dialog-action" onClick={() => setRouteOpen(true)}>
          <Route size={16} /> <span>{flow.routeLabel}</span> <ArrowRight size={15} />
        </button>
      </section>
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
      <section className="ls-directory-product" aria-label="Etkinliktekiler">
      <div className="ls-directory-heading">
        <h2>Birlikte aynı alandayız.</h2>
        <div className="ls-directory-tools">
        <button aria-label="Katılımcıları yenile" title="Katılımcıları yenile"
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
          <RefreshCw size={18} className={loading ? "ls-refreshing" : undefined} />
        </button>
        <button aria-label="Tanışma yardımı" aria-expanded={helpOpen} onClick={() => setHelpOpen(!helpOpen)}><CircleHelp size={18} /></button>
        </div>
      </div>
      {helpOpen && <p className="ls-directory-help">Profili açıp tanışma isteği gönder. Tik, istek gönderdiğin kişileri gösterir. Yenile düğmesi katılımcıları günceller.</p>}
      <label className="ls-people-search">
        <Search size={18} />
        <input
          aria-label="Katılımcı ara"
          placeholder="İsim veya alan ara"
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
        <div className="ls-people-grid ls-people-list">
          {filtered.slice(0, visibleCount).map((p) => (
            <button
              className="ls-people-card"
              key={p.id}
              style={categoryColor(p.offers[0] || "Katılımcı")}
              onClick={() => setSelected(p)}
              aria-label={`${p.name}${p.isSelf ? " · sen" : ""} · profili aç`}
            >
              <LaunchAvatar event={event} datasetId={datasetId} token={token} id={p.id} name={p.name} className="ls-people-avatar" />
              <span className="ls-person-copy"><strong>
                {p.name}
                {p.isSelf ? " · sen" : ""}
              </strong>
              <small>{p.jobTitle || p.offers.join(" · ") || "Katılımcı"}</small>
              <span className="ls-person-intro">{p.intro || "Henüz kendini tanıtmadı."}</span></span>
              {(p.sent || p.received) && <span className="ls-request-marker" title={p.sent ? "Tanışma isteğin iletildi" : "Seninle tanışmak istiyor"} aria-label={p.sent ? "İstek gönderildi" : "Gelen istek"}>
                {p.sent ? <Check size={14} /> : <Bell size={14} />}
              </span>}
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
      </section>
      {routeOpen && (
        <div className="ls-person-overlay" onClick={() => setRouteOpen(false)}>
          <section className="ls-profile-sheet" role="dialog" aria-modal="true"
            aria-label={flow.routeLabel} onClick={(event) => event.stopPropagation()}>
            <button autoFocus className="ls-profile-close" aria-label="Rotayı kapat" onClick={() => setRouteOpen(false)}><X /></button>
            <h2>{flow.routeLabel}</h2>
            <p>{suggested.length ? "Etkinlikte aradığın bağlantılardan başla. Bir adım seç, profili incele ve tanışmak için yer öner." : "Yeni katılımcılar geldikçe tanışabileceğin kişiler burada görünecek."}</p>
            {suggested.map((person) => (
              <button key={person.id} className="ls-secondary ls-route-step" onClick={() => {
                setRouteOpen(false);
                setSelected(person);
              }}><LaunchAvatar event={event} datasetId={datasetId} token={token} id={person.id} name={person.name} /><span><strong>{person.name}</strong><small>{person.offers.join(" · ")}</small></span><ArrowRight size={16} /></button>
            ))}
          </section>
        </div>
      )}
      {inbox && !selected && (
        <div className="ls-person-overlay" onClick={() => setInbox(false)}>
          <section className="ls-profile-sheet" role="dialog" aria-modal="true" aria-label="Tanışma isteklerim" onClick={(event) => event.stopPropagation()}>
            <button autoFocus className="ls-profile-close" aria-label="İstekleri kapat" onClick={() => setInbox(false)}><X /></button>
            <h2>Tanışma isteklerim</h2>
            {requests.length === 0 && <p>Henüz tanışma isteğin yok.</p>}
            {requests.map((person) => {
              const request = person.incoming || person.outgoing;
              return <button key={person.id} className="ls-secondary ls-route-step" onClick={() => setSelected(person)}>
                <Users size={16} /><span><strong>{person.name}</strong><small>
                  {person.sent && person.received ? "Karşılıklı" : person.received ? "Gelen istek" : "Gönderdiğin istek"}
                  {request && ` · ${formatTime(request.at)}`}
                </small></span><ArrowRight size={16} />
              </button>;
            })}
          </section>
        </div>
      )}
      {selected && (
        <div className="ls-person-overlay" onClick={() => setSelected(null)}>
          <section
            className={`ls-profile-sheet${editing ? " ls-compose-sheet" : ""}`}
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
            <span className="ls-people-avatar">{personPhoto ? <img src={personPhoto} alt="" /> : selected.name[0]}</span>
            {!editing && !selected.isSelf && (
              <button className="ls-secondary ls-dialog-action" disabled={reasonPending}
                onClick={() => void showReason(selected)}>
                {reasonPending ? "Hazırlanıyor…" : "Neden tanışmalıyım?"}
              </button>
            )}
            <h2>{selected.name}</h2>
            {selected.jobTitle && <p className="ls-profile-title">{selected.jobTitle}</p>}
            {!editing && <>
            {reason.startsWith(selected.id + ":") && <p role="status">{reason.slice(selected.id.length + 1)}</p>}
            <span className="ls-code">{selected.code}</span>
            <p>{selected.intro}</p>
            <small>PAYLAŞABİLECEKLERİ</small>
            <p>{selected.offersDetail || selected.offers.join(" · ")}</p>
            {selected.needs && <><small>BU BULUŞMADA ARADIĞI</small><p>{selected.needs}</p></>}
            </>}
            {!selected.isSelf && (
              <div className="ls-introduction-actions">
                {!editing && [["Gelen istek", selected.incoming], ["Gönderdiğin istek", selected.outgoing]].map(([label, proposal]) => {
                  const detail = proposal as Proposal | undefined;
                  if (!detail) return null;
                  return <div className="ls-proposal" key={String(label)}>
                    <strong>{String(label)}</strong>
                    <small>{formatTime(detail.at)}{detail.updatedAt && detail.updatedAt !== detail.at ? ` · Düzenlendi ${formatTime(detail.updatedAt)}` : ""}</small>
                    {detail.place && <p>Buluşma yeri · {detail.place}</p>}
                    {detail.message && <p>{detail.message}</p>}
                  </div>;
                })}
                {!editing ? (
                  <button className="ls-primary ls-dialog-action" onClick={() => {
                    if (!selected.sent) setMeetingPlace(selected.incoming?.place || "");
                    setEditing(true);
                  }}>
                    {selected.sent ? "Mesajı ve konumu düzenle" : selected.received ? "Ben de tanışmak isterim" : "Tanışmak isterim"}
                  </button>
                ) : (
                  <form className="ls-form" onSubmit={(event) => { event.preventDefault(); void introduce(selected); }}>
                    <label>Buluşma yeri
                      <input maxLength={120} required placeholder="Örn. girişteki karşılama masası" value={meetingPlace} onChange={(event) => setMeetingPlace(event.target.value)} />
                    </label>
                    <label>Seni nasıl tanısın?
                      <textarea maxLength={300} required placeholder="Örn. Üstümde lacivert ceket var, sahnenin sağındayım." value={meetingMessage} onChange={(event) => setMeetingMessage(event.target.value)} />
                    </label>
                    <button className="ls-primary ls-dialog-action" disabled={sending || !meetingPlace.trim() || !meetingMessage.trim()}>{sending ? "Kaydediliyor…" : selected.sent ? "Değişiklikleri kaydet" : "İsteği gönder"}</button>
                    <button type="button" className="ls-secondary ls-dialog-action" onClick={() => setEditing(false)}>Vazgeç</button>
                  </form>
                )}
                {error && <p role="alert">{error}</p>}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
