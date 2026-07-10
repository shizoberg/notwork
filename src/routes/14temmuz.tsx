import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

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

function JulyFourteenth() {
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
      </main>
      <SiteFooter />
    </div>
  );
}
