import { createFileRoute } from "@tanstack/react-router";
import { NetworkStartupPage } from "./network-startup";
import { createSeo } from "@/lib/seo";

export const Route = createFileRoute("/startup")({
  head: () =>
    createSeo({
      title: "İzmir Startup Ağı ve Proje Desteği | notwork",
      description:
        "İzmir’de startup projesini anlat, pazarlama ihtiyacını paylaş ve notwork network club topluluğundan doğru bağlantılarla destek al.",
      path: "/startup",
      keywords: ["İzmir startup", "İzmir girişimci ağı", "startup proje desteği"],
    }),
  component: NetworkStartupPage,
});
