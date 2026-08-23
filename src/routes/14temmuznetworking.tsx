import { createFileRoute } from "@tanstack/react-router";
import { NetworkingExperience } from "@/routes/networking";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/14temmuznetworking")({
  head: () =>
    createSeo({
      title: "14 Temmuz İzmir Networking Ağı | notwork",
      description:
        "14 Temmuz notwork İzmir etkinliğine özel networking ağında katılımcıları keşfet, yeteneklerini paylaş ve network club bağlantılarını büyüt.",
      path: "/14temmuznetworking",
      keywords: ["14 Temmuz notwork ağı", "etkinlik networking ağı", "İzmir topluluk ağı"],
    }),
  component: JulyNetworkingRoute,
});

function JulyNetworkingRoute() {
  return <NetworkingExperience variant="july14" />;
}
