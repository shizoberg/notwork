import { createFileRoute } from "@tanstack/react-router";

const legacyMailUrl =
  "mailto:berk@carewithki.com?subject=notwork%20legacy%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum";

export const Route = createFileRoute("/legacy")({
  head: () => ({
    meta: [
      { title: "notwork Legacy | Private Üyelik ve Özel Toplanmalar" },
      {
        name: "description",
        content:
          "notwork Legacy; düzenli etkinliklere katılan, topluluğu geliştiren ve seçilen üyelerin özel yemeklere, private buluşmalara ve premium metal kartvizite davet edildiği üyelik deneyimidir.",
      },
      {
        name: "keywords",
        content:
          "notwork legacy, notwork private etkinlik, notwork üyelik, İzmir özel networking, premium networking, metal kartvizit",
      },
      { property: "og:title", content: "notwork Legacy" },
      {
        property: "og:description",
        content:
          "Seçilmiş notwork üyeleri için private toplanmalar, özel yemekler ve premium metal kartvizit deneyimi.",
      },
      { property: "og:url", content: "https://notwork.me/legacy" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
      { name: "twitter:title", content: "notwork Legacy" },
      {
        name: "twitter:description",
        content:
          "notwork topluluğunun seçilmiş üyeleri için özel, private ve premium üyelik deneyimi.",
      },
      { name: "twitter:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/legacy" }],
  }),
  component: LegacyPage,
});

const principles = [
  "notwork Legacy üyelerine e-posta yolu ile ulaşılır.",
  "Düzenli etkinliğe katılan ve topluluğu geliştiren üyeler seçilir.",
  "Üyelik yıllık abonelik modeliyle ilerler.",
  "Özel yemekler ve private notwork toplanmaları düzenlenir.",
  "Üyelere özel notwork premium metal kartvizit verilir.",
];

function LegacyPage() {
  return (
    <div className="min-h-screen bg-[#080705] text-[#f4ead7]">
      <main>
        <section className="relative overflow-hidden px-5 py-16 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(143,203,208,0.12),transparent_28%)]" />
          <div className="relative mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-[#f2d57b]">
              <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
              private invitation system
            </div>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl font-display text-6xl font-black leading-[0.82] tracking-[-0.06em] sm:text-8xl">
                  notwork <span className="text-[#d4af37]">legacy</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#f4ead7]/70 sm:text-xl">
                  Seçilmiş kişilerin notwork özel toplanmalarına davet edildiği, daha private ve
                  daha özel hissettiren üyelik sistemi.
                </p>
              </div>
              <div className="rounded-[2rem] border border-[#d4af37]/30 bg-[#14100a]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
                <div className="text-xs font-bold uppercase tracking-[0.35em] text-[#d4af37]">
                  sadece davetle
                </div>
                <p className="mt-4 text-[#f4ead7]/70">
                  Legacy üyeleri, düzenli katılım ve topluluğa katkı üzerinden seçilir. Davetler
                  e-posta yoluyla iletilir.
                </p>
                <a
                  href={legacyMailUrl}
                  className="mt-6 inline-flex rounded-full bg-[#d4af37] px-5 py-3 font-bold text-[#080705] transition hover:opacity-90"
                >
                  Legacy hakkında bilgi al
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3">
          <article className="rounded-3xl border border-[#d4af37]/25 bg-[#14100a] p-6">
            <div className="text-sm font-bold uppercase tracking-[0.25em] text-[#d4af37]">01</div>
            <h2 className="mt-5 text-2xl font-black">Özel toplanmalar</h2>
            <p className="mt-3 leading-relaxed text-[#f4ead7]/65">
              Daha küçük, seçilmiş ve bağ kurmaya odaklı notwork buluşmaları. Amaç kalabalık değil,
              doğru kişilerin aynı masaya oturması.
            </p>
          </article>
          <article className="rounded-3xl border border-[#d4af37]/25 bg-[#14100a] p-6">
            <div className="text-sm font-bold uppercase tracking-[0.25em] text-[#d4af37]">02</div>
            <h2 className="mt-5 text-2xl font-black">Özel yemekler</h2>
            <p className="mt-3 leading-relaxed text-[#f4ead7]/65">
              Yıllık üyelik kapsamında özel yemekler, davetli masaları ve daha derin tanışma
              ortamları kurgulanır.
            </p>
          </article>
          <article className="rounded-3xl border border-[#d4af37]/25 bg-[#14100a] p-6">
            <div className="text-sm font-bold uppercase tracking-[0.25em] text-[#d4af37]">03</div>
            <h2 className="mt-5 text-2xl font-black">Metal kartvizit</h2>
            <p className="mt-3 leading-relaxed text-[#f4ead7]/65">
              notwork Legacy üyelerine özel premium metal kartvizit verilir; üyelik hissi somut bir
              objeye dönüşür.
            </p>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="rounded-[2rem] border border-[#d4af37]/25 bg-[#0f0b07] p-6 sm:p-8">
            <h2 className="text-3xl font-black tracking-[-0.03em] sm:text-5xl">
              Legacy’ye kimler seçilir?
            </h2>
            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {principles.map((principle) => (
                <div key={principle} className="flex gap-3 rounded-2xl bg-[#f4ead7]/5 p-4">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#d4af37]" />
                  <span className="text-[#f4ead7]/72">{principle}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#d4af37]/20 px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-[#f4ead7]/55 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-brand text-2xl text-[#d4af37]">notwork legacy</div>
            <div className="mt-1">private invitation system · İzmir</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" className="hover:text-[#d4af37]">
              notwork ana sayfa
            </a>
            <a href={legacyMailUrl} className="hover:text-[#d4af37]">
              e-posta ile bilgi al
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
