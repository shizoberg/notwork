import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { InterviewReels } from "@/components/InterviewReels";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { averageRating, listEventReviews, type EventReview } from "@/lib/event-reviews";
import { createSeo } from "@/lib/seo";

const ticketUrl =
  "https://www.biletimgo.com/etkinlik/notwork-basarisizlik-hikayeleri-networking-club-29731";
const locationUrl =
  "https://www.google.com/maps/search/?api=1&query=House%20of%20Rene%20Lokal%20Erzene%20Mahallesi%20Fevzi%20%C3%87akmak%20Caddesi%20No%2049%20Bornova%20%C4%B0zmir";

export const Route = createFileRoute("/21agustos")({
  head: () =>
    createSeo({
      title: "21 Ağustos notwork İzmir | Network Club Etkinliği",
      description:
        "21 Ağustos notwork İzmir network club gecesinin başarısızlık hikâyelerini, katılımcı yorumlarını, röportajlarını ve networking anlarını keşfet.",
      path: "/21agustos",
      keywords: ["21 Ağustos notwork", "Bornova networking", "Rene Lokal etkinlik"],
      type: "article",
    }),
  component: AugustTwentyFirst,
});

const sections = [
  {
    number: "01",
    title: "Program",
    text: "notwork sahnesinde başarısızlık hikâyeleri, çıkarılan dersler ve etkinlik sonrası networking akışı olacak.",
    items: [
      "Kapı açılış: 19.30",
      "Başarısızlık hikâyeleri ve deneyim paylaşımları",
      "Networking free time",
      "Doğru dersler ve doğru bağlantılar",
    ],
  },
  {
    number: "02",
    title: "Konuşmacılar",
    text: "Bu etkinliğin konuşmacıları yakında duyurulacak. Her konuşmacı kendi olduramama hikâyesini ve oradan çıkan dersi sahneye taşıyacak.",
    items: [
      "Konuşmacılar yakında duyurulacak",
      "Gerçek hikâyeler",
      "Kısa ve canlı anlatımlar",
      "Sahne sonrası tanışma alanı",
    ],
  },
  {
    number: "03",
    title: "Konum",
    text: "House of Rene Lokal, Bornova metrodan yürüme mesafesindedir. Etkinliğe metrodan indikten sonra kısa bir yürüyüşle ulaşabilirsiniz.",
    items: [
      "House of Rene Lokal — Bornova / İzmir",
      "Erzene Mahallesi Fevzi Çakmak Caddesi No: 49 - Bornova / İzmir",
      "Bornova metrodan yürüme mesafesi",
    ],
    link: locationUrl,
    linkLabel: "Konumu aç",
  },
];

const highlights = [
  "f*ckup hikâyeleri",
  "networking club",
  "Rene Lokal atmosferi",
  "Bornova / İzmir",
];

