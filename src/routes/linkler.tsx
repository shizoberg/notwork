import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, Gamepad2, MessageCircle, Utensils } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/linkler")({
  head: () => ({
    meta: [
      { title: "notwork Linkler | Oyun, WhatsApp ve Menü" },
      {
        name: "description",
        content: "notwork etkinlik bağlantıları, interaktif Mentimeter oyunu, WhatsApp ve menü.",
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
    href: "https://www.menti.com/",
    icon: Gamepad2,
  },
  {
    title: "WhatsApp Topluluğu",
    description: "Topluluğa katıl ve duyuruları takip et",
    href: "https://wa.me/905457210929",
    icon: MessageCircle,
  },
];

const menuImages: string[] = [];

function LinksPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:py-16">
      <div className="mx-auto max-w-xl">
        <header className="text-center">
          <a href="/" className="inline-flex items-center gap-2 font-brand text-3xl">
            <span className="h-3 w-3 rounded-full bg-primary" />
            notwork
          </a>
          <p className="mt-3 text-sm text-foreground/55">etkinlik bağlantıları</p>
        </header>

        <section className="mt-10 grid gap-3">
          {links.map(({ title, description, href, icon: Icon }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary-deep">
                <Icon size={24} strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{title}</span>
                <span className="mt-0.5 block text-xs text-foreground/50">{description}</span>
              </span>
              <ExternalLink
                size={18}
                className="shrink-0 text-foreground/35 transition group-hover:text-primary-deep"
              />
            </a>
          ))}
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/60"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary-deep">
              <Utensils size={24} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Menü</span>
              <span className="mt-0.5 block text-xs text-foreground/50">
                Yeme-içme menüsünü görüntüle
              </span>
            </span>
            <ChevronDown
              size={20}
              className={`shrink-0 text-foreground/45 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="border-t border-border p-4 sm:p-5">
              {menuImages.length > 0 ? (
                <div className="grid gap-4">
                  {menuImages.map((image, index) => (
                    <img
                      key={image}
                      src={image}
                      alt={`notwork menü ${index + 1}`}
                      className="w-full rounded-xl border border-border object-contain"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-muted/60 px-5 py-10 text-center">
                  <Utensils className="mx-auto text-primary-deep" size={28} strokeWidth={1.6} />
                  <p className="mt-3 text-sm font-semibold">Menü görselleri hazırlanıyor.</p>
                  <p className="mt-1 text-xs text-foreground/50">
                    Görseller eklendiğinde burada kaydırılabilir şekilde açılacak.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-foreground/40">
          notwork · İzmir
        </footer>
      </div>
    </main>
  );
}
