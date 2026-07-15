import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { averageRating, listEventReviews, type EventReview } from "@/lib/event-reviews";

const ticketUrl = "https://www.biletimgo.com/etkinlik/notwork-bir-tur-network-eventi-28473";
const locationUrl = "https://maps.app.goo.gl/YfRXaqhTXdZS7W7n8";

export const Route = createFileRoute("/14temmuz")({
  head: () => ({
    meta: [
      { title: "14 Temmuz notwork İzmir | Etkinlik Merkezi" },
      {
        name: "description",
        content:
          "14 Temmuz 2026 notwork İzmir etkinliğinin programı, konuşmacıları, duyuruları ve etkinlik günü güncellemeleri.",
      },
      { property: "og:title", content: "14 Temmuz notwork İzmir" },
      {
        property: "og:description",
        content: "14 Temmuz notwork etkinliğinin programı ve etkinlik günü duyuruları.",
      },
      { property: "og:url", content: "https://notwork.me/14temmuz" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/14temmuz" }],
  }),
  component: JulyFourteenth,
});

const sections = [
  {
    number: "01",
    title: "Program",
    text: "Yaklaşık 2.30 saat sürecek akışta interaktif sahne, 4 sunucu ve networking free time bölümü olacak.",
    items: ["İnteraktif sahne", "4 sunucu", "Networking free time", "Tahmini süre: 2.30 saat"],
  },
  {
    number: "02",
    title: "Konuşmacılar",
    text: "Sahnedeki 4 sunucu, uğraşıp da olmayanları ve oradan çıkan deneyimleri interaktif bir akışla paylaşacak.",
    items: [
      "Gerçek deneyimler",
      "Kısa ve canlı anlatımlar",
      "Seyirciyle etkileşim",
      "Sahne sonrası tanışma alanı",
    ],
  },
  {
    number: "03",
    title: "Etkinlik Günü",
    text: "Giriş Mahal Bomonti ana kapısından olacaktır. Halkapınar metro / İZBAN durağından inerek kolayca gelebilirsiniz.",
    items: [
      "Adres: Halkapınar Mahallesi Şehitler Caddesi, 1558. Sk. No:2, 35170 Konak/İzmir",
      "Konum Macfit Mahal Bomonti’yi gösterebilir; giriş kapısı tam onun oradadır.",
      "Daha kolay ulaşım için aşağıdaki konum bağlantısını kullanın.",
    ],
    link: locationUrl,
    linkLabel: "Konumu aç",
  },
];

const speakers = [
  {
    name: "Şahika Akkuş",
    talk: "Sevmediğimizden değil konuşamadığımızdan",
    theme: "İlişki hikâyeleri",
    quote:
      "Başarısız ilişki hikayelerinin kahramanları kötü insanlar değildi. Çoğu zaman iyi niyetle davranan, birbirini anlamaya çalışan ama bunu nasıl yapacağını bilemeyen insanlardı.",
    color: "bg-red-600",
  },
  {
    name: "Tülay Tuğluer",
    talk: "Yapay zeka yok artık! dedi.",
    theme: "Kariyer dönüşümü",
    quote: "Bir hayata kaç kariyer, farklı kariyer sığar?",
    color: "bg-blue-700",
  },
  {
    name: "Seda Çakmak",
    talk: "Çıkış",
    theme: "Konfor alanından çıkış",
    quote:
      "Balık kafasını sudan çıkardı. Ben fanustan. İkimiz de aynı şeyi gördük: dışarıda bir dünya var ve kimse hazır değil.",
    color: "bg-blue-700",
  },
  {
    name: "Caner Yücedağ",
    talk: "Arada kaldığım her şey",
    theme: "İş, aşk ve arkadaşlık",
    quote: "İş, aşk ve arkadaşlık üçgeni arasında olduramadığım şeyler.",
    color: "bg-red-600",
  },
];

function JulyFourteenth() {
  const [reviews, setReviews] = useState<EventReview[]>([]);

  useEffect(() => {
    let active = true;
    listEventReviews("14-temmuz-2026")
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

  const ratingAverage = averageRating(reviews);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-5xl px-5 pb-14 pt-12 text-center sm:pb-20 sm:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-deep">
            <span className="h-2 w-2 rounded-full bg-primary blink" />
            14 Temmuz 2026 · Mahal Bomonti İzmir
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-black leading-[0.9] tracking-[-0.05em] sm:text-7xl">
            14 Temmuz
            <br />
            <span className="text-primary-deep">notwork gecesi</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/65 sm:text-xl">
            Bu sayfa etkinliğin merkezi olacak. Programı, konuşmacıları ve etkinlik günü tüm
            duyuruları buradan takip edebileceksin.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={ticketUrl}
              data-analytics="ticket_click"
              data-meta-event="ViewContent"
              data-meta-content="notwork 14 Temmuz Bileti"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Bilet al
            </a>
            <a
              href="/networking"
              className="rounded-full border border-border bg-card px-6 py-3 font-semibold transition hover:border-primary/60"
            >
              Networking ağı
            </a>
          </div>
        </section>

        <EventReviewsSection reviews={reviews} ratingAverage={ratingAverage} />

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

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="mb-6 max-w-3xl">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary-deep">
              sunucular ve sunumlar
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              Bu etkinlikte kimlerin hikâyelerini dinleyeceğiz?
            </h2>
            <p className="mt-4 leading-relaxed text-foreground/60">
              14 Temmuz notwork gecesinde dört farklı hikâye; ilişki, kariyer, çıkış ve arada
              kalmışlık üzerinden sahneye taşınıyor.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {speakers.map((speaker) => (
              <article
                key={speaker.name}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
              >
                <div className="grid min-h-full sm:grid-cols-[0.38fr_1fr]">
                  <div
                    className={`${speaker.color} flex min-h-32 items-end justify-start p-5 text-primary-foreground`}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.28em] opacity-75">
                        sunucu
                      </div>
                      <div className="mt-2 text-2xl font-black leading-none">
                        {speaker.name.split(" ").map((part) => (
                          <span key={part} className="block">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-deep">
                      {speaker.theme}
                    </div>
                    <h3 className="mt-4 text-3xl font-black leading-tight tracking-[-0.03em]">
                      {speaker.talk}
                    </h3>
                    <blockquote className="mt-5 border-l-4 border-primary pl-4 text-sm leading-relaxed text-foreground/65">
                      “{speaker.quote}”
                    </blockquote>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}

function EventReviewsSection({
  reviews,
  ratingAverage,
}: {
  reviews: EventReview[];
  ratingAverage: number;
}) {
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary-deep">
              etkinlik değerlendirmeleri
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              14 Temmuz için gelen yorumlar
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/60">
              Katılımcıların paylaştığı puanlar, fotoğraflar ve yorumlar burada görünür. Ekibe özel
              notlar bu alanda yayınlanmaz.
            </p>
          </div>
          <a
            href="/etkinlik-degerlendirme"
            className="inline-flex w-fit rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
          >
            Değerlendirme yaz
          </a>
        </div>

        {reviews.length > 0 ? (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-black text-primary-deep">
                {renderStars(Math.round(ratingAverage))} {ratingAverage.toFixed(1)}
              </div>
              <div className="text-sm font-semibold text-foreground/55">
                {reviews.length} değerlendirme
              </div>
            </div>
            <div className="mt-6 -mx-2 overflow-x-auto px-2 pb-2 [scrollbar-width:thin]">
              <div className="flex gap-4">
                {reviews.map((review) => {
                  const isExpanded = !!expandedReviews[review.id];
                  const canExpand = review.comment.length > 170;
                  return (
                    <article
                      key={review.id}
                      className={`flex w-[82vw] max-w-sm shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all sm:w-[340px] ${
                        isExpanded ? "h-auto" : "h-[430px]"
                      }`}
                    >
                      {review.photoDataUrl && (
                        <img
                          src={review.photoDataUrl}
                          alt={`${review.eventTitle} değerlendirme fotoğrafı`}
                          className="h-44 w-full shrink-0 object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="flex flex-1 flex-col p-4">
                        <div className="text-lg text-primary-deep">{renderStars(review.rating)}</div>
                        <p
                          className={`mt-3 text-sm leading-relaxed text-foreground/70 ${
                            isExpanded ? "" : "line-clamp-6"
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
                        <div className="mt-auto pt-4 text-xs font-bold uppercase tracking-[0.18em] text-foreground/45">
                          {review.name || "notwork katılımcısı"}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5 text-sm leading-relaxed text-foreground/65">
            Henüz değerlendirme yok. 14 Temmuz gecesine dair ilk yıldızı ve yorumu sen bırak.
          </div>
        )}
      </div>
    </section>
  );
}

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}
