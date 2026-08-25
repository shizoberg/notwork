import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  ChevronDown,
  Handshake,
  Instagram,
  Menu,
  MessageCircle,
  Presentation,
  Rocket,
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
          <Link to="/sponsor" className="rounded-lg px-3 py-2 hover:bg-muted">
            Sponsor
          </Link>
          <Link to="/community" className="rounded-lg px-3 py-2 hover:bg-muted">
            Community
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

const mobilePrimaryLinks = [
  {
    to: "/notwork-nedir",
    label: "notwork nedir?",
    description: "Felsefeyi ve event akışını keşfet.",
    icon: Sparkles,
  },
  {
    href: "/#katilimci-yorumlari",
    label: "Etkinlikler",
    description: "Geçmiş geceler ve katılımcı yorumları.",
    icon: CalendarDays,
  },
  {
    to: "/networking",
    label: "Networking ağı",
    description: "Topluluktaki insanları ve bağlantıları gör.",
    icon: Handshake,
  },
] as const;

const mobileSecondaryLinks = [
  { href: "/#galeri", label: "Galeri", icon: Camera },
  { to: "/sponsor", label: "Sponsor", icon: Sparkles },
  { to: "/sunum-yukle", label: "Sunum yap", icon: Presentation },
  { to: "/startup", label: "Startup", icon: Rocket },
] as const;

