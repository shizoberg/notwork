import { createFileRoute } from "@tanstack/react-router";
import { NetworkingExperience } from "@/routes/networking";

export const Route = createFileRoute("/14temmuznetworking")({
  head: () => ({
    meta: [
      { title: "14 Temmuz notwork Ağı | İzmir Networking" },
      {
        name: "description",
        content:
          "14 Temmuz notwork etkinliğine özel networking ağına katıl; etkinlikteki kişilerle tanış, yeteneklerini paylaş ve topluluk bağlantılarını canlı gör.",
      },
      {
        name: "keywords",
        content:
          "14 Temmuz notwork ağı, İzmir networking etkinliği, notwork community, İzmir iş ağı, networking ağı",
      },
      { property: "og:title", content: "14 Temmuz notwork Ağı | İzmir Networking" },
      {
        property: "og:description",
        content:
          "14 Temmuz notwork etkinliğine özel ağda kendini göster, salondaki kişilerle tanış ve bağlantılarını büyüt.",
      },
      { property: "og:url", content: "https://notwork.me/14temmuznetworking" },
      { property: "og:image", content: "https://notwork.me/notwork-social.jpg" },
      { name: "twitter:title", content: "14 Temmuz notwork Ağı | İzmir Networking" },
      {
        name: "twitter:description",
        content:
          "14 Temmuz notwork etkinliğine özel topluluk ağına katıl, salondaki bağlantıları keşfet.",
      },
      { name: "twitter:image", content: "https://notwork.me/notwork-social.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/14temmuznetworking" }],
  }),
  component: JulyNetworkingRoute,
});

function JulyNetworkingRoute() {
  return <NetworkingExperience variant="july14" />;
}
