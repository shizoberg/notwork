import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import gallery2 from "@/assets/gallery/notwork-2.jpg";
import gallery3 from "@/assets/gallery/notwork-3.jpg";
import gallery4 from "@/assets/gallery/notwork-4.jpg";
import gallery6 from "@/assets/gallery/notwork-6.jpg";
import gallery8 from "@/assets/gallery/notwork-8.jpg";
import gallery13 from "@/assets/gallery/notwork-13.jpg";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/notwork-nedir")({
  head: () =>
    createSeo({
      title: "notwork Nedir? | İzmir Network Club",
      description:
        "notwork, İzmir’de başarısızlık hikâyelerinin anlatıldığı ve katılımcıların doğru bağlantılar kurduğu bir network club. Etkinlik akışını ve felsefesini keşfet.",
      path: "/notwork-nedir",
      keywords: ["notwork nedir", "network club nedir", "başarısızlık etkinliği"],
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

        <section className="mx-auto max-w-6xl px-5 pb-10 sm:pb-14">
          <div className="-mx-5 overflow-x-auto px-5 pb-3 [scrollbar-width:thin]">
            <div className="flex snap-x gap-4 lg:grid lg:grid-cols-2">
              {explainerVideos.map((video) => (
                <article
                  key={video.watchUrl}
                  className="w-[82vw] max-w-sm shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[var(--shadow-card)] sm:w-[420px] lg:w-auto lg:max-w-none"
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
                  <div className="p-4 sm:p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary-deep">
                      video
                    </div>
                    <h2 className="mt-2 font-display text-xl font-black tracking-[-0.04em] sm:text-2xl">
                      {video.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-xs leading-6 text-muted-foreground sm:text-sm">
                      {video.text}
                    </p>
                    <a
                      href={video.watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground transition hover:opacity-90"
                    >
                      youtube’da aç
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-8 sm:pb-10">
          <div className="-mx-5 overflow-x-auto px-5 pb-3 [scrollbar-width:thin]">
            <div className="flex snap-x gap-3">
              {flow.map((item, index) => (
                <div
                  key={item}
                  className="w-40 shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:w-48"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary-deep">
                    step {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-3 font-display text-xl font-black tracking-[-0.04em]">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-10 sm:pb-14">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                network anları
              </div>
              <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                insanlar hikayeden sonra tanışıyor
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground">
              etkinlik boyunca sahne, masa sohbetleri ve mikrofon anları aynı hissin parçası:
              güvenli, samimi ve bağlantıya açık bir oda.
            </p>
          </div>
          <div className="-mx-5 overflow-x-auto px-5 pb-3 [scrollbar-width:thin]">
            <div className="flex snap-x gap-3">
              {networkMoments.map((image, index) => (
                <img
                  key={image.alt}
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className={`h-36 w-56 shrink-0 snap-start rounded-2xl object-cover shadow-[var(--shadow-card)] sm:h-44 sm:w-72 ${
                    index === 0 ? "sm:w-[34rem]" : ""
                  }`}
                />
              ))}
            </div>
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
                  {index === 4 ? <MiniNetworkPreview /> : null}
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

function MiniNetworkPreview() {
  const nodes = [
    { x: 18, y: 32, label: "tasarım" },
    { x: 39, y: 20, label: "girişim" },
    { x: 61, y: 35, label: "pazarlama" },
    { x: 82, y: 23, label: "yazılım" },
    { x: 27, y: 68, label: "içerik" },
    { x: 51, y: 60, label: "satış" },
    { x: 73, y: 72, label: "community" },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [0, 5],
    [4, 5],
    [5, 6],
    [2, 6],
    [1, 5],
  ];

  return (
    <Link
      to="/networking"
      className="group mt-6 block overflow-hidden rounded-[1.5rem] border border-primary/25 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_42%),var(--background)] p-4 transition hover:border-primary sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-deep">
            canlı ağ preview
          </div>
          <h3 className="mt-1 font-display text-2xl font-black tracking-[-0.04em]">
            networking ağımızı uzaktan gör
          </h3>
        </div>
        <span className="inline-flex w-fit rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground">
          ağa git →
        </span>
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-card/80 p-2">
        <svg
          viewBox="0 0 100 82"
          role="img"
          aria-label="notwork networking ağı önizleme"
          className="h-44 w-full sm:h-56"
        >
          <defs>
            <linearGradient id="mini-network-line" x1="0" x2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {edges.map(([from, to]) => {
            const first = nodes[from];
            const second = nodes[to];
            return (
              <line
                key={`${from}-${to}`}
                x1={first.x}
                y1={first.y}
                x2={second.x}
                y2={second.y}
                stroke="url(#mini-network-line)"
                strokeWidth="0.8"
              />
            );
          })}
          {nodes.map((node, index) => (
            <g key={node.label} className="transition group-hover:scale-105">
              <circle
                cx={node.x}
                cy={node.y}
                r={index === 5 ? 6.5 : 5.2}
                fill={index === 5 ? "hsl(var(--primary))" : "hsl(var(--card))"}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
              />
              <text
                x={node.x}
                y={node.y + 11}
                textAnchor="middle"
                className="fill-foreground text-[3.4px] font-black"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Link>
  );
}
