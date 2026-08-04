import { createFileRoute } from "@tanstack/react-router";
import { NetworkStartupPage } from "./network-startup";

export const Route = createFileRoute("/startup")({
  head: () => ({
    meta: [
      { title: "Network Startup | notwork" },
      {
        name: "description",
        content:
          "Kendi işini geliştirmek, işini kurmak veya projesini doğru bağlantılarla büyütmek isteyen girişimciler için notwork Network Startup formu.",
      },
      {
        name: "keywords",
        content:
          "network startup, startup networking, girişimci ağı, notwork startup, İzmir startup, proje geliştirme",
      },
      { property: "og:title", content: "Network Startup | notwork" },
      {
        property: "og:description",
        content:
          "Projeni anlat; Berk Aktaş ve notwork ağı sana doğru bağlantıları bulmaya çalışsın.",
      },
      { property: "og:url", content: "https://notwork.me/startup" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
      { name: "twitter:title", content: "Network Startup | notwork" },
      {
        name: "twitter:description",
        content: "Kendi işini kurmak veya büyütmek isteyenler için bağlantı odaklı destek formu.",
      },
      { name: "twitter:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/startup" }],
  }),
  component: NetworkStartupPage,
});
