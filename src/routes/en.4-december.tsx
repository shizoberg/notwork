import {Link} from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { EventProductPage } from "@/components/EventProductPage";
import { englishEvent } from "@/lib/english-events";

export const Route = createFileRoute("/en/4-december")({
  head: () => ({ meta: [{ title: "notwork Stage · 4 December in Munich" }] }),
  component: () => <main className="mx-auto max-w-3xl px-6 py-24"><h1>No upcoming events in Germany</h1><Link to="/en/events">All events</Link></main>,
});