function AugustTwentyFirst() {
  const [reviews, setReviews] = useState<EventReview[]>([]);

  useEffect(() => {
    let active = true;
    listEventReviews("21-agustos-2026")
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-5xl px-5 pb-14 pt-12 text-center sm:pb-20 sm:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-deep">
            <span className="h-2 w-2 rounded-full bg-primary blink" />
            21 Ağustos 2026 · Cuma · Rene Lokal
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-black leading-[0.9] tracking-[-0.05em] sm:text-7xl">
            21 Ağustos
            <br />
            <span className="text-primary-deep">notwork gecesi</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/65 sm:text-xl">
            Başarısızlık hikâyelerinden çıkarılmış doğru dersler ve doğru bağlantılar için House of
            Rene Lokal’de buluşuyoruz.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={ticketUrl}
              data-analytics="ticket_click"
              data-analytics-label="21 Ağustos Rene Lokal bilet al"
              data-meta-event="ViewContent"
              data-meta-content="notwork 21 Ağustos Rene Lokal Bileti"
              data-meta-content-id="notwork-21-agustos-rene-lokal"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Bilet al
            </a>
            <a
              href="/linkler"
              className="rounded-full border border-primary/30 bg-background px-6 py-3 font-semibold text-primary-deep transition hover:border-primary"
            >
              Network test kaydı
            </a>
            <a
              href={locationUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border bg-card px-6 py-3 font-semibold transition hover:border-primary/60"
            >
              Konuma git
            </a>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 md:grid-cols-4">
          {highlights.map((item) => (
            <div key={item} className="rounded-2xl border border-border bg-card p-5 text-center">
              <span className="mx-auto block h-2 w-2 rounded-full bg-primary" />
              <div className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-primary-deep">
                {item}
              </div>
            </div>
          ))}
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 md:grid-cols-3">
          {sections.map((section) => (
            <article key={section.number} className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs font-bold tracking-[0.2em] text-primary-deep">
                {section.number}
              </div>
              <h2 className="mt-5 text-2xl font-bold">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-foreground/60">{section.text}</p>
              <ul className="mt-5 grid gap-2 text-sm text-foreground/65">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {"link" in section && section.link && (
                <a
                  href={section.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  {section.linkLabel}
                </a>
              )}
            </article>
          ))}
        </section>

        <AugustReviews reviews={reviews} />
        <InterviewReels
          title="21 Ağustos etkinlik röportajları"
          eyebrow="etkinlik röportajları"
          description="Rene Lokal gecesinden kısa katılımcı yorumları. Sessiz döner; tıklayınca sesli ve büyük açılır."
        />

        <section className="mx-auto max-w-6xl px-5 pb-20 mt-16 sm:mt-24">
          <div className="overflow-hidden rounded-3xl border border-primary/25 bg-[radial-gradient(circle_at_top_left,rgba(143,203,208,0.25),transparent_34%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--background)))] p-6 shadow-[var(--shadow-card)] sm:p-10">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary-deep">
              konuşmacılar
            </div>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">
              Konuşmacılar yakında duyurulacak
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-foreground/65">
              Bu gece sahneye çıkacak isimleri yakında açıklayacağız. Her biri kendi
              olduramamalarından çıkardığı dersi ve bugün kurduğu bağlantıları notwork sahnesinde
              paylaşacak.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Sahne", "Hikâye", "Networking"].map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-background/75 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
                    {item}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    notwork ruhuna uygun gerçek deneyimler ve tanışmayı kolaylaştıran bir akış.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

function AugustReviews({ reviews }: { reviews: EventReview[] }) {
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
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
  const ratingAverage = averageRating(reviews);

  return (
    <section id="yorumlar" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary-deep">
            kullanıcı yorumları
          </div>
          <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            21 Ağustos gecesinden notlar
          </h2>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-bold text-primary-deep">
          {ratingAverage.toFixed(1)} / 5 · {reviews.length} yorum
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedReviews.map((review) => {
          const isExpanded = !!expandedReviews[review.id];
          const canExpand = review.comment.length > 170;
          return (
            <article
              key={review.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]"
            >
              {review.photoDataUrl && (
                <img
                  src={review.photoDataUrl}
                  alt={`${review.name || "notwork katılımcısı"} yorumu`}
                  loading="lazy"
                  className="h-32 w-full object-cover object-center sm:h-44"
                />
              )}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base text-primary-deep sm:text-lg">
                    {renderStars(review.rating)}
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black text-primary-deep">
                    21 Ağustos 2026
                  </div>
                </div>
                <p
                  className={`mt-3 text-sm leading-relaxed text-foreground/75 sm:text-base ${
                    isExpanded ? "" : "line-clamp-4"
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
                    className="mt-3 text-sm font-black text-primary-deep hover:underline"
                  >
                    {isExpanded ? "Daha az göster" : "Devamını oku"}
                  </button>
                )}
                <div className="mt-5 border-t border-border pt-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/45">
                    {review.name || "notwork katılımcısı"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    21 Ağustos notwork İzmir
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
