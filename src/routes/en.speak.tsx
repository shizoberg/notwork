import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/en/speak")({
  head: () => ({ meta: [{ title: "Speak at an event | notwork" }] }),
  component: () => (
    <div className="glass-site">
      <SiteNav />
      <main className="mx-auto min-h-[55vh] max-w-4xl px-5 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Speak at an event</h1>
        <p className="my-5 max-w-2xl">Have a story about something that didn’t go to plan? Tell us what happened, what you learned and what you’d share with the audience.</p>
        <a className="underline" href="mailto:berk@notwork.me">Send your talk idea ↗</a>
      </main>
      <SiteFooter />
    </div>
  ),
});
