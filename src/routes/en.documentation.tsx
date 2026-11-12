import { createFileRoute } from "@tanstack/react-router";
import { LanguageReferencePage } from "@/components/LanguageReferencePage";

export const Route = createFileRoute("/en/documentation")({
  head: () => ({ meta: [{ title: "Documentation | notwork" }, { name: "robots", content: "noindex" }] }),
  component: () => <LanguageReferencePage title="Documentation" turkish="/dokumantasyon" german="/de/dokumentation" />,
});
