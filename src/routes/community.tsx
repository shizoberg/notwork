import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Camera, MessageCircle, Play, Sparkles, Upload, Users } from "lucide-react";
import { InterviewReels } from "@/components/InterviewReels";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "notwork Community | İzmir Networking Club" },
      {
        name: "description",
        content:
          "notwork community; İzmir'de başarısızlık hikâyeleri, networking, etkinlik röportajları, galeri, WhatsApp topluluğu ve yeni etkinlik takvimi.",
      },
      { property: "og:title", content: "notwork Community | İzmir Networking Club" },
      {
        property: "og:description",
        content:
          "notwork community vibe: etkinlik fotoğrafları, röportajlar, topluluk ağı ve WhatsApp duyuru kanalı.",
      },
      { property: "og:url", content: "https://notwork.me/community" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
      { name: "twitter:title", content: "notwork Community | İzmir Networking Club" },
      {
        name: "twitter:description",
        content:
          "notwork topluluğunun fotoğrafları, röportajları, etkinlik takvimi ve bağlantıları.",
      },
      { name: "twitter:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/community" }],
  }),
  component: Community,
});

const whatsappCommunityUrl = "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE";

const galleryImages = Array.from({ length: 27 }, (_, index) => ({
  src: `/community/${index + 1}.jpg`,
  alt: `notwork community etkinlik fotoğrafı ${index + 1}`,
}));

const communityVideos = [
  {
    src: "/community/community-roportaj.mp4",
    title: "community yorumu",
  },
  {
    src: "/interviews/21-agustos-roportaj-1.mp4",
    title: "21 Ağustos röportajı 01",
  },
  {
    src: "/interviews/21-agustos-roportaj-2.mp4",
    title: "21 Ağustos röportajı 02",
  },
  {
    src: "/interviews/21-agustos-roportaj-3.mp4",
    title: "21 Ağustos röportajı 03",
  },
  {
    src: "/interviews/21-agustos-roportaj-4.mp4",
    title: "21 Ağustos röportajı 04",
  },
];

const communityStats = [
  { value: "126+", label: "networking ağı üyesi" },
  { value: "8", label: "geçmiş notwork gecesi" },
  { value: "1", label: "aktif WhatsApp topluluğu" },
];

const calendar = [
  {
    date: "yakında",
    title: "Yeni notwork gecesi",
    text: "Bir sonraki etkinlik tarihi ve konuşmacılar topluluk kanalında duyurulacak.",
  },
  {
    date: "her etkinlikte",
    title: "Match Lab + networking",
    text: "Katılımcılar kendini tanıtır, sistem doğru bağlantıları önerir ve sahada tanışma başlar.",
  },
  {
    date: "sonrasında",
    title: "Röportajlar ve yorumlar",
    text: "Etkinlikten çıkan hisleri, yorumları ve kısa videoları community arşivinde topluyoruz.",
  },
];

function Community() {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_32%),var(--background)]">
      <SiteNav />
      <main className="flex-1 overflow-hidden">
        <section className="mx-auto grid max-w-6xl gap-8 px-5 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
              <span className="h-2 w-2 rounded-full bg-primary" />
              community hub
            </div>
            <h1 className="mt-5 font-brand text-5xl leading-[0.85] tracking-[-0.08em] sm:text-7xl lg:text-8xl">
              notwork <span className="text-primary-deep">community</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              notwork sadece etkinlik günü buluşulan bir oda değil. Fotoğraflar, röportajlar,
              WhatsApp topluluğu, networking ağı ve yeni etkinlik duyurularıyla büyüyen bir
              community hissi.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappCommunityUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-black text-primary-foreground shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp community
              </a>
              <Link
                to="/networking"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-card px-6 py-3.5 font-black text-foreground transition hover:bg-primary/10"
              >
                <Users className="h-5 w-5" />
                Networking ağını gör
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-[2rem] border border-border bg-card/75 p-4 shadow-[var(--shadow-card)] backdrop-blur sm:grid-cols-3 lg:grid-cols-1">
            {communityStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-background p-5">
                <div className="font-display text-4xl font-black tracking-[-0.05em] text-primary-deep">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-bold text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pt-12 sm:pt-16" id="galeri">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-primary-deep">
                <Camera className="h-4 w-4" />
                fotoğraf galerisi
              </div>
              <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                odadaki enerji burada
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Etkinliklerden seçtiğimiz kareler. İnsanlar, sahne, sohbet ve o garip ama güzel
              notwork yakınlığı.
            </p>
          </div>
          <div className="grid auto-rows-[118px] grid-cols-2 gap-3 sm:auto-rows-[170px] sm:grid-cols-4 lg:grid-cols-6">
            {galleryImages.slice(0, 18).map((image, index) => (
              <figure
                key={image.src}
                className={`overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-sm ${index === 0 || index === 7 ? "col-span-2 row-span-2" : ""}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </figure>
            ))}
          </div>
        </section>

        <InterviewReels
          title="community röportajları"
          eyebrow="etkinlik sonrası"
          description="Kısa yorumlar sessiz döner; tıklayınca videoyu büyütüp sesli izleyebilirsin."
          videos={communityVideos}
        />

        <section className="mx-auto grid max-w-6xl gap-5 px-5 pt-14 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary-deep">
              <CalendarDays className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              etkinlik takvimi
            </h2>
            <p className="mt-4 text-muted-foreground">
              Yeni notwork geceleri, özel networking anları ve community duyuruları önce WhatsApp
              topluluğunda paylaşılır.
            </p>
            <a
              href={whatsappCommunityUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-black text-primary-foreground"
            >
              Duyuruları takip et
              <Sparkles className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-3">
            {calendar.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.6rem] border border-border bg-card p-5"
              >
                <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                  {item.date}
                </div>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pt-14 sm:pt-20">
          <div className="grid gap-4 rounded-[2rem] border border-primary/25 bg-primary/10 p-5 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                sahneye çıkmak isteyenlere
              </div>
              <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                sunum yükleme artık ayrı sayfada
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Hikâyeni sahneye taşımak istiyorsan sunum başlığını, hikâyeni ve iletişim
                bilgilerini ayrı formdan gönderebilirsin.
              </p>
            </div>
            <Link
              to="/sunum-yukle"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 font-black text-background transition hover:-translate-y-0.5"
            >
              <Upload className="h-5 w-5" />
              Sunum yükle
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pt-14 sm:pt-20">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-6 sm:p-9">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-primary-deep">
                  <Play className="h-4 w-4" />
                  community sistemi
                </div>
                <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                  etkinlikten sonra da bağ kopmasın
                </h2>
                <p className="mt-4 text-muted-foreground">
                  notwork’te amaç sadece kartvizit değişmek değil; aynı hikâyeyi dinleyen insanların
                  birbirini bulmasını kolaylaştırmak. Networking ağına kayıt ol, WhatsApp
                  topluluğundan duyuruları takip et, sonraki etkinliklerde tekrar buluş.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/notwork-nedir"
                    className="rounded-full border border-border px-5 py-3 text-center font-black"
                  >
                    notwork nedir?
                  </Link>
                  <Link
                    to="/etkinlikler"
                    className="rounded-full border border-border px-5 py-3 text-center font-black"
                  >
                    geçmiş etkinlikler
                  </Link>
                </div>
              </div>
              <div className="grid min-h-[280px] grid-cols-2 gap-2 bg-primary/10 p-3">
                {galleryImages.slice(18, 26).map((image) => (
                  <img
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full min-h-28 rounded-2xl object-cover"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
