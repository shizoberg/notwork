import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/startup")({
  beforeLoad: () => { throw redirect({ to: "/etkinlikler", replace: true }); },
});
