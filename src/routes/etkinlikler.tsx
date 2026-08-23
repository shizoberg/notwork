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
};

const filters = ["Tümü", "2026", "Rene Lokal", "Mahal Bomonti", "İstinyeArt", "MatchLab"];

const catalogEvents: EventCatalogItem[] = [
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
  },
];

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <section className="text-center">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-primary-deep">
            event kataloğu
          </div>
          <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-black leading-[0.9] tracking-[-0.06em] sm:text-7xl">
            notwork etkinlikleri
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Geçmiş notwork gecelerini ürün kataloğu gibi gez; lokasyon, akış ve yaklaşık katılımcı
            sayılarına göre filtrele.
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

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function EventCard({ event }: { event: EventCatalogItem }) {
  const card = (
    <article className="group h-full overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-soft)]">
      <div className={`relative min-h-48 bg-gradient-to-br ${event.accent} text-white`}>
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-[24px] border-white/16" />
        <div className="absolute -bottom-16 left-8 h-44 w-44 rounded-full border-[28px] border-white/12" />
        <div className="relative flex min-h-48 flex-col justify-between p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
              {event.date}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ink">
              {event.participants}
            </span>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-white/70">
              {event.venue}
            </div>
            <div className="mt-2 font-display text-4xl font-black leading-none tracking-[-0.05em]">
              notwork
              <br />
              gecesi
            </div>
          </div>
        </div>
      </div>
      <div className="flex min-h-72 flex-col p-6">
        <h2 className="font-display text-2xl font-black tracking-[-0.04em]">{event.title}</h2>
        <p className="mt-4 flex-1 leading-relaxed text-muted-foreground">{event.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-7 inline-flex items-center gap-2 font-black text-primary-deep">
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
