import { createFileRoute } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";
export const Route = createFileRoute("/startup")({
  head: () =>
    createSeo({
      title: "Startup · Coming soon | notwork",
      description: "Fikirlerin doğru insanlarla buluşacağı alan. Yakında notwork’te.",
      path: "/startup",
    }),
  component: StartupComingSoon,
});
function StartupComingSoon() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="startup-coming-soon">
        <span className="ntw-glass-mark">
          <Rocket size={27} strokeWidth={1.4} />
        </span>
        <p className="ntw-eyebrow">notwork startup</p>
        <h1>
          Fikirler burada
          <br />
          yolunu bulacak.
        </h1>
        <p>Doğru insanlar ve yeni başlangıçlar için bir alan.</p>
        <span className="ntw-availability">Coming soon · Yakında</span>
      </main>
      <SiteFooter />
    </div>
  );
}
