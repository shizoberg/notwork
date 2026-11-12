import { createFileRoute } from "@tanstack/react-router";
import { LanguageReferencePage } from "@/components/LanguageReferencePage";

export const Route = createFileRoute("/en/privacy")({
  head: () => ({ meta: [{ title: "Privacy notice | notwork" }, { name: "robots", content: "noindex" }] }),
  component: () => <LanguageReferencePage title="Privacy notice" turkish="/kvkk" german="/de/datenschutz" />,
});
