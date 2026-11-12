import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { GermanLegal } from "@/components/germany/GermanLegal";
export const Route = createFileRoute("/de/datenschutz")({
  head: () =>
    germanySeo(
      "/de/datenschutz",
      "Datenschutzhinweise",
      "Datenschutzhinweise für notwork Deutschland.",
    ),
  component: () => <GermanLegal kind="privacy" />,
});
