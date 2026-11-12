import { createFileRoute } from "@tanstack/react-router";
import { EventProductPage } from "@/components/EventProductPage";
import { englishEvent } from "@/lib/english-events";

export const Route = createFileRoute("/en/22-november")({
  head: () => ({ meta: [{ title: "notwork Stage · 22 November in İzmir" }] }),
  component: () => <EventProductPage config={englishEvent(false)} />,
});
