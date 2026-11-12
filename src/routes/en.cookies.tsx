import { createFileRoute } from "@tanstack/react-router";
import { LanguageReferencePage } from "@/components/LanguageReferencePage";

export const Route = createFileRoute("/en/cookies")({
  head: () => ({ meta: [{ title: "Cookie policy | notwork" }, { name: "robots", content: "noindex" }] }),
  component: () => <LanguageReferencePage title="Cookie policy" turkish="/cerez-politikasi" german="/de/cookies" />,
});
