import { createFileRoute } from "@tanstack/react-router";
import { MemberProfilePage } from "./profil";

export const Route = createFileRoute("/en/profile")({
  head: () => ({ meta: [{ title: "My profile | notwork" }, { name: "robots", content: "noindex" }] }),
  component: () => <MemberProfilePage />,
});
