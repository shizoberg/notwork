import { createFileRoute } from "@tanstack/react-router";
import { createNoIndexSeo } from "@/lib/seo";
import { LaunchAdminPanel } from "./adminlaunch";
export const Route = createFileRoute("/adminalaunch")({
  head: () =>
    createNoIndexSeo({
      title: "launchspace · yönetici girişi",
      description: "Yalnızca launchspace etkinlik yönetimi",
      path: "/adminalaunch",
    }),
  component: LaunchAdminPanel,
});
