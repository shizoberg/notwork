import { createFileRoute } from "@tanstack/react-router";
import { GermanySite, germanySeo } from "@/components/germany/GermanySite";
import type { FormEvent } from "react";

export const Route = createFileRoute("/de/vortrag")({
  head: () =>
    germanySeo(
      "/de/vortrag",
      "Ich möchte einen Vortrag halten",
      "Schlage einen Vortrag für ein notwork Event vor.",
    ),
  component: SpeakerPage,
});

function SpeakerPage() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = "notwork Deutschland · Vortragsvorschlag";
    const body = [
      "Name: " + data.get("name"),
      "E-Mail: " + data.get("email"),
      "Titel: " + data.get("title"),
      "",
      String(data.get("description")),
    ].join("\n");
    window.location.href = `mailto:berk@carewithki.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  return (
    <GermanySite active="/de/vortrag">
      <section className="de-card de-account">
        <h1>Ich möchte einen Vortrag halten</h1>
        <p>
          Teile eine Erfahrung oder Idee mit der notwork Community. Der Button öffnet deinen
          E-Mail-Entwurf.
        </p>
        <form onSubmit={submit}>
          <label>
            Dein Name
            <input name="name" autoComplete="name" maxLength={100} required />
          </label>
          <label>
            E-Mail-Adresse
            <input name="email" autoComplete="email" type="email" required />
          </label>
          <label>
            Titel des Vortrags
            <input name="title" maxLength={120} required />
          </label>
          <label>
            Worum geht es?
            <textarea name="description" maxLength={1600} required />
          </label>
          <button className="de-primary">E-Mail-Entwurf öffnen</button>
        </form>
      </section>
    </GermanySite>
  );
}
