import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, Gamepad2, MessageCircle, Percent, Utensils } from "lucide-react";
import { useState } from "react";

import aperolSpritz from "@/assets/menu/aperol-spritz.jpg";
import baharatliPatates from "@/assets/menu/baharatli-patates.jpg";
import chickenBurger from "@/assets/menu/chicken-burger.jpg";
import classicDoubleSmash from "@/assets/menu/classic-double-smash.jpg";
import longIslandIceTea from "@/assets/menu/long-island-ice-tea.jpg";
import mojito from "@/assets/menu/mojito.jpg";
import peynirliNachos from "@/assets/menu/peynirli-nachos.jpg";

export const Route = createFileRoute("/linkler")({
  head: () => ({
    meta: [
      { title: "notwork Linkler | Oyun, WhatsApp ve Menü" },
      {
        name: "description",
        content: "notwork etkinlik bağlantıları, interaktif Mentimeter oyunu, WhatsApp ve özel indirimli menü.",
      },
      { property: "og:title", content: "notwork linkler" },
      { property: "og:url", content: "https://notwork.me/linkler" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/linkler" }],
  }),
  component: LinksPage,
});

const links = [
  {
    title: "İnteraktif Oyun MentiMeter",
    description: "Canlı oyuna katıl",
    href: "https://www.menti.com/al2y33r8a21w",
    icon: Gamepad2,
  },
  {
    title: "WhatsApp Topluluğu",
    description: "Topluluğa katıl ve duyuruları takip et",
    href: "https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE",
    icon: MessageCircle,
  },
];

const featuredItems = [
  {
    name: "Chicken Burger",
    image: chickenBurger,
    originalPrice: 759,
    discountPrice: 607,
    content: "120 gr tavuk, burger peyniri, iceberg, acılı Smash sos, Honey Glaze sos ve baharatlı patates tava",
  },
  {
    name: "Classic Double Smash",
    image: classicDoubleSmash,
    originalPrice: 787,
    discountPrice: 630,
    content: "140 gr burger köftesi, burger peyniri, karamelize soğan, Classic Smash sos, kornişon turşu ve baharatlı patates tava",
  },
  {
    name: "Peynirli Nachos",
    image: peynirliNachos,
    originalPrice: 605,
    discountPrice: 484,
    content: "Mozzarella ve burger peyniri, renkli biberler, soğan, Meksika fasulyesi, jalapeno; sour cream, salsa ve guacamole dip sos",
  },
  {
    name: "Baharatlı Patates Tava",
    image: baharatliPatates,
    originalPrice: 473,
    discountPrice: 378,
    content: "Baharatlı patates tava",
  },
  {
    name: "Aperol Spritz",
    image: aperolSpritz,
    originalPrice: 638,
    discountPrice: 510,
    content: "Aperol, prosecco ve soda",
  },
  {
    name: "Long Island Ice Tea",
    image: longIslandIceTea,
    originalPrice: 638,
    discountPrice: 510,
    content: "Absolut Vodka, Beefeater Gin, Casamigos Blanco, Havana Club, Triple Sec ve turunç kola (Bubble seçeneğiyle)",
  },
  {
    name: "Mojito",
    image: mojito,
    originalPrice: 638,
    discountPrice: 510,
    content: "Havana Club, limon, şeker şurubu, soda ve nane",
  },
];

const beers = [
  ["Stella Artois 44 cl", 369, 295],
  ["Belfast 50 cl", 325, 260],
  ["Efes Pilsen 50 cl", 319, 255],
  ["Efes Malt 50 cl", 325, 260],
  ["Efes Pilsen Green 50 cl", 325, 260],
  ["Efes Pilsen Glutensiz 50 cl", 336, 269],
  ["Bomonti Filtresiz 50 cl", 325, 260],
  ["Beck’s 33 cl", 336, 269],
  ["Miller 33 cl", 347, 278],
  ["Erdinger 33 cl", 396, 317],
  ["Amsterdam Navigator 50 cl", 396, 317],
  ["Duvel 33 cl", 462, 370],
  ["Bud 33 cl", 330, 264],
  ["Corona 33 cl", 402, 322],
] as const;

const otherDrinks = [
  ["Hunger Lust House Wine", 457, 366],
  ["Damla Su 330 ml", 116, 93],
] as const;

function Price({ original, discounted }: { original: number; discounted: number }) {
  return (
    <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
      <span className="text-xl font-black text-primary-deep">{discounted} TL</span>
      <span className="pb-0.5 text-xs text-foreground/40 line-through">{original} TL</span>
      <span className="w-full text-[10px] font-bold uppercase tracking-[0.14em] text-primary-deep">
        notwork özel indirim
      </span>
    </div>
  );
}

function CompactMenuList({ items }: { items: ReadonlyArray<readonly [string, number, number]> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map(([name, original, discounted]) => (
        <article key={name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-4 py-3">
          <h4 className="text-sm font-bold leading-tight">{name}</h4>
          <div className="shrink-0 text-right">
            <p className="font-black text-primary-deep">{discounted} TL</p>
            <p className="text-[10px] text-foreground/40 line-through">{original} TL</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function LinksPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <a href="/" className="inline-flex items-center gap-2 font-brand text-3xl">
            <span className="h-3 w-3 rounded-full bg-primary" />
            notwork
          </a>
          <p className="mt-3 text-sm text-foreground/55">etkinlik bağlantıları</p>
        </header>

        <section className="mx-auto mt-10 grid max-w-xl gap-3">
          {links.map(({ title, description, href, icon: Icon }) => (
            <a key={title} href={href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary-deep"><Icon size={24} strokeWidth={1.8} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{title}</span>
                <span className="mt-0.5 block text-xs text-foreground/50">{description}</span>
              </span>
              <ExternalLink size={18} className="shrink-0 text-foreground/35 transition group-hover:text-primary-deep" />
            </a>
          ))}
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <button type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/60">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary-deep"><Utensils size={24} strokeWidth={1.8} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Menü</span>
              <span className="mt-0.5 block text-xs text-foreground/50">notwork misafirlerine özel %20 indirimli menü</span>
            </span>
            <ChevronDown size={20} className={`shrink-0 text-foreground/45 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="border-t border-border p-4 sm:p-6">
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-primary/10 p-4 text-primary-deep">
                <Percent size={22} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-black">notwork özel indirim</p>
                  <p className="mt-0.5 text-xs opacity-75">Aşağıdaki fiyatlara %20 indirim uygulanmıştır.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredItems.map((item) => (
                  <article key={item.name} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                    <img src={item.image} alt={item.name} className="aspect-square w-full object-cover" loading="lazy" />
                    <div className="p-4">
                      <h3 className="text-lg font-black">{item.name}</h3>
                      <p className="mt-2 min-h-12 text-xs leading-relaxed text-foreground/55">{item.content}</p>
                      <div className="mt-4"><Price original={item.originalPrice} discounted={item.discountPrice} /></div>
                    </div>
                  </article>
                ))}
              </div>

              <section className="mt-7">
                <h3 className="mb-3 text-lg font-black">Şişe Biralar</h3>
                <CompactMenuList items={beers} />
              </section>

              <section className="mt-7">
                <h3 className="mb-3 text-lg font-black">Diğer İçecekler</h3>
                <CompactMenuList items={otherDrinks} />
              </section>

              <p className="mt-5 text-center text-[10px] text-foreground/40">Alkollü içecekler yalnızca 18 yaş ve üzeri misafirler içindir.</p>
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-foreground/40">notwork · İzmir</footer>
      </div>
    </main>
  );
}
