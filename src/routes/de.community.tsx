import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/de/community")({
  beforeLoad: () => {
    throw redirect({ to: "/de/networking", statusCode: 301 });
  },
});
