import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { AnnouncementPreferences } from "./duyurular";

export const Route = createFileRoute("/de/mitteilungen")({
  head: () =>
    germanySeo("/de/mitteilungen", "E-Mail-Mitteilungen", "E-Mail-Mitteilungen bei notwork."),
  component: () => <AnnouncementPreferences german />,
});
