import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { SponsorPage } from "./sponsor";

export const Route = createFileRoute("/de/sponsor")({
  head: () => germanySeo("/de/sponsor", "Sponsoring", "Sponsoring bei notwork."),
  component: () => <SponsorPage german />,
});
