import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CircleHelp,
  Images,
  Instagram,
  Menu,
  MessageCircle,
  Network,
  Presentation,
  Radio,
  ShoppingBag,
  Sparkles,
  UserRound,
  Youtube,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COOKIE_CONSENT_OPEN_EVENT } from "@/lib/cookie-consent";
import { withEventSelection } from "@/lib/event-registry";
import { getMyMemberProfile, MEMBER_SESSION_CHANGED_EVENT } from "@/lib/member-profile-api";

type SiteNavVariant = "default" | "event" | "eventDark";

const desktopLinks = [
  { to: "/notwork-nedir", label: "notwork nedir", icon: CircleHelp },
  { to: "/etkinlikler", label: "Etkinlikler", icon: CalendarDays },
  { to: "/networking", label: "Networking", icon: Network },
] as const;

const desktopMenuLinks = [
  { to: "/sunum-yukle", label: "Sunum yapmak istiyorum", icon: Presentation },
  { to: "/ntw", label: "Etkinlik anı", icon: Radio },
  { to: "/sponsor", label: "Sponsor", icon: Sparkles },
  { to: "/merch", label: "Merch", icon: ShoppingBag },
] as const;

export const desktopGlassStyle = {
  backdropFilter: "blur(24px) saturate(165%)",
  WebkitBackdropFilter: "blur(24px) saturate(165%)",
};

const regionalPages: Record<string, string> = {
  "/notwork-nedir": "/de/ueber-notwork",
  "/etkinlikler": "/de/events",
  "/22-kasim": "/de/4-dezember",
  "/11-ekim": "/de/archiv/11-ekim-2026",
  "/17-eylul": "/de/archiv/17-eylul-2026",
  "/21agustos": "/de/archiv/21-agustos-2026",
  "/14temmuz": "/de/archiv/14-temmuz-2026",
  "/networking": "/de/networking",
  "/profil": "/de/profil",
  "/ntw": "/de/live",
  "/sunum-yukle": "/de/vortrag",
  "/sponsor": "/de/sponsor",
  "/merch": "/de/merch",
  "/duyurular": "/de/mitteilungen",
  "/dokumantasyon": "/de/dokumentation",
  "/kvkk": "/de/datenschutz",
  "/acik-riza": "/de/einwilligung",
  "/cerez-politikasi": "/de/cookies",
};

export function regionalPath(path: string, german: boolean) {
  return german ? (regionalPages[path] ?? "/de") : path;
}

export function RegionSwitch({
  german = false,
  className = "",
}: {
  german?: boolean;
  className?: string;
}) {
  const { pathname, searchStr } = useLocation();
  const navigate = useNavigate();
  const [pendingRegion, setPendingRegion] = useState<"de" | "tr">();
  const transitionTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);

  function changeRegion(
    event: MouseEvent<HTMLAnchorElement>,
    region: "de" | "tr",
    to: string,
    search?: { mode: string },
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      german === (region === "de") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    event.preventDefault();
    window.clearTimeout(transitionTimer.current);
    setPendingRegion(region);
    transitionTimer.current = window.setTimeout(() => {
      void navigate({ to, search }).finally(() => setPendingRegion(undefined));
    }, 155);
  }

  const registerInTurkey =
    pathname === "/profil" && new URLSearchParams(searchStr).get("mode") === "register";
  const registerInGermany = pathname === "/de/registrieren";
  const turkeySearch = registerInGermany || registerInTurkey ? { mode: "register" } : undefined;
  const germany =
    (registerInTurkey ? "/de/registrieren" : undefined) ??
    regionalPages[pathname] ??
    (pathname.startsWith("/u/") ? `/de${pathname}` : "/de");
  const turkey =
    Object.keys(regionalPages).find((key) => regionalPages[key] === pathname) ??
    (registerInGermany ? "/profil" : undefined) ??
    (pathname.startsWith("/de/u/") ? pathname.slice(3) : "/");
  return (
    <nav
      className={`site-region-toggle ${className}`}
      data-region={pendingRegion ?? (german ? "de" : "tr")}
      aria-label={german ? "Sprache und Region" : "Dil ve bölge"}
    >
      <span className="site-region-thumb" aria-hidden="true" />
      <Link
        to={turkey}
        search={turkeySearch}
        lang="tr"
        aria-label="Türkçe"
        activeOptions={{ exact: true }}
        aria-current={german ? undefined : "true"}
        onClick={(event) => changeRegion(event, "tr", turkey, turkeySearch)}
      >
        TR
      </Link>
      <Link
        to={germany}
        lang="de"
        aria-label="Deutsch"
        activeOptions={{ exact: true }}
        aria-current={german ? "true" : undefined}
        onClick={(event) => changeRegion(event, "de", germany)}
      >
        DE
      </Link>
    </nav>
  );
}

