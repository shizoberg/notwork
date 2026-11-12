import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { NetworkingExperience } from "./networking";

export const Route = createFileRoute("/de/networking")({
  head: () =>
    germanySeo(
      "/de/networking",
      "Networking",
      "Finde Menschen in der notwork Community und entdecke ihre Profile.",
    ),
  component: () => <NetworkingExperience german />,
});
