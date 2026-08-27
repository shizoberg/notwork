import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

const communityGalleryImageOrder = [25, 24, 23, 21, 20, 19, 2, 3, 27, 26, 8, 14, 13, 7, 9, 12, 15];

const gallery = [
  ...communityGalleryImageOrder.slice(0, 8).map((imageNumber) => `/community/${imageNumber}.jpg`),
  gallery13,
  `/community/${communityGalleryImageOrder[8]}.jpg`,
  gallery12,
  `/community/${communityGalleryImageOrder[9]}.jpg`,
  gallery2,
  `/community/${communityGalleryImageOrder[10]}.jpg`,
  gallery3,
  `/community/${communityGalleryImageOrder[11]}.jpg`,
  gallery4,
  `/community/${communityGalleryImageOrder[12]}.jpg`,
  gallery10,
  `/community/${communityGalleryImageOrder[13]}.jpg`,
  gallery9,
  `/community/${communityGalleryImageOrder[14]}.jpg`,
  gallery8,
  `/community/${communityGalleryImageOrder[15]}.jpg`,
  gallery6,
  `/community/${communityGalleryImageOrder[16]}.jpg`,
  gallery5,
];

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
        <Nedir />
        <InterviewReels />
        <PastEvents />
        <EventReviewsFlow />
        <Tracks />
        <Gallery />
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
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 text-center sm:px-5 sm:pb-10 sm:pt-10">
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/60">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary blink" />
          <span>Etkinlikler: 17 Eylül · Chill &amp; Chat, 9 Ekim · notwork Classic</span>
        </div>

        <div className="mx-auto mt-3 h-px w-10 bg-primary" />

        <h1
          className="mt-3 text-balance break-keep font-display text-[3.5rem] font-black leading-[0.82] tracking-[-0.05em] text-foreground sm:text-7xl md:text-8xl lg:text-9xl"
          aria-label={heroTitleVariants[titleIndex]}
        >
          <span className="inline-block min-h-[1.65em] sm:min-h-[0.92em]">
            {displayTitle}
            <span className="ml-1 inline-block h-[0.78em] w-[0.08em] translate-y-[0.08em] animate-pulse rounded-full bg-primary align-baseline" />
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
          Başarısızlık hikayelerinden çıkarılmış doğru dersleri dinleyeceğin network club.
        </p>

        <div className="mx-auto mt-5 grid w-full max-w-xl grid-cols-2 gap-2 sm:gap-3">
          <Link
            to="/17-eylul"
            data-analytics="ticket_click"
            data-analytics-label="17 Eylül ana sayfa etkinlik CTA"
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-foreground px-3 py-2.5 text-center text-[11px] font-black leading-tight text-background transition hover:-translate-y-0.5 hover:bg-primary-deep sm:px-5 sm:text-sm"
          >
            17 Eylül · notwork Chill &amp; Chat
          </Link>
          <Link
            to="/9-ekim"
            data-analytics="ticket_click"
            data-analytics-label="9 Ekim ana sayfa etkinlik CTA"
            className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-3 py-2.5 text-center text-[11px] font-black leading-tight text-primary-foreground transition hover:-translate-y-0.5 hover:brightness-95 sm:px-5 sm:text-sm"
          >
            9 Ekim · notwork Classic
          </Link>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-5">
      <div className="mx-auto max-w-2xl w-full rounded-xl border border-border bg-card p-3 sm:p-5 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          <h2 className="text-sm sm:text-lg font-bold text-foreground/80 uppercase tracking-widest">
            Sana ne katacak?
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { tag: "Doğru Network", desc: "Doğru insanlarla tanışmak." },
            { tag: "Doğru Kişiler", desc: "Senin gibi deneyim paylaşan insanlarla bağ kurmak." },
            { tag: "Başarıya Nasıl Gidilir", desc: "Hataları başarıya çeviren yolları öğrenmek." },
          ].map((b) => (
            <div key={b.tag} className="rounded-lg border border-border bg-background p-2.5">
              <h3 className="font-display font-bold text-[10px] sm:text-sm tracking-tight text-primary-deep">
                {b.tag}
              </h3>
              <div className="mt-1 h-px w-5 bg-primary/40" />
              <p className="mt-1.5 text-[10px] sm:text-xs text-foreground/80 leading-snug">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center sm:mt-5">
          <Link
            to="/notwork-nedir"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary/35 bg-background px-5 py-2.5 text-xs font-black text-primary-deep transition hover:border-primary hover:bg-primary/10 sm:min-h-12 sm:px-7 sm:text-sm"
          >
            notwork nedir?
          </Link>
        </div>
      </div>
    </section>
  );
}

