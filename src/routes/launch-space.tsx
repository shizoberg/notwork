import { fetchActiveLaunchDataset, type ActiveLaunchDataset } from "@/lib/launch-dataset";
import { defaultLaunchFlow, getLaunchFlow, launchQuestionKeys } from "@/lib/launch-flow";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Camera,
  MessageCircle,
  Network,
  Radio,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { createNoIndexSeo } from "@/lib/seo";
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
import { LaunchEventHeader } from "@/components/launch-space/LaunchEventHeader";
import { LaunchSpaceArea } from "@/components/launch-space/LaunchSpaceArea";

export const Route = createFileRoute("/launch-space")({
  head: () =>
    createNoIndexSeo({
      title: "launchspace · nodes by notwork",
      description: "14 Kasım etkinlik deneyimi · yerel test",
      path: "/launch-space",
    }),
  component: LaunchSpace,
});
const eventSelection = { event: novemberEventSlug };
const legacyTokenKey = getEventNetworkTokenStorageKey(eventSelection);
const keySuffix = (datasetId?: string) =>
  datasetId && datasetId !== "legacy-demo" ? `:${datasetId}` : "";
const tokenKeyFor = (datasetId?: string) => legacyTokenKey + keySuffix(datasetId);
const draftKeyFor = (datasetId?: string) => "launch-space:draft" + keySuffix(datasetId);
type Tab = "home" | "match" | "poll";
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
  const [flow, setFlow] = useState(defaultLaunchFlow);

  const [ready, setReady] = useState(false),
    [contextError, setContextError] = useState("");
  const [dataset, setDataset] = useState<ActiveLaunchDataset>();
  const selection = { ...eventSelection, datasetId: dataset?.id };
  const mode = dataset?.mode;
  const [registration, setRegistration] = useState<EventNetworkRegistration | null>(null),
    [token, setToken] = useState("");
  const [step, setStep] = useState(-1),
    [tab, setTab] = useState<Tab>("home"),
    [login, setLogin] = useState(false),
    [identity, setIdentity] = useState(""),
    [password, setPassword] = useState("");
  const activeQuestion = flow.questions[step - 1];
  const activeKey = launchQuestionKeys[step - 1];
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
    [aiConsent, setAiConsent] = useState(false),
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
  const pollLength = poll?.config.questions.length ?? 1;
  const pollQuestion = poll?.config.questions[Math.min(question, pollLength - 1)];
  useEffect(() => {
    setQuestion(0);
    setAnswers([]);
  }, [poll?.config.questionVersion]);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    void (async () => {
      try {
        const [savedFlow, currentDataset] = await Promise.all([
          getLaunchFlow().catch(() => defaultLaunchFlow),
          fetchActiveLaunchDataset(),
        ]);
        if (!alive.current) return;
        setFlow(savedFlow);
        setDataset(currentDataset);
        const currentSelection = { ...eventSelection, datasetId: currentDataset.id };
        const saved = localStorage.getItem(tokenKeyFor(currentDataset.id));
        const draft = localStorage.getItem(draftKeyFor(currentDataset.id));
        if (draft) {
          try {
            setForm((f) => ({ ...f, ...JSON.parse(draft) }));
          } catch {
            /* Invalid draft never blocks entry. */
          }
        }
        if (saved) {
          try {
            const r = await getEventNetworkMe(saved, currentSelection);
            if (!alive.current) return;
            setRegistration(r);
            setToken(saved);
          } catch (e) {
            setError("Önceki etkinlik oturumuna ulaşılamadı. Tekrar giriş yapabilirsin.");
          }
        } else {
          try {
            const profile = await getMyMemberProfile();
            if (profile && alive.current) {
              const [firstName, ...last] = profile.name.split(" ");
              setForm((f) => ({ ...f, firstName, lastName: last.join(" "), email: profile.email }));
              try {
                const r = await resumeEventNetwork(currentSelection);
                if (r.accessToken && alive.current) accept(r, currentDataset.id);
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
    if (ready && !registration)
      localStorage.setItem(draftKeyFor(dataset?.id), JSON.stringify(form));
  }, [form, ready, registration, dataset?.id]);

  useEffect(() => {
    if (!dataset) return;
    let current = true;
    let pending = false;
    const check = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const active = await fetchActiveLaunchDataset();
        if (!current) return;
        if (active.id !== dataset.id) location.reload();
        else setDataset(active);
      } catch {
        // Keep the current session during temporary network interruptions.
      } finally {
        pending = false;
      }
    };
    const timer = setInterval(check, 12000 + Math.round(Math.random() * 6000));
    document.addEventListener("visibilitychange", check);
    return () => {
      current = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [dataset?.id]);

  function accept(r: EventNetworkRegistration, id = dataset?.id) {
    if (!r.accessToken) throw Error("Oturum anahtarı alınamadı");
    localStorage.setItem(tokenKeyFor(id), r.accessToken);
    localStorage.removeItem(draftKeyFor(id));
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
          offers: [flow.categories.includes(form.field) ? form.field : flow.categories[0]],
          needTag: "networking",
          attendedEvent: novemberEventSlug,
          eventConsent: consent,
          aiAnalysisConsent: aiConsent,
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
    setRegistration(r.registration);
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
      body: JSON.stringify({
        event: novemberEventSlug,
        datasetId: dataset?.id,
        action,
        accessToken: token,
        ...rest,
      }),
    });
    if (!r.ok) throw Error(await r.text());
    return r.json();
  }
  useEffect(() => {
    if (tab !== "poll" || !token) return;
    let current = true;
    const refresh = () => {
      if (!document.hidden)
        void pollRequest(novemberEventSlug, { accessToken: token, datasetId: dataset?.id })
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
      await loadMatch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yeni eşleşme alınamadı");
    } finally {
      setBusy(false);
    }
  }
  const announcement = dataset?.bulletin?.announcement;
  const voteNotice = dataset?.bulletin?.vote;
  const hasCurrentVote = poll?.submitted && poll.config.questionVersion === voteNotice?.version;
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
        <span className="ls-demo">launchspace</span>
      </header>
      <main className="ls-main">
        {(announcement || (voteNotice && !hasCurrentVote && tab !== "poll")) && (
          <div className="ls-bulletins" aria-live="polite">
            {announcement && (
              <section className="ls-bulletin">
                <strong>Duyuru</strong>
                <p className="ls-flow-copy">{announcement.text}</p>
              </section>
            )}
            {voteNotice && !hasCurrentVote && tab !== "poll" && (
              <section className="ls-bulletin">
                <strong>Oylama açık</strong>
                <p>{voteNotice.title}</p>
                {registration ? (
                  <button
                    className="ls-secondary"
                    onClick={() => {
                      setTab("poll");
                      setShowResults(false);
                    }}
                  >
                    Oy kullan <ArrowRight size={15} />
                  </button>
                ) : (
                  <small className="ls-caption">
                    Etkinliğe giriş yaptıktan sonra oy verebilirsin.
                  </small>
                )}
              </section>
            )}
          </div>
        )}
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
              <section className="ls-enter">
                <LaunchEventHeader flow={flow} />
                <div className="ls-panel ls-node-entry">
                  <p className="ls-eyebrow">Etkinlik amacı</p>
                  <p className="ls-muted ls-flow-copy">{flow.welcomeText}</p>
                  <details>
                    <summary>Etkinlik programı</summary>
                    <ul className="ls-nodes-votes">
                      {flow.schedule.map(({ time, label }, index) => (
                        <li key={index}>
                          <strong>{time.replace(":", ".")}</strong>
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
                <div className="ls-panel ls-node-entry">
                  <h2 className="ls-flow-copy">{flow.welcomeTitle}</h2>
                  <div className="ls-actions">
                    <button className="ls-primary" onClick={() => setStep(0)}>
                      {flow.registerLabel} <ArrowRight size={18} />
                    </button>
                    <button className="ls-secondary" onClick={() => setLogin(true)}>
                      {flow.loginLabel}
                    </button>
                  </div>
                  {mode === "demo" && (
                    <p className="ls-caption">Demo · yalnızca örnek bilgiler kullan.</p>
                  )}
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
                  ) : activeQuestion ? (
                    <>
                      <p className="ls-eyebrow">{step} / 3 · SENİ TANIYALIM</p>
                      <h1>{activeQuestion.title}</h1>
                      {activeQuestion.options.length ? (
                        <fieldset className="ls-flow-options">
                          <legend>{activeQuestion.label}</legend>
                          {activeQuestion.options.map((option) => (
                            <label className="ls-check" key={option}>
                              <input
                                type="radio"
                                required
                                name={activeKey}
                                checked={form[activeKey] === option}
                                onChange={() => setForm({ ...form, [activeKey]: option })}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </fieldset>
                      ) : (
                        <label>
                          {activeQuestion.label}
                          <textarea
                            autoFocus
                            required
                            maxLength={2000}
                            placeholder={activeQuestion.placeholder}
                            value={form[activeKey]}
                            onChange={(e) => setForm({ ...form, [activeKey]: e.target.value })}
                          />
                        </label>
                      )}
                      {step === 2 && (
                        <label>
                          {flow.categoryLabel}
                          <select
                            value={
                              flow.categories.includes(form.field) ? form.field : flow.categories[0]
                            }
                            onChange={(e) => setForm({ ...form, field: e.target.value })}
                          >
                            {flow.categories.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {!activeQuestion.options.length && (
                        <p className="ls-caption">
                          Kendi kelimelerin yeterli. Kısa veya uzun yazabilirsin.
                        </p>
                      )}
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
                      <label className="ls-check">
                        <input
                          type="checkbox"
                          checked={aiConsent}
                          onChange={(e) => setAiConsent(e.target.checked)}
                        />
                        <span>
                          İsteğe bağlı · ihtiyaç ve katkı yanıtlarım eşleşme için OpenAI ile
                          değerlendirilebilir.
                        </span>
                      </label>
                      <p className="ls-caption">Ankette sahneye yalnızca toplu sonuçlar çıkar.</p>
                    </>
                  )}
                  <button className="ls-primary" disabled={busy}>
                    {busy
                      ? "Profilin hazırlanıyor…"
                      : step === 4
                        ? flow.finishLabel
                        : flow.nextLabel}
                    <ArrowRight size={18} />
                  </button>
                </form>
              </section>
            )}
          </>
        ) : (
          <>
            {tab !== "home" && (
              <div className="ls-flowbar" aria-label="Etkinlik akışı">
                {flow.schedule.map(({ time, label }, index) => (
                  <span key={index}>
                    {time.replace(":", ".")} · {label}
                  </span>
                ))}
              </div>
            )}
            {tab === "home" ? (
              <section className="ls-enter">
                <p className="ls-eyebrow">
                  HOŞ GELDİN, {registration.profile.firstName.toLocaleUpperCase("tr-TR")}
                </p>
                <LaunchSpaceArea
                  token={token}
                  goal={registration.needs}
                  flow={flow}
                  datasetId={dataset?.id}
                >
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
                    Oylama sonuçları
                    <ArrowRight size={16} />
                  </button>
                  <p className="ls-section-label">BU BULUŞMADAKİ DENEYİMLERİN</p>
                  <div className="ls-apps">
                    {flow.apps.map((app, index) => (
                      <button
                        key={app}
                        onClick={() => {
                          setError("");
                          setTab(app);
                        }}
                      >
                        <span className={app === "match" ? "ls-app-icon" : "ls-app-icon ls-lilac"}>
                          {app === "match" ? <Network /> : <Radio />}
                        </span>
                        <small>
                          0{index + 1} · {app === "match" ? "TANIŞ" : "PAYLAŞ"}
                        </small>
                        <h2>{app === "match" ? "notwork match" : "Sunum oylaması"}</h2>
                        <p>
                          {app === "match"
                            ? "Yeni bir gruba katıl ve sohbeti başlat."
                            : "Firma sunumları için oyunu kullan."}
                        </p>
                        <ArrowRight />
                      </button>
                    ))}
                  </div>
                </LaunchSpaceArea>
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
                          {m.isPhotoOwner ? (
                            <span className="ls-photo-badge">
                              <Camera size={12} />
                              Fotoğrafçı
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <p className="ls-muted">{group.aiAnalysis || group.reason}</p>
                    <p className="ls-photo-assignment">
                      <Camera size={17} />
                      <span>
                        Grup fotoğrafçınız:{" "}
                        <strong>
                          {group.members.find((m) => m.isPhotoOwner)?.name || "Belirleniyor"}
                        </strong>
                      </span>
                    </p>
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
                    <p className="ls-caption">
                      Yeni eşleşme: {(group.rematchApprovedParticipantIds || []).length}/
                      {group.members.length} onay. Grubunuz herkes onayladığında dağılır.
                    </p>
                    <button
                      className="ls-secondary ls-full"
                      disabled={
                        busy ||
                        (group.rematchApprovedParticipantIds || []).includes(
                          registration.participant.id,
                        )
                      }
                      onClick={() => void rotate()}
                    >
                      {busy
                        ? "Onayın kaydediliyor…"
                        : (group.rematchApprovedParticipantIds || []).includes(
                              registration.participant.id,
                            )
                          ? "Onayladın · diğer üyeler bekleniyor"
                          : "Yeni eşleşmeyi onayla"}
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
                <p className="ls-eyebrow">{flow.organizerName}</p>
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
                      Oyun kaydedildi. Sonuçlar paylaşıldığında buradan görebilirsin.
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
                    <p className="ls-muted">Oylama açıldığında buradan oy verebilirsin.</p>
                  </div>
                ) : (
                  <>
                    {pollLength > 1 && (
                      <p className="ls-caption">
                        Soru {Math.min(question + 1, pollLength)} / {pollLength}
                      </p>
                    )}
                    <h1 className="ls-poll-title">{pollQuestion?.title}</h1>
                    <div className="ls-options">
                      {pollQuestion?.options.map((o) => (
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
                      {pollLength > 1 && (
                        <button
                          disabled={question === 0 || busy}
                          className="ls-ghost"
                          onClick={() => setQuestion((q) => q - 1)}
                        >
                          Geri
                        </button>
                      )}
                      <button
                        className="ls-primary"
                        disabled={!pollQuestion?.options.includes(answers[question]) || busy}
                        onClick={async () => {
                          if (question < pollLength - 1) {
                            setQuestion((q) => q + 1);
                            return;
                          }
                          setBusy(true);
                          setError("");
                          try {
                            setPoll(
                              await pollRequest(novemberEventSlug, {
                                action: "submit",
                                datasetId: dataset?.id,
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
                        {busy
                          ? "Kaydediliyor…"
                          : question >= pollLength - 1
                            ? "Oyumu gönder"
                            : "Devam et"}
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
                  ...flow.apps.map((id) => ({
                    id,
                    label: id === "match" ? "Match" : "Anket",
                    icon: id === "match" ? Network : Radio,
                  })),
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
