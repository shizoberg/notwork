import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";

import { HomeLanding } from "@/components/HomeLanding";

export const Route = createFileRoute("/de/")({
  head: () =>
    germanySeo(
      "/de",
      "Networking-Community",
      "Entdecke notwork, die Community für persönliche Begegnungen und Networking in Deutschland.",
    ),
  component: () => <HomeLanding german />,
});
