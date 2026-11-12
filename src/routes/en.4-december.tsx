import { createFileRoute } from "@tanstack/react-router";
import { EventProductPage } from "@/components/EventProductPage";
import { englishEvent } from "@/lib/english-events";

export const Route = createFileRoute("/en/4-december")({
  head: () => ({ meta: [{ title: "notwork Stage · 4 December in Munich" }] }),
  component: () => <EventProductPage config={englishEvent(true)} />,
});
