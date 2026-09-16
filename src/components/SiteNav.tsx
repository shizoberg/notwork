import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  { to: "/ntw", label: "Etkinlik anı", icon: Radio },
  { to: "/sponsor", label: "Sponsor", icon: Sparkles },
  { to: "/merch", label: "Merch", icon: ShoppingBag },
] as const;

export function SiteNav({ variant = "default" }: { variant?: SiteNavVariant }) {
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

  return (
    <header className="site-header-shell sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="desktop-site-header mx-auto hidden max-w-6xl items-center sm:flex">
        <Link to="/" className="desktop-site-brand" aria-label="notwork ana sayfa">
          <img
            src="/brand/notwork-logo.png"
            alt="notwork"
            className="notwork-logo desktop-site-logo"
          />
        </Link>

        <nav className="desktop-site-links" aria-label="Ana menü">
          {desktopLinks.map((item) => {
            const Icon = item.icon;
            const active =
              item.to === "/etkinlikler"
                ? location.pathname === "/" || location.pathname === item.to
                : location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`desktop-site-link${active ? " is-active" : ""}`}
              >
                <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="desktop-site-menu" aria-label="Diğer sayfaları aç">
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
                Diğer
              </DropdownMenuLabel>
              <DropdownMenuItem asChild className="rounded-xl p-0">
                <a href="/#galeri" className="flex min-h-11 items-center gap-3 px-3 text-sm">
                  <Images size={17} strokeWidth={1.7} />
                  Galeri
                </a>
              </DropdownMenuItem>
              {desktopMenuLinks.map(({ to, label, icon: Icon }) => (
                <DropdownMenuItem key={to} asChild className="rounded-xl p-0">
                  <Link to={to} className="flex min-h-11 items-center gap-3 px-3 text-sm">
                    <Icon size={17} strokeWidth={1.7} />
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="desktop-site-actions">
          {memberLoggedIn === false ? (
            <Link to="/profil" search={{ mode: "register" }} className="desktop-site-join">
              notwork ol
            </Link>
          ) : null}
          <ProfileLink className="desktop-profile-button" />
        </div>
      </div>
      <div className="mx-auto grid h-16 grid-cols-[72px_1fr_72px] items-center px-3 sm:hidden">
        <MobileSiteMenu />
        <BrandLink className="justify-self-center" />
        <ProfileLink className="justify-self-end" />
      </div>
    </header>
  );
}

function BrandLink({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`notwork-logo-link ${className}`} aria-label="notwork ana sayfa">
      <img src="/brand/notwork-logo.png" alt="notwork" className="notwork-logo mobile-site-logo" />
    </Link>
  );
}

function ProfileLink({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link
      to="/profil"
      aria-label="Üye profiline git"
      title="Üye profili"
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
  { to: "/sunum-yukle", label: "Sunum yap", icon: Presentation },
] as const;

function MobileSiteMenu() {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Site menüsünü aç"
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
            network topluluğu
            <br />
            ve platform.
          </span>
        </DropdownMenuLabel>
        {[
          { to: "/notwork-nedir", label: "notwork nedir?", icon: Sparkles },
          ...mobileSecondaryLinks,
        ].map(({ to, label, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild className="rounded-2xl p-0">
            <Link
              to={to}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 px-3 text-sm"
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-2xl p-0">
          <a href="/#galeri" className="flex min-h-12 items-center gap-3 px-3 text-sm">
            Galeri ↗
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
  const tabs = [
    { label: "Linkler", active: location.pathname === "/linkler" },
    { label: "ntw.wordcloud", active: location.pathname.includes("wordcloud") },
    { label: "notwork match", active: location.pathname.includes("eslesme") },
    { label: "ntw.five", active: location.pathname.includes("five") },
    { label: "Yorum", active: location.pathname.includes("etkinlik-degerlendirme") },
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

export function SiteFooter() {
  return (
    <footer className="simple-footer">
      <div className="simple-footer-top">
        <Link to="/" className="notwork-logo-link" aria-label="notwork ana sayfa">
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
            İletişim ↗
          </a>
        </div>
      </div>
      <div className="simple-footer-bottom">
        <span>© {new Date().getFullYear()} notwork</span>
        <Link to="/duyurular">Duyurular</Link>
        <details>
          <summary>Gizlilik ve tercihler</summary>
          <div className="footer-legal">
            <Link to="/kvkk">KVKK</Link>
            <Link to="/acik-riza">Açık rıza</Link>
            <Link to="/cerez-politikasi">Çerez politikası</Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT))}
            >
              Çerez tercihleri
            </button>
          </div>
        </details>
      </div>
    </footer>
  );
}
