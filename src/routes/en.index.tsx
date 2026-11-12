import { createFileRoute } from "@tanstack/react-router";
import { HomeLanding } from "@/components/HomeLanding";

export const Route = createFileRoute("/en/")({
  head: () => ({
    meta: [
      { title: "notwork | Networking events in Türkiye and Germany" },
      { name: "description", content: "Discover notwork networking events, attendee stories and new connections in Türkiye and Germany." },
      { property: "og:locale", content: "en_GB" },
    ],
    links: [
      { rel: "canonical", href: "https://notwork.me/en" },
      { rel: "alternate", hrefLang: "tr", href: "https://notwork.me/" },
      { rel: "alternate", hrefLang: "de", href: "https://notwork.me/de" },
      { rel: "alternate", hrefLang: "en", href: "https://notwork.me/en" },
    ],
  }),
  component: () => <HomeLanding english />,
});
