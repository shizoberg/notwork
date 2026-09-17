import { previewEvent, useEventPreview } from "@/lib/event-preview";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock3,
  KeyRound,
  MessageCircle,
  Network,
  Star,
  UserRound,
  Vote,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { EventFlowBanner } from "@/components/EventFlowBanner";
import { currentEventFlowStep, type EventFlowState } from "@/lib/event-flow";
import { PasswordResetRequest } from "@/components/PasswordResetRequest";
import { notworkEventOptions, type EventNetworkRegistration } from "@/lib/event-network";
import {
  getEventNetworkMe,
  getEventNetworkTokenStorageKey,
  registerEventNetwork,
  resumeEventNetwork,
} from "@/lib/event-network-api";
import {
  getEventSelectionFromLocation,
  getPublicEventContext,
  defaultEventRegistrationPrompts,
  type EventRegistrationPrompts,
  type EventProductKey,
  type EventSelection,
  type NotworkEvent,
  withEventSelection,
} from "@/lib/event-registry";
import { getMyMemberProfile, loginMember, MemberProfileApiError } from "@/lib/member-profile-api";
import type { NotworkMemberProfile } from "@/lib/member-profile";
import { createNoIndexSeo } from "@/lib/seo";

export const Route = createFileRoute("/linkler")({
  head: () =>
    createNoIndexSeo({
      title: "notwork Etkinlik Girişi | ntw.wordcloud, notwork match ve ntw.five",
      description:
        "notwork etkinlik katılımcıları için kayıt, ntw.wordcloud, notwork match, ntw.five, WhatsApp topluluğu ve etkinlik yorumu bağlantıları.",
      path: "/linkler",
    }),
  component: LinksPage,
});

const offerSuggestions = [
  "yazılım",
  "tasarım",
  "pazarlama",
  "satış",
  "finans",
  "içerik",
  "topluluk",
  "girişim",
  "yapay zeka",
  "operasyon",
];

const needSuggestions = ["müşteri", "yatırım", "ekip", "mentor", "pazarlama", "fikir", "iş"];

const eventProductLinks: Array<{
  product: EventProductKey;
  title: string;
  description: string;
  href: string;
  icon: typeof Clock3;
}> = [
  {
    product: "five",
    title: "ntw.five",
    description: "Problemini seç, katkını sun ve beş dakikalık görüşmeni başlat.",
    href: "/five/live",
    icon: Clock3,
  },
  {
    product: "wordcloud",
    title: "ntw.wordcloud",
    description: "Canlı soruları yanıtla; ortak fikirlerin sahnede büyüsün.",
    href: "/21-agustos/wordcloud",
    icon: Vote,
  },
  {
    product: "matchlab",
    title: "notwork match",
    description: "Profil bilgilerine göre üçlü grubunu gör ve tanışmayı başlat.",
    href: "/21-agustos/eslesme",
    icon: Network,
  },
];

const externalLinks = [
  {
    title: "WhatsApp Topluluğu",
    description: "Topluluğa katıl ve duyuruları takip et",
    href: "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE",
    icon: MessageCircle,
  },
];

type LinkRegistrationForm = {
  firstName: string;
  lastName: string;
  email: string;
  attendedEvent: string;
  intro: string;
  offers: string[];
  customOffer: string;
  offersDetail: string;
  needs: string;
  needTag: string;
  marketingOptIn: boolean;
  eventConsent: boolean;
  aiAnalysisConsent: boolean;
  modelImprovementConsent: boolean;
  generalNetworkOptIn: boolean;
};

type RegistrationPath = "choose" | "login" | "forgot" | "new";
type RegistrationStep = "standard" | "event";
type ExperienceChoice = "enhanced" | "basic" | null;

type RegistrationDraft = {
  version: 1;
  savedAt: number;
  form: LinkRegistrationForm;
  registrationPath: RegistrationPath;
  registrationStep: RegistrationStep;
  eventQuestionIndex: number;
  experienceChoice: ExperienceChoice;
  loginIdentity: string;
};

const registrationDraftMaxAge = 7 * 24 * 60 * 60 * 1_000;

