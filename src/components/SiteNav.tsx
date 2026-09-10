import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Handshake,
  Instagram,
  Menu,
  MessageCircle,
  Presentation,
  Rocket,
  ShoppingBag,
  Sparkles,
  UserRound,
  UsersRound,
  X,
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

type SiteNavVariant = "default" | "event" | "eventDark";

export function SiteNav({ variant = "default" }: { variant?: SiteNavVariant }) {
  if (variant !== "default") return <EventSiteNav variant={variant} />;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto hidden h-16 max-w-6xl items-center justify-between px-5 sm:flex">
        <BrandLink />
        <nav className="hidden items-center gap-2 text-sm font-medium sm:flex">
          <Link to="/notwork-nedir" className="rounded-lg px-3 py-2 hover:bg-muted">
            Nedir?
          </Link>
          <a href="/#galeri" className="rounded-lg px-3 py-2 hover:bg-muted">
            Galeri
          </a>
          <Link to="/etkinlikler" className="rounded-lg px-3 py-2 hover:bg-muted">
            Etkinlikler
          </Link>
          <Link to="/networking" className="rounded-lg px-3 py-2 hover:bg-muted">
            Networking
          </Link>
          <Link to="/ntw" className="rounded-full border border-white/80 bg-white/50 px-4 py-2">
            ntw
          </Link>
          <Link to="/sponsor" className="rounded-lg px-3 py-2 hover:bg-muted">
            Sponsor
          </Link>
          <Link to="/merch" className="rounded-lg px-3 py-2 hover:bg-muted">
            Merch
          </Link>
          <Link
            to="/profil"
            aria-label="Üye profiline git"
            title="Üye profili"
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary-deep transition hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <UserRound size={17} strokeWidth={2.2} />
          </Link>
        </nav>
      </div>
      <div className="mx-auto grid h-16 grid-cols-[72px_1fr_72px] items-center px-3 sm:hidden">
        <MobileSiteMenu />
        <BrandLink className="justify-self-center" showDot={false} />
        <ProfileLink className="justify-self-end" />
      </div>
    </header>
  );
}

function BrandLink({ className = "", showDot = true }: { className?: string; showDot?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-brand text-lg sm:text-xl ${className}`}>
      {showDot ? <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> : null}
      <span>notwork</span>
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
    { label: "ntw.matchlab", active: location.pathname.includes("eslesme") },
    { label: "ntw.five", active: location.pathname.includes("five") },
    { label: "Yorum", active: location.pathname.includes("etkinlik-degerlendirme") },
  ];

  return (
    <header className={headerClass}>
      <div className="mx-auto hidden h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:flex">
        <Link to={linksHref} className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="absolute inset-0 rounded-full border border-primary/40" />
          </span>
          <span className="min-w-0">
            <span className="block font-brand text-lg leading-none">notwork</span>
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
        <Link to={linksHref} className="justify-self-center font-brand text-lg leading-none">
          notwork
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
        <Link to="/" className="font-brand text-xl">
          notwork
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
