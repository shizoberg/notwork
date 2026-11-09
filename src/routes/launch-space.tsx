import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  Network,
  Radio,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { createNoIndexSeo } from "@/lib/seo";
import { getPublicEventContext } from "@/lib/event-registry";
import {
  getEventNetworkMe,
  getEventNetworkMatch,
  registerEventNetwork,
  resumeEventNetwork,
  rotateEventNetworkMatch,
  getEventNetworkTokenStorageKey,
} from "@/lib/event-network-api";
import { getMyMemberProfile, loginMember } from "@/lib/member-profile-api";
import type { EventNetworkRegistration, EventNetworkMatchGroup } from "@/lib/event-network";
import { novemberEventSlug, pollRequest, type PollPayload } from "@/lib/event-poll";
import "@/launch-space.css";

export const Route = createFileRoute("/launch-space")({
  head: () =>
    createNoIndexSeo({
      title: "launch space · nodes by notwork",
      description: "14 Kasım etkinlik deneyimi · yerel test",
      path: "/launch-space",
    }),
  component: LaunchSpace,
});
const selection = { event: novemberEventSlug };
const tokenKey = getEventNetworkTokenStorageKey(selection);
type Tab = "home" | "match" | "poll";
const fields = [
  {
    key: "intro",
    title: "Biraz senden bahsedelim.",
    label: "Kendini nasıl tanıtırsın?",
    placeholder: "Neyle uğraşıyorsun, seni ne heyecanlandırıyor?",
  },
  {
    key: "offersDetail",
    title: "Paylaştıkça çoğalır.",
    label: "İnsanlara ne katabilirsin?",
    placeholder: "Deneyimin, bildiklerin, birlikte yapabileceklerin…",
  },
  {
    key: "needs",
    title: "Yeni ihtimallere açıl.",
    label: "Bu buluşmada ne arıyorsun?",
    placeholder: "Tanışmak istediğin insanlar ve aradığın destek…",
  },
] as const;
export function NodeMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="21" />
      <circle cx="24" cy="24" r="14" />
      <circle cx="24" cy="24" r="7" />
    </svg>
  );
}
function LaunchSpace() {
  const [ready, setReady] = useState(false),
    [contextError, setContextError] = useState("");
  const [eventTitle, setEventTitle] = useState("14 Kasım · notwork"),
    [mode, setMode] = useState("");
  const [registration, setRegistration] = useState<EventNetworkRegistration | null>(null),
    [token, setToken] = useState("");
  const [step, setStep] = useState(-1),
    [tab, setTab] = useState<Tab>("home"),
    [login, setLogin] = useState(false),
    [identity, setIdentity] = useState(""),
    [password, setPassword] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    intro: "",
    offersDetail: "",
    needs: "",
    field: "networking",
  });
  const [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [complete, setComplete] = useState(false);
  const [group, setGroup] = useState<EventNetworkMatchGroup | null>(null),
    [waiting, setWaiting] = useState(""),
    [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<{ id: string; name: string; text: string }[]>([]),
    [text, setText] = useState("");
  const [poll, setPoll] = useState<PollPayload | null>(null),
    [answers, setAnswers] = useState<string[]>([]),
    [question, setQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    void (async () => {
      try {
        const context = await getPublicEventContext(selection);
        if (!alive.current) return;
        setEventTitle(context.event.shortTitle);
        setMode(context.event.products.matchlab.dataMode);
        const saved = localStorage.getItem(tokenKey);
        const draft = localStorage.getItem("launch-space:draft");
        if (draft) {
          try {
            setForm((f) => ({ ...f, ...JSON.parse(draft) }));
          } catch {
            /* Invalid draft never blocks entry. */
          }
        }
        if (saved) {
          try {
            const r = await getEventNetworkMe(saved, selection);
            if (!alive.current) return;
            setRegistration(r);
            setToken(saved);
          } catch (e) {
            setError("Önceki demo oturumuna ulaşılamadı. Tekrar giriş yapabilirsin.");
          }
        } else {
          try {
            const profile = await getMyMemberProfile();
            if (profile && alive.current) {
              const [firstName, ...last] = profile.name.split(" ");
              setForm((f) => ({ ...f, firstName, lastName: last.join(" "), email: profile.email }));
              try {
                const r = await resumeEventNetwork(selection);
                if (r.accessToken && alive.current) accept(r);
              } catch {
                setStep(1);
              }
            }
          } catch {
            /* Guests use event registration. */
          }
        }
        if (alive.current) setReady(true);
      } catch (e) {
        if (alive.current) setContextError(e instanceof Error ? e.message : "Etkinlik yüklenemedi");
      }
    })();
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (ready && !registration) localStorage.setItem("launch-space:draft", JSON.stringify(form));
  }, [form, ready, registration]);
  function accept(r: EventNetworkRegistration) {
    if (!r.accessToken) throw Error("Oturum anahtarı alınamadı");
    localStorage.setItem(tokenKey, r.accessToken);
    localStorage.removeItem("launch-space:draft");
    setToken(r.accessToken);
    setRegistration(r);
    setStep(-1);
  }
  async function submit() {
    setError("");
    setBusy(true);
    try {
      const r = await registerEventNetwork(
        {
          ...form,
          offers: [form.field || "networking"],
          needTag: "networking",
          attendedEvent: novemberEventSlug,
          eventConsent: consent,
          aiAnalysisConsent: false,
          modelImprovementConsent: false,
          generalNetworkOptIn: false,
          marketingOptIn: false,
        },
        selection,
      );
      accept(r);
      setComplete(true);
      setTimeout(() => setComplete(false), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt tamamlanamadı");
    } finally {
      setBusy(false);
    }
  }
  async function signIn() {
    setError("");
    setBusy(true);
    try {
      const profile = await loginMember(identity.trim(), password);
      setPassword("");
      const [firstName, ...last] = profile.name.split(" ");
      setForm((f) => ({ ...f, firstName, lastName: last.join(" "), email: profile.email }));
      try {
        const r = await resumeEventNetwork(selection);
        accept(r);
      } catch {
        setStep(1);
      }
      setLogin(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Giriş yapılamadı");
    } finally {
      setBusy(false);
    }
  }
  async function loadMatch() {
    const r = await getEventNetworkMatch(token, selection);
    if (!alive.current) return;
    setGroup(r.group || null);
    setWaiting(
      r.status === "ready"
        ? ""
        : (r as { waitingReason?: string }).waitingReason === "admin"
          ? "Herkes hazır olduğunda organizatör eşleştirmeyi başlatacak."
          : `Havuzda ${r.waitingCount ?? 1} kişi var. Üç kişi olduğunda eşleşmen hazır olacak.`,
    );
  }
  useEffect(() => {
    if (tab !== "match" || !token) return;
    const refresh = () => {
      if (!document.hidden) void loadMatch().catch((e) => setError(e.message));
    };
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [tab, token]);
  useEffect(() => {
    if (!group || tab !== "match") {
      setMessages([]);
      return;
    }
    let current = true;
    const refresh = async () => {
      if (document.hidden) return;
      try {
        const rows = await network("chatRead", { groupId: group.id });
        if (current) setMessages(rows);
      } catch (e) {
        if (current) setError(e instanceof Error ? e.message : "Sohbet yüklenemedi");
      }
    };
    setMessages([]);
    void refresh();
    const timer = setInterval(refresh, 7000);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [tab, group?.id, token]);
  async function network(action: string, rest: Record<string, unknown>) {
    const r = await fetch("/api/event-products/network", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: novemberEventSlug, action, accessToken: token, ...rest }),
    });
    if (!r.ok) throw Error(await r.text());
    return r.json();
  }
  useEffect(() => {
    if (tab !== "poll" || !token) return;
    let current = true;
    const refresh = () => {
      if (!document.hidden)
        void pollRequest(novemberEventSlug, { accessToken: token })
          .then((r) => {
            if (current) setPoll(r);
          })
          .catch((e) => {
            if (current) setError(e.message);
          });
    };
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [tab, token]);
  async function rotate() {
    if (!group) return;
    setBusy(true);
    setError("");
    try {
      await rotateEventNetworkMatch(token, group.id, selection);
      setGroup(null);
      setMessages([]);
      await loadMatch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yeni eşleşme alınamadı");
    } finally {
      setBusy(false);
    }
  }
  const progress = Math.max(0, Math.round(((step + 1) / 5) * 100));
  return (
    <div className="launch-space">
      <header className="ls-header">
        <a href="/launch-space" className="ls-brand">
          <NodeMark />
          <span>
            nodes<small>by notwork</small>
          </span>
        </a>
        <span className="ls-demo">{mode || "demo"} · launch space</span>
      </header>
      <main className="ls-main">
        {contextError ? (
          <div className="ls-panel">
            <h1>Demo hazırlanıyor.</h1>
            <p>{contextError}</p>
            <p>Yerel test sunucusunu kullanarak aç.</p>
            <button onClick={() => location.reload()}>Tekrar dene</button>
          </div>
        ) : !ready ? (
          <div className="ls-center">
            <div className="ls-orbit">
              <NodeMark />
            </div>
            <p>Alanını hazırlıyoruz…</p>
          </div>
        ) : !registration ? (
          <>
            {step === -1 && !login ? (
              <section className="ls-welcome ls-enter">
                <div className="ls-orbit">
                  <NodeMark />
                  <i />
                  <i />
                  <i />
                </div>
                <p className="ls-eyebrow">14 KASIM · 18.00</p>
                <h1>
                  Bir tanışma.
                  <br />
                  <span>Yeni ihtimaller.</span>
                </h1>
                <p className="ls-muted">
                  Kendini tanıt. Doğru insanlarla buluş.
                  <br />
                  Topluluğun sesine katıl.
                </p>
                <button className="ls-primary" onClick={() => setStep(0)}>
                  Etkinlik profilimi oluştur <ArrowRight size={18} />
                </button>
                <button className="ls-ghost" onClick={() => setLogin(true)}>
                  Notwork profilim var · giriş yap
                </button>
                <p className="ls-caption">
                  Demo · yalnızca örnek bilgiler kullan.
                  <br />
                  Bu akış Nodes hesabı oluşturmaz.
                </p>
                <div className="ls-preview">
                  <span>
                    <Network size={17} /> Match
                  </span>
                  <span>
                    <Radio size={17} /> Canlı anket
                  </span>
                </div>
              </section>
            ) : login ? (
              <form
                className="ls-form ls-enter"
                onSubmit={(e) => {
                  e.preventDefault();
                  void signIn();
                }}
              >
                <button type="button" className="ls-back" onClick={() => setLogin(false)}>
                  <ArrowLeft size={18} />
                  Geri
                </button>
                <p className="ls-eyebrow">TEKRAR HOŞ GELDİN</p>
                <h1>Kaldığın yerden.</h1>
                <label>
                  E-posta veya kullanıcı adı
                  <input
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </label>
                <label>
                  Şifren
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>
                <button className="ls-primary" disabled={busy}>
                  {busy ? "Giriş yapılıyor…" : "Giriş yap"}
                </button>
              </form>
            ) : (
              <section className="ls-form ls-enter" key={step}>
                <div className="ls-progress">
                  <span>ETKİNLİK PROFİLİN</span>
                  <strong>%{progress}</strong>
                  <div
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <i style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <button className="ls-back" onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={18} />
                  Geri
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (step === 4) void submit();
                    else setStep(step + 1);
                  }}
                >
                  {step === 0 ? (
                    <>
                      <p className="ls-eyebrow">ÖNCE TANIŞALIM</p>
                      <h1>Burada sana yer var.</h1>
                      <label>
                        Adın
                        <input
                          required
                          maxLength={50}
                          autoComplete="given-name"
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        />
                      </label>
                      <label>
                        Soyadın
                        <input
                          required
                          maxLength={50}
                          autoComplete="family-name"
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        />
                      </label>
                      <label>
                        E-posta
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </label>
                    </>
                  ) : step < 4 ? (
                    <>
                      <p className="ls-eyebrow">{step} / 3 · SENİ TANIYALIM</p>
                      <h1>{fields[step - 1].title}</h1>
                      <label>
                        {fields[step - 1].label}
                        <textarea
                          autoFocus
                          required
                          maxLength={2000}
                          placeholder={fields[step - 1].placeholder}
                          value={form[fields[step - 1].key]}
                          onChange={(e) =>
                            setForm({ ...form, [fields[step - 1].key]: e.target.value })
                          }
                        />
                      </label>
                      {step === 2 ? (
                        <label>
                          Katkı alanın
                          <select
                            value={form.field || "networking"}
                            onChange={(e) => setForm({ ...form, field: e.target.value })}
                          >
                            {[
                              "networking",
                              "teknoloji",
                              "tasarım",
                              "pazarlama",
                              "girişimcilik",
                              "içerik",
                              "araştırma",
                            ].map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      <p className="ls-caption">
                        Kendi kelimelerin yeterli. Kısa veya uzun yazabilirsin.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="ls-eyebrow">SON BİR ADIM</p>
                      <h1>Tanışmaya hazırsın.</h1>
                      <div className="ls-person">
                        <UserRound />
                        <div>
                          <strong>
                            {form.firstName} {form.lastName}
                          </strong>
                          <p>{form.intro}</p>
                        </div>
                      </div>
                      <label className="ls-check">
                        <input
                          type="checkbox"
                          checked={consent}
                          required
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        <span>
                          Etkinlikte verdiğim yanıtların grup eşleştirmesinde kullanılmasını kabul
                          ediyorum.{" "}
                          <a href="/kvkk" target="_blank" rel="noreferrer">
                            Aydınlatma metni
                          </a>
                        </span>
                      </label>
                      <p className="ls-caption">
                        Ankette sahneye yalnızca toplu sonuçlar çıkar.
                        <br />
                        Bu demoda yapay zekâya veri gönderilmez.
                      </p>
                    </>
                  )}
                  <button className="ls-primary" disabled={busy}>
                    {busy ? "Profilin hazırlanıyor…" : step === 4 ? "Kaydı tamamla" : "Devam et"}
                    <ArrowRight size={18} />
                  </button>
                </form>
              </section>
            )}
          </>
        ) : (
          <>
            <div className="ls-flowbar" aria-label="Etkinlik akışı">
              <span>18.00 · Başlangıç</span>
              <i />
              <span>19.00 · Sunumlar</span>
            </div>
            {tab === "home" ? (
              <section className="ls-enter">
                <p className="ls-eyebrow">
                  HOŞ GELDİN, {registration.profile.firstName.toLocaleUpperCase("tr-TR")}
                </p>
                <h1>
                  Şimdi
                  <br />
                  <span>notwork zamanı.</span>
                </h1>
                <div className="ls-person">
                  <div className="ls-avatar">{registration.profile.firstName[0]}</div>
                  <div>
                    <strong>
                      {registration.profile.firstName} {registration.profile.lastName}
                    </strong>
                    <p>{registration.intro}</p>
                  </div>
                  <span className="ls-code">{registration.participant.publicCode}</span>
                </div>
                <button
                  className="ls-results-link"
                  onClick={() => {
                    setTab("poll");
                    setShowResults(true);
                  }}
                >
                  <Radio size={17} />
                  notwork anket sonuçları
                  <ArrowRight size={16} />
                </button>
                <p className="ls-section-label">BU BULUŞMADAKİ DENEYİMLERİN</p>
                <div className="ls-apps">
                  <button
                    onClick={() => {
                      setError("");
                      setTab("match");
                    }}
                  >
                    <span className="ls-app-icon">
                      <Network />
                    </span>
                    <small>01 · TANIŞ</small>
                    <h2>notwork match</h2>
                    <p>
                      Yeni bir gruba katıl.
                      <br />
                      Sohbeti birlikte başlat.
                    </p>
                    <ArrowRight />
                  </button>
                  <button
                    onClick={() => {
                      setError("");
                      setTab("poll");
                    }}
                  >
                    <span className="ls-app-icon ls-lilac">
                      <Radio />
                    </span>
                    <small>02 · PAYLAŞ</small>
                    <h2>notwork anket</h2>
                    <p>
                      Beş soruda senin sesin.
                      <br />
                      Bir sahnede topluluğun sesi.
                    </p>
                    <ArrowRight />
                  </button>
                </div>
              </section>
            ) : tab === "match" ? (
              <section className="ls-enter">
                <p className="ls-eyebrow">NOTWORK MATCH</p>
                {!group ? (
                  <div className="ls-center">
                    <div className="ls-orbit ls-search">
                      <NodeMark />
                    </div>
                    <h1>
                      Yeni bağlantın
                      <br />
                      birazdan burada.
                    </h1>
                    <p className="ls-muted" role="status">
                      {waiting || "Sana uygun bağlantıları arıyoruz…"}
                    </p>
                    <button
                      className="ls-secondary"
                      onClick={() => void loadMatch().catch((e) => setError(e.message))}
                    >
                      Tekrar kontrol et
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="ls-match-heading">
                      <div>
                        <p className="ls-caption">SENİN GRUBUN</p>
                        <h1>{group.groupName}</h1>
                      </div>
                      <button className="ls-secondary" onClick={() => setExpanded(true)}>
                        Grup adını büyüt
                      </button>
                    </div>
                    <div className="ls-members">
                      {group.members.map((m) => (
                        <div key={m.participantId}>
                          <span className="ls-avatar">{m.name[0]}</span>
                          <strong>
                            {m.name}
                            {m.isCurrentUser ? " · sen" : ""}
                          </strong>
                          <small>{m.publicCode}</small>
                        </div>
                      ))}
                    </div>
                    <p className="ls-muted">{group.aiAnalysis || group.reason}</p>
                    <section className="ls-chat">
                      <h2>
                        <MessageCircle size={18} />
                        Grup sohbeti
                      </h2>
                      <p className="ls-caption">Yalnızca bu eşleşmedeki kişiler görebilir.</p>
                      <div className="ls-messages" aria-live="polite">
                        {messages.length ? (
                          messages.map((m) => (
                            <p key={m.id}>
                              <strong>{m.name}</strong>
                              <span>{m.text}</span>
                            </p>
                          ))
                        ) : (
                          <p className="ls-muted">İlk selam senden gelsin.</p>
                        )}
                      </div>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setBusy(true);
                          setError("");
                          try {
                            const rows = await network("chatSend", {
                              groupId: group.id,
                              message: text.trim(),
                              messageId: crypto.randomUUID(),
                            });
                            setMessages(rows);
                            setText("");
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "Mesaj gönderilemedi");
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        <input
                          aria-label="Grubuna mesaj"
                          placeholder="Nerede buluşalım?"
                          maxLength={500}
                          required
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        />
                        <button disabled={busy || !text.trim()} aria-label="Gönder">
                          <Send size={18} />
                        </button>
                      </form>
                    </section>
                    <div className="ls-panel">
                      <p className="ls-eyebrow">SOHBETİ BAŞLAT</p>
                      <p>{group.conversationPrompt}</p>
                    </div>
                    <button
                      className="ls-secondary ls-full"
                      disabled={busy}
                      onClick={() => void rotate()}
                    >
                      {busy ? "Yeni bağlantılar aranıyor…" : "Yeni eşleşme iste"}
                      <ArrowRight size={17} />
                    </button>
                  </>
                )}
              </section>
            ) : (
              <section className="ls-enter">
                <div className="ls-poll-switch">
                  <button aria-pressed={!showResults} onClick={() => setShowResults(false)}>
                    Anket
                  </button>
                  <button aria-pressed={showResults} onClick={() => setShowResults(true)}>
                    Canlı sonuçlar
                  </button>
                </div>
                <p className="ls-eyebrow">NOTWORK ANKET</p>
                {!poll ? (
                  <p role="status">Anket yükleniyor…</p>
                ) : showResults ? (
                  <PublishedResults poll={poll} />
                ) : poll.submitted ? (
                  <div className="ls-center">
                    <div className="ls-success">
                      <Check size={34} />
                    </div>
                    <h1>
                      Senin sesin
                      <br />
                      topluluğa karıştı.
                    </h1>
                    <p className="ls-muted">
                      Beş yanıtın kaydedildi. Topluluğun yanıtlarını buradan takip edebilirsin.
                    </p>
                    <button onClick={() => setShowResults(true)} className="ls-primary">
                      Sonuçları gör
                    </button>
                    <button onClick={() => setTab("home")} className="ls-secondary">
                      Deneyimlere dön
                    </button>
                  </div>
                ) : !poll.config.isOpen ? (
                  <div className="ls-center">
                    <Radio size={45} />
                    <h1>
                      Birazdan
                      <br />
                      söz sende.
                    </h1>
                    <p className="ls-muted">
                      Organizatör anketi açtığında beş soru burada görünecek.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="ls-progress">
                      <span>SORU {question + 1} / 5</span>
                      <strong>%{Math.round((question / 5) * 100)}</strong>
                      <div>
                        <i style={{ width: `${(question / 5) * 100}%` }} />
                      </div>
                    </div>
                    <h1 className="ls-poll-title">{poll.config.questions[question].title}</h1>
                    <div className="ls-options">
                      {poll.config.questions[question].options.map((o) => (
                        <button
                          key={o}
                          aria-pressed={answers[question] === o}
                          onClick={() =>
                            setAnswers((a) => {
                              const n = [...a];
                              n[question] = o;
                              return n;
                            })
                          }
                        >
                          <span>{o}</span>
                          {answers[question] === o ? <Check size={18} /> : <i />}
                        </button>
                      ))}
                    </div>
                    <div className="ls-actions">
                      <button
                        disabled={question === 0 || busy}
                        className="ls-ghost"
                        onClick={() => setQuestion((q) => q - 1)}
                      >
                        Geri
                      </button>
                      <button
                        className="ls-primary"
                        disabled={!answers[question] || busy}
                        onClick={async () => {
                          if (question < 4) {
                            setQuestion((q) => q + 1);
                            return;
                          }
                          setBusy(true);
                          setError("");
                          try {
                            setPoll(
                              await pollRequest(novemberEventSlug, {
                                action: "submit",
                                accessToken: token,
                                questionVersion: poll.config.questionVersion || 1,
                                answers,
                              }),
                            );
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "Anket kaydedilemedi");
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        {busy ? "Kaydediliyor…" : question === 4 ? "Yanıtları gönder" : "Devam et"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}
            <nav className="ls-nav" aria-label="Etkinlik uygulamaları">
              {(
                [
                  { id: "home", label: "Alanım", icon: UserRound },
                  { id: "match", label: "Match", icon: Network },
                  { id: "poll", label: "Anket", icon: Radio },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  aria-current={tab === id ? "page" : undefined}
                  onClick={() => {
                    setError("");
                    setTab(id);
                  }}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </>
        )}
        {error ? (
          <div className="ls-error" role="alert">
            {error}
            <button onClick={() => setError("")} aria-label="Mesajı kapat">
              ×
            </button>
          </div>
        ) : null}
      </main>
      {complete ? (
        <div className="ls-completion" role="status">
          <div className="ls-orbit">
            <NodeMark />
          </div>
          <Sparkles />
          <h1>Artık hazırsın.</h1>
          <p>Güzel bağlantılara.</p>
        </div>
      ) : null}
      {expanded && group ? (
        <div className="ls-expanded" role="dialog" aria-modal="true" aria-label="Grup adı">
          <button onClick={() => setExpanded(false)} className="ls-secondary">
            Kapat
          </button>
          <NodeMark />
          <h1>{group.groupName}</h1>
        </div>
      ) : null}
    </div>
  );
}

function PublishedResults({ poll }: { poll: PollPayload }) {
  const result = poll.published;
  if (!result)
    return (
      <div className="ls-center">
        <Radio size={40} />
        <h2>Sonuçlar birazdan burada.</h2>
        <p className="ls-muted">Organizatörün yayınladığı soru burada da görünecek.</p>
      </div>
    );
  return (
    <section className="ls-mobile-results">
      <p className="ls-caption">CANLI · {result.total} YANIT</p>
      <h2>{result.question.title}</h2>
      <div className="ls-result-bars">
        {result.counts.map((c, i) => {
          const percent = result.total ? (c.count / result.total) * 100 : 0;
          return (
            <div className="ls-result-bar" key={c.label}>
              <div
                className={`ls-result-fill ls-result-color-${i % 5}`}
                style={{ width: `${percent}%` }}
              />
              <span className="ls-result-name">{c.label}</span>
              <span className="ls-result-value">
                <strong>
                  {Math.round(percent)}
                  <small>%</small>
                </strong>
                <span>{c.count} oy</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="ls-caption">Yalnızca toplu sonuçlar · otomatik güncellenir.</p>
    </section>
  );
}
