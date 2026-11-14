import { MatchRating } from "@/components/launch-space/MatchRating";
import { LaunchAvatar } from "@/components/launch-space/LaunchAvatar";
import { fetchActiveLaunchDataset, type ActiveLaunchDataset } from "@/lib/launch-dataset";
import { defaultLaunchFlow, getLaunchFlow } from "@/lib/launch-flow";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
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
  resumeEventNetwork,
  rotateEventNetworkMatch,
  getEventNetworkTokenStorageKey,
} from "@/lib/event-network-api";
import { getMyMemberProfile } from "@/lib/member-profile-api";
import type { EventNetworkRegistration, EventNetworkMatchGroup } from "@/lib/event-network";
import { novemberEventSlug, pollRequest, type PollPayload } from "@/lib/event-poll";
import "@/launch-space.css";
import { LaunchEventHeader } from "@/components/launch-space/LaunchEventHeader";
import { LaunchSpaceArea } from "@/components/launch-space/LaunchSpaceArea";

export const Route = createFileRoute("/launch-space")({
  head: () =>
    createNoIndexSeo({
      title: "launchspace · nodes by notwork",
      description: "14 Kasım Launchspace etkinlik deneyimi",
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
  const [introVisible, setIntroVisible] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("nodes-launch-welcome")) return;
      sessionStorage.setItem("nodes-launch-welcome", "1");
    } catch { /* Storage can be unavailable in private browsers. */ }
    setIntroVisible(true);
    const timer = setTimeout(() => setIntroVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);
  const [flow, setFlow] = useState(defaultLaunchFlow);

  const [ready, setReady] = useState(false),
    [contextError, setContextError] = useState("");
  const [dataset, setDataset] = useState<ActiveLaunchDataset>();
  const selection = { ...eventSelection, datasetId: dataset?.id };
  const mode = dataset?.mode;
  const [registration, setRegistration] = useState<EventNetworkRegistration | null>(null),
    [token, setToken] = useState("");
  const [tab, setTab] = useState<Tab>("home");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deviceResume, setDeviceResume] = useState(false);
  const [signInLink, setSignInLink] = useState("");
  useEffect(() => {
    const hash = new URLSearchParams(location.hash.slice(1));
    const link = hash.get("sign-in");
    if (link) {
      setSignInLink(link);
      history.replaceState(history.state, "", location.pathname + location.search);
    }
  }, []);
  const [jobTitle, setJobTitle] = useState("");
  const [registrationStep, setRegistrationStep] = useState(0);
  const [responses, setResponses] = useState(["", "", ""]);
  const [category, setCategory] = useState("");
  const [aiConsent, setAiConsent] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File>();
  const [photoNotice, setPhotoNotice] = useState("");
  const registrationQuestion = flow.questions[registrationStep - 1];
  const [avatar, setAvatar] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [editingVote, setEditingVote] = useState(false);
  const [voteReminder, setVoteReminder] = useState(false);
  const [selfieStatus, setSelfieStatus] = useState("");
  const [selfie, setSelfie] = useState("");
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
        // Cookie backup also restores a session when browser storage was cleared.
        if (!saved) {
          try {
            const response = await fetch("/api/event-products/network", { method: "POST", headers: { "content-type": "application/json" },
              body: JSON.stringify({ ...currentSelection, action: "launchDeviceResume" }) });
            if (response.ok) {
              const recovered = await response.json();
              if (alive.current) { accept(recovered, currentDataset.id); setReady(true); }
              return;
            }
          } catch { /* Registration stays available during transient failures. */ }
        }
        const draft = localStorage.getItem(draftKeyFor(currentDataset.id));
        if (draft) {
          try {
            setName(JSON.parse(draft).name || "");
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
              setName([firstName, ...last].join(" "));
              setAvatar(profile.photoUrl || "");
              try {
                const r = await resumeEventNetwork(currentSelection);
                if (r.accessToken && alive.current) accept(r, currentDataset.id);
              } catch {
                // A member without an event registration can use the prefilled name.
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
      localStorage.setItem(draftKeyFor(dataset?.id), JSON.stringify({ name }));
  }, [name, ready, registration, dataset?.id]);

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
  }
  async function openProfileEditor() {
    setBusy(true); setProfileNotice("");
    try {
      const { registration: r, email: contactEmail } = await network("launchProfile", {});
      setName(`${r.profile.firstName} ${r.profile.lastName}`.trim());
      setEmail(contactEmail); setJobTitle(r.jobTitle || "");
      setResponses([r.intro || "", r.offersDetail || "", r.needs || ""]);
      setCategory(r.offers[0] || flow.categories[0]); setAiConsent(r.aiConsent?.analysis === true);
      setEditingProfile(true);
    } catch (e) { setProfileNotice(e instanceof Error ? e.message : "Profil açılamadı."); }
    finally { setBusy(false); }
  }
  async function saveProfile() {
    setBusy(true); setProfileNotice("");
    try {
      const result = await network("launchProfileUpdate", { firstName: name.trim(), email: email.trim(), jobTitle,
        intro: responses[0], offersDetail: responses[1], needs: responses[2], offers: [category], aiAnalysisConsent: aiConsent });
      accept(result.registration);
      setEditingProfile(false); setProfileNotice("Bilgilerin güncellendi.");
      void loadMatch().catch(() => {});
    } catch (e) { setProfileNotice(e instanceof Error ? e.message : "Kaydedilemedi."); }
    finally { setBusy(false); }
  }
  async function submit() {
    setError("");
    setBusy(true);
    try {
      const r = await network("launchGuest", {
        firstName: name.trim(), email: email.trim(), eventConsent: consent,
        jobTitle, intro: responses[0], offersDetail: responses[1], needs: responses[2],
        offers: [category || flow.categories[0]], aiAnalysisConsent: aiConsent,
      });
      accept(r);
      if (profilePhoto && r.accessToken) void saveProfilePhoto(profilePhoto, r.accessToken);
      setComplete(true);
      setTimeout(() => setComplete(false), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt tamamlanamadı");
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
        : (r as { waitingReason?: string }).waitingReason === "threshold"
          ? "İlk 20 kişi kaydını tamamladığında eşleşmeler otomatik başlayacak."
        : (r as { waitingReason?: string }).waitingReason === "matching"
          ? "Eşleşmeler hazırlanıyor. Birazdan grubun burada."
        : (r as { waitingReason?: string }).waitingReason === "admin"
          ? "Herkes hazır olduğunda organizatör eşleştirmeyi başlatacak."
          : `Havuzda ${r.waitingCount ?? 1} kişi var. Uygun bir üçlü oluştuğunda eşleşmen hazır olacak.`,
    );
  }
  useEffect(() => {
    if ((tab !== "match" && tab !== "home") || !token) return;
    let pending = false;
    let active = true;
    const refresh = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        await loadMatch();
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : "Eşleşme yüklenemedi");
      } finally {
        pending = false;
      }
    };
    void refresh();
    const timer = setInterval(refresh, 10000 + Math.floor(Math.random() * 4000));
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [tab, token, dataset?.id]);
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
    const timer = setInterval(refresh, 7000 + Math.floor(Math.random() * 4000));
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [tab, group?.id, token]);
  useEffect(() => {
    if (!token) return;
    let active = true;
    void network("launchProfilePhoto", {}).then(({ photo }) => {
      if (active && photo) setAvatar(photo);
    }).catch(() => {});
    return () => { active = false; };
  }, [token, dataset?.id]);

  async function saveProfilePhoto(file: File, accessToken: string) {
    setPhotoNotice("Fotoğraf yükleniyor…");
    try {
      if (!file.type.startsWith("image/") || file.size > 12_000_000) throw Error("12 MB altında bir fotoğraf seç.");
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) { bitmap.close(); throw Error("Fotoğraf işlenemedi."); }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      let photo = canvas.toDataURL("image/jpeg", 0.68);
      for (const quality of [0.55, 0.42, 0.28]) {
        if (photo.length <= 40000) break;
        photo = canvas.toDataURL("image/jpeg", quality);
      }
      if (photo.length > 40000) throw Error("Fotoğraf küçültülemedi.");
      await network("launchProfilePhoto", { accessToken, photoDataUrl: photo });
      setAvatar(photo);
      setPhotoNotice("");
    } catch {
      setPhotoNotice("Profil fotoğrafı yüklenemedi.");
    }
  }

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
  async function recoverSession(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = signInLink
        ? await network("launchSignInComplete", { accessToken: signInLink })
        : await network("launchDeviceResume", { email: email.trim(), accessToken: token || localStorage.getItem(tokenKeyFor(dataset?.id)) || "" });
      accept(result);
      setSignInLink("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
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
  }, [tab, token, dataset?.id]);
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
  function openVotes() {
    setVoteReminder(true);
    setTab("poll");
  }

  async function uploadSelfie(file?: File) {
    if (!file || !group) return;
    setSelfieStatus("Yükleniyor…");
    try {
      if (!file.type.startsWith("image/") || file.size > 12_000_000) throw Error("12 MB altı bir fotoğraf seç.");
      const image = await createImageBitmap(file);
      const scale = Math.min(1, 760 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) { image.close(); throw Error("Fotoğraf işlenemedi."); }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();
      const photo = canvas.toDataURL("image/jpeg", .7);
      await network("groupSelfie", { groupId: group.id, photoDataUrl: photo });
      setSelfie(photo);
      setSelfieStatus("Grup selfien kaydedildi.");
    } catch (error) {
      setSelfieStatus(error instanceof Error ? error.message : "Fotoğraf kaydedilemedi.");
    }
  }
  useEffect(() => { setSelfieStatus(""); setSelfie(""); }, [group?.id]);
  return (
    <div className="launch-space">
      {introVisible && <div className="ls-welcome-portal" aria-hidden="true"><div className="ls-welcome-mark"><NodeMark /><strong>nodes</strong><small>by notwork</small></div></div>}
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
        <div className="ls-program-ticker" aria-label="Etkinlik akışı">
          <div className="ls-program-track">
            {[false, true].map((copy) => (
              <div className="ls-program-items" key={String(copy)} aria-hidden={copy || undefined}>
                {flow.schedule.map(({ time, label }, index) => (
                  <span key={index}>{time.replace(":", ".")} · {label}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
        {(announcement || (voteNotice && !hasCurrentVote && tab !== "poll")) && (
          <div className="ls-bulletins" aria-live="polite">
            {announcement && (
              <section className="ls-bulletin ls-ticker">
                <strong>Duyuru</strong>
                <div><p>{announcement.text}</p></div>
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
                      openVotes();
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
        {tab === "poll" && voteReminder && (
          <div className="ls-person-overlay">
            <section className="ls-profile-sheet" role="dialog" aria-modal="true" aria-label={flow.votesLabel}>
              <h2>{flow.votesLabel}</h2>
              <p>{flow.voteReminder}</p>
              <button autoFocus className="ls-primary ls-dialog-action" onClick={() => setVoteReminder(false)}>Anladım</button>
            </section>
          </div>
        )}
        {contextError ? (
          <div className="ls-panel">
            <h1>Etkinlik yüklenemedi.</h1>
            <p>{contextError}</p>
            <button onClick={() => location.reload()}>Tekrar dene</button>
          </div>
        ) : !ready ? (
          <div className="ls-center">
            <div className="ls-orbit">
              <NodeMark />
            </div>
            <p>Alanını hazırlıyoruz…</p>
          </div>
        ) : signInLink || (deviceResume && !registration) ? (
          <section className="ls-enter">
            <LaunchEventHeader flow={flow} />
            <form className="ls-form ls-panel ls-entry-form ls-return-form" onSubmit={recoverSession}>
              <h1>Etkinliğe geri dön</h1>
              <p className="ls-entry-description">Kayıt olduğun cihazda e-postanı yazarak kaldığın yerden devam et.</p>
              {!signInLink && <label>E-posta
                <input type="email" required autoComplete="email" placeholder="E-posta adresin" value={email}
                  onChange={(event) => setEmail(event.target.value)} />
              </label>}
              <button className="ls-primary" disabled={busy}>
                {busy ? "Bekle…" : "Oturumu aç"}
              </button>
              <button type="button" className="ls-secondary" onClick={() => {
                setSignInLink(""); setDeviceResume(false); setError("");
              }}>Kayıt ekranına dön</button>
            </form>
          </section>
        ) : !registration ? (
          <section className="ls-enter">
            <LaunchEventHeader flow={flow} />
            <form className="ls-form ls-panel ls-entry-form" onSubmit={(event) => {
              event.preventDefault();
              if (busy) return;
              if (registrationStep < 4) setRegistrationStep(registrationStep + 1);
              else if (consent) void submit();
            }}>
              {registrationStep > 0 && <button type="button" className="ls-secondary" onClick={() => setRegistrationStep(registrationStep - 1)}>Geri</button>}
              <p className="ls-caption">{registrationStep + 1} / 5</p>
              {registrationStep === 0 && <p className="ls-welcome-message">Her etkinliğin merkezinde sen varsın.</p>}
              <h1>{registrationStep === 0 ? "Hoş geldin" : registrationQuestion?.title || "Tanışmaya hazırsın"}</h1>
              {registrationStep === 0 && <>
                <p className="ls-muted">{flow.welcomeText}</p>
                <button type="button" className="ls-secondary" onClick={() => setDeviceResume(true)}>Kaydım var</button>
                <label>Adın ve soyadın
                  <input required maxLength={100} autoComplete="name" value={name}
                    onChange={(event) => setName(event.target.value)} />
                </label>
                <label>E-posta
                  <input required type="email" maxLength={120} autoComplete="email" value={email}
                    onChange={(event) => setEmail(event.target.value)} />
                </label>
              </>}
              {registrationQuestion && <>
                {registrationStep === 1 && <>
                  <aside className="ls-profile-example" aria-label="Örnek profil">
                    <small>ÖRNEK PROFİL</small><strong>Ece Yılmaz · Ürün tasarımcısı</strong>
                    <p>“Karmaşık fikirleri insanların kolayca kullanabildiği ürünlere dönüştürüyorum.”</p>
                  </aside>
                  <label className="ls-question-field" data-profile-field="title">Unvanın / yaptığın iş
                    <input required maxLength={100} placeholder="Örn. Ürün tasarımcısı" value={jobTitle} onChange={event => setJobTitle(event.target.value)} />
                  </label>
                  <p className="ls-caption">Unvanının yanına seni anlatan bir cümle ekle. Ne yaptığını kendi sözlerinle anlat.</p>
                </>}

                <label className="ls-question-field" data-profile-field={registrationStep === 1 ? "intro" : registrationStep === 2 ? "offers" : "needs"}>{registrationQuestion.label}
                  {registrationQuestion.options.length > 0 ? (
                    <select required value={responses[registrationStep - 1]} onChange={(event) =>
                      setResponses((current) => current.map((value, index) => index === registrationStep - 1 ? event.target.value : value))}>
                      <option value="">Seç</option>
                      {registrationQuestion.options.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  ) : (
                    <textarea required maxLength={1000} placeholder={registrationQuestion.placeholder}
                      value={responses[registrationStep - 1]} onChange={(event) =>
                        setResponses((current) => current.map((value, index) => index === registrationStep - 1 ? event.target.value : value))} />
                  )}
                </label>
                {registrationStep === 2 && <label>{flow.categoryLabel}
                  <select value={category || flow.categories[0]} onChange={(event) => setCategory(event.target.value)}>
                    {flow.categories.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>}
              </>}
              {registrationStep === 4 && <>
                <label>Profil fotoğrafı · isteğe bağlı
                  <input type="file" accept="image/*" onChange={(event) => setProfilePhoto(event.target.files?.[0])} />
                </label>
                <label className="ls-check">
                  <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>Adımın ve eklediğim fotoğrafın katılımcılara görünmesini, yanıtlarımın eşleşmede kullanılmasını kabul ediyorum. <a href="/kvkk" target="_blank" rel="noreferrer">Aydınlatma metni</a></span>
                </label>
                <label className="ls-check">
                  <input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} />
                  <span>İsteğe bağlı · katkı ve ihtiyaç yanıtlarım OpenAI ile tanışma önerilerinde kullanılabilir.</span>
                </label>
              </>}
              <button className="ls-primary" disabled={busy || (registrationStep === 4 && !consent)}>
                {busy ? "Kaydediliyor…" : registrationStep === 4 ? flow.registerLabel : flow.nextLabel} <ArrowRight size={18} />
              </button>
              {mode === "demo" && <p className="ls-caption">Demo · yalnızca örnek bilgiler kullan.</p>}
            </form>
          </section>
        ) : (
          <>
            {tab === "home" ? (
              <section className="ls-enter">
                <LaunchSpaceArea
                  event={novemberEventSlug}
                  token={token}
                  goal={registration.needs}
                  firstName={registration.profile.firstName}
                  avatar={avatar}
                  flow={flow}
                  datasetId={dataset?.id}
                >
                  <div className="ls-person">
                    <div className="ls-avatar">{avatar ? <img src={avatar} alt="Profil fotoğrafın" /> : registration.profile.firstName[0]}</div>
                    <div>
                      <strong>
                        {registration.profile.firstName} {registration.profile.lastName}
                      </strong>
                      {registration.jobTitle && <small>{registration.jobTitle}</small>}
                      <p>{registration.intro}</p>
                    </div>
                    <span className="ls-code">{registration.participant.publicCode}</span>
                  </div>
                  <button type="button" className="ls-secondary" disabled={busy} onClick={openProfileEditor}>Profilimi düzenle</button>
                  {editingProfile && <form className="ls-profile-editor" onSubmit={e => { e.preventDefault(); void saveProfile(); }}>
                    <h2>Profil bilgilerin</h2>
                    <label>Ad soyad<input required maxLength={100} value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>
                    <label>E-posta<input type="email" maxLength={120} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
                    <label data-profile-field="title">Ünvan / yaptığın iş<input required maxLength={100} value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></label>
                    <label>Alan<select value={category} onChange={e => setCategory(e.target.value)}>{Array.from(new Set([category, ...flow.categories])).filter(Boolean).map(c => <option key={c}>{c}</option>)}</select></label>
                    {["Kendini tanımlayan cümle", "Paylaşabileceklerin", "Bu buluşmada aradığın"].map((label, index) => <label key={label} data-profile-field={["intro", "offers", "needs"][index]}>{flow.questions[index]?.label || label}<textarea maxLength={4000} rows={3} value={responses[index]} onChange={e => setResponses(values => values.map((v, i) => i === index ? e.target.value : v))} /></label>)}
                    <label>Profil fotoğrafı · seçince kaydedilir<input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) void saveProfilePhoto(file, token); }} /></label>
                    {avatar && <button type="button" className="ls-secondary" onClick={async () => { try { await network("launchProfilePhoto", { photoDataUrl: "" }); setAvatar(""); setPhotoNotice("Fotoğraf kaldırıldı."); } catch { setPhotoNotice("Fotoğraf kaldırılamadı."); } }}>Fotoğrafı kaldır</button>}
                    <label className="ls-editor-consent"><input type="checkbox" checked={aiConsent} onChange={e => setAiConsent(e.target.checked)} />Gelişmiş network deneyimini aç</label>
                    <div className="ls-editor-actions"><button type="submit" disabled={busy}>{busy ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</button><button type="button" className="ls-secondary" disabled={busy} onClick={() => setEditingProfile(false)}>Vazgeç</button></div>
                  </form>}
                  {profileNotice && <p role="status">{profileNotice}</p>}
                  {photoNotice && <p role="status" className="ls-caption">{photoNotice}</p>}
                  <p className="ls-section-label">BU BULUŞMADAKİ DENEYİMLERİN</p>
                  <div className="ls-apps">
                    {flow.apps.map((app) => (
                      <button
                        key={app}
                        data-app={app}
                        onClick={() => {
                          setError("");
                          if (app === "poll") openVotes();
                          else setTab(app);
                        }}
                      >
                        <span className={app === "match" ? "ls-app-icon" : "ls-app-icon ls-lilac"}>
                          {app === "match" ? <Network /> : <Radio />}
                        </span>
                        <h2>{app === "match" ? flow.matchLabel : flow.votesLabel}</h2>
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
                    <section className="ls-panel ls-match-group" aria-label="Eşleşme grubun">
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
                          <LaunchAvatar event={novemberEventSlug} datasetId={dataset?.id} token={token} id={m.participantId} name={m.name} />
                          <strong>
                            {m.name}
                            {m.isCurrentUser ? " · sen" : ""}
                          </strong>
                          <small className="ls-member-code">{m.publicCode}</small>
                          {m.jobTitle && <small className="ls-member-title" data-profile-field="title">{m.jobTitle}</small>}
                          {m.intro && <details className="ls-member-intro" data-profile-field="intro"><summary aria-label={`${m.name} tanıtımını aç`}>{m.intro}</summary><p>{m.intro}</p></details>}
                          <small>{group.rematchApprovedParticipantIds?.includes(m.participantId) ? "✓ Onayladı" : "Onay bekleniyor"}</small>
                          {m.isPhotoOwner ? (
                            <span className="ls-photo-badge">
                              <Camera size={12} />
                              Fotoğrafçı
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <div className="ls-match-purpose">
                      <h2>Grup amacı</h2>
                      <p className="ls-muted">{group.aiAnalysis || group.reason}</p>
                    </div>
                    </section>
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
                    <MatchRating key={group.id} initialRating={group.myRating} onRate={rating => network("rateMatch", { groupId: group.id, rating })} />
                    <section className="ls-panel ls-rematch-panel">
                      <h2>Yeni eşleşme</h2>
                      {flow.showSelfie && (
                        <div className="ls-group-selfie">
                          <label className="ls-secondary ls-selfie-button">
                            <Camera size={17} aria-hidden="true" /> Fotoğraf çek
                            <input type="file" accept="image/*" capture="user" aria-label="Grup selfiesi"
                              onChange={(event) => void uploadSelfie(event.target.files?.[0])} />
                          </label>
                          <p className="ls-caption">Grup selfiesi · isteğe bağlı</p>
                          {selfie && <img className="ls-selfie-preview" src={selfie} alt="Grup selfiesi" />}
                          {selfieStatus && <p className="ls-caption" role="status">{selfieStatus}</p>}
                        </div>
                      )}
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
                    </section>
                  </>
                )}
              </section>
            ) : (
              <section className="ls-enter">
                {!poll ? (
                  <p role="status">Anket yükleniyor…</p>
                ) : poll.submitted && !editingVote ? (
                  <div className="ls-center ls-vote-confirmation">
                    <div className="ls-success">
                      <Check size={34} />
                    </div>
                    <h1>
                      Senin sesin
                      <br />
                      topluluğa karıştı.
                    </h1>
                    <p className="ls-muted">
                      Oyun kaydedildi. Dilersen daha sonra değiştirebilirsin.
                    </p>
                    <div className="ls-vote-results" aria-label="Oylama sonuçları">
                      {poll.results?.map(({ question, total, counts }) => (
                        <section key={question.id} className="ls-panel">
                          <h2>{question.title}</h2>
                          <p className="ls-caption">{total} oy</p>
                          <div className="ls-result-bars">
                            {counts.map(({ label, count }, index) => {
                              const percent = total ? count / total * 100 : 0;
                              return (
                                <div className="ls-result-bar" key={label} role="meter"
                                  aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
                                  aria-valuetext={`${count} oy, yüzde ${Math.round(percent)}`}>
                                  <div className={`ls-result-fill ls-result-color-${index % 5}`}
                                    style={{ width: `${percent}%` }} aria-hidden="true" />
                                  <span className="ls-result-name">{label}</span>
                                  <span className="ls-result-value">
                                    <strong>{Math.round(percent)}<small>%</small></strong>
                                    <span>{count} oy</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </div>
                    <div className="ls-vote-actions">
                    {poll.config.isOpen && (
                      <button className="ls-secondary" onClick={() => {
                        setAnswers(poll.myAnswers || []);
                        setQuestion(0);
                        setEditingVote(true);
                      }}>Oyumu değiştir</button>
                    )}
                    <button onClick={() => setTab("home")} className="ls-secondary">
                      My Space’e dön
                    </button>
                    </div>
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
                            setEditingVote(false);
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
                  { id: "home", label: "My Space", icon: UserRound },
                  ...flow.apps.map((id) => ({
                    id,
                    label: id === "match" ? flow.matchLabel : flow.votesLabel,
                    icon: id === "match" ? Network : Radio,
                  })),
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  aria-current={tab === id ? "page" : undefined}
                  onClick={() => {
                    setError("");
                    if (id === "poll") openVotes();
                    else setTab(id);
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
