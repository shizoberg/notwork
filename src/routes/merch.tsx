import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gift, KeyRound, PackageOpen, Shirt, Sparkles } from "lucide-react";

import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";

const products = [
  {
    id: "sticker-keychain",
    eyebrow: "ntw set 01",
    name: "ntw sticker + anahtarlık",
    description:
      "notwork çizimlerinden oluşan sticker paketi ve çantanda, anahtarında ya da kartlığında taşıyabileceğin ntw anahtarlık.",
    image: "/community/12.jpg",
    imageAlt: "ntw sticker paketi ve notwork anahtarlık",
    icon: PackageOpen,
    tone: "bg-[#d9f3f2] text-[#0f4d52]",
  },
  {
    id: "keychain",
    eyebrow: "ntw object 02",
    name: "ntw anahtarlık",
    description:
      "notwork logosunu günlük hayatına taşıyan hafif, renkli ve sınırlı üretim anahtarlık.",
    image: "/community/10.jpg",
    imageAlt: "notwork üyesinin kullandığı ntw anahtarlık ve etkinlik kartı",
    icon: KeyRound,
    tone: "bg-[#ffe1ee] text-[#6a2944]",
  },
  {
    id: "tshirt",
    eyebrow: "ntw wear 03",
    name: "ntw tişört",
    description:
      "Ön ve arka notwork baskısıyla community ruhunu etkinliğin dışına taşıyan rahat kesim tişört.",
    image: "/community/11.jpg",
    imageAlt: "beyaz notwork baskılı ntw tişört",
    icon: Shirt,
    tone: "bg-[#dfd4ff] text-[#3f2d67]",
  },
] as const;

export const Route = createFileRoute("/merch")({
  head: () =>
    createSeo({
      title: "notwork Merch | ntw Sticker, Anahtarlık ve Tişört",
      description:
        "ntw sticker paketi, notwork anahtarlık ve ntw tişört ürünlerini keşfet. notwork community ruhunu yanında taşı.",
      path: "/merch",
      keywords: [
        "notwork merch",
        "ntw sticker",
        "notwork anahtarlık",
        "ntw tişört",
        "notwork ürünleri",
      ],
    }),
  component: MerchPage,
});

function MerchPage() {
  return (
    <div className="min-h-screen bg-[#f4f8f7] text-foreground">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden border-b border-border/60 px-3 py-10 sm:px-6 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(143,203,208,0.38),transparent_30%),radial-gradient(circle_at_92%_20%,rgba(255,171,207,0.3),transparent_28%),linear-gradient(180deg,#f8fbfa_0%,#eef6f5_100%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary-deep backdrop-blur sm:text-xs">
                <Sparkles size={14} /> notwork / merch
              </div>
              <h1 className="mt-5 font-brand text-[3.8rem] leading-[0.78] tracking-[-0.055em] sm:text-8xl lg:text-[8.5rem]">
                notwork merch
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-xl">
                Bir geceden kalan enerjiyi yanında taşı. ntw sticker, anahtarlık ve tişörtler;
                community içinde üretilen sınırlı parçalar.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-[#f2c55b]/45 bg-[#fff3c9] px-4 py-3 text-[#523a06]">
                <Gift size={20} className="shrink-0" />
                <span className="text-sm font-bold leading-snug">
                  9 Ekim notwork Classic biletlerinde sticker paketi + ntw anahtarlık hediye.
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/85 bg-[#071416] shadow-[0_28px_80px_rgba(15,45,50,0.2)] sm:rounded-[3rem]">
              <div className="aspect-[5/4] sm:aspect-[16/10]">
                <img
                  src="/community/12.jpg"
                  alt="ntw sticker paketi ve notwork anahtarlık"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "center 58%" }}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-white sm:inset-x-7 sm:bottom-7">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65">
                    featured drop
                  </div>
                  <div className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-4xl">
                    ntw sticker + anahtarlık
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-foreground sm:text-xs">
                  yakında satışta
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-20">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                ntw collection
              </div>
              <h2 className="mt-2 font-display text-4xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl">
                Community’den çıkan parçalar.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              İlk drop sınırlı üretilecek. Fiyat ve satış bağlantıları ürünler hazır olduğunda
              burada açılacak.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3 sm:mt-10">
            {products.map((product, index) => {
              const Icon = product.icon;
              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_16px_48px_rgba(15,45,50,0.09)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#dce9e8]">
                    <img
                      src={product.image}
                      alt={product.imageAlt}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                      style={{ objectPosition: product.id === "tshirt" ? "center 62%" : "center" }}
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.17em] text-white backdrop-blur">
                      {String(index + 1).padStart(2, "0")} / limited
                    </span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${product.tone}`}
                      >
                        <Icon size={20} />
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                        yakında satışta
                      </span>
                    </div>
                    <div className="mt-4 text-[10px] font-black uppercase tracking-[0.19em] text-primary-deep">
                      {product.eyebrow}
                    </div>
                    <h3 className="mt-2 text-2xl font-black leading-tight tracking-[-0.035em]">
                      {product.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-t border-border/60 bg-[#071416] px-3 py-10 text-white sm:px-6 sm:py-16">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[#8fcbd0]">
                first access
              </div>
              <h2 className="mt-2 max-w-2xl font-display text-3xl font-black leading-[0.95] tracking-[-0.045em] sm:text-5xl">
                İlk merch drop’unu etkinliklerde gör.
              </h2>
            </div>
            <Link
              to="/etkinlikler"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#8fcbd0] px-5 py-3 text-sm font-black text-[#071416] transition hover:-translate-y-0.5 hover:bg-white"
            >
              Etkinlikleri gör <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
