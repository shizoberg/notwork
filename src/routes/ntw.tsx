import { createFileRoute, Navigate } from "@tanstack/react-router";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/ntw")({
  head: () =>
    createSeo({
      title: "Etkinlik anı | notwork",
      description: "Aynı mekân, yeni insanlar ve gerçek zamanlı karşılaşmalar.",
      path: "/ntw",
    }),
  component: NtwPage,
});

function NtwPage() {
  return <Navigate to="/linkler" search={{ event: "9-ekim-2026" }} replace />;
}
