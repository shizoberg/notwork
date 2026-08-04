import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Gamepad2, MessageCircle, Network, Star, Vote } from "lucide-react";
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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav variant="event" />
      <main className="px-5 py-10 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <header className="text-center">
            <a href="/" className="inline-flex items-center gap-2 font-brand text-3xl">
              <span className="h-3 w-3 rounded-full bg-primary" />
              notwork
            </a>
            <p className="mt-3 text-sm font-semibold text-foreground/55">
              21 Ağustos etkinlik giriş ekranı
            </p>
            <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-black leading-none tracking-[-0.05em] sm:text-6xl">
              Anket mi, Notworking Match mi?
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-foreground/60">
              Etkinlikte ihtiyacın olan bağlantıyı buradan seç. Anket cevapların sahneye düşer;
              Match Lab ise seni etkinlik içindeki doğru kişilerle eşleştirir.
            </p>
          </header>

          <section className="mx-auto mt-8 max-w-xl rounded-2xl border border-primary/25 bg-primary/10 p-4 text-center shadow-sm">
            <p className="text-sm font-semibold leading-relaxed text-foreground/75">
              Mahal Bomonti İzmir’e bize katkılarından dolayı teşekkür ederiz. Destekleri için{" "}
              <span className="font-black text-primary-deep">@mahallbomontiizmir</span> hesabını
              takip etmenizi rica ederiz.
            </p>
            <a
              href="https://www.instagram.com/mahallbomontiizmir/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground transition hover:opacity-90"
            >
              Mahal Bomonti İzmir’i takip et
              <ExternalLink size={15} />
            </a>
          </section>

          <section className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {eventLinks.map(({ title, description, href, icon: Icon }) => (
              <a
                key={title}
                href={href}
                className="group rounded-[2rem] border border-primary/25 bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/70 hover:shadow-xl hover:shadow-primary/10"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary-deep transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={28} strokeWidth={1.8} />
                </span>
                <span className="mt-6 block text-2xl font-black tracking-[-0.03em]">{title}</span>
                <span className="mt-2 block text-sm leading-6 text-foreground/55">
                  {description}
                </span>
                <span className="mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary-foreground">
                  Başla
                </span>
              </a>
            ))}
          </section>

          <section className="mx-auto mt-8 grid max-w-xl gap-3">
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

          <p className="mx-auto mt-8 max-w-2xl rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-xs leading-5 text-foreground/55">
            Etkinlik bağlantılarını kullanarak ilgili form akışlarında verdiğin bilgilerin
            <Link to="/kvkk" className="mx-1 font-bold text-primary-deep underline">
              KVKK Aydınlatma Metni
            </Link>
            kapsamında işlenebileceğini kabul etmiş olursun. Zorunlu izin gereken alanlarda ayrıca
            onay kutusu gösterilir.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
