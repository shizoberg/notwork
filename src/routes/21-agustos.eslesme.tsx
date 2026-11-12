import { createFileRoute } from "@tanstack/react-router";
import { EventMatch } from "@/components/EventMatch";

export const Route = createFileRoute("/21-agustos/eslesme")({
  head: () => ({
    meta: [{ title: "notwork match" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: EventMatch,
});
