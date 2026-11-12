import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/en/sponsor")({
  head: () => ({ meta: [{ title: "Partner with notwork | notwork" }] }),
  component: () => (
    <div className="glass-site">
      <SiteNav />
      <main className="mx-auto min-h-[55vh] max-w-4xl px-5 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Partner with notwork</h1>
        <p className="my-5 max-w-2xl">Help us bring people together. Tell us about your organisation and how you’d like to work with the notwork community.</p>
        <a className="underline" href="mailto:berk@notwork.me">Get in touch ↗</a>
      </main>
      <SiteFooter />
    </div>
  ),
});
