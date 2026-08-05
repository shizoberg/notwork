import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

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
    eyebrow: "03 · sistem",
    title: "dinlemekten bağlantıya geçiyoruz",
    text: "sunum sonrası networking alanı açılıyor. qr, match lab ve community kayıtlarıyla insanların birbirini daha kolay bulmasını sağlıyoruz.",
  },
  {
    eyebrow: "04 · felsefe",
    title: "başarısızlık burada sosyal sermaye",
    text: "çünkü hatalar konuşulunca insanlar daha hızlı yakınlaşıyor. notwork, filtrelenmiş başarı hikayeleri yerine gerçek deneyimlerden bağ kurmayı seçiyor.",
  },
];

const flow = ["karşılama", "ısınma", "hikayeler", "dersler", "networking", "community"];

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

        <section className="mx-auto max-w-6xl px-5 pb-12">
          <div className="grid gap-4 md:grid-cols-4">
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
