import { createFileRoute } from "@tanstack/react-router";
import { germanySeo } from "@/components/germany/GermanySite";
import { PublicMemberProfilePage } from "./u.$username";

export const Route = createFileRoute("/de/u/$username")({
  head: () =>
    germanySeo("/de/u", "ntw.business", "Die notwork Mitgliedskarte mit Empfehlungen.", true),
  component: () => <PublicMemberProfilePage username={Route.useParams().username} />,
});
