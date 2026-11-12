import { createFileRoute } from "@tanstack/react-router";
import { NtwPage } from "./ntw";

export const Route = createFileRoute("/en/live")({
  head: () => ({ meta: [{ title: "Live event | notwork" }] }),
  component: () => <NtwPage english />,
});
