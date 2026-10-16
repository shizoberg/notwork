import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/creative")({
  beforeLoad: () => { throw redirect({ to: "/etkinlikler", replace: true }); },
});