export function SiteNav({
  variant = "default",
  german = false,
}: {
  variant?: SiteNavVariant;
  german?: boolean;
}) {
  const location = useLocation();
  const [memberLoggedIn, setMemberLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (variant !== "default") return;
    let active = true;
    const refreshSession = () => {
      void getMyMemberProfile()
        .then(() => {
          if (active) setMemberLoggedIn(true);
        })
        .catch(() => {
          if (active) setMemberLoggedIn(false);
        });
    };
    const handleSessionChange = (event: Event) => {
      const detail = (event as CustomEvent<{ loggedIn?: boolean }>).detail;
      if (typeof detail?.loggedIn === "boolean") setMemberLoggedIn(detail.loggedIn);
      else refreshSession();
    };
    refreshSession();
    window.addEventListener(MEMBER_SESSION_CHANGED_EVENT, handleSessionChange);
    return () => {
      active = false;
      window.removeEventListener(MEMBER_SESSION_CHANGED_EVENT, handleSessionChange);
    };
  }, [variant]);

  if (variant !== "default") return <EventSiteNav variant={variant} />;
  const home = german ? "/de" : "/";
  const labels: Record<string, string> = {
    "/notwork-nedir": "Was ist notwork?",
    "/etkinlikler": "Events",
    "/networking": "Networking",
    "/sunum-yukle": "Vortrag halten",
    "/ntw": "Event live",
    "/sponsor": "Sponsoring",
    "/merch": "Merch",
  };

  return (
    <header className="site-header-shell sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div
        className="desktop-site-header mx-auto hidden max-w-6xl items-center sm:flex"
        style={desktopGlassStyle}
      >
        <Link
          to={home}
          className="desktop-site-brand"
          aria-label={german ? "notwork Startseite" : "notwork ana sayfa"}
        >
          <img
            src="/brand/notwork-logo.png"
            alt="notwork"
            className="notwork-logo desktop-site-logo"
          />
        </Link>

        <nav className="desktop-site-links" aria-label={german ? "Hauptmenü" : "Ana menü"}>
          {desktopLinks.map((item) => {
            const Icon = item.icon;
            const target = regionalPath(item.to, german);
            const active =
              item.to === "/etkinlikler"
                ? location.pathname === home || location.pathname === target
                : location.pathname === target;
            return (
              <Link
                key={item.to}
                to={target}
                aria-current={active ? "page" : undefined}
                className={`desktop-site-link${active ? " is-active" : ""}`}
              >
                <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                <span>{german ? labels[item.to] : item.label}</span>
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="desktop-site-menu"
                aria-label={german ? "Weitere Seiten öffnen" : "Diğer sayfaları aç"}
              >
                <Menu size={15} strokeWidth={1.8} aria-hidden="true" />
                <span>Menü</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={14}
              className="glass-menu desktop-site-dropdown w-60 p-2"
            >
              <DropdownMenuLabel className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-foreground/40">
                {german ? "Weitere Seiten" : "Diğer"}
              </DropdownMenuLabel>
              <DropdownMenuItem asChild className="rounded-xl p-0">
                <a
                  href={german ? "/de#galeri" : "/#galeri"}
                  className="flex min-h-11 items-center gap-3 px-3 text-sm"
                >
                  <Images size={17} strokeWidth={1.7} />
                  {german ? "Galerie" : "Galeri"}
                </a>
              </DropdownMenuItem>
              {desktopMenuLinks.map(({ to, label, icon: Icon }) => (
                <DropdownMenuItem key={to} asChild className="rounded-xl p-0">
                  <Link
                    to={regionalPath(to, german)}
                    className="flex min-h-11 items-center gap-3 px-3 text-sm"
                  >
                    <Icon size={17} strokeWidth={1.7} />
                    {german ? labels[to] : label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="desktop-site-actions">
          <RegionSwitch german={german} />
          {memberLoggedIn === false ? (
            <Link
              to={german ? "/de/registrieren" : "/profil"}
              search={german ? {} : { mode: "register" }}
              className="desktop-site-join"
            >
              {german ? "Mitglied werden" : "notwork ol"}
            </Link>
          ) : null}
          <ProfileLink german={german} className="desktop-profile-button" />
        </div>
      </div>
      <div className="mx-auto grid h-16 grid-cols-[116px_1fr_116px] items-center px-3 sm:hidden">
        <MobileSiteMenu german={german} />
        <BrandLink german={german} className="justify-self-center" />
        <div className="site-mobile-actions">
          <RegionSwitch german={german} />
          <ProfileLink german={german} />
        </div>
      </div>
    </header>
  );
}

function BrandLink({ className = "", german = false }: { className?: string; german?: boolean }) {
  return (
    <Link
      to={german ? "/de" : "/"}
      className={`notwork-logo-link ${className}`}
      aria-label={german ? "notwork Startseite" : "notwork ana sayfa"}
    >
      <img src="/brand/notwork-logo.png" alt="notwork" className="notwork-logo mobile-site-logo" />
    </Link>
  );
}

function ProfileLink({
  className = "",
  dark = false,
  german = false,
}: {
  className?: string;
  dark?: boolean;
  german?: boolean;
}) {
  return (
    <Link
      to={german ? "/de/profil" : "/profil"}
      aria-label={german ? "Zum Profil" : "Üye profiline git"}
      title={german ? "Profil" : "Üye profili"}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        dark
          ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
          : "border-primary/35 bg-primary/10 text-primary-deep hover:bg-primary hover:text-primary-foreground"
      } ${className}`}
    >
      <UserRound size={18} strokeWidth={2.2} />
    </Link>
  );
}

const mobileSecondaryLinks = [
  { to: "/merch", label: "Merch", icon: ShoppingBag },
  { to: "/sponsor", label: "Sponsor", icon: Sparkles },
  { to: "/sunum-yukle", label: "Sunum yapmak istiyorum", icon: Presentation },
] as const;

function MobileSiteMenu({ german = false }: { german?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={german ? "Menü öffnen" : "Site menüsünü aç"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white/55 text-xs sm:hidden"
        >
          <Menu size={19} strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={12}
        className="glass-menu z-[9999] w-64 p-3 sm:hidden"
      >
        <DropdownMenuLabel className="flex items-center gap-3 px-3 py-3">
          <span className="menu-wordmark">ntw</span>
          <span className="text-xs font-normal text-muted-foreground">
            {german ? "Networking-Community" : "network topluluğu"}
            <br />
            {german ? "und Plattform." : "ve platform."}
          </span>
        </DropdownMenuLabel>
        {[
          { to: "/notwork-nedir", label: "notwork nedir?", icon: Sparkles },
          ...mobileSecondaryLinks,
        ].map(({ to, label, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild className="rounded-2xl p-0">
            <Link
              to={regionalPath(to, german)}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 px-3 text-sm"
            >
              <Icon size={18} strokeWidth={1.5} />
              {german
                ? {
                    "/notwork-nedir": "Was ist notwork?",
                    "/merch": "Merch",
                    "/sponsor": "Sponsoring",
                    "/sunum-yukle": "Vortrag halten",
                  }[to]
                : label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-2xl p-0">
          <a
            href={german ? "/de#galeri" : "/#galeri"}
            className="flex min-h-12 items-center gap-3 px-3 text-sm"
          >
            {german ? "Galerie ↗" : "Galeri ↗"}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-2xl p-0">
          <a
            href="https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-center gap-3 px-3 text-sm"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EventSiteNav({ variant }: { variant: Exclude<SiteNavVariant, "default"> }) {
  const location = useLocation();
  const eventSearch = new URLSearchParams(location.searchStr);
  const eventSelection = eventSearch.get("eventId")
    ? { eventId: eventSearch.get("eventId") || "" }
    : eventSearch.get("eventSlug")
      ? { eventSlug: eventSearch.get("eventSlug") || "" }
      : { event: eventSearch.get("event") || "" };
  const dark = variant === "eventDark";
  const headerClass = dark
    ? "sticky top-0 z-40 border-b border-white/10 bg-[#071112]/72 text-white shadow-[0_12px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl"
    : "sticky top-0 z-40 border-b border-primary/20 bg-background/78 text-foreground shadow-[0_12px_50px_rgba(113,204,210,0.12)] backdrop-blur-xl";
  const passiveClass = dark
    ? "rounded-full px-3 py-2 text-xs font-black text-white/42"
    : "rounded-full px-3 py-2 text-xs font-black text-foreground/42";
  const currentClass = dark
    ? "rounded-full bg-[#8ee4e8] px-4 py-2 text-xs font-black text-[#071112] shadow-[0_0_22px_rgba(142,228,232,0.28)]"
    : "rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground shadow-[0_0_22px_rgba(113,204,210,0.2)]";
  const linksHref = withEventSelection("/linkler", eventSelection);
  const currentApp = location.pathname.includes("wordcloud")
    ? "ntw.wordcloud"
    : location.pathname.includes("eslesme")
      ? "notwork match"
      : location.pathname.includes("five")
        ? "ntw.five"
        : location.pathname.includes("etkinlik-degerlendirme")
          ? "Yorum"
          : null;
  const tabs = [
    { label: "Linkler", active: location.pathname === "/linkler" },
    ...(currentApp ? [{ label: currentApp, active: true }] : []),
  ];

  return (
    <header className={headerClass}>
      <div className="mx-auto hidden h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:flex">
        <Link to={linksHref} className="flex min-w-0 items-center gap-2">
          <img
            src="/brand/notwork-logo.png"
            alt="notwork"
            className="notwork-logo event-site-logo"
          />
          <span className="min-w-0">
            <span
              className={
                dark
                  ? "block truncate text-[10px] font-bold text-white/45"
                  : "block truncate text-[10px] font-bold text-foreground/45"
              }
            >
              etkinlik girişi
            </span>
          </span>
        </Link>

        <nav
          aria-label="Etkinlik içindeki konumun"
          className="flex items-center gap-1 overflow-x-auto rounded-full border border-current/10 bg-current/[0.03] p-1"
        >
          {tabs.map((tab) => (
            <span
              key={tab.label}
              aria-current={tab.active ? "page" : undefined}
              className={tab.active ? currentClass : passiveClass}
            >
              {tab.label}
            </span>
          ))}
          <ProfileLink dark={dark} />
        </nav>
      </div>
      <div className="mx-auto grid h-16 grid-cols-[72px_1fr_72px] items-center px-3 sm:hidden">
        <MobileSiteMenu />
        <Link
          to={linksHref}
          className="notwork-logo-link justify-self-center"
          aria-label="Etkinlik linklerine dön"
        >
          <img
            src="/brand/notwork-logo.png"
            alt="notwork"
            className="notwork-logo mobile-site-logo"
          />
        </Link>
        <ProfileLink className="justify-self-end" dark={dark} />
      </div>
    </header>
  );
}

export function SiteFooter({ german = false }: { german?: boolean } = {}) {
  return (
    <footer className="simple-footer">
      <div className="simple-footer-top">
        <Link
          to={german ? "/de" : "/"}
          className="notwork-logo-link"
          aria-label={german ? "notwork Startseite" : "notwork ana sayfa"}
        >
          <img
            src="/brand/notwork-logo.png"
            alt="notwork"
            className="notwork-logo footer-site-logo"
          />
        </Link>
        <div className="flex items-center gap-5">
          <a
            href="https://www.instagram.com/notwork.ntw/"
            target="_blank"
            rel="noreferrer"
            aria-label="notwork Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://www.youtube.com/@notwork-izmir"
            target="_blank"
            rel="noreferrer"
            aria-label="notwork YouTube"
          >
            <Youtube size={19} />
          </a>
          <a href="mailto:berk@notwork.me" className="text-xs">
            {german ? "Kontakt ↗" : "İletişim ↗"}
          </a>
        </div>
      </div>
      <div className="simple-footer-bottom">
        <span>© {new Date().getFullYear()} notwork</span>
        <Link to={regionalPath("/duyurular", german)}>{german ? "Mitteilungen" : "Duyurular"}</Link>
        <Link to={regionalPath("/dokumantasyon", german)}>
          {german ? "Dokumentation" : "Dokümantasyon"}
        </Link>
        <details>
          <summary>{german ? "Datenschutz und Einstellungen" : "Gizlilik ve tercihler"}</summary>
          <div className="footer-legal">
            <Link to={regionalPath("/kvkk", german)}>{german ? "Datenschutz" : "KVKK"}</Link>
            <Link to={regionalPath("/acik-riza", german)}>
              {german ? "Einwilligung" : "Açık rıza"}
            </Link>
            <Link to={regionalPath("/cerez-politikasi", german)}>
              {german ? "Cookie-Richtlinie" : "Çerez politikası"}
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT))}
            >
              {german ? "Cookie-Einstellungen" : "Çerez tercihleri"}
            </button>
          </div>
        </details>
      </div>
    </footer>
  );
}
