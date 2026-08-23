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

const galleryImageOrder = [2, 3, 8, 19, 20, 25, 26, 27, 24, 23, 14, 21, 13, 7, 9, 12, 15];

const galleryImages = galleryImageOrder.map((imageNumber) => ({
  src: `/community/${imageNumber}.jpg`,
  alt: `notwork community etkinlik fotoğrafı ${imageNumber}`,
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
  { value: "500+", label: "notwork community üyesi" },
  { value: "20+", label: "notwork buluşması" },
  { value: "27", label: "community fotoğrafı" },
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
        <section className="mx-auto grid max-w-6xl gap-5 px-5 pt-7 sm:gap-8 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <h1 className="font-brand text-[3rem] leading-[0.98] tracking-[-0.035em] sm:text-7xl sm:tracking-[-0.045em] lg:text-8xl">
              notwork <span className="text-primary-deep">community</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-xl">
              notwork; fotoğraflar, röportajlar, WhatsApp topluluğu ve networking ağıyla etkinlik
              sonrasında da yaşayan bir community.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
              <a
                href={whatsappCommunityUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 sm:px-6 sm:py-3.5 sm:text-base"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp community
              </a>
              <a
                href="#galeri"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-card px-5 py-3 text-sm font-black text-foreground transition hover:bg-primary/10 sm:px-6 sm:py-3.5 sm:text-base"
              >
                <Camera className="h-5 w-5" />
                Galeriye geç
              </a>
              <Link
                to="/networking"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-card px-5 py-3 text-sm font-black text-foreground transition hover:bg-primary/10 sm:px-6 sm:py-3.5 sm:text-base"
              >
                <Users className="h-5 w-5" />
                Networking ağını gör
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] border border-border bg-card/75 p-2.5 shadow-[var(--shadow-card)] backdrop-blur sm:gap-3 sm:rounded-[2rem] sm:p-4 lg:grid-cols-1">
            {communityStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-background p-3 sm:rounded-3xl sm:p-5">
                <div className="font-display text-2xl font-black tracking-[-0.05em] text-primary-deep sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-[10px] font-bold leading-tight text-muted-foreground sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-9 sm:pt-16" id="galeri">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-primary-deep">
                <Camera className="h-4 w-4" />
                fotoğraf galerisi
              </div>
              <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                odadaki enerji, yüzler ve hikâyeler
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Etkinliklerden seçtiğimiz kareler. İnsanlar, sahne, sohbet ve o garip ama güzel
              notwork yakınlığı. Yana kaydırarak bakabilirsin.
            </p>
          </div>
          <div className="-mx-5 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-3">
              {galleryImages.map((image, index) => (
                <figure
                  key={image.src}
                  className={`h-44 w-72 shrink-0 overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-sm sm:h-56 ${index % 6 === 0 ? "sm:w-[28rem]" : "sm:w-80"}`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition duration-500 hover:scale-105"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>

        <InterviewReels
          title="community röportajları"
          eyebrow="etkinlik sonrası"
          description="Kısa yorumlar sessiz döner; tıklayınca videoyu büyütüp sesli izleyebilirsin."
          videos={communityVideos}
        />

        <section className="mx-auto grid max-w-6xl gap-5 px-5 pt-14 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary-deep sm:h-14 sm:w-14">
              <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h2 className="mt-4 font-display text-3xl font-black tracking-[-0.04em] sm:mt-5 sm:text-5xl">
              etkinlik takvimi
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
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
                className="rounded-[1.6rem] border border-border bg-card p-4 sm:p-5"
              >
                <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                  {item.date}
                </div>
                <h3 className="mt-2 text-xl font-black tracking-[-0.03em] sm:text-2xl">
                  {item.title}
                </h3>
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

        <section className="mx-auto max-w-6xl px-5 pt-10 sm:pt-20">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-5 sm:p-9">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-primary-deep">
                  <Play className="h-4 w-4" />
                  community sistemi
                </div>
                <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                  etkinlikten sonra da bağ kopmasın
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
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
                  <a
                    href={whatsappCommunityUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-primary px-5 py-3 text-center font-black text-primary-foreground"
                  >
                    WhatsApp community
                  </a>
                </div>
              </div>
              <div className="overflow-x-auto bg-primary/10 p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:max-h-[360px]">
                <div className="flex w-max gap-2 lg:grid lg:w-auto lg:grid-cols-2">
                  {galleryImages.slice(0, 8).map((image) => (
                    <img
                      key={image.src}
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      className="h-28 w-44 shrink-0 rounded-2xl object-cover object-center sm:h-36 sm:w-56 lg:h-40 lg:w-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
