import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

const sponsorMailUrl =
  "mailto:berk@carewithki.com?subject=notwork%20sponsorlu%C4%9Fu%20hakk%C4%B1nda%20g%C3%B6r%C3%BC%C5%9Fmek%20istiyorum";

export const Route = createFileRoute("/sponsor")({
  head: () => ({
    meta: [
      { title: "notwork Sponsor Ol | Marka Deneyimi ve Meslek Bazlı Etkinlikler" },
      {
        name: "description",
        content:
          "notwork sponsorluğu ile markanız için etkinlik içi çekim, ürün deneyimi, doğru konsept eşleşmesi ve meslek bazlı özel networking etkinlikleri tasarlıyoruz.",
      },
      {
        name: "keywords",
        content:
          "notwork sponsor, İzmir etkinlik sponsorluğu, marka deneyimi, ürün deneyimi, meslek bazlı etkinlik, notpharmacy, notdoctor, notarchitecture",
      },
      { property: "og:title", content: "notwork Sponsor Ol" },
      {
        property: "og:description",
        content:
          "Markanızı notwork sahnesiyle buluşturun: çekim hizmeti, ürün deneyimi ve meslek bazlı özel etkinlik formatları.",
      },
      { property: "og:url", content: "https://notwork.me/sponsor" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
      { name: "twitter:title", content: "notwork Sponsor Ol" },
      {
        name: "twitter:description",
        content:
          "notwork sponsorluğu ile markanız için doğru konsepti ve hedef topluluğu buluşturuyoruz.",
      },
      { name: "twitter:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/sponsor" }],
  }),
  component: SponsorPage,
});

const sponsorBenefits = [
  {
    title: "Etkinlik içi çekim hizmeti",
    text: "Markanızın etkinlikteki görünürlüğünü fotoğraf ve video içeriklerle destekliyoruz. Etkinlik sonrası kullanılabilir içerik havuzu oluşturuyoruz.",
  },
  {
    title: "Marka-konsept eşleşmesi",
    text: "Ürününüzü veya hizmetinizi notwork ruhuna uygun bir deneyimle buluşturuyoruz; sahne, networking ve topluluk akışına doğal şekilde yerleştiriyoruz.",
  },
  {
    title: "Ürün deneyimi",
    text: "Katılımcıların markanızla temas edeceği tadım, demo, hediye, deneyim alanı veya interaktif aktivite kurguları tasarlıyoruz.",
  },
];

const verticalEvents = [
  {
    name: "notpharmacy",
    text: "Eczacılık, sağlık perakendesi ve wellness çevresini aynı mesleki bağlamda buluşturan özel format.",
  },
  {
    name: "notdoctor",
    text: "Doktorlar, sağlık profesyonelleri ve sağlık girişimleri için meslek odaklı deneyim ve networking alanı.",
  },
  {
    name: "notarchitecture",
    text: "Mimarlar, tasarımcılar, yapı ve yaratıcı endüstri profesyonelleri için kategori bazlı notwork buluşması.",
  },
];

function SponsorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-12 pt-12 sm:pb-16 sm:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-deep">
            <span className="h-2 w-2 rounded-full bg-primary blink" />
            markalar için notwork
          </div>
          <div className="mt-7 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-black leading-[0.9] tracking-[-0.05em] sm:text-7xl">
                notwork’e <span className="text-primary-deep">sponsor olun</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/65 sm:text-xl">
                notwork olarak etkinliklerimizde markanız için çekim hizmeti sağlıyor, markanızla
                uygun konsepti buluşturuyor ve katılımcılara gerçek bir ürün deneyimi sunuyoruz.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary-deep">
                sponsor görüşmesi
              </div>
              <p className="mt-4 text-foreground/65">
                Markanız için doğru etkinlik formatını birlikte tasarlamak üzere bize ulaşın.
              </p>
              <a
                href={sponsorMailUrl}
                className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Sponsor olmak istiyorum
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-14 md:grid-cols-3">
          {sponsorBenefits.map((benefit) => (
            <article key={benefit.title} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-2xl font-bold">{benefit.title}</h2>
              <p className="mt-4 leading-relaxed text-foreground/60">{benefit.text}</p>
            </article>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="rounded-3xl border border-primary/25 bg-primary/10 p-6 sm:p-8">
            <div className="max-w-3xl">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary-deep">
                meslek bazlı özel etkinlikler
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] sm:text-5xl">
                Markanızı doğru meslek topluluğuyla buluşturuyoruz.
              </h2>
              <p className="mt-4 leading-relaxed text-foreground/65">
                notpharmacy, notdoctor, notarchitecture gibi meslek bazlı spesifik eventler host
                ediyoruz. Buradaki temel amaç etkinliğin net bir meslek kategorisine odaklanması ve
                markanızın doğru bağlamda deneyimlenmesi.
              </p>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {verticalEvents.map((event) => (
                <article
                  key={event.name}
                  className="rounded-2xl border border-border bg-background p-5"
                >
                  <div className="font-brand text-2xl text-primary-deep">{event.name}</div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/60">{event.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