function Tracks() {
  return (
    <section className="mx-auto mt-14 max-w-5xl px-4 sm:mt-24 sm:px-5">
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          <h2 className="text-sm sm:text-lg font-bold text-foreground/80 uppercase tracking-[0.2em] leading-relaxed">
            BAŞARISIZLIK HİKAYELERİ
            <br />3 FARKLI AÇIDA
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
          {tracks.map((t) => (
            <div
              key={t.tag}
              className="rounded-xl border p-3 sm:p-4"
              style={{ borderColor: `${t.color}30`, backgroundColor: `${t.color}08` }}
            >
              <h3
                className="font-display font-bold text-lg sm:text-2xl tracking-tight"
                style={{ color: t.color }}
              >
                {t.tag}
              </h3>
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
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      name: "notwork Classic",
      href: "/9-ekim" as const,
      items: [
        {
          n: "01",
          t: "Başarısızlık hikâyeleri",
          d: "Gerçek deneyimler, kısa sunumlar ve çıkarılan net dersler.",
        },
        {
          n: "02",
          t: "3 hayat kolu",
          d: "Kariyer, ilişki ve macera tarafında farklı hikâyeler.",
        },
        {
          n: "03",
          t: "İnteraktif sahne",
          d: "WordCloud ve mini oyunlarla seyirci de akışa katılır.",
        },
        {
          n: "04",
          t: "Sonra networking",
          d: "Sunum sonrası ntw.match.lab ile doğru bağlantı zamanı.",
        },
      ],
    },
    {
      name: "notwork Chat",
      href: "/17-eylul" as const,
      items: [
        {
          n: "01",
          t: "Problemini hızlıca çöz",
          d: "ntw.five ile problemini anlayıp çözüm üretebilecek gerçek bağlantılar edin.",
        },
        {
          n: "02",
          t: "İşine yarayan bağlantılar",
          d: "Etkinlikten sonra da iletişimde kalacağın güçlü bir network oluştur.",
        },
        {
          n: "03",
          t: "Doğru insanlarla tanış",
          d: "ntw.match.lab ile ihtiyacına, niyetine ve katkına uygun insanları bul.",
        },
        {
          n: "04",
          t: "DJ, canlı müzik, keyifli ortam",
          d: "Sıkıcı kartvizit trafiği yerine community enerjisiyle rahatça tanış.",
        },
      ],
    },
  ];
  const activeEvent = slides[activeSlide];

  return (
    <section id="nedir" className="mx-auto mt-14 max-w-6xl overflow-hidden px-4 sm:mt-24 sm:px-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
        <div>
          <div className="text-primary-deep font-medium text-sm uppercase tracking-widest">
            Bir notwork eventinde
          </div>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-5xl text-foreground max-w-2xl">
            {activeEvent.name}’te seni ne bekliyor?
          </h2>
        </div>
        <Link
          to={activeEvent.href}
          className="hidden rounded-full border border-border bg-card px-4 py-2 text-sm font-black transition hover:border-primary hover:bg-primary/10 sm:inline-flex"
        >
          Etkinliği incele ↗
        </Link>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5">
        <div className="flex rounded-full border border-border bg-card p-1">
          {slides.map((slide, index) => (
            <button
              key={slide.name}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`rounded-full px-3 py-2 text-[11px] font-black transition sm:px-4 sm:text-sm ${
                activeSlide === index
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {slide.name}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() =>
              setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1))
            }
            aria-label="Önceki etkinlik akışı"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-lg font-black transition hover:border-primary hover:bg-primary/10"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
            aria-label="Sonraki etkinlik akışı"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-lg font-black transition hover:border-primary hover:bg-primary/10"
          >
            →
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex w-[200%] transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeSlide * 50}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.name}
              className="grid w-1/2 shrink-0 grid-cols-2 gap-2 pr-px sm:grid-cols-4 sm:gap-4"
            >
              {slide.items.map((item) => (
                <article
                  key={`${slide.name}-${item.n}`}
                  className="rounded-2xl border border-border bg-card p-3 transition hover:border-primary/60 hover:shadow-[var(--shadow-card)] sm:p-5"
                >
                  <div className="font-display text-primary text-xl font-bold sm:text-3xl">
                    {item.n}
                  </div>
                  <h3 className="mt-2 font-display font-semibold text-sm leading-tight sm:text-lg">
                    {item.t}
                  </h3>
                  <p className="mt-1.5 text-xs leading-snug text-muted-foreground sm:mt-2 sm:text-sm sm:leading-relaxed">
                    {item.d}
                  </p>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between sm:mt-4">
        <div className="flex gap-1.5" aria-label="Etkinlik slaytı göstergesi">
          {slides.map((slide, index) => (
            <button
              key={slide.name}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`${slide.name} akışını göster`}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === index ? "w-8 bg-primary" : "w-3 bg-border"
              }`}
            />
          ))}
        </div>
        <Link
          to={activeEvent.href}
          className="text-xs font-black text-primary-deep hover:underline sm:hidden"
        >
          Etkinliği incele ↗
        </Link>
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
    <section
      id="etkinlikler"
      className="mx-auto mt-14 max-w-6xl scroll-mt-24 px-4 sm:mt-24 sm:px-5"
    >
      <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-7 sm:flex-row sm:items-end">
        <div>
          <div className="text-primary-deep font-medium text-sm uppercase tracking-widest">
            etkinlikler
          </div>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-5xl text-foreground">
            notwork geceleri
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Geçmiş notwork gecelerinden hikâyeleri, yorumları ve etkinlik arşivini burada topluyoruz.
        </p>
        <Link
          to="/etkinlikler"
          className="inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-black text-primary-deep transition hover:bg-primary hover:text-primary-foreground sm:px-5 sm:py-3"
        >
          Tüm etkinlikleri gör
        </Link>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:thin] sm:-mx-5 sm:px-5 sm:pb-4">
        <div className="flex snap-x gap-3 sm:gap-4">
          {pastEvents.map((event) => {
            const eventReviews = reviewsByEvent[event.id] || [];
            const eventAverage = averageRating(eventReviews);
            const eventPhoto = eventReviews.find((review) => review.photoDataUrl)?.photoDataUrl;
            const card = (
              <article className="group flex h-full min-h-[338px] w-[76vw] max-w-[290px] snap-start flex-col overflow-hidden rounded-[22px] border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-soft)] sm:min-h-[390px] sm:w-[300px] sm:max-w-[300px] sm:rounded-[24px]">
                <div className="relative min-h-28 overflow-hidden bg-ink text-cream sm:min-h-40">
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
                  <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full border-[20px] border-primary/25" />
                  <div className="absolute -bottom-14 left-8 h-32 w-32 rounded-full border-[22px] border-primary/15" />
                  <div className="relative flex min-h-28 flex-col justify-between p-3.5 sm:min-h-40 sm:p-4">
                    <div className="inline-flex w-fit rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
                      {event.date}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                        {event.location}
                      </div>
                      <div className="mt-1 font-display text-2xl font-black leading-none tracking-[-0.05em]">
                        notwork gecesi
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-3.5 sm:p-5">
                  <div className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-deep">
                    Geçmiş event
                  </div>
                  <h3 className="mt-2.5 font-display text-lg font-black tracking-[-0.04em] sm:mt-3 sm:text-xl">
                    {event.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:line-clamp-3 sm:text-sm">
                    {event.text}
                  </p>
                  {eventReviews.length > 0 && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 sm:mt-4 sm:py-2.5">
                      <div>
                        <div className="text-sm tracking-tight text-primary-deep">
                          {renderEventStars(Math.round(eventAverage))}
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold text-foreground/45">
                          {eventReviews.length} değerlendirme
                        </div>
                      </div>
                      <div className="text-sm font-black text-primary-deep">
                        {eventAverage.toFixed(1)} / 5
                      </div>
                    </div>
                  )}
                  <div className="mt-auto inline-flex items-center gap-2 pt-3 text-xs font-bold text-primary-deep sm:pt-4 sm:text-sm">
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
      className="mx-auto mt-14 max-w-6xl scroll-mt-24 px-4 sm:mt-24 sm:px-5"
    >
      <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-7 sm:flex-row sm:items-end">
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
          className="inline-flex w-fit rounded-full bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition hover:opacity-90 sm:px-5 sm:py-3"
        >
          Etkinlik yorumla
        </Link>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:thin] sm:-mx-5 sm:px-5 sm:pb-4">
        <div className="flex snap-x gap-3 sm:gap-4">
          {sortedReviews.map((review) => {
            const event = eventMetaById[review.eventId];
            const isExpanded = !!expandedReviews[review.id];
            const canExpand = review.comment.length > 170;
            return (
              <article
                key={review.id}
                className={`flex w-[80vw] max-w-[320px] shrink-0 snap-start flex-col overflow-hidden rounded-[22px] border border-border bg-card shadow-[var(--shadow-card)] transition-all sm:w-[340px] sm:max-w-[340px] sm:rounded-3xl ${
                  isExpanded
                    ? "h-auto"
                    : review.photoDataUrl
                      ? "h-[350px] sm:h-[420px]"
                      : "h-[240px] sm:h-[280px]"
                }`}
              >
                {review.photoDataUrl && (
                  <img
                    src={review.photoDataUrl}
                    alt={`${review.eventTitle} yorumu`}
                    loading="lazy"
                    className="h-48 w-full shrink-0 object-cover object-center sm:h-64"
                  />
                )}
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-primary-deep sm:text-base">
                      {renderEventStars(review.rating)}
                    </div>
                    <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary-deep">
                      {event?.date || review.eventTitle}
                    </div>
                  </div>
                  <p
                    className={`mt-2 text-xs leading-relaxed text-foreground/75 sm:text-sm ${
                      isExpanded ? "" : "line-clamp-2 sm:line-clamp-3"
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
                      className="mt-2 w-fit text-xs font-black text-primary-deep hover:underline"
                    >
                      {isExpanded ? "Daha az göster" : "Devamını oku"}
                    </button>
                  )}
                  <div className="mt-auto border-t border-border pt-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/45">
                      {review.name || "notwork katılımcısı"}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-foreground">
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
  const sliderRef = useRef<HTMLDivElement>(null);
  const resumeAutoScrollAtRef = useRef(0);
  const loop = [...gallery, ...gallery];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let animationFrame = 0;
    let previousTime = performance.now();

    const moveSlider = (currentTime: number) => {
      const elapsed = Math.min(currentTime - previousTime, 50);
      previousTime = currentTime;

      if (currentTime >= resumeAutoScrollAtRef.current) {
        slider.scrollLeft += elapsed * 0.007;
        const loopPoint = slider.scrollWidth / 2;
        if (slider.scrollLeft >= loopPoint) slider.scrollLeft -= loopPoint;
      }

      animationFrame = window.requestAnimationFrame(moveSlider);
    };

    animationFrame = window.requestAnimationFrame(moveSlider);
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const pauseAutoScroll = (duration = 5000) => {
    resumeAutoScrollAtRef.current = performance.now() + duration;
  };

  const moveManually = (direction: -1 | 1) => {
    const slider = sliderRef.current;
    if (!slider) return;
    pauseAutoScroll();
    slider.scrollBy({
      left: direction * Math.min(slider.clientWidth * 0.78, 420),
      behavior: "smooth",
    });
  };

  return (
    <section id="galeri" className="mt-14 sm:mt-24">
      <div className="mx-auto mb-5 flex max-w-6xl items-end justify-between gap-3 px-4 sm:mb-7 sm:px-5">
        <div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Önceki eventlerden</h2>
          <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
            Kaydır veya oklarla fotoğrafları incele.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => moveManually(-1)}
            aria-label="Önceki fotoğraf"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-base font-black transition hover:border-primary hover:bg-primary/10 sm:h-10 sm:w-10 sm:text-lg"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => moveManually(1)}
            aria-label="Sonraki fotoğraf"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-base font-black transition hover:border-primary hover:bg-primary/10 sm:h-10 sm:w-10 sm:text-lg"
          >
            →
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <div
          ref={sliderRef}
          onPointerDown={() => {
            resumeAutoScrollAtRef.current = Number.POSITIVE_INFINITY;
          }}
          onPointerUp={() => pauseAutoScroll()}
          onPointerCancel={() => pauseAutoScroll()}
          onPointerLeave={() => pauseAutoScroll()}
          onWheel={() => pauseAutoScroll()}
          className="cursor-grab overflow-x-auto px-4 pb-3 active:cursor-grabbing [scrollbar-width:thin] sm:px-5"
        >
          <div className="flex w-max snap-x snap-mandatory gap-4">
            {loop.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt={`notwork event anı ${(i % gallery.length) + 1}`}
                loading="lazy"
                width={1024}
                height={1024}
                draggable={false}
                className="h-52 w-auto shrink-0 snap-start select-none rounded-2xl object-cover sm:h-72"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="mx-auto mt-14 max-w-3xl px-4 sm:mt-24 sm:px-5">
      <h2 className="font-display font-bold text-3xl sm:text-4xl text-center">Sık sorulanlar</h2>
      <p className="mt-3 text-center text-muted-foreground">Aklında kalan her şey, hızlıca.</p>
      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card sm:mt-8">
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
      className="w-full px-4 py-4 text-left sm:px-6 sm:py-5"
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
    <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-24 sm:px-5">
      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-cream sm:p-14">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-50"
          style={{ background: "var(--primary)" }}
        />
        <div className="relative max-w-2xl">
          <div className="text-primary font-medium uppercase tracking-widest text-sm">
            Sahneye çık
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">
            Denedin, olmadı, sonra öğrendin ve başardın. Şimdi anlatma zamanı.
          </h2>
          <p className="mt-4 text-cream/75 max-w-lg">
            Sunumunu yükle, hikâyeni ve bu deneyimden çıkardığın dersi birkaç cümleyle anlat.
            WhatsApp üzerinden sana hızlıca dönüyoruz.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
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
