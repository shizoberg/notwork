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
import { SiteFooter, SiteNav } from "@/components/SiteNav";
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
import {
  getMyMemberProfile,
  loginMember,
  MemberProfileApiError,
} from "@/lib/member-profile-api";
import type { NotworkMemberProfile } from "@/lib/member-profile";
import { createNoIndexSeo } from "@/lib/seo";

export const Route = createFileRoute("/linkler")({
  head: () =>
    createNoIndexSeo({
      title: "notwork Etkinlik Girişi | ntw.wordcloud, ntw.matchlab ve ntw.five",
      description:
        "notwork etkinlik katılımcıları için kayıt, ntw.wordcloud, ntw.matchlab, ntw.five, WhatsApp topluluğu ve etkinlik yorumu bağlantıları.",
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
    title: "ntw.matchlab",
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
  generalNetworkOptIn: boolean;
};

type RegistrationPath = "choose" | "login" | "new";
type RegistrationStep = "standard" | "event";

function LinksPage() {
  const [activeEvent, setActiveEvent] = useState<NotworkEvent | null>(null);
  const [registration, setRegistration] = useState<EventNetworkRegistration | null>(null);
  const [memberProfile, setMemberProfile] = useState<NotworkMemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [registrationPath, setRegistrationPath] = useState<RegistrationPath>("choose");
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>("standard");
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
  const eventLinks = useMemo(() => {
    const productLinks = eventProductLinks.map((link) => {
      const product = activeEvent?.products[link.product];
      return {
        ...link,
        title: product?.label || link.title,
        href: withEventSelection(link.href, eventSelection),
        enabled: product
          ? product.enabled && product.visible && product.state !== "disabled"
          : true,
        order: product?.order || (link.product === "five" ? 1 : link.product === "wordcloud" ? 2 : 3),
      };
    }).sort((left, right) => left.order - right.order);
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
  }, [activeEvent, eventSelection]);
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
    marketingOptIn: true,
    eventConsent: false,
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
      marketingOptIn: data.profile.marketingOptIn,
      generalNetworkOptIn: data.profile.generalNetworkOptIn,
      eventConsent: true,
    }));
  }

  function applyMemberProfile(profile: NotworkMemberProfile, fallbackEvent?: string) {
    const [firstName = "", ...lastNameParts] = profile.name.trim().split(/\s+/);
    setMemberProfile(profile);
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
    setRegistrationStep("event");
  }

  useEffect(() => {
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
      let loadedRegistration = false;
      const token = localStorage.getItem(activeTokenStorageKey);
      if (token) {
        try {
          if (active) applyRegistration(await getEventNetworkMe(token, selection), selectedEvent?.slug);
          loadedRegistration = true;
        } catch {
          localStorage.removeItem(activeTokenStorageKey);
        }
      }

      let profile: NotworkMemberProfile | null = null;
      try {
        profile = await getMyMemberProfile();
        if (active) setMemberProfile(profile);
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

      if (active) setIsLoading(false);
    }

    void loadRegistration();
    return () => {
      active = false;
    };
  }, []);

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.firstName.trim() &&
        form.lastName.trim() &&
        form.email.includes("@") &&
        form.attendedEvent &&
        form.intro.trim().length >= 140 &&
        form.offersDetail.trim().length >= 140 &&
        form.needs.trim().length >= 140 &&
        form.offers.length > 0 &&
        form.eventConsent &&
        form.generalNetworkOptIn,
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
          eventConsent: form.eventConsent,
        },
        eventSelection,
      );

      if (data.accessToken) localStorage.setItem(tokenStorageKey, data.accessToken);
      setRegistration(data);
      setMessage(
        data.membership?.verifiedMember
          ? "Kayıt tamamlandı. Etkinlik katılımcısı üyeliğin otomatik doğrulandı; kodun hazır."
          : "Kayıt tamamlandı. Kodun hazır; şimdi ntw.wordcloud veya ntw.matchlab’e geçebilirsin.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kayıt tamamlanamadı.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitMemberLogin() {
    if (!loginConsent) return;
    setIsSaving(true);
    setMessage("");
    try {
      const profile = await loginMember(loginIdentity.trim(), loginPassword);
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

  const hasRegistration = Boolean(registration);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav variant="event" />
      <main className="px-4 py-5 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <header className="text-center sm:text-left">
            <a href="/" className="inline-flex items-center gap-2 font-brand text-3xl">
              <span className="h-3 w-3 rounded-full bg-primary" />
              notwork
            </a>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
              {activeEvent?.shortTitle || "notwork etkinlik giriş ekranı"}
            </p>
          </header>

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
              memberProfile={memberProfile}
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
            />
          ) : null}

          {hasRegistration && registration ? (
            <section className="mt-5 rounded-[2rem] border border-primary/25 bg-primary/10 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
                    Kayıt tamamlandı
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
                    Merhaba {registration.profile.firstName}, kodun hazır.
                  </h1>
                </div>
                <div className="rounded-3xl bg-primary px-5 py-3 text-4xl font-black tracking-[-0.08em] text-primary-foreground">
                  {registration.participant.publicCode}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/60">
                Bu kod ntw.matchlab’de seni bulmamızı sağlar. Kayıt, {registration.profile.email} ve
                <strong className="ml-1 text-foreground">
                  @{registration.membership?.username || registration.profile.username}
                </strong>
                kullanıcı adına bağlıdır; profil oturumunla başka bir cihazda da devam edebilirsin.
              </p>
              {registration.membership?.source === "event-qr" ? (
                <div className="mt-3 rounded-2xl border border-primary/25 bg-background/75 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-deep">
                    Etkinlik QR üyesi
                  </p>
                  <p className="mt-1 text-xs leading-5 text-foreground/55">
                    Bu etkinlik girişinden geldiğin için profilin admin onayı beklemeden doğrulandı.
                    Kullanıcı adın @{registration.membership.username}.
                  </p>
                </div>
              ) : null}
              <div className="mt-4 rounded-2xl border border-primary/20 bg-background/70 p-4">
                <p className="text-sm font-black text-primary-deep">
                  İlk etkinlik hissini ve ortam/selfie fotoğrafını da bekliyoruz.
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground/55">
                  Kısa yorumun etkinlik sonrası notwork sayfasında görünebilir; fotoğraf görevi
                  ntw.matchlab gruplarında rastgele bir kişiye atanır.
                </p>
                <a
                  href={
                    activeEvent
                      ? `/etkinlik-degerlendirme?event=${encodeURIComponent(activeEvent.slug)}`
                      : "/etkinlik-degerlendirme?event=21-agustos-2026"
                  }
                  className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground"
                >
                  ilk yorumumu bırak
                </a>
              </div>
              {message ? (
                <p className="mt-3 rounded-2xl bg-background/70 px-4 py-3 text-sm font-bold text-primary-deep">
                  {message}
                </p>
              ) : null}
            </section>
          ) : null}

          <section className="mt-5 grid gap-3">
            {eventLinks.map(({ title, description, href, icon: Icon, enabled }) => (
              <a
                key={title}
                href={href}
                onClick={(event) => {
                  if (!enabled) {
                    event.preventDefault();
                    setMessage(`${title}, bu etkinlikte henüz aktif değil.`);
                  } else if (!hasRegistration) {
                    event.preventDefault();
                    setMessage(
                      "Önce kısa kayıt ve KVKK onayını tamamla; sonra bu alana geçebilirsin.",
                    );
                  }
                }}
                aria-disabled={!hasRegistration || !enabled}
                className={`group flex items-center gap-3 rounded-[1.35rem] border bg-card p-3 shadow-sm transition sm:p-4 ${
                  hasRegistration && enabled
                    ? "border-primary/25 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-lg hover:shadow-primary/10"
                    : "border-border opacity-60"
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary-deep transition group-hover:bg-primary group-hover:text-primary-foreground sm:h-14 sm:w-14">
                  <Icon size={25} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-black tracking-[-0.03em] sm:text-xl">
                    {title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-foreground/55 sm:text-sm">
                    {description}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-primary px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.12em] text-primary-foreground sm:px-4">
                  {!enabled ? "Kapalı" : hasRegistration ? "Başla" : "Kayıt"}
                </span>
              </a>
            ))}
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

          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-foreground/45">
            Bu giriş ekranı ntw.wordcloud, ntw.matchlab ve genel notwork networking ağı için
            kullanılacak temel profilini oluşturur.
          </p>
        </div>
      </main>
      <SiteFooter />
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
  memberProfile,
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
}: {
  form: LinkRegistrationForm;
  setForm: React.Dispatch<React.SetStateAction<LinkRegistrationForm>>;
  canSubmit: boolean;
  isSaving: boolean;
  message: string;
  toggleOffer: (offer: string) => void;
  addCustomOffer: () => void;
  submitRegistration: () => Promise<void>;
  memberProfile: NotworkMemberProfile | null;
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
}) {
  if (registrationPath === "choose") {
    return (
      <section className="mt-5 rounded-[2rem] border border-primary/25 bg-card p-5 shadow-xl shadow-primary/10 sm:p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary-deep">
          <UserRound className="h-4 w-4" />
          etkinlik girişi
        </div>
        <h1 className="mt-4 text-3xl font-black leading-none tracking-[-0.04em] sm:text-4xl">
          Daha önce notwork profili oluşturdun mu?
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground/60">
          Kayıtlı üyeler aynı ekranda giriş yapar. Yeni katılımcılar önce temel bilgilerini, sonra
          bu etkinliğe özel soruları yanıtlar.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRegistrationPath("login")}
            className="flex min-h-28 flex-col items-start justify-between rounded-[1.5rem] border border-primary/35 bg-primary/10 p-4 text-left transition hover:border-primary hover:bg-primary/15"
          >
            <KeyRound className="h-6 w-6 text-primary-deep" />
            <span>
              <span className="block text-lg font-black">Kayıtlıyım</span>
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
            className="flex min-h-28 flex-col items-start justify-between rounded-[1.5rem] border border-border bg-background p-4 text-left transition hover:border-primary"
          >
            <UserRound className="h-6 w-6 text-primary-deep" />
            <span>
              <span className="block text-lg font-black">Kayıtlı değilim</span>
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
      <section className="mt-5 rounded-[2rem] border border-primary/25 bg-card p-5 shadow-xl shadow-primary/10 sm:p-6">
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
          <ConsentBox
            checked={loginConsent}
            onChange={setLoginConsent}
            title="KVKK Aydınlatma Metni’ni okudum; etkinlik kaydımın ve profil bilgilerimin bu etkinlik ürünlerinde kullanılmasını onaylıyorum."
          />
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

  if (registrationStep === "standard") {
    return (
      <section className="mt-5 rounded-[2rem] border border-primary/25 bg-card p-5 shadow-xl shadow-primary/10 sm:p-6">
        <button
          type="button"
          onClick={() => setRegistrationPath("choose")}
          className="text-xs font-black text-primary-deep"
        >
          ← seçeneklere dön
        </button>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-primary-deep">
          1 / 2 · temel bilgiler
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Etkinlik profilini oluştur</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <QuickInput label="Ad" value={form.firstName} onChange={(firstName) => setForm((current) => ({ ...current, firstName }))} />
          <QuickInput label="Soyad" value={form.lastName} onChange={(lastName) => setForm((current) => ({ ...current, lastName }))} />
          <QuickInput className="sm:col-span-2" label="E-posta" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} />
        </div>
        <label className="mt-4 block text-sm font-bold">
          Hangi Notwork etkinliğine katıldın?
          <select
            value={form.attendedEvent}
            onChange={(event) => setForm((current) => ({ ...current, attendedEvent: event.target.value }))}
            className="mt-2 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-base outline-none focus:border-primary"
          >
            <option value="">Etkinliği seç</option>
            {activeEvent && !notworkEventOptions.some((item) => item.value === activeEvent.slug) ? <option value={activeEvent.slug}>{activeEvent.title}</option> : null}
            {notworkEventOptions.map((eventOption) => <option key={eventOption.value} value={eventOption.value}>{eventOption.label}</option>)}
          </select>
        </label>
        <div className="mt-4">
          <h2 className="text-lg font-black">Neler yapabilirsin?</h2>
          <p className="mt-1 text-xs text-foreground/50">Eşleşmede kullanılacak en fazla 3 alan seç.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {offerSuggestions.map((offer) => (
              <button key={offer} type="button" onClick={() => toggleOffer(offer)} className={`rounded-full border px-3 py-2 text-sm font-bold ${form.offers.includes(offer) ? "border-primary bg-primary text-primary-foreground" : "border-primary/20 bg-primary/5"}`}>{offer}</button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={form.customOffer} onChange={(event) => setForm((current) => ({ ...current, customOffer: event.target.value }))} maxLength={36} placeholder="Başka konu" className="min-w-0 flex-1 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm outline-none" />
            <button type="button" onClick={addCustomOffer} className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Ekle</button>
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
    <section className="mt-5 rounded-[2rem] border border-primary/25 bg-card p-5 shadow-xl shadow-primary/10 sm:p-6">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary-deep">
        <UserRound className="h-4 w-4" />
        2 / 2 · etkinlik soruları
      </div>
      <h1 className="mt-4 text-3xl font-black leading-none tracking-[-0.04em] sm:text-4xl">
        {activeEvent?.shortTitle || "Bu etkinlik"} için son adım.
      </h1>
      <p className="mt-3 text-sm leading-6 text-foreground/60">
        Bu sorular etkinliğe özeldir ve admin panelinden her etkinlik için ayrı düzenlenir.
      </p>

      <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/10 p-3 text-xs font-semibold leading-5 text-foreground/65">
        Etkinlik alanındaki QR üzerinden bu özel kayıt butonunu kullanan katılımcılar, admin onayı
        beklemeden doğrulanmış Notwork etkinlik üyesi olarak eklenir.
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/8 p-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-deep">
            {memberProfile ? "Profil oturumu açık" : "Temel bilgiler tamamlandı"}
          </p>
          <p className="mt-1 text-xs leading-5 text-foreground/55">
            {memberProfile
              ? `@${memberProfile.username} ile devam ediyorsun.`
              : `${form.firstName} ${form.lastName} · ${form.email}`}
          </p>
        </div>
        <button type="button" onClick={() => setRegistrationStep("standard")} className="rounded-full border border-primary/30 bg-background px-4 py-2 text-xs font-black text-primary-deep">bilgileri düzenle</button>
      </div>

      <label className="mt-4 block text-sm font-bold">
        {registrationPrompts.introLabel}
        <textarea
          value={form.intro}
          onChange={(event) => setForm((current) => ({ ...current, intro: event.target.value }))}
          rows={5}
          minLength={140}
          maxLength={600}
          placeholder={registrationPrompts.introPlaceholder}
          className="mt-2 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <CharacterHint length={form.intro.length} />
      </label>

      <label className="mt-4 block text-sm font-bold">
        {registrationPrompts.offersLabel}
        <textarea
          value={form.offersDetail}
          onChange={(event) =>
            setForm((current) => ({ ...current, offersDetail: event.target.value }))
          }
          rows={5}
          minLength={140}
          maxLength={600}
          placeholder={registrationPrompts.offersPlaceholder}
          className="mt-2 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <CharacterHint length={form.offersDetail.length} />
      </label>

      <label className="mt-4 block text-sm font-bold">
        {registrationPrompts.needsLabel}
        <textarea
          value={form.needs}
          onChange={(event) => setForm((current) => ({ ...current, needs: event.target.value }))}
          rows={5}
          minLength={140}
          maxLength={600}
          placeholder={registrationPrompts.needsPlaceholder}
          className="mt-2 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <CharacterHint length={form.needs.length} />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {needSuggestions.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setForm((current) => ({ ...current, needTag: tag }))}
            className={`rounded-full border px-3 py-2 text-sm font-bold ${
              form.needTag === tag
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/20 bg-primary/5"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        <ConsentBox
          checked={form.eventConsent}
          onChange={(eventConsent) => setForm((current) => ({ ...current, eventConsent }))}
          title="KVKK metnini okudum; ntw.wordcloud, ntw.matchlab ve kod sistemi için bilgilerimin işlenmesini onaylıyorum."
        />
        <ConsentBox
          checked={form.generalNetworkOptIn}
          onChange={(generalNetworkOptIn) =>
            setForm((current) => ({ ...current, generalNetworkOptIn }))
          }
          title="Profilimin notwork networking ağında görünmesini ve eşleşme için kullanılmasını onaylıyorum."
        />
        <ConsentBox
          checked={form.marketingOptIn}
          onChange={(marketingOptIn) => setForm((current) => ({ ...current, marketingOptIn }))}
          title="Etkinlik ve topluluk duyurularını e-posta ile almak istiyorum."
        />
        <p className="text-xs leading-5 text-foreground/45">
          Ayrıntılar için{" "}
          <Link to="/kvkk" className="font-black text-primary-deep underline">
            KVKK Aydınlatma Metni
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
        disabled={!canSubmit || isSaving}
        onClick={() => void submitRegistration()}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-black text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Kayıt oluşturuluyor…" : "Etkinlik kaydımı tamamla"}
        <Check className="h-4 w-4" />
      </button>
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

function CharacterHint({ length }: { length: number }) {
  const remaining = Math.max(0, 140 - length);
  return (
    <span
      className={`mt-1 block text-right text-[11px] font-bold ${
        remaining === 0 ? "text-primary-deep" : "text-foreground/40"
      }`}
    >
      {remaining === 0 ? `${length}/600 · yeterli detay` : `en az ${remaining} karakter daha`}
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
