import { createFileRoute } from "@tanstack/react-router";
import { Palette } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/creative")({
  head: () => createSeo({ title: "Creative · Coming soon | notwork", description: "İçerik üreticileri ve sanatçılar için yeni notwork etkinlikleri yakında.", path: "/creative" }),
  component: CreativeComingSoon,
});

function CreativeComingSoon() {
  return <div className="min-h-screen"><SiteNav /><main className="startup-coming-soon"><span className="ntw-glass-mark"><Palette size={27} strokeWidth={1.4} /></span><p className="ntw-eyebrow">notwork creative</p><h1>Kreatif insanlar<br />burada buluşacak.</h1><p>İçerik üreticileri ve sanatçılar için etkinlikler.</p><span className="ntw-availability">Coming soon · Yakında</span></main><SiteFooter /></div>;
}