function MobileSiteMenu() {
  const [open, setOpen] = useState(false);
  const backdrop =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[9998] bg-[#020707]/55 backdrop-blur-[12px] animate-in fade-in duration-200 sm:hidden"
          />,
          document.body,
        )
      : null;

  return (
    <>
      {backdrop}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Site menüsünü aç"
            className="group inline-flex h-10 items-center gap-1.5 rounded-lg px-1 text-[11px] font-medium leading-none text-foreground outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary sm:hidden"
          >
            <Menu size={15} strokeWidth={2.2} />
            <span>Menü</span>
            <ChevronDown
              size={13}
              strokeWidth={2.2}
              className="transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={10}
          className="z-[9999] w-[calc(100vw-1.5rem)] max-w-[370px] rounded-[30px] border border-white/90 bg-background p-2.5 shadow-[0_32px_100px_rgba(7,17,18,0.34)] ring-1 ring-foreground/5 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 sm:hidden"
        >
          <div className="flex items-start justify-between gap-3 rounded-[22px] bg-primary/10 px-4 py-3.5">
            <div className="min-w-0">
              <DropdownMenuLabel className="p-0 text-[10px] font-black uppercase tracking-[0.22em] text-primary-deep">
                notwork’ü keşfet
              </DropdownMenuLabel>
              <div className="mt-1 text-sm font-medium leading-snug text-muted-foreground">
                Hikâyelerden doğru bağlantılara.
              </div>
            </div>
            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-background/80 text-foreground transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X size={17} strokeWidth={2.2} />
            </button>
          </div>

          <div className="mt-2 grid gap-1">
            {mobilePrimaryLinks.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary-deep transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={19} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-foreground">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-deep"
                  />
                </>
              );

              return (
                <DropdownMenuItem
                  key={item.label}
                  asChild
                  className="rounded-2xl p-0 focus:bg-primary/8"
                >
                  {"to" in item ? (
                    <Link
                      to={item.to}
                      className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 outline-none"
                    >
                      {content}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 outline-none"
                    >
                      {content}
                    </a>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator className="my-2 bg-border/70" />

          <DropdownMenuItem asChild className="rounded-[20px] p-0 focus:bg-primary/10">
            <Link
              to="/community"
              className="group flex items-center gap-3 rounded-[20px] bg-foreground px-4 py-3.5 text-background outline-none transition hover:bg-primary-deep"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background/12">
                <UsersRound size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">Community</span>
                <span className="mt-0.5 block text-[11px] text-background/65">
                  Fotoğraflar, takvim ve WhatsApp topluluğu.
                </span>
              </span>
              <ArrowUpRight size={17} className="shrink-0" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="mt-1.5 rounded-[20px] p-0 focus:bg-primary/10">
            <a
              href="https://chat.whatsapp.com/G096ufx4BgxLbqPfTnF0EE"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-[20px] bg-primary px-4 py-3 text-primary-foreground outline-none transition hover:bg-primary-deep"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-foreground/15">
                <MessageCircle size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">WhatsApp’a katıl</span>
                <span className="mt-0.5 block text-[11px] text-primary-foreground/70">
                  Community duyurularını takip et.
                </span>
              </span>
              <ArrowUpRight size={17} className="shrink-0" />
            </a>
          </DropdownMenuItem>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {mobileSecondaryLinks.map((item) => {
              const Icon = item.icon;
              const className =
                "flex min-h-11 items-center gap-2 rounded-2xl border border-border/70 bg-card px-3 py-2.5 text-xs font-bold text-foreground outline-none transition hover:border-primary hover:bg-primary/8";

              return (
                <DropdownMenuItem
                  key={item.label}
                  asChild
                  className="rounded-2xl p-0 focus:bg-transparent"
                >
                  {"to" in item ? (
                    <Link to={item.to} className={className}>
                      <Icon size={16} className="text-primary-deep" />
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} className={className}>
                      <Icon size={16} className="text-primary-deep" />
                      {item.label}
                    </a>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function EventSiteNav({ variant }: { variant: Exclude<SiteNavVariant, "default"> }) {
  const dark = variant === "eventDark";
  const headerClass = dark
    ? "sticky top-0 z-40 border-b border-white/10 bg-[#071112]/72 text-white shadow-[0_12px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl"
    : "sticky top-0 z-40 border-b border-primary/20 bg-background/78 text-foreground shadow-[0_12px_50px_rgba(113,204,210,0.12)] backdrop-blur-xl";
  const linkClass = dark
    ? "rounded-full px-3 py-2 text-xs font-black text-white/72 transition hover:bg-white/10 hover:text-white"
    : "rounded-full px-3 py-2 text-xs font-black text-foreground/65 transition hover:bg-primary/10 hover:text-primary-deep";
  const primaryClass = dark
    ? "rounded-full bg-[#8ee4e8] px-4 py-2 text-xs font-black text-[#071112] shadow-[0_0_22px_rgba(142,228,232,0.28)]"
    : "rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground shadow-[0_0_22px_rgba(113,204,210,0.2)]";

  return (
    <header className={headerClass}>
      <div className="mx-auto hidden h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:flex">
        <Link to="/linkler" className="flex min-w-0 items-center gap-2">
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

        <nav className="flex items-center gap-1 overflow-x-auto rounded-full border border-current/10 bg-current/[0.03] p-1">
          <Link to="/linkler" className={linkClass}>
            Linkler
          </Link>
          <Link to="/21-agustos/wordcloud" className={linkClass}>
            Anket
          </Link>
          <Link to="/21-agustos/eslesme" className={linkClass}>
            Match
          </Link>
          <a href="/etkinlik-degerlendirme?event=21-agustos-2026" className={primaryClass}>
            Yorumla
          </a>
          <ProfileLink dark={dark} />
        </nav>
      </div>
      <div className="mx-auto grid h-16 grid-cols-[72px_1fr_72px] items-center px-3 sm:hidden">
        <MobileSiteMenu />
        <Link to="/linkler" className="justify-self-center font-brand text-lg leading-none">
          notwork
        </Link>
        <ProfileLink className="justify-self-end" dark={dark} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  const meetingMailUrl =
    "mailto:berk@carewithki.com?subject=notwork%20ekibi%20ile%20toplant%C4%B1%20almak%20istiyorum";
  const openCookiePreferences = () => {
    window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
  };

  return (
    <footer className="mt-14 border-t border-border/60 sm:mt-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm text-muted-foreground lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="font-brand text-2xl text-foreground">notwork</div>
          <p className="mt-3 max-w-md leading-relaxed">
            İzmir · deneyip de yapamadıklarımızı, öğrendiklerimizi ve kurduğumuz bağlantıları
            konuştuğumuz sahne.
          </p>
          <div className="mt-5 grid gap-2">
            <div>
              <span className="font-semibold text-foreground">Ofis adresi:</span> Çınarlı, 1572/1.
              Sk. No:33, 35170 Konak/İzmir
            </div>
            <a
              href={meetingMailUrl}
              className="inline-flex w-fit rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Toplantı için e-posta gönder
            </a>
            <Link
              to="/sponsor"
              className="inline-flex w-fit text-sm font-semibold text-primary-deep hover:underline"
            >
              Sponsor olmak isteyenler için →
            </Link>
            <Link
              to="/legacy"
              className="inline-flex w-fit text-sm font-semibold text-primary-deep hover:underline"
            >
              notwork Legacy →
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://www.instagram.com/notwork.ntw/"
              target="_blank"
              rel="noreferrer"
              aria-label="notwork Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary-deep"
            >
              <Instagram size={19} strokeWidth={1.8} />
            </a>
            <a
              href="https://www.youtube.com/@notwork-izmir"
              target="_blank"
              rel="noreferrer"
              aria-label="notwork YouTube"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary-deep"
            >
              <Youtube size={20} strokeWidth={1.8} />
            </a>
          </div>
        </div>

        <div>
          <div className="mb-3 font-semibold text-foreground">
            notwork’ü en kapsamlı anlatan video
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <iframe
              src="https://www.youtube.com/embed/vtzncdq4Jlk"
              title="notwork'ü en kapsamlı anlatan video"
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-border/60 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} notwork</span>
        <div className="flex flex-wrap gap-3">
          <Link to="/kvkk" className="hover:text-foreground hover:underline">
            KVKK
          </Link>
          <Link to="/cerez-politikasi" className="hover:text-foreground hover:underline">
            Çerez Politikası
          </Link>
          <button
            type="button"
            onClick={openCookiePreferences}
            className="text-left hover:text-foreground hover:underline"
          >
            Çerezleri yönet
          </button>
        </div>
      </div>
    </footer>
  );
}
