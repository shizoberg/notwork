import { createFileRoute } from "@tanstack/react-router";
import { NetworkingExperience } from "./networking";

export const Route = createFileRoute("/en/networking")({
  head: () => ({ meta: [{ title: "Networking | notwork" }] }),
  component: () => <NetworkingExperience english />,
});
