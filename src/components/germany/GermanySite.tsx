import type { ReactNode } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

export function germanySeo(path: string, title: string, description: string, noindex = false) {
  const url = `https://notwork.me${path}`;
  return {
    meta: [
      { title: `${title} | notwork Deutschland` },
      { name: "description", content: description },
      { name: "robots", content: noindex ? "noindex, follow" : "index, follow" },
      { property: "og:title", content: `${title} | notwork Deutschland` },
      { property: "og:description", content: description },
      { property: "og:locale", content: "de_DE" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function GermanySite({
  children,
  home = false,
}: {
  children: ReactNode;
  active?: string;
  home?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col" lang="de">
      <SiteNav german />
      <main className={home ? "flex-1 regional-home-content" : "de-site-main"}>{children}</main>
      <SiteFooter german />
    </div>
  );
}
