import { createFileRoute, notFound } from "@tanstack/react-router";
import { PastEventPage } from "@/components/PastEventPage";
import { englishCatalog } from "./etkinlikler";
import { eventConfig } from "./22-kasim";

export const Route = createFileRoute("/en/archive/$eventId")({
  loader: ({ params }) => {
    const event = englishCatalog.find((item) => item.id === params.eventId && item.href?.startsWith("/en/archive/"));
    if (!event) throw notFound();
    return event;
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? "Event archive"} | notwork` }] }),
  component: function ArchiveEvent() {
    const event = Route.useLoaderData();
    return <PastEventPage english title={event.title} date={event.date} venue={event.venue} photos={[...new Set([event.image, ...eventConfig.communityGallery])]} />;
  },
});
