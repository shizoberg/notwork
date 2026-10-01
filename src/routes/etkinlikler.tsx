import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Search } from "lucide-react";
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
  dateIso: string;
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
  "notwork match",
  "WordCloud",
];

const catalogEvents: EventCatalogItem[] = [
  {
    id: "11-ekim-2026",
    dateIso: "2026-10-11",
    date: "11 Ekim 2026",
    year: "2026",
    venue: "Rene Lokal",
    title: "notwork Sahne",
    summary:
      "Dört ilham veren başarısızlık hikâyesi, canlı WordCloud ve iki networking arasında ntw.match.lab deneyimi.",
    participants: "Sınırlı kontenjan",
    tags: ["Rene Lokal", "WordCloud", "notwork match", "4 konuşmacı"],
    href: "/11-ekim",
    accent: "from-[#071416] via-[#6b304e] to-[#d8c6ff]",
    image: "/community/8.jpg",
    imagePosition: "center 38%",
  },
  {
    id: "17-eylul-2026",
    dateIso: "2026-09-17",
    date: "17 Eylül 2026",
    year: "2026",
    venue: "Köşk Alsancak",
    title: "notwork Fast",
    summary:
      "ntw.match.lab, ntw.five ve DJ deneyimini aynı lineer akışta birleştiren yeni nesil notwork gecesi.",
    participants: "Sınırlı kontenjan",
    tags: ["Köşk Alsancak", "notwork match", "ntw.five", "DJ"],
    href: "/17-eylul",
    accent: "from-[#071416] via-[#245f66] to-[#d8c6ff]",
    image: "/community/17.jpg",
    imagePosition: "center 42%",
  },
  {
    id: "21-agustos-2026",
    dateIso: "2026-08-21",
    date: "21 Ağustos 2026",
    year: "2026",
    venue: "House of Rene Lokal",
    title: "21 Ağustos notwork İzmir",
    summary:
      "Rene Lokal’de notwork match, WordCloud, röportajlar ve etkinlik sonrası networking akışıyla büyüyen notwork gecesi.",
    participants: "100+ katılımcı",
    tags: ["Rene Lokal", "notwork match", "WordCloud", "Networking"],
    href: "/21agustos",
    accent: "from-[#0f2f35] via-[#2f9aa5] to-[#8fcbd0]",
    image: "/community/25.jpg",
    imagePosition: "center 46%",
  },
  {
    id: "14-temmuz-2026",
    dateIso: "2026-07-14",
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
    dateIso: "2026-05-22",
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
    dateIso: "2026-04-10",
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
    dateIso: "2026-03-08",
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
    dateIso: "2026-02-10",
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
    dateIso: "2026-01-16",
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
    dateIso: "2025-12-08",
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

const upcomingEventIds = new Set(["11-ekim-2026"]);

function EventsCatalogPage() {
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [activeScope, setActiveScope] = useState<"all" | "upcoming" | "past">("all");
  const [query, setQuery] = useState("");

  const visibleEvents = useMemo(() => {
    return catalogEvents.filter(
      (event) =>
        (activeScope === "all" ||
          (activeScope === "upcoming"
            ? upcomingEventIds.has(event.id)
            : !upcomingEventIds.has(event.id))) &&
        (activeFilter === "Tümü" ||
          event.year === activeFilter ||
          event.venue.includes(activeFilter) ||
          event.tags.some((tag) =>
            tag.toLocaleLowerCase("tr-TR").includes(activeFilter.toLocaleLowerCase("tr-TR")),
          )) &&
        `${event.title} ${event.venue} ${event.summary} ${event.tags.join(" ")}`
          .toLocaleLowerCase("tr-TR")
          .includes(query.trim().toLocaleLowerCase("tr-TR")),
    );
  }, [activeFilter, activeScope, query]);

  const upcomingEvents = visibleEvents.filter((event) => upcomingEventIds.has(event.id));
  const pastEvents = visibleEvents.filter((event) => !upcomingEventIds.has(event.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:px-5 sm:pb-20 sm:pt-16">
        <section>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-deep sm:text-sm">
            notwork / takvim
          </div>
          <h1 className="mt-2 font-display text-4xl font-black leading-none tracking-[-0.055em] sm:mt-4 sm:text-6xl">
            etkinlikler
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
            Sıradaki buluşmayı ve geçmiş notwork gecelerini tek akışta gör.
          </p>
        </section>

        <div className="mt-5 border-y border-border/70 py-3 sm:mt-10 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex rounded-full border border-border bg-card p-1"
              aria-label="Etkinlik dönemi"
            >
              {(
                [
                  ["all", "Tümü"],
                  ["upcoming", "Yaklaşan"],
                  ["past", "Geçmiş"],
                ] as const
              ).map(([scope, label]) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setActiveScope(scope)}
                  aria-pressed={activeScope === scope}
                  className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                    activeScope === scope
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="shrink-0 text-xs font-semibold text-muted-foreground sm:text-sm">
              {visibleEvents.length} etkinlik
            </span>
          </div>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_128px] gap-2 sm:grid-cols-[1fr_220px]">
            <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 text-muted-foreground">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Etkinlik ara</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Etkinlik ara"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
            <label className="sr-only" htmlFor="event-catalog-filter">
              Yer veya tema seç
            </label>
            <select
              id="event-catalog-filter"
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary"
            >
              {filters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter === "Tümü" ? "Yer / tema" : filter}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visibleEvents.length ? (
          <>
            <CatalogSection
              title="Yaklaşan"
              eyebrow="sıradaki buluşma"
              events={upcomingEvents}
              upcoming
            />
            <CatalogSection
              title="Geçmiş etkinlikler"
              eyebrow="notwork arşivi"
              events={pastEvents}
            />
          </>
        ) : (
          <div className="border-b border-border py-16 text-center">
            <p className="font-display text-xl font-black">Bu aramada etkinlik bulunamadı.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter("Tümü");
                setActiveScope("all");
              }}
              className="mt-3 text-sm font-bold text-primary-deep underline underline-offset-4"
            >
              Filtreleri temizle
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function CatalogSection({
  title,
  eyebrow,
  events,
  upcoming = false,
}: {
  title: string;
  eyebrow: string;
  events: EventCatalogItem[];
  upcoming?: boolean;
}) {
  if (!events.length) return null;

  return (
    <section className="mt-6 sm:mt-12" aria-label={title}>
      <div className="mb-2 flex items-end justify-between gap-4 sm:mb-5">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-deep sm:text-xs">
            {eyebrow}
          </div>
          <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.04em] sm:text-3xl">
            {title}
          </h2>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{events.length}</span>
      </div>
      <ol className="divide-y divide-border/70 border-y border-border/70">
        {events.map((event) => (
          <EventListRow key={event.id} event={event} upcoming={upcoming} />
        ))}
      </ol>
    </section>
  );
}

function EventListRow({ event, upcoming }: { event: EventCatalogItem; upcoming: boolean }) {
  const [day, month] = event.date.split(" ");
  const content = (
    <>
      <time dateTime={event.dateIso} className="flex w-12 shrink-0 flex-col leading-none sm:w-16">
        <span
          className={`font-display text-3xl font-black tracking-[-0.07em] sm:text-4xl ${upcoming ? "text-primary-deep" : "text-foreground"}`}
        >
          {day}
        </span>
        <span className="mt-1 text-[10px] font-black uppercase tracking-[0.07em] text-muted-foreground sm:text-xs">
          {month}
        </span>
        <span className="mt-1 text-[10px] text-muted-foreground/70">{event.year}</span>
      </time>
      <div
        className={`relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:size-20 ${event.accent}`}
      >
        <img
          src={event.image}
          alt=""
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
          style={{ objectPosition: event.imagePosition ?? "center" }}
        />
      </div>
      <div className="min-w-0 flex-1">
        {upcoming ? (
          <span className="mb-1 inline-block text-[10px] font-black uppercase tracking-[0.15em] text-primary-deep">
            Sıradaki etkinlik
          </span>
        ) : null}
        <h3 className="font-display text-base font-black leading-tight tracking-[-0.03em] sm:text-xl">
          {event.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
          <MapPin size={12} className="shrink-0" aria-hidden="true" />{" "}
          <span className="truncate">{event.venue}</span>
        </p>
        <p className="mt-2 hidden max-w-xl text-sm leading-relaxed text-muted-foreground sm:block">
          {event.summary}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
        {event.href ? (
          <ArrowUpRight
            size={18}
            aria-hidden="true"
            className="text-primary-deep transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        ) : (
          <span className="text-[10px] font-semibold text-muted-foreground">Arşiv</span>
        )}
        <span className="hidden text-xs font-semibold text-muted-foreground sm:block">
          {event.participants}
        </span>
      </div>
    </>
  );

  return (
    <li>
      {event.href ? (
        <Link
          to={event.href}
          aria-label={`${event.title}, ${event.date}, detayları aç`}
          className={`group flex items-center gap-3 py-3 transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary sm:gap-6 sm:px-3 sm:py-5 ${upcoming ? "bg-primary/5" : ""}`}
        >
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-3 py-3 sm:gap-6 sm:px-3 sm:py-5">{content}</div>
      )}
    </li>
  );
}
