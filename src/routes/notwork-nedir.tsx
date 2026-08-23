import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MessageCircle, Users } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
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

const whatsappCommunityUrl = "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE";

const eventMoments = [
  { src: "/community/25.jpg", alt: "notwork etkinliğinde sohbet eden katılımcılar" },
  { src: "/community/24.jpg", alt: "notwork networking anında tanışan katılımcılar" },
  { src: "/community/23.jpg", alt: "notwork sahnesini izleyen topluluk" },
  { src: "/community/21.jpg", alt: "notwork etkinliğinde konuşmacı ve katılımcılar" },
  { src: "/community/20.jpg", alt: "notwork etkinliği topluluk fotoğrafı" },
  { src: "/community/19.jpg", alt: "notwork etkinliğinde sahne anı" },
  { src: "/community/2.jpg", alt: "notwork etkinliğinde bağlantı kuran katılımcılar" },
  { src: "/community/3.jpg", alt: "notwork networking gecesinden bir an" },
];

function NotworkNedirPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-9 sm:px-5 sm:pb-16 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
              <span className="h-2 w-2 rounded-full bg-primary" />
              notwork nedir?
            </div>
            <h1 className="mt-5 font-display text-[3.25rem] font-black leading-[0.86] tracking-[-0.06em] sm:mt-6 sm:text-7xl md:text-8xl">
              adım adım networking club
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-7">
              notwork; başarısızlık hikayelerinden çıkarılmış doğru dersleri dinlediğin, sonra bu
              derslerin etrafında doğru insanlarla bağ kurduğun bir community sistemi.
            </p>
            <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-2 sm:mt-8 sm:flex sm:justify-center sm:gap-3">
              <a
                href={whatsappCommunityUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-3 text-center text-xs font-black leading-tight text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-deep sm:rounded-full sm:px-6 sm:text-sm"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                WhatsApp community
              </a>
              <Link
                to="/community"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-card px-3 py-3 text-center text-xs font-black leading-tight transition hover:border-primary hover:bg-primary/10 sm:rounded-full sm:px-6 sm:text-sm"
              >
                <Users className="h-4 w-4 shrink-0 text-primary-deep" />
                Community’yi gör
              </Link>
            </div>
          </div>
        </section>

        <section id="etkinlik-anlari" className="mx-auto max-w-6xl px-4 pb-12 sm:px-5 sm:pb-20">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-7 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                gerçek etkinlik anları
              </div>
              <h2 className="mt-2 max-w-2xl font-display text-3xl font-black tracking-[-0.05em] sm:text-5xl">
                hikâyeden bağlantıya geçen oda
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Sahne, kahkaha, masa sohbetleri ve yeni tanışmalar. notwork’ün nasıl hissettirdiğini
              en iyi bu kareler anlatıyor.
            </p>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-5 sm:px-5">
            <div className="flex w-max snap-x snap-mandatory gap-3">
              {eventMoments.map((image, index) => (
                <figure
                  key={image.src}
                  className={`h-56 w-44 shrink-0 snap-start overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-[var(--shadow-card)] sm:h-72 sm:w-56 ${
                    index === 0 ? "w-64 sm:w-[24rem]" : ""
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading={index < 2 ? "eager" : "lazy"}
                    className="h-full w-full object-cover object-center transition duration-500 hover:scale-105"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-5 sm:pb-20">
          <div className="mb-5 sm:mb-7">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
              önce izle
            </div>
            <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.05em] sm:text-5xl">
              notwork’ü ve sahneyi tanı
            </h2>
          </div>
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

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-5 sm:pb-20">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                event akışı
              </div>
              <h2 className="mt-2 font-display text-2xl font-black tracking-[-0.04em] sm:text-4xl">
                gecenin ritmi
              </h2>
            </div>
            <CalendarDays className="h-7 w-7 shrink-0 text-primary-deep sm:h-9 sm:w-9" />
          </div>
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

        <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-5 sm:pb-24">
          <div className="relative border-l border-primary/30 pl-5 sm:pl-8">
            {steps.map((step, index) => (
              <article key={step.title} className="relative pb-6 last:pb-0 sm:pb-10">
                <span className="absolute -left-[1.92rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-primary bg-background sm:-left-[2.58rem]">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:rounded-[2rem] sm:p-8">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-primary-deep">
                    {step.eyebrow}
                  </div>
                  <h2 className="mt-2.5 font-display text-2xl font-black tracking-[-0.04em] sm:mt-3 sm:text-5xl">
                    {step.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
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

        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-5 sm:pb-20">
          <div className="overflow-hidden rounded-[2rem] border border-primary/25 bg-primary/10 p-6 text-center shadow-[var(--shadow-card)] sm:p-10">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-primary-deep">
              kısa cevap
            </div>
            <p className="mx-auto mt-4 max-w-3xl font-display text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              notwork, başarıdan önceki gerçek deneyimleri duyup sonrasında doğru bağlantılar
              kurduğun yer.
            </p>
            <div className="mt-7 grid gap-2 sm:mt-8 sm:flex sm:justify-center sm:gap-3">
              <a
                href={whatsappCommunityUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-primary-foreground transition hover:bg-primary-deep"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp community’ye katıl
              </a>
              <Link
                to="/community"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-black transition hover:border-primary hover:text-primary-deep"
              >
                community sayfasını gör
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-foreground/60 transition hover:text-primary-deep"
              >
                ana sayfaya dön
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
