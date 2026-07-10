import { Link } from "@tanstack/react-router";
import { Instagram, Youtube } from "lucide-react";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-2 sm:px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-brand text-lg sm:text-xl">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
          <span>notwork</span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-2 text-[11px] sm:text-sm font-medium">
          <a href="/#nedir" className="px-3 py-2 rounded-lg hover:bg-muted hidden sm:inline">
            Nedir?
          </a>
          <a href="/#galeri" className="px-3 py-2 rounded-lg hover:bg-muted hidden sm:inline">
            Galeri
          </a>
          <Link to="/networking" className="px-1.5 sm:px-3 py-2 rounded-lg hover:bg-muted">
            Networking
          </Link>
          <Link to="/sponsor" className="px-1.5 sm:px-3 py-2 rounded-lg hover:bg-muted">
            Sponsor
          </Link>
          <Link to="/community" className="px-1.5 sm:px-3 py-2 rounded-lg hover:bg-muted">
            <span className="sm:hidden">Sunum Yap</span>
            <span className="hidden sm:inline">Community</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const meetingMailUrl =
    "mailto:berk@carewithki.com?subject=notwork%20ekibi%20ile%20toplant%C4%B1%20almak%20istiyorum";

  return (
    <footer className="border-t border-border/60 mt-20">
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
      <div className="mx-auto max-w-6xl border-t border-border/60 px-5 py-5 text-xs text-muted-foreground">
        © {new Date().getFullYear()} notwork
      </div>
    </footer>
  );
}
