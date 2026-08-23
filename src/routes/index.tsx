import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import gallery2 from "@/assets/gallery/notwork-2.jpg";
import gallery3 from "@/assets/gallery/notwork-3.jpg";
import gallery4 from "@/assets/gallery/notwork-4.jpg";
import gallery5 from "@/assets/gallery/notwork-5.jpg";
import gallery6 from "@/assets/gallery/notwork-6.jpg";
import gallery8 from "@/assets/gallery/notwork-8.jpg";
import gallery9 from "@/assets/gallery/notwork-9.jpg";
import gallery10 from "@/assets/gallery/notwork-10.jpg";
import gallery12 from "@/assets/gallery/notwork-12.jpg";
import gallery13 from "@/assets/gallery/notwork-13.jpg";
import { InterviewReels } from "@/components/InterviewReels";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { averageRating, listEventReviews, type EventReview } from "@/lib/event-reviews";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    createSeo({
      title: "notwork | Network Club ve Başarısızlık Hikâyeleri",
      description:
        "notwork, İzmir’de başarısızlık hikâyelerinin anlatıldığı bir network club. Gerçek deneyimleri dinle, doğru dersleri çıkar ve yeni bağlantılar kur.",
      path: "/",
      keywords: [
        "İzmir network etkinliği",
        "İzmir networking event",
        "networking club İzmir",
        "girişimcilik hikâyeleri",
        "f*ckup nights İzmir",
      ],
    }),
  component: Landing,
});

const communityGalleryImageOrder = [2, 3, 8, 19, 20, 25, 26, 27, 24, 23, 14, 21, 13, 7, 9, 12, 15];

const gallery = [
  `/community/${communityGalleryImageOrder[0]}.jpg`,
  `/community/${communityGalleryImageOrder[1]}.jpg`,
  `/community/${communityGalleryImageOrder[2]}.jpg`,
  `/community/${communityGalleryImageOrder[3]}.jpg`,
  gallery13,
  `/community/${communityGalleryImageOrder[4]}.jpg`,
  `/community/${communityGalleryImageOrder[5]}.jpg`,
  gallery12,
  `/community/${communityGalleryImageOrder[6]}.jpg`,
  `/community/${communityGalleryImageOrder[7]}.jpg`,
  gallery2,
  `/community/${communityGalleryImageOrder[8]}.jpg`,
  gallery3,
  `/community/${communityGalleryImageOrder[9]}.jpg`,
  gallery4,
  `/community/${communityGalleryImageOrder[10]}.jpg`,
  gallery10,
  `/community/${communityGalleryImageOrder[11]}.jpg`,
  gallery9,
  `/community/${communityGalleryImageOrder[12]}.jpg`,
  gallery8,
  `/community/${communityGalleryImageOrder[13]}.jpg`,
  gallery6,
  `/community/${communityGalleryImageOrder[14]}.jpg`,
  gallery5,
  `/community/${communityGalleryImageOrder[15]}.jpg`,
  `/community/${communityGalleryImageOrder[16]}.jpg`,
];

const whatsappCommunityUrl = "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE";

