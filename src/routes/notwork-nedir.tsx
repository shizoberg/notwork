import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import gallery2 from "@/assets/gallery/notwork-2.jpg";
import gallery3 from "@/assets/gallery/notwork-3.jpg";
import gallery4 from "@/assets/gallery/notwork-4.jpg";
import gallery6 from "@/assets/gallery/notwork-6.jpg";
import gallery8 from "@/assets/gallery/notwork-8.jpg";
import gallery13 from "@/assets/gallery/notwork-13.jpg";

export const Route = createFileRoute("/notwork-nedir")({
  head: () => ({
    meta: [
      { title: "notwork nedir? | networking club" },
      {
        name: "description",
        content:
          "notwork; başarısızlık hikayelerinden çıkarılmış doğru dersleri dinlediğin, sonra doğru insanlarla bağ kurduğun İzmir merkezli networking club.",
      },
      {
        name: "keywords",
        content:
          "notwork nedir, networking club, İzmir networking, başarısızlık hikayeleri, notwork felsefe, notwork event akışı",
      },
      { property: "og:title", content: "notwork nedir? | networking club" },
      {
        property: "og:description",
        content: "event akışı, sistem ve felsefe: notwork’ün nasıl çalıştığını adım adım keşfet.",
      },
      { property: "og:url", content: "https://notwork.me/notwork-nedir" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/notwork-nedir" }],
  }),
  component: NotworkNedirPage,
});

const steps = [
  {
    eyebrow: "01 · giriş",
    title: "önce aynı odada buluşuyoruz",
    text: "notwork bir networking club. ama klasik kartvizit değiş tokuşu değil; insanlar önce gerçek hikayelerle aynı frekansa geliyor.",
  },
  {
    eyebrow: "02 · event akışı",
    title: "sahne, hikaye ve ders",
    text: "konuşmacılar uğraşıp olduramadıkları deneyimleri anlatıyor. asıl odak, o deneyimden çıkan doğru ders ve bugün geldikleri nokta.",
  },
  {
    eyebrow: "03 · anket oyunu",
    title: "salonu oyuna dahil ediyoruz",
    text: "sunumlar başlamadan kısa bir interaktif anket oyunu oynuyoruz. herkes tek kelimelik cevaplar veriyor; sahnede oluşan ortak kelimeler salonun enerjisini görünür yapıyor.",
  },
  {
    eyebrow: "04 · sistem",
    title: "sizi eşleştiren bir yazılım kullanıyoruz",
    text: "networking kısmında sadece rastgele tanıştırmıyoruz. kayıt olurken yazdığın ihtiyaçlar ve sunabileceklerin üzerinden seni konuşma ihtimali yüksek kişilerle eşleştiren kısa bir sistem kullanıyoruz.",
  },
  {
    eyebrow: "05 · felsefe",
    title: "başarısızlık burada sosyal sermaye",
    text: "çünkü hatalar konuşulunca insanlar daha hızlı yakınlaşıyor. notwork, filtrelenmiş başarı hikayeleri yerine gerçek deneyimlerden bağ kurmayı seçiyor.",
  },
];

const flow = [
  "karşılama",
  "anket oyunu",
  "hikayeler",
  "dersler",
  "match lab",
  "networking",
  "community",
];

const explainerVideos = [
  {
    title: "notwork’ü berk ve armağan anlatıyor",
    text: "notwork’ün neden ortaya çıktığını, sahnede ne konuşulduğunu ve bu community hissinin nasıl kurulduğunu en kapsamlı videoda izleyebilirsin.",
    embedUrl: "https://www.youtube.com/embed/vtzncdq4Jlk",
    watchUrl: "https://www.youtube.com/watch?v=vtzncdq4Jlk",
  },
  {
    title: "örnek sunum izle",
    text: "notwork sahnesindeki tonu, hikaye anlatımını ve başarısızlıktan çıkarılan ders akışını görmek için örnek sunumu izleyebilirsin.",
    embedUrl: "https://www.youtube.com/embed/uvTP_j3o76c",
    watchUrl: "https://www.youtube.com/watch?v=uvTP_j3o76c",
  },
];

const networkMoments = [
  { src: gallery4, alt: "notwork etkinliğinde katılımcıların sahneye eşlik ettiği an" },
  { src: gallery6, alt: "notwork networking anında mikrofonla konuşan katılımcı" },
  { src: gallery8, alt: "notwork etkinliğinde masada sohbet eden katılımcılar" },
  { src: gallery13, alt: "notwork etkinliğinde hikaye dinleyen katılımcılar" },
  { src: gallery2, alt: "notwork etkinliğinde sunumu dinleyen katılımcı" },
  { src: gallery3, alt: "notwork etkinliğinde mikrofon uzatılan katılımcı" },
];

function NotworkNedirPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
              <span className="h-2 w-2 rounded-full bg-primary" />
              notwork nedir?
            </div>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.86] tracking-[-0.06em] sm:text-7xl md:text-8xl">
              adım adım networking club
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              notwork; başarısızlık hikayelerinden çıkarılmış doğru dersleri dinlediğin, sonra bu
              derslerin etrafında doğru insanlarla bağ kurduğun bir community sistemi.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-20">
          <div className="grid gap-5 lg:grid-cols-2">
            {explainerVideos.map((video) => (
              <article
                key={video.watchUrl}
                className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-card)]"
              >
                <div className="aspect-video bg-ink">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                    video
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.04em]">
                    {video.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{video.text}</p>
                  <a
                    href={video.watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground transition hover:opacity-90"
                  >
                    youtube’da aç
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((item, index) => (
              <div
                key={item}
                className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                  step {String(index + 1).padStart(2, "0")}
                </div>
                <div className="mt-4 font-display text-2xl font-black tracking-[-0.04em]">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-20">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                network anları
              </div>
              <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                insanlar hikayeden sonra tanışıyor
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              etkinlik boyunca sahne, masa sohbetleri ve mikrofon anları aynı hissin parçası:
              güvenli, samimi ve bağlantıya açık bir oda.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {networkMoments.map((image, index) => (
              <img
                key={image.alt}
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className={`h-44 w-full rounded-3xl object-cover shadow-[var(--shadow-card)] sm:h-64 ${
                  index === 0 ? "md:col-span-2" : ""
                }`}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-16 sm:pb-24">
          <div className="relative border-l border-primary/30 pl-5 sm:pl-8">
            {steps.map((step, index) => (
              <article key={step.title} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[1.92rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-primary bg-background sm:-left-[2.58rem]">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-primary-deep">
                    {step.eyebrow}
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                    {step.title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                    {step.text}
                  </p>
                  {index === 1 ? (
                    <div className="mt-6 grid gap-3 text-sm font-bold sm:grid-cols-3">
                      <span className="rounded-2xl bg-primary/10 px-4 py-3 text-primary-deep">
                        kariyer
                      </span>
                      <span className="rounded-2xl bg-primary/10 px-4 py-3 text-primary-deep">
                        ilişki
                      </span>
                      <span className="rounded-2xl bg-primary/10 px-4 py-3 text-primary-deep">
                        macera
                      </span>
                    </div>
                  ) : null}
                  {index === 3 ? (
                    <div className="mt-6 grid gap-3 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary-deep">
                          kişi a
                        </div>
                        <div className="mt-2 font-bold">sunabilir: tasarım, içerik</div>
                        <div className="mt-1 text-muted-foreground">arıyor: müşteri, fikir</div>
                      </div>
                      <div className="flex items-center justify-center rounded-2xl bg-primary/10 px-4 py-3 text-xl font-black text-primary-deep">
                        ↔
                      </div>
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary-deep">
                          kişi b
                        </div>
                        <div className="mt-2 font-bold">sunabilir: müşteri ağı</div>
                        <div className="mt-1 text-muted-foreground">arıyor: tasarım desteği</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-20">
          <div className="overflow-hidden rounded-[2rem] border border-primary/25 bg-primary/10 p-6 text-center shadow-[var(--shadow-card)] sm:p-10">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-primary-deep">
              kısa cevap
            </div>
            <p className="mx-auto mt-4 max-w-3xl font-display text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              notwork, başarıdan önceki gerçek deneyimleri duyup sonrasında doğru bağlantılar
              kurduğun yer.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
              >
                ana sayfaya dön
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-black transition hover:border-primary hover:text-primary-deep"
              >
                sahneye hikaye gönder
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
