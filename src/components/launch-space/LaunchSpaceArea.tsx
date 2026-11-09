import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Check, Search, Users, X } from "lucide-react";
import { novemberEventSlug } from "@/lib/event-poll";

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
export function LaunchSpaceArea({
  token,
  goal,
  children,
}: {
  token: string;
  goal: string;
  children?: ReactNode;
}) {
  const [people, setPeople] = useState<Person[]>([]);
  const [query, setQuery] = useState("");
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
        event: novemberEventSlug,
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
  }, [token]);
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
  const incoming = people.filter((p) => p.received && !p.sent);
  return (
    <div className="ls-space-area">
      <div className="ls-space-cover">
        <img src="/nodes-app/assets/community-cover.jpg" alt="Notwork topluluk buluşması" />
        <div>
          <small>ÖZEL TOPLULUK ALANIN</small>
          <h2>Launch Space</h2>
          <p>14 Kasım · 18.00</p>
        </div>
      </div>
      <div className="ls-space-identity">
        <span className="ls-space-logo">
          <img src="/brand/notwork-logo.png" alt="notwork" />
        </span>
        <span>
          <Users size={15} />{" "}
          {loading ? "Katılımcılar yükleniyor" : `${people.length} kayıtlı kişi`}
          <small>nodes by notwork</small>
        </span>
      </div>
      <section className="ls-space-purpose">
        <small>BU BULUŞMADAKİ AMACIN</small>
        <p>
          {goal ||
            "Yeni insanlarla tanışmak, deneyimini paylaşmak ve birlikte yeni ihtimaller keşfetmek."}
        </p>
        <div>
          <span>
            18.00 <b>Buluşma & tanışma</b>
          </span>
          <span>
            19.00 <b>Sunumlar</b>
          </span>
          <span>
            <b>Match & canlı anket</b>
          </span>
        </div>
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
          onChange={(e) => setQuery(e.target.value)}
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
          {filtered.map((p) => (
            <button className="ls-people-card" key={p.id} onClick={() => setSelected(p)}>
              <span className="ls-people-avatar">
                {p.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <strong>
                {p.name}
                {p.isSelf ? " · sen" : ""}
              </strong>
              <small>{p.offers.join(" · ") || "Katılımcı"}</small>
              <p>{p.intro || "Birlikte tanışmaya hazır."}</p>
              <span className="ls-person-status">
                {p.sent && p.received
                  ? "Tanışma karşılıklı ✓"
                  : p.received
                    ? "Seninle tanışmak istiyor"
                    : p.sent
                      ? "Tanışma isteğin iletildi"
                      : "Profili keşfet →"}
              </span>
            </button>
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <p className="ls-muted">Bu aramada kimseyi bulamadık.</p>
      )}
      {selected && (
        <div className="ls-person-overlay" onClick={() => setSelected(null)}>
          <section
            className="ls-profile-sheet"
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