function LinksPage() {
  const preview = useEventPreview();
  const [previewReady, setPreviewReady] = useState(false);
  const [activeEvent, setActiveEvent] = useState<NotworkEvent | null>(null);
  const [registration, setRegistration] = useState<EventNetworkRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [liveFlow, setLiveFlow] = useState<EventFlowState | null>(null);
  const [message, setMessage] = useState("");
  const [registrationPath, setRegistrationPath] = useState<RegistrationPath>("choose");
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>("standard");
  const [eventQuestionIndex, setEventQuestionIndex] = useState(0);
  const [experienceChoice, setExperienceChoice] = useState<ExperienceChoice>(null);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [loginIdentity, setLoginIdentity] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginConsent, setLoginConsent] = useState(false);
  const eventSelection = useMemo<EventSelection>(
    () => (activeEvent ? { event: activeEvent.slug } : {}),
    [activeEvent],
  );
  const tokenStorageKey = useMemo(
    () => getEventNetworkTokenStorageKey(eventSelection),
    [eventSelection],
  );
  const draftStorageKey = `${tokenStorageKey}:registration-draft:v1`;
  const eventLinks = useMemo(() => {
    const productLinks = eventProductLinks
      .map((link) => {
        const product = activeEvent?.products[link.product];
        return {
          ...link,
          title: product?.label || link.title,
          href: withEventSelection(link.href, eventSelection),
          enabled: product
            ? product.enabled &&
              product.visible &&
              (preview || (product.state === "live" && product.dataMode === "live"))
            : true,
          order:
            product?.order ?? (link.product === "five" ? 1 : link.product === "wordcloud" ? 2 : 3),
        };
      })
      .sort((left, right) => left.order - right.order);
    return [
      ...productLinks,
      {
        product: null,
        title: "Etkinlik Yorumu",
        description: "Etkinliği puanla; yorum ve fotoğraf ekle.",
        href: activeEvent
          ? `/etkinlik-degerlendirme?event=${encodeURIComponent(activeEvent.slug)}`
          : "/etkinlik-degerlendirme?event=21-agustos-2026",
        icon: Star,
        enabled: true,
      },
    ];
  }, [activeEvent, eventSelection, preview]);
  const [form, setForm] = useState<LinkRegistrationForm>({
    firstName: "",
    lastName: "",
    email: "",
    attendedEvent: "",
    intro: "",
    offers: [] as string[],
    customOffer: "",
    offersDetail: "",
    needs: "",
    needTag: "",
    marketingOptIn: false,
    eventConsent: false,
    aiAnalysisConsent: false,
    modelImprovementConsent: false,
    generalNetworkOptIn: false,
  });

  const registrationPrompts = useMemo(
    () => ({
      ...defaultEventRegistrationPrompts,
      ...activeEvent?.entry.registrationPrompts,
    }),
    [activeEvent],
  );

  function applyRegistration(data: EventNetworkRegistration, fallbackEvent = "21-agustos-2026") {
    setRegistration(data);
    setForm((current) => ({
      ...current,
      firstName: data.profile.firstName,
      lastName: data.profile.lastName,
      email: data.profile.email,
      attendedEvent: data.profile.attendedEvent || fallbackEvent,
      intro: data.intro || "",
      offers: data.offers,
      offersDetail: data.offersDetail || "",
      needs: data.needs,
      needTag: data.needTag,
      marketingOptIn: Boolean(
        data.profile.marketingPreferenceVersion === "2026-09-09" && data.profile.marketingOptIn,
      ),
      generalNetworkOptIn: data.profile.generalNetworkOptIn,
      eventConsent: true,
      aiAnalysisConsent: data.aiConsent?.analysis === true,
      modelImprovementConsent: data.aiConsent?.modelImprovement === true,
    }));
  }

  function applyMemberProfile(profile: NotworkMemberProfile, fallbackEvent?: string) {
    const [firstName = "", ...lastNameParts] = profile.name.trim().split(/\s+/);
    setForm((current) => ({
      ...current,
      firstName,
      lastName: lastNameParts.join(" "),
      email: profile.email,
      attendedEvent: current.attendedEvent || fallbackEvent || "",
      intro: profile.bio || profile.headline || current.intro,
      offers: profile.skills.slice(0, 3),
      generalNetworkOptIn: true,
    }));
    setRegistrationPath("new");
    setRegistrationStep(profile.skills.length > 0 ? "event" : "standard");
  }

  function redirectToPasswordSetup(profile: NotworkMemberProfile) {
    if (!profile.mustChangePassword) return false;
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/profil?next=${encodeURIComponent(returnTo)}`);
    return true;
  }

  useEffect(() => {
    if (preview === null) return;
    if (preview) {
      setActiveEvent(previewEvent());
      setPreviewReady(new URLSearchParams(window.location.search).get("step") === "apps");
      setIsLoading(false);
      return;
    }
    let active = true;

    async function loadRegistration() {
      let selectedEvent: NotworkEvent | null = null;
      try {
        const context = await getPublicEventContext(getEventSelectionFromLocation());
        selectedEvent = context.event;
        if (active) {
          setActiveEvent(context.event);
          setForm((current) => ({
            ...current,
            attendedEvent: current.attendedEvent || context.event.slug,
          }));
        }
      } catch (error) {
        console.error(error);
      }

      const selection: EventSelection = selectedEvent ? { event: selectedEvent.slug } : {};
      const activeTokenStorageKey = getEventNetworkTokenStorageKey(selection);
      const activeDraftStorageKey = `${activeTokenStorageKey}:registration-draft:v1`;
      try {
        const storedDraft = JSON.parse(
          localStorage.getItem(activeDraftStorageKey) || "null",
        ) as RegistrationDraft | null;
        if (
          storedDraft?.version === 1 &&
          Date.now() - storedDraft.savedAt <= registrationDraftMaxAge
        ) {
          if (active) {
            setForm((current) => ({
              ...current,
              ...storedDraft.form,
              attendedEvent:
                storedDraft.form.attendedEvent || selectedEvent?.slug || current.attendedEvent,
            }));
            setRegistrationPath(storedDraft.registrationPath);
            setRegistrationStep(storedDraft.registrationStep);
            setEventQuestionIndex(Math.min(3, Math.max(0, storedDraft.eventQuestionIndex || 0)));
            setExperienceChoice(storedDraft.experienceChoice || null);
            setLoginIdentity(storedDraft.loginIdentity || "");
          }
        } else {
          localStorage.removeItem(activeDraftStorageKey);
        }
      } catch {
        localStorage.removeItem(activeDraftStorageKey);
      }
      let loadedRegistration = false;
      const token = localStorage.getItem(activeTokenStorageKey);
      if (token) {
        try {
          if (active)
            applyRegistration(await getEventNetworkMe(token, selection), selectedEvent?.slug);
          loadedRegistration = true;
        } catch {
          localStorage.removeItem(activeTokenStorageKey);
        }
      }

      let profile: NotworkMemberProfile | null = null;
      try {
        profile = await getMyMemberProfile();
        if (profile && redirectToPasswordSetup(profile)) return;
      } catch (error) {
        if (!(error instanceof MemberProfileApiError && error.status === 401)) console.error(error);
      }

      if (!loadedRegistration && profile) {
        try {
          const resumed = await resumeEventNetwork(selection);
          if (resumed.accessToken) localStorage.setItem(activeTokenStorageKey, resumed.accessToken);
          if (active) applyRegistration(resumed, selectedEvent?.slug);
          loadedRegistration = true;
        } catch {
          if (active) applyMemberProfile(profile, selectedEvent?.slug);
        }
      }

      if (loadedRegistration) localStorage.removeItem(activeDraftStorageKey);
      if (active) {
        setDraftHydrated(true);
        setIsLoading(false);
      }
    }

    void loadRegistration();
    return () => {
      active = false;
    };
  }, [preview]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.firstName.trim() &&
        form.lastName.trim() &&
        form.email.includes("@") &&
        form.attendedEvent &&
        form.offers.length > 0 &&
        form.eventConsent,
      ),
    [form],
  );

  const canContinueStandard = useMemo(
    () =>
      Boolean(
        form.firstName.trim() &&
        form.lastName.trim() &&
        form.email.includes("@") &&
        form.attendedEvent &&
        form.offers.length > 0,
      ),
    [form],
  );

  const hasRegistration = Boolean(registration) || Boolean(preview && previewReady);
  const profileCard = registration
    ? {
        firstName: registration.profile.firstName,
        lastName: registration.profile.lastName,
        code: registration.participant.publicCode,
        offers: registration.offers,
        needTag: registration.needTag,
        needs: registration.needs,
      }
    : preview && previewReady
      ? {
          firstName: "Demo",
          lastName: "Notworker",
          code: "NTW17",
          offers: ["topluluk", "içerik", "girişim"],
          needTag: "networking",
          needs: "Yeni fikirler üretebileceği insanlarla tanışmak",
        }
      : null;

  useEffect(() => {
    if (preview || !draftHydrated || hasRegistration) return;
    const draft: RegistrationDraft = {
      version: 1,
      savedAt: Date.now(),
      form,
      registrationPath,
      registrationStep,
      eventQuestionIndex,
      experienceChoice,
      loginIdentity,
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    draftHydrated,
    draftStorageKey,
    eventQuestionIndex,
    experienceChoice,
    form,
    hasRegistration,
    loginIdentity,
    preview,
    registrationPath,
    registrationStep,
  ]);

  useEffect(() => {
    if (!hasRegistration) return;
    localStorage.removeItem(draftStorageKey);
  }, [draftStorageKey, hasRegistration]);

  useEffect(() => {
    if (!showCompletion) return;
    const timer = window.setTimeout(() => setShowCompletion(false), 1_750);
    return () => window.clearTimeout(timer);
  }, [showCompletion]);

  const registrationProgress = useMemo(() => {
    if (hasRegistration) return 100;

    if (registrationPath === "choose") return 0;
    if (registrationPath === "login") {
      const completed = [loginIdentity.trim(), loginPassword, loginConsent].filter(Boolean).length;
      return Math.round((completed / 3) * 45);
    }

    const completed = [
      form.firstName.trim(),
      form.lastName.trim(),
      form.email.includes("@"),
      form.attendedEvent,
      form.offers.length > 0,
      true,
      true,
      true,
      form.needTag,
      form.eventConsent,
    ].filter(Boolean).length;
    return Math.round((completed / 10) * 100);
  }, [form, hasRegistration, loginConsent, loginIdentity, loginPassword, registrationPath]);

  const progressCopy = useMemo(() => {
    if (hasRegistration) return { label: "Hazırsın", hint: "Uygulama akışın hazır" };
    if (registrationPath === "choose") return { label: "Başlangıç", hint: "Sana uygun yolu seç" };
    if (registrationPath === "login")
      return { label: "Profilin", hint: "Hesabınla güvenle devam et" };
    if (registrationStep === "standard")
      return { label: "Profilin", hint: "Temel bilgilerini tamamla" };
    return { label: "Etkinlik", hint: "Seni doğru kişilerle buluşturalım" };
  }, [hasRegistration, registrationPath, registrationStep]);

  const activeEventLinks = useMemo(() => eventLinks.filter((link) => link.enabled), [eventLinks]);
  const currentFlowProduct = currentEventFlowStep(liveFlow)?.product || null;
  const isFlowControlled = Boolean(
    currentFlowProduct && liveFlow && ["running", "awaiting_advance"].includes(liveFlow.status),
  );

  function toggleOffer(offer: string) {
    setForm((current) => {
      const exists = current.offers.includes(offer);
      const offers = exists
        ? current.offers.filter((item) => item !== offer)
        : [...current.offers, offer].slice(0, 3);
      return { ...current, offers };
    });
  }

  function addCustomOffer() {
    const offer = form.customOffer.trim().toLocaleLowerCase("tr-TR");
    if (!offer || form.offers.includes(offer)) return;
    setForm({ ...form, offers: [...form.offers, offer].slice(0, 3), customOffer: "" });
  }

  async function submitRegistration() {
    if (preview) {
      setPreviewReady(true);
      setShowCompletion(true);
      return;
    }
    setIsSaving(true);
    setMessage("");
    try {
      const data = await registerEventNetwork(
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          attendedEvent: form.attendedEvent,
          intro: form.intro.trim(),
          offers: form.offers,
          offersDetail: form.offersDetail.trim(),
          needs: form.needs.trim(),
          needTag: form.needTag || "networking",
          generalNetworkOptIn: form.generalNetworkOptIn,
          marketingOptIn: form.marketingOptIn,
          marketingPreferenceVersion: "2026-09-09",
          eventConsent: form.eventConsent,
          aiAnalysisConsent: form.aiAnalysisConsent,
          modelImprovementConsent: form.modelImprovementConsent,
        },
        eventSelection,
      );

      if (data.accessToken) localStorage.setItem(tokenStorageKey, data.accessToken);
      setRegistration(data);
      setShowCompletion(true);
      setMessage(
        data.membership?.verifiedMember
          ? "Kayıt tamamlandı. Etkinlik katılımcısı üyeliğin otomatik doğrulandı; kodun hazır."
          : "Kayıt tamamlandı. Kodun hazır; şimdi ntw.wordcloud veya notwork match’e geçebilirsin.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kayıt tamamlanamadı.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitMemberLogin() {
    if (preview) {
      setForm((current) => ({
        ...current,
        firstName: "Demo",
        lastName: "Notworker",
        email: "demo.member@notwork.local",
        attendedEvent: activeEvent?.slug || current.attendedEvent || "21-agustos-2026",
        intro: "",
        offers: ["networking"],
        offersDetail: "",
        needs: "",
        needTag: "networking",
        generalNetworkOptIn: true,
        eventConsent: false,
        aiAnalysisConsent: false,
        modelImprovementConsent: false,
      }));
      setRegistrationPath("new");
      setRegistrationStep("event");
      setMessage("Demo üye girişi tamamlandı. Şimdi etkinliğe özel soruları yanıtla.");
      return;
    }
    if (!loginConsent) return;
    setIsSaving(true);
    setMessage("");
    try {
      const profile = await loginMember(loginIdentity.trim(), loginPassword);
      if (redirectToPasswordSetup(profile)) return;
      applyMemberProfile(profile, activeEvent?.slug);
      try {
        const resumed = await resumeEventNetwork(eventSelection);
        if (resumed.accessToken) localStorage.setItem(tokenStorageKey, resumed.accessToken);
        applyRegistration(resumed, activeEvent?.slug);
      } catch {
        setMessage("Üye girişin tamamlandı. Şimdi bu etkinliğe özel soruları yanıtla.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Üye girişi tamamlanamadı.");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    document.documentElement.dataset.notworkEntryReady = String(hasRegistration);
    if (hasRegistration) window.requestAnimationFrame(() => window.scrollTo({ top: 0 }));
    const timer = window.setTimeout(
      () =>
        window.dispatchEvent(new CustomEvent("notwork-entry-ready", { detail: hasRegistration })),
      0,
    );
    return () => {
      window.clearTimeout(timer);
      delete document.documentElement.dataset.notworkEntryReady;
    };
  }, [hasRegistration]);

  return (
    <div
      className={`event-entry min-h-screen bg-background text-foreground${hasRegistration ? "" : " is-registering"}`}
    >
      {showCompletion && (
        <div className="entry-completion" role="status" aria-live="polite">
          <div className="entry-completion-mark" aria-hidden="true">
            <span />
            <Check />
          </div>
          <p>Artık hazırsın</p>
          <small>notwork akışın açılıyor</small>
        </div>
      )}
      <SiteNav variant="event" />
      <EventFlowBanner onFlowChange={setLiveFlow} />
      <main id="etkinlik-girisi" className="scroll-mt-24 px-4 py-5 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <header className={`entry-heading${hasRegistration ? " is-ready" : ""}`}>
            <EntryProgress
              value={registrationProgress}
              label={progressCopy.label}
              hint={progressCopy.hint}
            />
            {hasRegistration && (
              <>
                <h1>{activeEvent?.entry.appsTitle || "Şimdi notwork zamanı"}</h1>
                <p>{activeEvent?.entry.appsSubtitle || "Akışa göre uygulamanı seç"}</p>
              </>
            )}
          </header>
          {preview && !hasRegistration && (
            <button className="entry-preview" onClick={() => setPreviewReady(true)}>
              Örnek katılımcıyla uygulamaları incele →
            </button>
          )}

          {isLoading ? (
            <section className="mt-5 rounded-[2rem] border border-primary/20 bg-card p-6 text-center text-sm font-bold text-foreground/55 shadow-sm">
              Kayıt bilgilerin kontrol ediliyor…
            </section>
          ) : null}

          {!isLoading && !hasRegistration ? (
            <RegistrationGate
              form={form}
              setForm={setForm}
              canSubmit={canSubmit}
              isSaving={isSaving}
              message={message}
              toggleOffer={toggleOffer}
              addCustomOffer={addCustomOffer}
              submitRegistration={submitRegistration}
              activeEvent={activeEvent}
              registrationPath={registrationPath}
              registrationStep={registrationStep}
              setRegistrationPath={setRegistrationPath}
              setRegistrationStep={setRegistrationStep}
              canContinueStandard={canContinueStandard}
              loginIdentity={loginIdentity}
              loginPassword={loginPassword}
              loginConsent={loginConsent}
              setLoginIdentity={setLoginIdentity}
              setLoginPassword={setLoginPassword}
              setLoginConsent={setLoginConsent}
              submitMemberLogin={submitMemberLogin}
              registrationPrompts={registrationPrompts}
              eventQuestionIndex={eventQuestionIndex}
              setEventQuestionIndex={setEventQuestionIndex}
              experienceChoice={experienceChoice}
              setExperienceChoice={setExperienceChoice}
            />
          ) : null}

          {hasRegistration && (
            <>
              {profileCard && (
                <section className="entry-profile-card" aria-label="Profilim">
                  <div className="entry-profile-avatar" aria-hidden="true">
                    {profileCard.firstName.slice(0, 1)}
                    {profileCard.lastName.slice(0, 1)}
                  </div>
                  <div className="entry-profile-copy">
                    <span>Profilim</span>
                    <h2>
                      {profileCard.firstName} {profileCard.lastName}
                    </h2>
                    <p>{profileCard.offers.join(" · ") || profileCard.needTag}</p>
                    {profileCard.needs ? (
                      <small>Aradığı bağlantı · {profileCard.needs}</small>
                    ) : null}
                  </div>
                  <div className="entry-profile-code">
                    <span>Etkinlik kodu</span>
                    <strong>{profileCard.code}</strong>
                  </div>
                </section>
              )}
              <div className="entry-flow-summary">
                <span>Bu akşamın akışı</span>
                <p>Admin akışındaki sırayı takip et. Her adım seni bir sonrakine taşır.</p>
              </div>
              <section className="entry-app-flow">
                {activeEventLinks.map(
                  ({ product, title, description, href, icon: Icon }, index) => (
                    <a
                      key={title}
                      href={
                        isFlowControlled && product !== currentFlowProduct
                          ? undefined
                          : preview && href.startsWith("/")
                            ? `${href}${href.includes("?") ? "&" : "?"}preview=event`
                            : href
                      }
                      aria-disabled={isFlowControlled && product !== currentFlowProduct}
                      className={`entry-app-step group${
                        isFlowControlled && product !== currentFlowProduct ? " is-locked" : ""
                      }`}
                    >
                      <span className="entry-app-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="entry-app-icon">
                        <Icon size={23} strokeWidth={1.7} />
                      </span>
                      <span className="entry-app-copy">
                        <strong>{title}</strong>
                        <small>{description}</small>
                      </span>
                      <span className="entry-app-action">
                        {isFlowControlled && product !== currentFlowProduct ? "Sırada" : "Başla"}{" "}
                        <ArrowRight size={15} />
                      </span>
                    </a>
                  ),
                )}
              </section>

              <section className="mx-auto mt-7 grid max-w-xl gap-3">
                <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-foreground/35">
                  Diğer bağlantılar
                </p>
                {externalLinks.map(({ title, description, href, icon: Icon }) => (
                  <a
                    key={title}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary-deep">
                      <Icon size={24} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{title}</span>
                      <span className="mt-0.5 block text-xs text-foreground/50">{description}</span>
                    </span>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-foreground/35 transition group-hover:text-primary-deep"
                    />
                  </a>
                ))}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function EntryProgress({ value, label, hint }: { value: number; label: string; hint: string }) {
  return (
    <div
      className="entry-progress"
      role="progressbar"
      aria-label="Kayıt ilerlemesi"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div className="entry-progress-copy">
        <span>{label}</span>
        <strong className="entry-progress-percent">%{value}</strong>
      </div>
      <span className="entry-progress-track" aria-hidden="true">
        <i style={{ transform: `scaleX(${value / 100})` }} />
      </span>
      <p>{hint}</p>
    </div>
  );
}

function RegistrationGate({
  form,
  setForm,
  canSubmit,
  isSaving,
  message,
  toggleOffer,
  addCustomOffer,
  submitRegistration,
  activeEvent,
  registrationPath,
  registrationStep,
  setRegistrationPath,
  setRegistrationStep,
  canContinueStandard,
  loginIdentity,
  loginPassword,
  loginConsent,
  setLoginIdentity,
  setLoginPassword,
  setLoginConsent,
  submitMemberLogin,
  registrationPrompts,
  eventQuestionIndex,
  setEventQuestionIndex,
  experienceChoice,
  setExperienceChoice,
}: {
  form: LinkRegistrationForm;
  setForm: React.Dispatch<React.SetStateAction<LinkRegistrationForm>>;
  canSubmit: boolean;
  isSaving: boolean;
  message: string;
  toggleOffer: (offer: string) => void;
  addCustomOffer: () => void;
  submitRegistration: () => Promise<void>;
  activeEvent: NotworkEvent | null;
  registrationPath: RegistrationPath;
  registrationStep: RegistrationStep;
  setRegistrationPath: React.Dispatch<React.SetStateAction<RegistrationPath>>;
  setRegistrationStep: React.Dispatch<React.SetStateAction<RegistrationStep>>;
  canContinueStandard: boolean;
  loginIdentity: string;
  loginPassword: string;
  loginConsent: boolean;
  setLoginIdentity: React.Dispatch<React.SetStateAction<string>>;
  setLoginPassword: React.Dispatch<React.SetStateAction<string>>;
  setLoginConsent: React.Dispatch<React.SetStateAction<boolean>>;
  submitMemberLogin: () => Promise<void>;
  registrationPrompts: EventRegistrationPrompts;
  eventQuestionIndex: number;
  setEventQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  experienceChoice: ExperienceChoice;
  setExperienceChoice: React.Dispatch<React.SetStateAction<ExperienceChoice>>;
}) {
  const eventQuestionComplete = [true, true, true, form.eventConsent && experienceChoice !== null];

  if (registrationPath === "choose") {
    return (
      <section className="entry-registration-card entry-registration-choice">
        <div className="entry-step-kicker">
          <UserRound className="h-4 w-4" />
          hoş geldin
        </div>
        <h1 className="mt-4 text-3xl font-black leading-none tracking-[-0.04em] sm:text-4xl">
          İyi ki geldin.
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground/60">
          Birbirimizi tanıyarak başlayalım. Profilin varsa giriş yap, yoksa birlikte oluşturalım.
        </p>
        <div className="entry-choice-grid">
          <button
            type="button"
            onClick={() => setRegistrationPath("login")}
            className="entry-choice is-primary"
          >
            <span className="entry-choice-icon">
              <KeyRound />
            </span>
            <span>
              <span className="block text-lg font-black">Giriş yap</span>
              <span className="mt-1 block text-xs leading-5 text-foreground/55">
                Kullanıcı adı/e-posta ve şifrenle devam et.
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRegistrationPath("new");
              setRegistrationStep("standard");
            }}
            className="entry-choice"
          >
            <span className="entry-choice-icon">
              <UserRound />
            </span>
            <span>
              <span className="block text-lg font-black">Profil oluştur</span>
              <span className="mt-1 block text-xs leading-5 text-foreground/55">
                Etkinlik profilini burada hızlıca oluştur.
              </span>
            </span>
          </button>
        </div>
      </section>
    );
  }

  if (registrationPath === "login") {
    return (
      <section className="entry-registration-card">
        <button
          type="button"
          onClick={() => setRegistrationPath("choose")}
          className="text-xs font-black text-primary-deep"
        >
          ← seçeneklere dön
        </button>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">Profilinle devam et</h1>
        <p className="mt-2 text-sm leading-6 text-foreground/60">
          Sayfa değişmeden giriş yap; mevcut etkinlik kaydın varsa otomatik bulunur.
        </p>
        <div className="mt-5 grid gap-3">
          <QuickInput
            label="Kullanıcı adı veya e-posta"
            value={loginIdentity}
            onChange={setLoginIdentity}
          />
          <QuickInput
            label="Şifre"
            type="password"
            value={loginPassword}
            onChange={setLoginPassword}
          />
          <button
            type="button"
            onClick={() => setRegistrationPath("forgot")}
            className="justify-self-end text-sm font-black text-primary-deep hover:underline"
          >
            Şifremi unuttum
          </button>
          <ConsentBox
            checked={loginConsent}
            onChange={setLoginConsent}
            title="Etkinlik kaydımın ve profil cevaplarımın bu etkinliğin ntw ürünlerinde kullanılmasına açık rıza veriyorum."
          />
          <p className="text-xs leading-5 text-foreground/45">
            Girişten önce{" "}
            <Link to="/kvkk" className="font-black text-primary-deep underline">
              KVKK Aydınlatma Metni
            </Link>{" "}
            ve{" "}
            <Link to="/acik-riza" className="font-black text-primary-deep underline">
              Açık Rıza Metni
            </Link>
            ’ni inceleyebilirsin.
          </p>
        </div>
        {message ? (
          <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary-deep">
            {message}
          </p>
        ) : null}
        <button
          type="button"
          disabled={!loginIdentity.trim() || !loginPassword || !loginConsent || isSaving}
          onClick={() => void submitMemberLogin()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-black text-primary-foreground disabled:opacity-50"
        >
          {isSaving ? "Giriş yapılıyor…" : "Giriş yap ve devam et"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    );
  }

  if (registrationPath === "forgot") {
    return <PasswordResetRequest variant="event" onBack={() => setRegistrationPath("login")} />;
  }

  if (registrationStep === "standard") {
    return (
      <section className="entry-registration-card">
        <button
          type="button"
          onClick={() => setRegistrationPath("choose")}
          className="text-xs font-black text-primary-deep"
        >
          ← seçeneklere dön
        </button>
        <p className="entry-step-kicker mt-4">1 / 2 · temel bilgiler</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Etkinlik profilini oluştur</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <QuickInput
            label="Ad"
            value={form.firstName}
            onChange={(firstName) => setForm((current) => ({ ...current, firstName }))}
          />
          <QuickInput
            label="Soyad"
            value={form.lastName}
            onChange={(lastName) => setForm((current) => ({ ...current, lastName }))}
          />
          <QuickInput
            className="sm:col-span-2"
            label="E-posta"
            type="email"
            value={form.email}
            onChange={(email) => setForm((current) => ({ ...current, email }))}
          />
        </div>
        <label className="mt-4 block text-sm font-bold">
          Hangi Notwork etkinliğine katıldın?
          <select
            value={form.attendedEvent}
            onChange={(event) =>
              setForm((current) => ({ ...current, attendedEvent: event.target.value }))
            }
            className="mt-2 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-base outline-none focus:border-primary"
          >
            <option value="">Etkinliği seç</option>
            {activeEvent && !notworkEventOptions.some((item) => item.value === activeEvent.slug) ? (
              <option value={activeEvent.slug}>{activeEvent.title}</option>
            ) : null}
            {notworkEventOptions.map((eventOption) => (
              <option key={eventOption.value} value={eventOption.value}>
                {eventOption.label}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4">
          <h2 className="text-lg font-black">Neler yapabilirsin?</h2>
          <p className="mt-1 text-xs text-foreground/50">
            Eşleşmede kullanılacak en fazla 3 alan seç.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {offerSuggestions.map((offer) => (
              <button
                key={offer}
                type="button"
                onClick={() => toggleOffer(offer)}
                className={`rounded-full border px-3 py-2 text-sm font-bold ${form.offers.includes(offer) ? "border-primary bg-primary text-primary-foreground" : "border-primary/20 bg-primary/5"}`}
              >
                {offer}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={form.customOffer}
              onChange={(event) =>
                setForm((current) => ({ ...current, customOffer: event.target.value }))
              }
              maxLength={36}
              placeholder="Başka konu"
              className="min-w-0 flex-1 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={addCustomOffer}
              className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Ekle
            </button>
          </div>
        </div>
        <button
          type="button"
          disabled={!canContinueStandard}
          onClick={() => setRegistrationStep("event")}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-black text-primary-foreground disabled:opacity-50"
        >
          Etkinlik sorularına geç <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    );
  }

  return (
    <section className="entry-registration-card">
      <div className="entry-step-kicker">
        <UserRound className="h-4 w-4" />
        soru {eventQuestionIndex + 1} / 4
      </div>
      <h1 className="mt-4 text-3xl font-black leading-none tracking-[-0.04em] sm:text-4xl">
        Seni doğru kişilerle buluşturalım.
      </h1>
      <p className="mt-3 text-sm leading-6 text-foreground/60">
        Her ekranda tek soruyu yanıtla. Cevapların {activeEvent?.shortTitle || "etkinlik"} akışını
        sana göre hazırlasın.
      </p>

      <div key={eventQuestionIndex} className="entry-question-stage">
        {eventQuestionIndex === 0 && (
          <label className="entry-question-label">
            {registrationPrompts.introLabel}
            <textarea
              autoFocus
              value={form.intro}
              onChange={(event) =>
                setForm((current) => ({ ...current, intro: event.target.value }))
              }
              rows={4}
              placeholder={registrationPrompts.introPlaceholder}
            />
            <CharacterHint />
          </label>
        )}

        {eventQuestionIndex === 1 && (
          <label className="entry-question-label">
            {registrationPrompts.offersLabel}
            <textarea
              autoFocus
              value={form.offersDetail}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  offersDetail: event.target.value,
                }))
              }
              rows={4}
              placeholder={registrationPrompts.offersPlaceholder}
            />
            <CharacterHint />
          </label>
        )}

        {eventQuestionIndex === 2 && (
          <div>
            <label className="entry-question-label">
              {registrationPrompts.needsLabel}
              <textarea
                autoFocus
                value={form.needs}
                onChange={(event) =>
                  setForm((current) => ({ ...current, needs: event.target.value }))
                }
                rows={4}
                placeholder={registrationPrompts.needsPlaceholder}
              />
              <CharacterHint />
            </label>
            <p className="entry-question-helper">En yakın başlığı seç</p>
            <div className="entry-answer-chips">
              {needSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, needTag: tag }))}
                  className={form.needTag === tag ? "is-selected" : ""}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {eventQuestionIndex === 3 && (
          <div className="entry-consent-stage">
            <h2>Son bir onay</h2>
            <p>Metni açıkça okuyup tek onayla kaydını tamamlayabilirsin.</p>
            <ConsentBox
              checked={form.eventConsent}
              onChange={(eventConsent) => setForm((current) => ({ ...current, eventConsent }))}
              title="KVKK Aydınlatma Metni’ni okudum. Profil ve etkinlik cevaplarımın kaydımı oluşturmak, ntw.wordcloud, notwork match, ntw.five ve etkinlik kodu özelliklerini çalıştırmak için işlendiği konusunda bilgilendirildim."
            />
            <p className="entry-legal-copy">
              Onaylamadan önce <Link to="/kvkk">KVKK Aydınlatma Metni</Link>’nin tamamını
              okuyabilirsin.
            </p>
            <div className="entry-experience-choice" role="group" aria-label="Etkinlik deneyimi">
              <div>
                <strong>Etkinlik deneyimini seç</strong>
                <span>Bir seçim yapmadan kayıt tamamlanmaz.</span>
              </div>
              <button
                type="button"
                className={experienceChoice === "enhanced" ? "is-selected" : ""}
                aria-pressed={experienceChoice === "enhanced"}
                onClick={() => {
                  setExperienceChoice("enhanced");
                  setForm((current) => ({
                    ...current,
                    aiAnalysisConsent: true,
                    generalNetworkOptIn: true,
                  }));
                }}
              >
                <b>önerilen</b>
                <span>Gelişmiş network deneyimini aç</span>
                <small>AI destekli Match/Five analizi ve networking ağında görünürlük</small>
              </button>
              <button
                type="button"
                className={experienceChoice === "basic" ? "is-selected is-basic" : ""}
                aria-pressed={experienceChoice === "basic"}
                onClick={() => {
                  setExperienceChoice("basic");
                  setForm((current) => ({
                    ...current,
                    aiAnalysisConsent: false,
                    generalNetworkOptIn: false,
                  }));
                }}
              >
                <span>Temel deneyimle devam et</span>
                <small>Kurallı eşleştirme çalışır, profil networking ağında yayınlanmaz</small>
              </button>
            </div>
            <details className="entry-optional-consents">
              <summary>E-posta tercihi</summary>
              <p>Bu seçimi yapmadan da kaydını tamamlayabilirsin.</p>
              <ConsentBox
                checked={form.marketingOptIn}
                onChange={(marketingOptIn) =>
                  setForm((current) => ({ ...current, marketingOptIn }))
                }
                title="Etkinlik ve topluluk duyurularını e-posta ile almak istiyorum."
              />
              <p className="entry-legal-copy">
                Bu tercihler hakkında <Link to="/acik-riza">Açık Rıza Metni</Link>’ni
                inceleyebilirsin.
              </p>
            </details>
          </div>
        )}
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary-deep">
          {message}
        </p>
      ) : null}

      <div className="entry-question-actions">
        <button
          type="button"
          className="entry-question-back"
          onClick={() => {
            if (eventQuestionIndex === 0) setRegistrationStep("standard");
            else setEventQuestionIndex((current) => current - 1);
          }}
        >
          Geri
        </button>
        {eventQuestionIndex < 3 ? (
          <button
            type="button"
            disabled={!eventQuestionComplete[eventQuestionIndex]}
            className="entry-question-next"
            onClick={() => setEventQuestionIndex((current) => current + 1)}
          >
            Devam et <ArrowRight />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canSubmit || !eventQuestionComplete[3] || isSaving}
            onClick={() => void submitRegistration()}
            className="entry-question-next"
          >
            {isSaving ? "Kayıt oluşturuluyor…" : "Kaydı tamamla"}
            <Check />
          </button>
        )}
      </div>
    </section>
  );
}

function QuickInput({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`block text-sm font-bold ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-base outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function CharacterHint() {
  return (
    <span className="mt-1 block text-right text-[11px] font-bold text-foreground/45">
      İstediğin kadar yazabilir veya boş bırakabilirsin
    </span>
  );
}

function ConsentBox({
  checked,
  onChange,
  title,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
}) {
  return (
    <label className="flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm font-semibold leading-6">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-primary"
      />
      <span>{title}</span>
    </label>
  );
}
