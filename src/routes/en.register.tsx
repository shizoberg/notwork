import { createFileRoute } from "@tanstack/react-router";
import { MemberProfilePage } from "./profil";

export const Route = createFileRoute("/en/register")({
  head: () => ({ meta: [{ title: "Join notwork | notwork" }, { name: "robots", content: "noindex" }] }),
  component: () => <MemberProfilePage registration />,
});
