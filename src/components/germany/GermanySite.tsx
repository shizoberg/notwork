import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CircleHelp,
  Network,
  UserRound,
  Mic2,
  Radio,
  Menu,
} from "lucide-react";
import type { ReactNode } from "react";
import { desktopGlassStyle, RegionSwitch } from "@/components/SiteNav";
import { COOKIE_CONSENT_OPEN_EVENT } from "@/lib/cookie-consent";

export const germanyLinks = [
  { to: "/de", label: "Über notwork", icon: CircleHelp },
  { to: "/de/events", label: "Events", icon: CalendarDays },
  { to: "/de/networking", label: "Networking", icon: Network },
  { to: "/de/live", label: "Event live", icon: Radio },
  { to: "/de/vortrag", label: "Vortrag halten", icon: Mic2 },
] as const;

export function germanySeo(path: string, title: string, description: string, noindex = false) {
  const url = `https://notwork.me${path}`;
  return {
    meta: [
      { title: `${title} | notwork Deutschland` },
      { name: "description", content: description },
      { name: "robots", content: noindex ? "noindex, follow" : "index, follow" },
      { property: "og:title", content: `${title} | notwork Deutschland` },
      { property: "og:description", content: description },
      { property: "og:locale", content: "de_DE" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function GermanySite({ children, active }: { children: ReactNode; active?: string }) {
  return (
    <>
      <header className="site-header-shell de-site-header sticky top-0 z-40 bg-background/70 backdrop-blur-md">
        <div
          className="desktop-site-header mx-auto hidden max-w-6xl items-center sm:flex"
          style={desktopGlassStyle}
        >
          <Link to="/de" className="desktop-site-brand" aria-label="notwork Deutschland">
            <img
              className="notwork-logo desktop-site-logo"
              src="/brand/notwork-logo.png"
              alt="notwork"
            />
          </Link>
          <nav className="desktop-site-links" aria-label="Hauptmenü">
            {germanyLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                aria-current={active === to ? "page" : undefined}
                className={`desktop-site-link${active === to ? " is-active" : ""}`}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="desktop-site-actions">
            <RegionSwitch german />
            <Link to="/de/profil" className="site-region-switch" aria-label="Mein Profil">
              <UserRound size={17} />
            </Link>
          </div>
        </div>
        <div className="mx-auto grid h-16 grid-cols-[96px_1fr_96px] items-center px-3 sm:hidden">
          <RegionSwitch german className="justify-self-start" />
          <Link to="/de" className="justify-self-center" aria-label="notwork Deutschland">
            <img
              className="notwork-logo mobile-site-logo"
              src="/brand/notwork-logo.png"
              alt="notwork"
            />
          </Link>
          <div className="site-mobile-actions">
            <details className="de-mobile-menu">
              <summary className="site-region-switch" aria-label="Menü öffnen">
                <Menu size={17} />
              </summary>
              <nav aria-label="Weitere Seiten" className="glass-menu de-mobile-menu-panel">
                <Link to="/de">Über notwork</Link>
                <Link to="/de/vortrag">Ich möchte einen Vortrag halten</Link>
                <Link to="/de/datenschutz">Datenschutz</Link>
              </nav>
            </details>
            <Link to="/de/profil" className="site-region-switch" aria-label="Mein Profil">
              <UserRound size={17} />
            </Link>
          </div>
        </div>
      </header>
      <main className="de-site-main">{children}</main>
      <footer className="simple-footer">
        <div className="simple-footer-top">
          <Link to="/de">notwork Deutschland</Link>
          <a href="mailto:berk@notwork.me">Kontakt ↗</a>
        </div>
        <div className="simple-footer-bottom">
          <span>© {new Date().getFullYear()} notwork</span>
          <Link to="/de/vortrag">Ich möchte einen Vortrag halten</Link>
          <Link to="/de/datenschutz">Datenschutz</Link>
          <Link to="/de/cookies">Cookies</Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT))}
          >
            Cookie-Einstellungen
          </button>
        </div>
      </footer>
    </>
  );
}

export function GermanyHome() {
  return (
    <GermanySite active="/de">
      <section className="de-hero">
        <p className="de-kicker">🇩🇪 NOTWORK DEUTSCHLAND · DEUTSCH</p>
        <h1>
          Gute Gespräche.
          <br />
          Echte Verbindungen.
        </h1>
        <p>
          notwork veranstaltet Networking-Events in Deutschland und der Türkei. Wir bringen Menschen
          zusammen, die Erfahrungen teilen, Ideen ausprobieren und gemeinsam etwas aufbauen wollen.
        </p>
        <div className="de-actions">
          <Link to="/de/events" className="de-primary">
            4. Dezember · Zum Event <ArrowRight size={17} />
          </Link>
          <Link to="/de/networking" className="de-secondary">
            Community entdecken
          </Link>
        </div>
      </section>
      <section className="de-feature-grid" aria-label="Das erwartet dich">
        <article className="de-card">
          <CalendarDays />
          <h2>Gemeinsam vor Ort</h2>
          <p>
            Bei unseren Treffen lernst du Menschen kennen, mit denen du Ideen und Erfahrungen
            austauschen kannst.
          </p>
        </article>
        <article className="de-card">
          <Network />
          <h2>Verbindungen, die bleiben</h2>
          <p>
            Entdecke, woran andere arbeiten, was sie suchen und womit sie dich unterstützen können.
          </p>
        </article>
      </section>
    </GermanySite>
  );
}

export function GermanyEvents() {
  return (
    <GermanySite active="/de/events">
      <section className="de-hero">
        <p className="de-kicker">🇩🇪 NOTWORK DEUTSCHLAND · DEUTSCH</p>
        <h1>Events in Deutschland</h1>
        <p>Hier findest du unsere kommenden Treffen und Networking-Events in Deutschland.</p>
      </section>
      <section className="de-card de-empty">
        <CalendarDays size={26} />
        <h2>notwork Deutschland · 4. Dezember 2026</h2>
        <p>Uhrzeit, Veranstaltungsort und Informationen zur Anmeldung folgen.</p>
        <Link to="/de/live" className="de-secondary">
          Match-Demo ausprobieren <ArrowRight size={17} />
        </Link>
      </section>
    </GermanySite>
  );
}
