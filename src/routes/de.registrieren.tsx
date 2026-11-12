import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { MemberProfilePage } from "./profil";

export const Route = createFileRoute("/de/registrieren")({
  head: () => germanySeo("/de/registrieren", "Registrieren", "Erstelle dein notwork Profil.", true),
  component: () => <MemberProfilePage registration />,
});
