import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";

import { EventsCatalogPage } from "./etkinlikler";

export const Route = createFileRoute("/de/events")({
  head: () =>
    germanySeo("/de/events", "Events in Deutschland", "Kommende notwork Events in Deutschland."),
  component: () => <EventsCatalogPage german />,
});
