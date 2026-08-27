import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/etkinlikler")({
  head: () =>
    createSeo({
      title: "İzmir Networking Etkinlikleri | notwork Network Club",
      description:
        "notwork İzmir network club etkinliklerini keşfet: başarısızlık hikâyeleri, gerçek dersler, katılımcı yorumları ve networking geceleri.",
      path: "/etkinlikler",
      keywords: [
        "İzmir networking etkinlikleri",
        "İzmir network etkinliği",
        "İzmir etkinlik takvimi",
      ],
    }),
  component: EventsCatalogPage,
});

type EventCatalogItem = {
  id: string;
  date: string;
  year: string;
  venue: string;
  title: string;
  summary: string;
  participants: string;
  tags: string[];
  href?: string;
  accent: string;
  image: string;
  imagePosition?: string;
};

const filters = [
  "Tümü",
  "2026",
  "Rene Lokal",
  "Köşk Alsancak",
  "Mahal Bomonti",
  "İstinyeArt",
  "MatchLab",
  "WordCloud",
];

const catalogEvents: EventCatalogItem[] = [
  {
    id: "9-ekim-2026",
    date: "9 Ekim 2026",
    year: "2026",
    venue: "Rene Lokal",
    title: "notwork Classic",
    summary:
      "Dört ilham veren başarısızlık hikâyesi, canlı WordCloud ve iki networking arasında ntw.match.lab deneyimi.",
    participants: "Sınırlı kontenjan",
    tags: ["Rene Lokal", "WordCloud", "MatchLab", "4 konuşmacı"],
    href: "/9-ekim",
    accent: "from-[#071416] via-[#6b304e] to-[#d8c6ff]",
    image: "/community/24.jpg",
    imagePosition: "center 34%",
  },
  {
    id: "17-eylul-2026",
    date: "17 Eylül 2026",
    year: "2026",
    venue: "Köşk Alsancak",
    title: "notwork Chill & Chat",
    summary:
      "ntw.match.lab, ntw.five ve DJ deneyimini aynı lineer akışta birleştiren yeni nesil notwork gecesi.",
    participants: "Sınırlı kontenjan",
    tags: ["Köşk Alsancak", "MatchLab", "ntw.five", "DJ"],
    href: "/17-eylul",
    accent: "from-[#071416] via-[#245f66] to-[#d8c6ff]",
    image: "/community/21.jpg",
    imagePosition: "center 44%",
  },
  {
    id: "21-agustos-2026",
    date: "21 Ağustos 2026",
    year: "2026",
    venue: "House of Rene Lokal",
    title: "21 Ağustos notwork İzmir",
    summary:
      "Rene Lokal’de MatchLab, WordCloud, röportajlar ve etkinlik sonrası networking akışıyla büyüyen notwork gecesi.",
    participants: "100+ katılımcı",
    tags: ["Rene Lokal", "MatchLab", "WordCloud", "Networking"],
    href: "/21agustos",
    accent: "from-[#0f2f35] via-[#2f9aa5] to-[#8fcbd0]",
    image: "/community/25.jpg",
    imagePosition: "center 46%",
  },
  {
    id: "14-temmuz-2026",
    date: "14 Temmuz 2026",
    year: "2026",
    venue: "Mahal Bomonti İzmir",
    title: "14 Temmuz notwork İzmir",
    summary:
      "İnteraktif sahne, 4 sunucu, networking free time ve topluluk ağıyla ilerleyen özel notwork gecesi.",
    participants: "70+ katılımcı",
    tags: ["Mahal Bomonti", "Konuşmacılar", "Networking ağı"],
    href: "/14temmuz",
    accent: "from-[#142643] via-[#111827] to-[#0f172a]",
    image: "/community/26.jpg",
    imagePosition: "center 42%",
  },
  {
    id: "22-mayis",
    date: "22 Mayıs 2026",
    year: "2026",
    venue: "İstinyeArt İzmir",
    title: "notwork · Mayıs buluşması",
    summary:
      "Kariyer ve üretim süreçlerinde olduramadıklarımızı, sonra kurulan yeni yolları konuştuğumuz samimi gece.",
    participants: "50+ katılımcı",
    tags: ["İstinyeArt", "Kariyer", "Üretim"],
    accent: "from-[#173f68] via-[#265f73] to-[#8fcbd0]",
    image: "/community/14.jpg",
    imagePosition: "center 38%",
  },
  {
    id: "10-nisan",
    date: "10 Nisan 2026",
    year: "2026",
    venue: "İstinyeArt İzmir",
    title: "notwork · Nisan sahnesi",
    summary:
      "İletişim, iş birlikleri ve yeni başlangıçlar üzerine hatalardan öğrenilenleri sahneye taşıyan akşam.",
    participants: "45+ katılımcı",
    tags: ["İstinyeArt", "İletişim", "İş birliği"],
    accent: "from-[#5f2a4f] via-[#8b2c5c] to-[#e3a3bf]",
    image: "/community/27.jpg",
    imagePosition: "center 48%",
  },
  {
    id: "8-mart",
    date: "8 Mart 2026",
    year: "2026",
    venue: "İstinyeArt İzmir",
    title: "notwork · 8 Mart özel",
    summary:
      "Farklı hayat deneyimlerinden gelen cesaret, kırılma noktaları ve yeniden başlama hikâyeleri.",
    participants: "55+ katılımcı",
    tags: ["İstinyeArt", "Deneyim", "Topluluk"],
    accent: "from-[#7f1d1d] via-[#b23b3b] to-[#f3a46b]",
    image: "/community/13.jpg",
    imagePosition: "center 46%",
  },
  {
    id: "10-subat",
    date: "10 Şubat 2026",
    year: "2026",
    venue: "İstinyeArt İzmir",
    title: "notwork · Şubat gecesi",
    summary:
      "Yanlış kararlar, yarım kalan işler ve onları dönüştüren derslerin konuşulduğu kış buluşması.",
    participants: "45+ katılımcı",
    tags: ["İstinyeArt", "Yeni başlangıç", "Dersler"],
    accent: "from-[#1e3a8a] via-[#2563eb] to-[#93c5fd]",
    image: "/community/23.jpg",
    imagePosition: "center 40%",
  },
  {
    id: "16-ocak",
    date: "16 Ocak 2026",
    year: "2026",
    venue: "İstinyeArt İzmir",
    title: "notwork · Ocak buluşması",
    summary:
      "Planların tutmadığı, yolların değiştiği ve buna rağmen yeni kapıların açıldığı hikâyeler.",
    participants: "40+ katılımcı",
    tags: ["İstinyeArt", "Plan", "Dönüşüm"],
    accent: "from-[#134e4a] via-[#0f766e] to-[#99f6e4]",
    image: "/community/20.jpg",
    imagePosition: "center 42%",
  },
  {
    id: "8-aralik",
    date: "8 Aralık 2025",
    year: "2025",
    venue: "İstinyeArt İzmir",
    title: "notwork · Aralık başlangıcı",
    summary:
      "notwork ruhunu taşıyan ilk buluşmalardan biri; başarısızlık hikâyeleriyle tanışmayı kolaylaştıran sıcak akşam.",
    participants: "35+ katılımcı",
    tags: ["İstinyeArt", "Başlangıç", "Tanışma"],
    accent: "from-[#3f2d1f] via-[#8a5a32] to-[#f2c078]",
    image: "/community/8.jpg",
    imagePosition: "center 40%",
  },
];

