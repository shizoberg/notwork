import { createFileRoute } from "@tanstack/react-router";
import { createNoIndexSeo } from "@/lib/seo";
import { LaunchAdminPanel } from "./adminlaunch";
export const Route = createFileRoute("/adminalaunch")({
  head: () =>
    createNoIndexSeo({
      title: "Launch Space · yönetici girişi",
      description: "Yalnızca Launch Space etkinlik yönetimi",
      path: "/adminalaunch",
    }),
  component: LaunchAdminPanel,
});
