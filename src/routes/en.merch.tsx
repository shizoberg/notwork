import { createFileRoute } from "@tanstack/react-router";
import { LanguageReferencePage } from "@/components/LanguageReferencePage";

export const Route = createFileRoute("/en/merch")({
  head: () => ({ meta: [{ title: "Merch | notwork" }, { name: "robots", content: "noindex" }] }),
  component: () => <LanguageReferencePage title="Merch" turkish="/merch" german="/de/merch" />,
});
