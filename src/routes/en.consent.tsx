import { createFileRoute } from "@tanstack/react-router";
import { LanguageReferencePage } from "@/components/LanguageReferencePage";

export const Route = createFileRoute("/en/consent")({
  head: () => ({ meta: [{ title: "Consent notice | notwork" }, { name: "robots", content: "noindex" }] }),
  component: () => <LanguageReferencePage title="Consent notice" turkish="/acik-riza" german="/de/einwilligung" />,
});
