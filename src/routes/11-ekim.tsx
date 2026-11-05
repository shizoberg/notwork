import { createFileRoute } from "@tanstack/react-router";
import { PastEventPage } from "@/components/PastEventPage";
import { createSeo } from "@/lib/seo";
import { eventConfig } from "./9-ekim";

export const Route = createFileRoute("/11-ekim")({
  head: () =>
    createSeo({
      title: "11 Ekim notwork Sahne | İzmir Networking Etkinliği",
      description: "11 Ekim’de Rene Lokal’de notwork Sahne etkinliği.",
      path: "/11-ekim",
      type: "article",
    }),
  component: () => <PastEventPage title="notwork sahne" date="11 Ekim 2026" venue="Rene Lokal" photos={[...eventConfig.communityGallery, "/community/8.jpg", "/community/14.jpg", "/community/20.jpg", "/community/25.jpg", "/community/26.jpg", "/community/27.jpg"].filter((src, i, all) => all.indexOf(src) === i)} />,
});
