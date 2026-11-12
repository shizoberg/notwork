import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { GermanLegal } from "@/components/germany/GermanLegal";
export const Route = createFileRoute("/de/einwilligung")({
  head: () =>
    germanySeo("/de/einwilligung", "Einwilligung", "Einwilligung für notwork Deutschland."),
  component: () => <GermanLegal kind="consent" />,
});
