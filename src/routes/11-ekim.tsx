import { createFileRoute } from "@tanstack/react-router";
import { EventProductPage } from "@/components/EventProductPage";
import { createSeo } from "@/lib/seo";
import { eventConfig } from "./9-ekim";

export const Route = createFileRoute("/11-ekim")({
  head: () =>
    createSeo({
      title: "11 Ekim notwork Classic | İzmir Networking Etkinliği",
      description: "11 Ekim’de Rene Lokal’de notwork Classic etkinliği.",
      path: "/11-ekim",
      type: "article",
    }),
  component: () => <EventProductPage config={eventConfig} />,
});
