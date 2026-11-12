import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { MemberProfilePage } from "./profil";

export const Route = createFileRoute("/de/profil")({
  head: () =>
    germanySeo(
      "/de/profil",
      "Mein Profil",
      "Melde dich an und verwalte dein notwork Profil.",
      true,
    ),
  component: () => <MemberProfilePage />,
});
