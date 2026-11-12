import { createFileRoute, notFound } from "@tanstack/react-router";
import { PastEventPage } from "@/components/PastEventPage";
import { germanySeo } from "@/components/germany/GermanySite";
import { germanCatalog } from "./etkinlikler";
import { eventConfig as stage } from "./22-kasim";

export const Route = createFileRoute("/de/archiv/$eventId")({
  loader: ({ params }) => {
    const event = germanCatalog.find(
      (item) => item.id === params.eventId && item.href?.startsWith("/de/archiv/"),
    );
    if (!event) throw notFound();
    return event;
  },
  head: ({ loaderData }) =>
    loaderData ? germanySeo(loaderData.href!, loaderData.title, loaderData.summary) : {},
  component: function ArchiveEvent() {
    const event = Route.useLoaderData();
    return (
      <PastEventPage
        german
        title={event.title}
        date={event.date}
        venue={event.venue}
        photos={[...new Set([event.image, ...stage.communityGallery])]}
      />
    );
  },
});
