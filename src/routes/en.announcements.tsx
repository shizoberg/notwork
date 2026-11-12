import { createFileRoute } from "@tanstack/react-router";
import { LanguageReferencePage } from "@/components/LanguageReferencePage";

export const Route = createFileRoute("/en/announcements")({
  head: () => ({ meta: [{ title: "Email preferences | notwork" }, { name: "robots", content: "noindex" }] }),
  component: () => <LanguageReferencePage title="Email preferences" turkish="/duyurular" german="/de/mitteilungen" />,
});
