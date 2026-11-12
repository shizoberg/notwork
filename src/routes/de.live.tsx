import { createFileRoute, Link } from "@tanstack/react-router";
import { GermanySite, germanySeo } from "@/components/germany/GermanySite";
import { MatchMiniDemo } from "@/components/MatchMiniDemo";

export const Route = createFileRoute("/de/live")({
  head: () => germanySeo("/de/live", "Event live", "Probiere notwork Match vor dem Event aus."),
  component: () => (
    <GermanySite active="/de/live">
      <section className="de-hero">
        <p className="de-kicker">NOTWORK DEUTSCHLAND</p>
        <h1>Event live</h1>
        <p>
          Nächstes Event in Deutschland am <time dateTime="2026-12-04">4. Dezember 2026</time>.
        </p>
        <Link to="/de/events" className="de-profile-link">
          Zum Event ↗
        </Link>
      </section>
      <MatchMiniDemo german />
    </GermanySite>
  ),
});
