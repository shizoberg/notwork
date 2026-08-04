import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Gamepad2, MessageCircle, Network, Star, Vote } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/linkler")({
  head: () => ({
    meta: [
      { title: "notwork Linkler | 21 Ağustos Etkinlik Girişi" },
      {
        name: "description",
        content:
          "notwork 21 Ağustos etkinlik giriş sayfası: anket, Notworking Match Lab, WhatsApp ve interaktif oyun bağlantıları.",
      },
      { property: "og:title", content: "notwork 21 Ağustos linkler" },
      { property: "og:url", content: "https://notwork.me/linkler" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/linkler" }],
  }),
  component: LinksPage,
});

const eventLinks = [
  {
    title: "Anket",
    description: "Sahnedeki WordCloud için kısa cevaplarını bırak.",
    href: "/21-agustos/wordcloud",
    icon: Vote,
  },
  {
    title: "Notworking Match Lab",
    description: "Network kodunu oluştur, eşleşmeni bul ve yeni kişilerle tanış.",
    href: "/21-agustos/network",
    icon: Network,
  },
  {
    title: "Etkinlik Yorumu",
    description: "21 Ağustos etkinliğini puanla; yorum ve fotoğraf ekle.",
    href: "/etkinlik-degerlendirme?event=21-agustos-2026",
    icon: Star,
  },
];

const externalLinks = [
  {
    title: "İnteraktif Oyun MentiMeter",
    description: "Canlı oyuna katıl",
    href: "https://www.menti.com/al2y33r8a21w",
    icon: Gamepad2,
  },
  {
    title: "WhatsApp Topluluğu",
    description: "Topluluğa katıl ve duyuruları takip et",
    href: "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE",
    icon: MessageCircle,
  },
];

function LinksPage() {
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentWarning, setShowConsentWarning] = useState(false);

  useEffect(() => {
    setHasConsent(localStorage.getItem("notwork-21-agustos-link-consent") === "true");
  }, []);

  const updateConsent = (checked: boolean) => {
    setHasConsent(checked);
    setShowConsentWarning(false);
    localStorage.setItem("notwork-21-agustos-link-consent", checked ? "true" : "false");
  };

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
              21 Ağustos etkinlik giriş ekranı
            </p>
          </header>

          <section className="mt-5 rounded-[1.5rem] border border-primary/20 bg-primary/8 p-4 shadow-sm sm:p-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(event) => updateConsent(event.target.checked)}
                className="mt-1 h-5 w-5 rounded border-primary/40 accent-primary"
              />
              <span className="text-sm font-semibold leading-6 text-foreground/70">
                <Link to="/kvkk" className="font-black text-primary-deep underline">
                  KVKK Aydınlatma Metni
                </Link>
                ’ni okudum; etkinlik bağlantılarını kullanırken verdiğim bilgilerin ilgili akışlarda
                işlenmesini ve paylaşılmasını onaylıyorum.
              </span>
            </label>
            {showConsentWarning ? (
              <p className="mt-3 rounded-2xl bg-primary/15 px-3 py-2 text-xs font-bold text-primary-deep">
                Devam etmek için önce KVKK onay kutusunu işaretle.
              </p>
            ) : null}
          </section>

          <section className="mt-5 grid gap-3">
            {eventLinks.map(({ title, description, href, icon: Icon }) => (
              <a
                key={title}
                href={href}
                onClick={(event) => {
                  if (!hasConsent) {
                    event.preventDefault();
                    setShowConsentWarning(true);
                  }
                }}
                aria-disabled={!hasConsent}
                className={`group flex items-center gap-3 rounded-[1.35rem] border bg-card p-3 shadow-sm transition sm:p-4 ${
                  hasConsent
                    ? "border-primary/25 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-lg hover:shadow-primary/10"
                    : "border-border opacity-75"
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
                  {hasConsent ? "Başla" : "Onayla"}
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
                <ExternalLink
                  size={18}
                  className="shrink-0 text-foreground/35 transition group-hover:text-primary-deep"
                />
              </a>
            ))}
          </section>

          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-foreground/45">
            Demo sürecinde 21 Ağustos akışları test verisiyle denenebilir. Gerçek katılımcı
            bilgilerinde KVKK onayı zorunludur.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
