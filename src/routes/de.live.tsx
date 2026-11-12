import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { NtwPage } from "./ntw";

export const Route = createFileRoute("/de/live")({
  head: () => germanySeo("/de/live", "Event live", "Probiere notwork Match vor dem Event aus."),
  component: () => <NtwPage german />,
});
