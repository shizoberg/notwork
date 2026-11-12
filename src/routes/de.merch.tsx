import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { MerchPage } from "./merch";

export const Route = createFileRoute("/de/merch")({
  head: () => germanySeo("/de/merch", "Merch", "Merch bei notwork."),
  component: () => <MerchPage german />,
});
