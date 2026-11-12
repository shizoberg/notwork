import { createFileRoute } from "@tanstack/react-router";
import { documentationHead, NotworkDocumentation } from "@/components/NotworkDocumentation";

export const Route = createFileRoute("/de/dokumentation")({
  head: () => documentationHead(true),
  component: () => <NotworkDocumentation german />,
});
