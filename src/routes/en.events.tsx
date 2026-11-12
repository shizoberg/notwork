import { createFileRoute } from "@tanstack/react-router";
import { EventsCatalogPage } from "./etkinlikler";

export const Route = createFileRoute("/en/events")({
  head: () => ({ meta: [{ title: "Events in Türkiye and Germany | notwork" }] }),
  component: () => <EventsCatalogPage english />,
});