const upcomingEventIds = new Set(["17-eylul-2026", "9-ekim-2026"]);

function EventsCatalogPage() {
  const [activeFilter, setActiveFilter] = useState("Tümü");

  const visibleEvents = useMemo(() => {
    if (activeFilter === "Tümü") return catalogEvents;
    return catalogEvents.filter(
      (event) =>
        event.year === activeFilter ||
        event.venue.includes(activeFilter) ||
        event.tags.some((tag) =>
          tag.toLocaleLowerCase("tr-TR").includes(activeFilter.toLocaleLowerCase("tr-TR")),
        ),
    );
  }, [activeFilter]);

  const upcomingEvents = visibleEvents.filter((event) => upcomingEventIds.has(event.id));
  const pastEvents = visibleEvents.filter((event) => !upcomingEventIds.has(event.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-20">
        <section className="text-center">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep sm:text-sm">
            event kataloğu
          </div>
          <h1 className="mx-auto mt-3 max-w-4xl font-display text-4xl font-black leading-[0.9] tracking-[-0.06em] sm:mt-4 sm:text-7xl">
            notwork etkinlikleri
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            Yaklaşan etkinlikleri keşfet; geçmiş notwork gecelerini lokasyon, deneyim ve katılımcı
            sayılarına göre gez.
          </p>
        </section>

        <div className="sticky top-16 z-20 -mx-5 mt-8 overflow-x-auto border-y border-border/60 bg-background/86 px-5 py-3 backdrop-blur-md [scrollbar-width:none] sm:mx-0 sm:rounded-full sm:border sm:px-4">
          <div className="flex min-w-max gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(113,204,210,0.28)]"
                    : "bg-card text-foreground/65 hover:bg-primary/10 hover:text-primary-deep"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <CatalogSection
          title="Yaklaşan etkinlikler"
          eyebrow="sıradaki notwork geceleri"
          events={upcomingEvents}
        />
        <CatalogSection title="Geçmiş etkinlikler" eyebrow="community arşivi" events={pastEvents} />
      </main>
      <SiteFooter />
    </div>
  );
}

function CatalogSection({
  title,
  eyebrow,
  events,
}: {
  title: string;
  eyebrow: string;
  events: EventCatalogItem[];
}) {
  if (!events.length) return null;

  return (
    <section className="mt-8 sm:mt-12">
      <div className="mb-3 flex items-end justify-between gap-4 sm:mb-5">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-deep sm:text-xs">
            {eyebrow}
          </div>
          <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.04em] sm:text-4xl">
            {title}
          </h2>
        </div>
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-black text-muted-foreground sm:px-3 sm:text-xs">
          {events.length} etkinlik
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: EventCatalogItem }) {
  const card = (
    <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-soft)] sm:rounded-3xl">
      <div
        className={`relative min-h-32 overflow-hidden bg-gradient-to-br sm:min-h-48 ${event.accent} text-white`}
      >
        <img
          src={event.image}
          alt={`${event.title} etkinliğinden bir kare`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          style={{ objectPosition: event.imagePosition ?? "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/48 via-black/18 to-black/78" />
        <div className="relative flex min-h-32 flex-col justify-between p-4 sm:min-h-48 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] backdrop-blur-md sm:px-3 sm:text-xs sm:tracking-[0.18em]">
              {event.date}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-ink sm:px-3 sm:text-xs">
              {event.participants}
            </span>
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/85 drop-shadow-sm sm:text-xs sm:tracking-[0.22em]">
              {event.venue}
            </div>
            <div className="mt-1 font-display text-2xl font-black leading-none tracking-[-0.05em] drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)] sm:mt-2 sm:text-4xl">
              notwork
              <br />
              gecesi
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col p-4 sm:min-h-72 sm:p-6">
        <h2 className="font-display text-xl font-black tracking-[-0.04em] sm:text-2xl">
          {event.title}
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          {event.summary}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-background px-2 py-1 text-[9px] font-bold sm:px-3 sm:py-1.5 sm:text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary-deep sm:mt-7 sm:text-base">
          {event.href ? "Event sayfasına git" : "Arşiv kaydı"}
          {event.href && <span className="transition group-hover:translate-x-1">→</span>}
        </div>
      </div>
    </article>
  );

  return event.href ? (
    <Link to={event.href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}
