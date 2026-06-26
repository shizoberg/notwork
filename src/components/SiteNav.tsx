import { Link } from "@tanstack/react-router";
import { Instagram, Youtube } from "lucide-react";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-brand text-xl">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
          <span>notwork</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <a href="/#nedir" className="px-3 py-2 rounded-lg hover:bg-muted hidden sm:inline">Nedir?</a>
          <a href="/#galeri" className="px-3 py-2 rounded-lg hover:bg-muted hidden sm:inline">Galeri</a>
          <Link to="/community" className="px-3 py-2 rounded-lg hover:bg-muted">Community</Link>
          <a
            href="https://biletinial.com"
            target="_blank"
            rel="noreferrer"
            className="ml-1 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            Bilet al
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-20">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-sm text-muted-foreground">
        <div className="font-brand text-xl text-foreground">notwork</div>
        <div>İzmir · deneyip de yapamadıklarımız</div>
        <div className="flex items-center gap-2">
          <a href="https://www.instagram.com/notwork.ntw/" target="_blank" rel="noreferrer" aria-label="notwork Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground hover:border-primary hover:text-primary-deep transition">
            <Instagram size={19} strokeWidth={1.8} />
          </a>
          <a href="https://www.youtube.com/@notwork-izmir" target="_blank" rel="noreferrer" aria-label="notwork YouTube" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground hover:border-primary hover:text-primary-deep transition">
            <Youtube size={20} strokeWidth={1.8} />
          </a>
        </div>
        <div>© {new Date().getFullYear()} notwork</div>
      </div>
    </footer>
  );
}