const faq = [
  {
    q: "notwork tam olarak ne?",
    a: "İzmir'de düzenlenen, sadece deneyip de yapamadıklarımızı değil; bu başarısızlıklardan ne öğrendiğimizi ve nasıl başardığımızı paylaştığımız bir network eventi.",
  },
  {
    q: "Sahnede kimler var?",
    a: "Her event 4 konuşmacı ağırlıyor. Her biri 10 dakikada bir deneyimini, çıkardığı dersi ve dönüşümünü sunumla anlatıyor.",
  },
  {
    q: "Konu akışı nasıl seçiliyor?",
    a: "Üç kol üzerinden ilerliyoruz: kariyer, ilişki ve macera. Her eventte bu üç perspektiften farklı hayatlar dinliyoruz.",
  },
  {
    q: "Networking ne zaman?",
    a: "Sunumlar bittikten sonra. Öncesinde ısınmak için mikrofonu seyirciye uzatıp interaktif bir oyun oynuyoruz.",
  },
  {
    q: "Ben de sahneye çıkabilir miyim?",
    a: "Evet. Community sayfasından sunumunu ve hikâyeni gönder, sana WhatsApp'tan dönelim.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Benefits />
        <InterviewReels />
        <PastEvents />
        <EventReviewsFlow />
        <Tracks />
        <Gallery />
        <Nedir />
        <FAQ />
        <SubmitCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

const tracks = [
  {
    tag: "KARİYER",
    desc: "Başarmaya çalışırken arka planda dönenler: olmayan projeler, kaçan fırsatlar, görünmeyen bedeller, yanlış tercihler ve seni dönüştüren süreçler.",
    color: "#1e3a8a",
  },
  {
    tag: "İLİŞKİLER",
    desc: "İş ilişkileri ve arkadaşlıkta yapılan yanlışlar, yakınlık, kopuş, içte kalan şeyler ve iletişimi yeniden kurmanın yolları.",
    color: "#8b2c5c",
  },
  {
    tag: "MACERA",
    desc: "Seyahat hikâyeleri, deneyip paylaşamamış veya adım atılamamış farklı maceralar, cesaret edilmemiş yollar.",
    color: "#e8743b",
  },
];

const pastEvents = [
  {
    id: "21-agustos-2026",
    date: "21 Ağustos 2026",
    location: "House of Rene Lokal",
    title: "21 Ağustos notwork İzmir",
    text: "Rene Lokal’de başarısızlık hikâyeleri, MatchLab, WordCloud ve etkinlik sonrası networking akışıyla büyüyen notwork gecesi.",
    tags: ["MatchLab", "WordCloud", "Rene Lokal", "Networking"],
    href: "/21agustos",
    accent: "from-[#0f2f35] via-[#2f9aa5] to-[#8fcbd0]",
  },
  {
    id: "14-temmuz-2026",
    date: "14 Temmuz 2026",
    location: "Mahal Bomonti İzmir",
    title: "14 Temmuz notwork İzmir",
    text: "İnteraktif sahne, 4 sunucu, networking free time ve etkinlik günü topluluk ağıyla birlikte ilerleyen özel notwork gecesi.",
    tags: ["Konuşmacılar", "Program", "Konum", "Networking ağı"],
    href: "/14temmuz",
    accent: "from-[#142643] via-[#111827] to-[#0f172a]",
  },
  {
    id: "22-mayis",
    date: "22 Mayıs",
    location: "İstinyeArt İzmir",
    title: "notwork · Mayıs buluşması",
    text: "Kariyer ve üretim süreçlerinde olduramadıklarımızı, sonrasında kurulan yeni yolları konuştuğumuz samimi bir networking gecesi.",
    tags: ["Kariyer", "Üretim", "Networking"],
    accent: "from-[#173f68] via-[#265f73] to-[#8fcbd0]",
  },
  {
    id: "10-nisan",
    date: "10 Nisan",
    location: "İstinyeArt İzmir",
    title: "notwork · Nisan sahnesi",
    text: "İletişim, iş birlikleri ve yeni başlangıçlar üzerine; hatalardan öğrenilenleri sahneye taşıyan bir akşam.",
    tags: ["İletişim", "İş birliği", "Sahne"],
    accent: "from-[#5f2a4f] via-[#8b2c5c] to-[#e3a3bf]",
  },
  {
    id: "8-mart",
    date: "8 Mart",
    location: "İstinyeArt İzmir",
    title: "notwork · 8 Mart özel",
    text: "Farklı hayat deneyimlerinden gelen cesaret, kırılma noktaları ve yeniden başlama hikâyeleriyle güçlü bir buluşma.",
    tags: ["Deneyim", "Cesaret", "Topluluk"],
    accent: "from-[#7f1d1d] via-[#b23b3b] to-[#f3a46b]",
  },
  {
    id: "10-subat",
    date: "10 Şubat",
    location: "İstinyeArt İzmir",
    title: "notwork · Şubat gecesi",
    text: "Yeni yılın ilk büyük adımlarında; yanlış kararlar, yarım kalan işler ve onları dönüştüren dersler konuşuldu.",
    tags: ["Yeni başlangıç", "Dersler", "Bağlantı"],
    accent: "from-[#1e3a8a] via-[#2563eb] to-[#93c5fd]",
  },
  {
    id: "16-ocak",
    date: "16 Ocak",
    location: "İstinyeArt İzmir",
    title: "notwork · Ocak buluşması",
    text: "Planların tutmadığı, yolların değiştiği ve buna rağmen yeni kapıların açıldığı hikâyelerle yılın ritmi kuruldu.",
    tags: ["Plan", "Dönüşüm", "Network"],
    accent: "from-[#134e4a] via-[#0f766e] to-[#99f6e4]",
  },
  {
    id: "8-aralik",
    date: "8 Aralık",
    location: "İstinyeArt İzmir",
    title: "notwork · Aralık başlangıcı",
    text: "notwork ruhunu taşıyan ilk buluşmalardan biri; başarısızlık hikâyeleriyle tanışmayı kolaylaştıran sıcak bir akşam.",
    tags: ["Başlangıç", "Hikâye", "Tanışma"],
    accent: "from-[#3f2d1f] via-[#8a5a32] to-[#f2c078]",
  },
];

const eventMetaById = Object.fromEntries(pastEvents.map((event) => [event.id, event]));

const heroTitleVariants = ["networking club", "notworking club", "network community"];

function Hero() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayTitle, setDisplayTitle] = useState(heroTitleVariants[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timeoutId = 0;
    let cancelled = false;

    const typeNextTitle = (currentIndex: number) => {
      const currentTitle = heroTitleVariants[currentIndex];
      const nextIndex = (currentIndex + 1) % heroTitleVariants.length;
      const nextTitle = heroTitleVariants[nextIndex];

      const erase = (length: number) => {
        if (cancelled) return;
        if (length <= 0) {
          type(1, nextIndex, nextTitle);
          return;
        }
        setDisplayTitle(currentTitle.slice(0, length));
        timeoutId = window.setTimeout(() => erase(length - 1), 34);
      };

      const type = (length: number, nextTitleIndex: number, title: string) => {
        if (cancelled) return;
        setDisplayTitle(title.slice(0, length));
        if (length >= title.length) {
          setTitleIndex(nextTitleIndex);
          timeoutId = window.setTimeout(() => typeNextTitle(nextTitleIndex), 2200);
          return;
        }
        timeoutId = window.setTimeout(() => type(length + 1, nextTitleIndex, title), 58);
      };

      timeoutId = window.setTimeout(() => erase(currentTitle.length - 1), 1800);
    };

    typeNextTitle(0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-5 pt-6 sm:pt-12 pb-10 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/60">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary blink" />
          <span>Etkinlik duyurusu yakında sizlerle olacak</span>
        </div>

        <div className="mx-auto mt-3 h-px w-10 bg-primary" />

        <h1
          className="mt-3 font-display font-black tracking-[-0.05em] text-foreground text-balance break-keep text-[4rem] sm:text-7xl md:text-8xl lg:text-9xl leading-[0.82]"
          aria-label={heroTitleVariants[titleIndex]}
        >
          <span className="inline-block min-h-[1.65em] sm:min-h-[1.62em] md:min-h-[1.6em]">
            {displayTitle}
            <span className="ml-1 inline-block h-[0.78em] w-[0.08em] translate-y-[0.08em] animate-pulse rounded-full bg-primary align-baseline" />
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Başarısızlık hikayelerinden çıkarılmış doğru dersleri dinleyeceğin network club.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/notwork-nedir"
            className="inline-flex w-fit items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary-deep sm:px-6 sm:py-3"
          >
            notwork nedir?
          </Link>
          <a
            href={whatsappCommunityUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground transition hover:opacity-90 sm:px-6 sm:py-3"
          >
            WhatsApp duyuru kanalı
          </a>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-5 pb-6 sm:pb-12">
      <div className="mx-auto max-w-2xl w-full rounded-xl border border-border bg-card p-3 sm:p-5 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm sm:text-lg font-bold text-foreground/80 uppercase tracking-widest">
            Sana ne katacak?
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { tag: "Doğru Network", desc: "Doğru insanlarla tanışmak." },
            { tag: "Doğru Kişiler", desc: "Senin gibi deneyim paylaşan insanlarla bağ kurmak." },
            { tag: "Başarıya Nasıl Gidilir", desc: "Hataları başarıya çeviren yolları öğrenmek." },
          ].map((b) => (
            <div key={b.tag} className="rounded-lg border border-border bg-background p-2.5">
              <div className="font-display font-bold text-[10px] sm:text-sm tracking-tight text-primary-deep">
                {b.tag}
              </div>
              <div className="mt-1 h-px w-5 bg-primary/40" />
              <p className="mt-1.5 text-[10px] sm:text-xs text-foreground/80 leading-snug">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tracks() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-5 pb-8 sm:pb-16">
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm sm:text-lg font-bold text-foreground/80 uppercase tracking-[0.2em] leading-relaxed">
            BAŞARISIZLIK HİKAYELERİ
            <br />3 FARKLI AÇIDA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
          {tracks.map((t) => (
            <div
              key={t.tag}
              className="rounded-xl border p-3 sm:p-4"
              style={{ borderColor: `${t.color}30`, backgroundColor: `${t.color}08` }}
            >
              <div
                className="font-display font-bold text-lg sm:text-2xl tracking-tight"
                style={{ color: t.color }}
              >
                {t.tag}
              </div>
              <div className="mt-1.5 h-px w-10 opacity-40" style={{ backgroundColor: t.color }} />
              <p className="mt-2 text-xs sm:text-sm text-foreground/80 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto text-center">
          Her etkinlikte 3–4 konuk. Her gecede en az{" "}
          <span className="font-semibold" style={{ color: "#1e3a8a" }}>
            1 kariyer
          </span>
          ,{" "}
          <span className="font-semibold" style={{ color: "#8b2c5c" }}>
            1 ilişki/iletişim
          </span>{" "}
          ve{" "}
          <span className="font-semibold" style={{ color: "#e8743b" }}>
            1 macera
          </span>{" "}
          hikâyesi.
        </p>
      </div>
    </section>
  );
}

function Nedir() {
  const items = [
    {
      n: "01",
      t: "Başarısızlık hikayeleri dinleyeceksin.",
      d: "Gerçek deneyimler, kısa sunumlar ve çıkarılan net dersler.",
    },
    {
      n: "02",
      t: "3 hayat kolu",
      d: "Kariyer, ilişki ve macera tarafında farklı hikâyeler.",
    },
    {
      n: "03",
      t: "Isınma oyunu",
      d: "Sahneye geçmeden önce interaktif mini oyun.",
    },
    {
      n: "04",
      t: "Sonra networking",
      d: "Sunum sonrası tanışma ve doğru bağlantı zamanı.",
    },
  ];
  return (
    <section id="nedir" className="mx-auto max-w-6xl px-5 mt-14 sm:mt-24">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-5 sm:mb-8">
        <div>
          <div className="text-primary-deep font-medium text-sm uppercase tracking-widest">
            Bir notwork eventinde
          </div>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-5xl text-foreground max-w-2xl">
            Seni ne bekliyor?
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm sm:text-base">
          Kısa hikâyeler, interaktif akış ve gerçek tanışmalar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {items.map((i) => (
          <div
            key={i.n}
            className="rounded-2xl border border-border bg-card p-3 transition hover:border-primary/60 hover:shadow-[var(--shadow-card)] sm:p-5"
          >
            <div className="font-display text-primary text-xl font-bold sm:text-3xl">{i.n}</div>
            <div className="mt-2 font-display font-semibold text-sm leading-tight sm:text-lg">
              {i.t}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-snug sm:mt-2 sm:text-sm sm:leading-relaxed">
              {i.d}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PastEvents() {
  const [reviewsByEvent, setReviewsByEvent] = useState<Record<string, EventReview[]>>({});

  useEffect(() => {
    let active = true;
    listEventReviews()
      .then((reviews) => {
        if (!active) return;
        const grouped = reviews.reduce<Record<string, EventReview[]>>((acc, review) => {
          acc[review.eventId] = [...(acc[review.eventId] || []), review];
          return acc;
        }, {});
        setReviewsByEvent(grouped);
      })
      .catch(() => {
        if (active) setReviewsByEvent({});
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="etkinlikler" className="mx-auto max-w-6xl scroll-mt-24 px-5 mt-20 sm:mt-28">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-primary-deep font-medium text-sm uppercase tracking-widest">
            etkinlikler
          </div>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-5xl text-foreground">
            notwork geceleri
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Geçmiş notwork gecelerinden hikâyeleri, yorumları ve etkinlik arşivini burada topluyoruz.
        </p>
        <Link
          to="/etkinlikler"
          className="inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-black text-primary-deep transition hover:bg-primary hover:text-primary-foreground"
        >
          Tüm etkinlikleri gör
        </Link>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 pb-4 [scrollbar-width:thin]">
        <div className="flex snap-x gap-4">
          {pastEvents.map((event) => {
            const eventReviews = reviewsByEvent[event.id] || [];
            const eventAverage = averageRating(eventReviews);
            const eventPhoto = eventReviews.find((review) => review.photoDataUrl)?.photoDataUrl;
            const card = (
              <article className="group flex h-full min-h-[450px] w-[82vw] sm:min-h-[520px] max-w-sm snap-start flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-soft)] sm:w-[360px]">
                <div className="relative min-h-44 overflow-hidden bg-ink text-cream sm:min-h-56">
                  {eventPhoto && (
                    <img
                      src={eventPhoto}
                      alt={`${event.title} etkinlik fotoğrafı`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div
                    className={`absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--primary)_35%,transparent),transparent_32%)] bg-gradient-to-br ${event.accent} ${eventPhoto ? "mix-blend-multiply" : ""}`}
                  />
                  {eventPhoto && <div className="absolute inset-0 bg-ink/35" />}
                  <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[24px] border-primary/25" />
                  <div className="absolute -bottom-14 left-8 h-40 w-40 rounded-full border-[28px] border-primary/15" />
                  <div className="relative flex min-h-44 flex-col justify-between p-5 sm:min-h-56 sm:p-6">
                    <div className="inline-flex w-fit rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
                      {event.date}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                        {event.location}
                      </div>
                      <div className="mt-2 font-display text-4xl font-black leading-none tracking-[-0.05em]">
                        notwork
                        <br />
                        gecesi
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-deep">
                    Geçmiş event
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-black tracking-[-0.04em]">
                    {event.title}
                  </h3>
                  <p className="mt-4 flex-1 leading-relaxed text-muted-foreground">{event.text}</p>
                  {eventReviews.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3 sm:mt-5 sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-lg tracking-tight text-primary-deep">
                          {renderEventStars(Math.round(eventAverage))}
                        </div>
                        <div className="text-xs font-black text-primary-deep">
                          {eventAverage.toFixed(1)} / 5
                        </div>
                      </div>
                      <div className="mt-1 text-xs font-semibold text-foreground/50">
                        {eventReviews.length} değerlendirme
                      </div>
                      <div className="mt-3 grid max-h-20 gap-2 overflow-y-auto pr-1 [scrollbar-width:thin] sm:max-h-28">
                        {eventReviews.slice(0, 4).map((review) => (
                          <p
                            key={review.id}
                            className="rounded-xl bg-background/80 px-3 py-2 text-sm leading-relaxed text-foreground/65"
                          >
                            “{review.comment}”
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                    {event.tags.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border bg-background px-3 py-1.5"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 inline-flex items-center gap-2 font-bold text-primary-deep">
                    {event.href ? "Event sayfasına git" : "Arşiv kaydı"}
                    {event.href && <span className="transition group-hover:translate-x-1">→</span>}
                  </div>
                </div>
              </article>
            );

            return event.href ? (
              <Link key={event.date} to={event.href} className="shrink-0">
                {card}
              </Link>
            ) : (
              <div key={event.date} className="shrink-0">
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function renderEventStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

function EventReviewsFlow() {
  const [reviews, setReviews] = useState<EventReview[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    listEventReviews()
      .then((items) => {
        if (active) setReviews(items);
      })
      .catch(() => {
        if (active) setReviews([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (reviews.length === 0) return null;

  const sortedReviews = [...reviews].sort((first, second) => {
    const firstIsFeatured = first.name.toLocaleLowerCase("tr-TR").includes("yaren şen");
    const secondIsFeatured = second.name.toLocaleLowerCase("tr-TR").includes("yaren şen");
    if (firstIsFeatured !== secondIsFeatured) return firstIsFeatured ? -1 : 1;

    const photoPriority =
      Number(Boolean(second.photoDataUrl)) - Number(Boolean(first.photoDataUrl));
    if (photoPriority !== 0) return photoPriority;
    return second.createdAt.localeCompare(first.createdAt);
  });
  return (
    <section
      id="katilimci-yorumlari"
      className="mx-auto max-w-6xl scroll-mt-24 px-5 mt-20 sm:mt-28"
    >
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-primary-deep font-medium text-sm uppercase tracking-widest">
            katılımcı yorumları
          </div>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-5xl text-foreground">
            Etkinlikte ne söylendi?
          </h2>
        </div>
        <Link
          to="/etkinlik-degerlendirme"
          className="inline-flex w-fit rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
        >
          Etkinlik yorumla
        </Link>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 pb-4 [scrollbar-width:thin]">
        <div className="flex snap-x gap-4">
          {sortedReviews.map((review) => {
            const event = eventMetaById[review.eventId];
            const isExpanded = !!expandedReviews[review.id];
            const canExpand = review.comment.length > 170;
            return (
              <article
                key={review.id}
                className={`flex w-[82vw] max-w-sm shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition-all sm:w-[360px] ${
                  isExpanded ? "h-auto" : "h-[350px] sm:h-[460px]"
                }`}
              >
                {review.photoDataUrl && (
                  <img
                    src={review.photoDataUrl}
                    alt={`${review.eventTitle} yorumu`}
                    loading="lazy"
                    className="h-28 w-full shrink-0 object-cover object-center sm:h-44"
                  />
                )}
                <div className="flex flex-1 flex-col p-3.5 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base text-primary-deep sm:text-lg">
                      {renderEventStars(review.rating)}
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary-deep">
                      {event?.date || review.eventTitle}
                    </div>
                  </div>
                  <p
                    className={`mt-2 text-sm leading-relaxed text-foreground/75 sm:mt-4 sm:text-base ${
                      isExpanded ? "" : "line-clamp-3 sm:line-clamp-5"
                    }`}
                  >
                    “{review.comment}”
                  </p>
                  {canExpand && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedReviews((current) => ({
                          ...current,
                          [review.id]: !current[review.id],
                        }))
                      }
                      className="mt-3 w-fit text-sm font-black text-primary-deep hover:underline"
                    >
                      {isExpanded ? "Daha az göster" : "Devamını oku"}
                    </button>
                  )}
                  <div className="mt-auto border-t border-border pt-3 sm:pt-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/45">
                      {review.name || "notwork katılımcısı"}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {event?.title || review.eventTitle}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const loop = [...gallery, ...gallery];
  return (
    <section id="galeri" className="mt-20 sm:mt-28">
      <div className="mx-auto max-w-6xl px-5 mb-8">
        <h2 className="font-display font-bold text-2xl sm:text-4xl">Önceki eventlerden</h2>
      </div>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex gap-4 w-max marquee-track">
          {loop.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`notwork event anı ${i + 1}`}
              loading="lazy"
              width={1024}
              height={1024}
              className="h-56 sm:h-72 w-auto rounded-2xl object-cover shrink-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="mx-auto max-w-3xl px-5 mt-20 sm:mt-28">
      <h2 className="font-display font-bold text-3xl sm:text-4xl text-center">Sık sorulanlar</h2>
      <p className="mt-3 text-center text-muted-foreground">Aklında kalan her şey, hızlıca.</p>
      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        {faq.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="w-full text-left px-5 sm:px-6 py-5"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-display font-semibold text-base sm:text-lg">{q}</span>
        <span
          className={`shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary-deep flex items-center justify-center font-bold transition-transform ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </div>
      <div
        className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden text-muted-foreground leading-relaxed">{a}</div>
      </div>
    </button>
  );
}

function SubmitCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 mt-20 sm:mt-28">
      <div className="relative overflow-hidden rounded-3xl bg-ink text-cream p-8 sm:p-14">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-50"
          style={{ background: "var(--primary)" }}
        />
        <div className="relative max-w-2xl">
          <div className="text-primary font-medium uppercase tracking-widest text-sm">
            Sahneye çık
          </div>
          <h2 className="mt-3 font-display font-bold text-3xl sm:text-5xl leading-tight">
            Denedin, olmadı, sonra öğrendin ve başardın. Şimdi anlatma zamanı.
          </h2>
          <p className="mt-4 text-cream/75 max-w-lg">
            Sunumunu yükle, hikâyeni ve bu deneyimden çıkardığın dersi birkaç cümleyle anlat.
            WhatsApp üzerinden sana hızlıca dönüyoruz.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              to="/sunum-yukle"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Sunumu gönder →
            </Link>
            <a
              href="https://wa.me/905457210929?text=Merhaba%20notwork%2C%20etkinlik%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-cream/30 text-cream font-medium hover:bg-cream/10 transition"
            >
              WhatsApp mesajı gönder
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
