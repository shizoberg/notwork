import { createFileRoute } from "@tanstack/react-router";
import { PublicMemberProfilePage } from "./u.$username";

export const Route = createFileRoute("/en/u/$username")({
  head: () => ({ meta: [{ title: "Member profile | notwork" }, { name: "robots", content: "noindex" }] }),
  component: () => <PublicMemberProfilePage username={Route.useParams().username} />,
});
