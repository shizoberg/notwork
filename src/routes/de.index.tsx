import { createFileRoute } from "@tanstack/react-router";
import { GermanyHome, germanySeo } from "@/components/germany/GermanySite";

export const Route = createFileRoute("/de/")({
  head: () =>
    germanySeo(
      "/de",
      "Networking-Community",
      "Entdecke notwork, die Community für persönliche Begegnungen und Networking in Deutschland.",
    ),
  component: GermanyHome,
});
