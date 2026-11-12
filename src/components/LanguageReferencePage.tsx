import { Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "./SiteNav";

export function LanguageReferencePage({ title, turkish, german }: { title: string; turkish: string; german: string }) {
  return (
    <div className="glass-site">
      <SiteNav />
      <main className="mx-auto min-h-[55vh] max-w-4xl px-5 py-16">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="my-5">This page is currently available in Turkish and German.</p>
        <div className="flex flex-wrap gap-6 underline">
          <Link to={turkish} lang="tr">Türkçe ↗</Link>
          <Link to={german} lang="de">Deutsch ↗</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
