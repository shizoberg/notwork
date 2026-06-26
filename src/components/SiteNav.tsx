import { Link } from "@tanstack/react-router";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-brand text-xl">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="font-bold">notwork</span>
          <span className="text-muted-foreground font-bold">.me</span>
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
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="font-brand font-bold text-foreground">notwork.me</div>
        <div>İzmir · deneyip de yapamadıklarımız</div>
        <div>© {new Date().getFullYear()} notwork</div>
      </div>
    </footer>
  );
}
