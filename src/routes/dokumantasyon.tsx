import { createFileRoute } from "@tanstack/react-router";
import { documentationHead, NotworkDocumentation } from "@/components/NotworkDocumentation";

export const Route = createFileRoute("/dokumantasyon")({
  head: () => documentationHead(),
  component: NotworkDocumentation,
});
