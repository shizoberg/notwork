import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { NotworkNedirPage } from "./notwork-nedir";

export const Route = createFileRoute("/de/ueber-notwork")({
  head: () => germanySeo("/de/ueber-notwork", "Was ist notwork?", "Was ist notwork? bei notwork."),
  component: () => <NotworkNedirPage german />,
});
