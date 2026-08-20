import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, ChevronRight, Maximize2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import type { EventNetworkRegistration } from "@/lib/event-network";
import { getEventNetworkMe, registerEventNetwork } from "@/lib/event-network-api";

const tokenStorageKey = "notwork_21_agustos_network_token";
const offerSuggestions = [
  "yazılım",
  "tasarım",
  "pazarlama",
  "satış",
  "finans",
  "içerik",
  "topluluk",
  "girişim",
  "hukuk",
  "kariyer",
  "yapay zeka",
  "operasyon",
];
const needSuggestions = ["iş", "ekip", "müşteri", "yatırım", "fikir", "tasarım", "teknoloji"];

export const Route = createFileRoute("/21-agustos/network")({
  head: () => ({
    meta: [
      { title: "21 Ağustos notwork Network Kaydı" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AugustNetworkPage,
});

function AugustNetworkPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [registration, setRegistration] = useState<EventNetworkRegistration | null>(null);
  const [fullScreenCard, setFullScreenCard] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    offers: [] as string[],
    customOffer: "",
    needs: "",
    needTag: "",
    generalNetworkOptIn: false,
    marketingOptIn: false,
    eventConsent: false,
  });

  useEffect(() => {
    const token = localStorage.getItem(tokenStorageKey);
    if (!token) return;
    void getEventNetworkMe(token)
      .then((data) => setRegistration(data))
      .catch(() => localStorage.removeItem(tokenStorageKey));
  }, []);

  const steps = ["Bilgiler", "Yapabildiklerin", "İhtiyacın", "İzinler"];
  const canContinue = useMemo(() => {
    if (step === 0) return form.firstName && form.lastName && form.email.includes("@");
    if (step === 1) return form.offers.length > 0;
    if (step === 2) return form.needs.trim().length > 5;
    return form.eventConsent;
  }, [form, step]);

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

  async function submit() {
    setSaving(true);
    setMessage("");
    try {
      const data = await registerEventNetwork({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        offers: form.offers,
        needs: form.needs,
        needTag: form.needTag,
        generalNetworkOptIn: form.generalNetworkOptIn,
        marketingOptIn: form.marketingOptIn,
        eventConsent: form.eventConsent,
      });
      if (data.accessToken) localStorage.setItem(tokenStorageKey, data.accessToken);
      await navigate({ to: "/linkler", replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kayıt tamamlanamadı.");
    } finally {
      setSaving(false);
    }
  }

  if (registration) {
    return (
      <div className="min-h-screen bg-[#f4fbfb] text-foreground">
        <SiteNav variant="event" />
        <main className="mx-auto max-w-xl px-5 py-8">
          <Link
            to="/linkler"
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary-deep shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Linklere geri dön
          </Link>
          <RegistrationCard
            registration={registration}
            fullScreen={fullScreenCard}
            onFullScreen={() => setFullScreenCard(true)}
            onClose={() => setFullScreenCard(false)}
          />
          <div className="mt-4 grid gap-3">
            <a
              href="/21-agustos/eslesme"
              className="rounded-full border border-primary/30 bg-white px-5 py-3 text-center text-sm font-bold text-primary-deep"
            >
              Eşleşmemi gör
            </a>
            <p className="rounded-2xl bg-white px-4 py-3 text-center text-sm text-foreground/55">
              Eşleşmeler admin tarafından yayımlandığında bu kodla seni bulacağız.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4fbfb] text-foreground">
      <SiteNav variant="event" />
      <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-xl flex-col px-5 py-8">
        <Link
          to="/linkler"
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary-deep shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Linklere geri dön
        </Link>
        <section className="rounded-[2rem] border border-primary/20 bg-white p-5 shadow-xl shadow-primary/10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-deep">
            <Users className="h-3.5 w-3.5" />
            21 Ağustos ağı
          </div>
          <h1 className="mt-5 font-display text-4xl font-black leading-none tracking-[-0.04em]">
            Network kodunu
            <br />
            oluştur
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground/60">
            Birkaç kısa adımda kendini ekle; etkinlikte seni büyük kodunla bulalım.
          </p>
        </section>

        <section className="mt-5 flex-1 rounded-[2rem] border border-primary/20 bg-white p-5 shadow-lg shadow-primary/10">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => index <= step && setStep(index)}
                className={`rounded-2xl px-2 py-2 text-[11px] font-bold ${
                  index === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary-deep"
                }`}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>

          {step === 0 ? (
            <div className="mt-6 grid gap-3">
              <NetworkInput
                label="Ad"
                value={form.firstName}
                onChange={(firstName) => setForm({ ...form, firstName })}
              />
              <NetworkInput
                label="Soyad"
                value={form.lastName}
                onChange={(lastName) => setForm({ ...form, lastName })}
              />
              <NetworkInput
                label="E-posta"
                type="email"
                value={form.email}
                onChange={(email) => setForm({ ...form, email })}
              />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-6">
              <h2 className="text-xl font-black">Hangi konularda yardımcı olabilirsin?</h2>
              <p className="mt-1 text-sm text-foreground/55">En fazla 3 konu seç.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {offerSuggestions.map((offer) => (
                  <button
                    key={offer}
                    type="button"
                    onClick={() => toggleOffer(offer)}
                    className={`rounded-full border px-3 py-2 text-sm font-bold ${
                      form.offers.includes(offer)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/20 bg-primary/5"
                    }`}
                  >
                    {offer}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={form.customOffer}
                  onChange={(event) => setForm({ ...form, customOffer: event.target.value })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomOffer();
                    }
                  }}
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
          ) : null}

          {step === 2 ? (
            <div className="mt-6">
              <h2 className="text-xl font-black">Neye ihtiyacın var?</h2>
              <textarea
                value={form.needs}
                onChange={(event) => setForm({ ...form, needs: event.target.value })}
                maxLength={220}
                rows={5}
                placeholder="Uzun zamandır başlayamadığın veya destek aradığın şeyi kısa yaz."
                className="mt-4 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {needSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setForm({ ...form, needTag: tag })}
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
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-6 grid gap-3">
              <ConsentBox
                checked={form.eventConsent}
                onChange={(eventConsent) => setForm({ ...form, eventConsent })}
                title="Etkinlik eşleştirmesi için bilgilerimin kullanılmasını onaylıyorum."
                required
              />
              <ConsentBox
                checked={form.generalNetworkOptIn}
                onChange={(generalNetworkOptIn) => setForm({ ...form, generalNetworkOptIn })}
                title="Profilim genel notwork ağında da görünebilir."
              />
              <ConsentBox
                checked={form.marketingOptIn}
                onChange={(marketingOptIn) => setForm({ ...form, marketingOptIn })}
                title="Etkinlik ve topluluk e-postalarını almak istiyorum."
              />
              <p className="text-xs leading-relaxed text-foreground/45">
                Etkinlik eşleştirmesi için verdiğin bilgilerin işlenmesini, görünmesini seçtiğin
                alanlarda kullanılmasını ve{" "}
                <Link to="/kvkk" className="font-bold text-primary-deep underline">
                  KVKK Aydınlatma Metni
                </Link>{" "}
                kapsamında bilgilendirildiğini kabul edersin.
              </p>
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              {message}
            </div>
          ) : null}

          <div className="mt-6 flex gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="rounded-full border border-primary/25 px-5 py-3 text-sm font-bold"
              >
                Geri
              </button>
            ) : null}
            <button
              type="button"
              disabled={!canContinue || saving}
              onClick={() => (step < 3 ? setStep(step + 1) : void submit())}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step < 3 ? "Devam" : saving ? "Kaydediliyor..." : "Kaydımı tamamla"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function NetworkInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-base outline-none focus:border-primary"
      />
    </label>
  );
}

function ConsentBox({
  checked,
  onChange,
  title,
  required = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  required?: boolean;
}) {
  return (
    <label className="flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1"
      />
      <span>{title}</span>
    </label>
  );
}

function RegistrationCard({
  registration,
  fullScreen,
  onFullScreen,
  onClose,
}: {
  registration: EventNetworkRegistration;
  fullScreen: boolean;
  onFullScreen: () => void;
  onClose: () => void;
}) {
  const content = (
    <div className="rounded-[2rem] border border-primary/20 bg-white p-6 text-center shadow-xl shadow-primary/10">
      <div className="text-xs font-black uppercase tracking-[0.28em] text-primary-deep">
        network kodun
      </div>
      <div className="mt-3 font-display text-8xl font-black leading-none tracking-[-0.08em] text-primary-deep">
        {registration.participant.publicCode}
      </div>
      <h1 className="mt-5 text-2xl font-black">
        {registration.profile.firstName} {registration.profile.lastName}
      </h1>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {registration.offers.map((offer) => (
          <span
            key={offer}
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-deep"
          >
            {offer}
          </span>
        ))}
      </div>
      <p className="mt-5 rounded-2xl bg-primary/5 px-4 py-3 text-sm text-foreground/60">
        İhtiyaç: {registration.needs}
      </p>
      {!fullScreen ? (
        <button
          type="button"
          onClick={onFullScreen}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          <Maximize2 className="h-4 w-4" />
          Kartı tam ekran göster
        </button>
      ) : (
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-full border border-primary/25 px-5 py-3 text-sm font-bold"
        >
          Kapat
        </button>
      )}
    </div>
  );

  if (!fullScreen) return content;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#f4fbfb] p-5">{content}</div>
  );
}
