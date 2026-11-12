import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { GermanLegal } from "@/components/germany/GermanLegal";
export const Route = createFileRoute("/de/cookies")({
  head: () =>
    germanySeo("/de/cookies", "Cookie-Richtlinie", "Cookie-Richtlinie für notwork Deutschland."),
  component: () => <GermanLegal kind="cookies" />,
});
