import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/en/about")({
  head: () => ({ meta: [{ title: "About notwork | notwork" }] }),
  component: () => (
    <div className="glass-site">
      <SiteNav />
      <main className="mx-auto min-h-[55vh] max-w-4xl px-5 py-16">
        <h1 className="text-4xl font-bold tracking-tight">About notwork</h1>
        <p className="my-5 max-w-2xl">We bring people together at networking events in Türkiye and Germany. At notwork Stage you hear honest stories about setbacks, then meet people through notwork Match. At notwork Fast the focus is on short conversations and new connections.</p>
        <a className="underline" href="/en/events">Explore events ↗</a>
      </main>
      <SiteFooter />
    </div>
  ),
});
