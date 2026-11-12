import { Link } from "@tanstack/react-router";
import { GermanySite } from "./GermanySite";
import { COOKIE_CONSENT_OPEN_EVENT } from "@/lib/cookie-consent";

const documents = {
  privacy: {
    title: "Datenschutzhinweise",
    sections: [
      [
        "Verantwortlicher",
        "Berk Aktaş, Mitgründer von notwork. Kontakt: berk@notwork.me. Anschrift: Çınarlı, 1572/1. Sk. No:33, 35170 Konak/İzmir, Türkei.",
      ],
      [
        "Welche Daten wir erheben",
        "Wir verarbeiten Angaben aus der Registrierung, dem Profil, Veranstaltungsformularen, QR-Check-ins, Feedback, Kontaktanfragen und dem Betrieb der Website. Dazu können Name, E-Mail-Adresse, Profilfoto, Land, berufliche Angaben, Netzwerkinteressen, Einwilligungen und technische Nutzungsdaten gehören.",
      ],
      [
        "Wofür wir die Daten nutzen",
        "Wir betreiben das Konto, das Mitgliederverzeichnis, die digitale Visitenkarte und die Veranstaltungsfunktionen. Wir verarbeiten Daten auch zur Bearbeitung von Anfragen, zur Sicherheit der Website und zur Fehlerbehebung. Ankündigungen per E-Mail erhältst du nach gesonderter Zustimmung.",
      ],
      [
        "Rechtsgrundlagen",
        "Je nach Zweck stützt sich die Verarbeitung auf die Bereitstellung der angefragten Leistung, berechtigte Interessen am sicheren Betrieb, gesetzliche Pflichten oder deine Einwilligung. Diese Hinweise informieren über die Verarbeitung. Die Einwilligung zur Profilanzeige wird im Formular separat abgefragt.",
      ],
      [
        "Profil, Matching und Feedback",
        "Mit deiner Einwilligung werden Name, Profiltext, Fähigkeiten, gewähltes Land und gegebenenfalls das Profilfoto im Mitgliederverzeichnis angezeigt. Die Sichtbarkeit von Kontaktdaten richtet sich nach den Zugriffsregeln. notwork Match vergleicht Interessen, Bedürfnisse und Angebote. Bei gesonderter Einwilligung können begrenzte Antworten für KI-gestützte Vorschläge verarbeitet werden. Name, E-Mail-Adresse, Telefonnummer, Benutzername und Foto werden für diese Vorschläge nicht an die OpenAI API gesendet.",
      ],
      [
        "Empfänger und Verarbeitung im Ausland",
        "Je nach Nutzung setzen wir Netlify und Netlify Blobs für Betrieb und Speicherung, GitHub für die Bereitstellung sowie Google/Gmail und gegebenenfalls Resend für E-Mails ein. Bei gesondert aktivierter KI-Unterstützung nutzen wir die OpenAI API. Messdienste kommen entsprechend deiner Cookie-Auswahl zum Einsatz. Dienste können Daten außerhalb deines Landes verarbeiten. Beim Öffnen externer Links gelten die Datenschutzhinweise der jeweiligen Anbieter.",
      ],
      [
        "Speicherung und Sicherheit",
        "Wir speichern Daten so lange, wie sie für den jeweiligen Zweck, gesetzliche Pflichten oder die Bearbeitung von Ansprüchen erforderlich sind. Zugriffsbeschränkungen, Anmeldesitzungen und Sicherungskopien schützen die Daten. Die Abmeldung von E-Mails beendet den Versand von Ankündigungen.",
      ],
      [
        "Deine Rechte und Kontakt",
        "Nach dem anwendbaren Datenschutzrecht kannst du unter anderem Auskunft, Berichtigung, Löschung oder Einschränkung beantragen, einer Verarbeitung widersprechen und eine Einwilligung mit Wirkung für die Zukunft widerrufen. Je nach Rechtsgrundlage können ein Recht auf Datenübertragbarkeit und ein Beschwerderecht bei der zuständigen Aufsicht bestehen. Für Datenschutzanfragen erreichst du uns unter berk@notwork.me.",
      ],
    ],
  },
  cookies: {
    title: "Cookie-Richtlinie",
    sections: [
      [
        "Notwendige Cookies",
        "Sie ermöglichen die Anmeldung, den Schutz der Sitzung und das Speichern deiner Cookie-Auswahl.",
      ],
      [
        "Analyse und Marketing",
        "Mit deiner Zustimmung können Analyse- und Marketingdienste Seitenaufrufe und Interaktionen messen. Dazu gehören je nach Seite Meta Pixel und der OpenAI-Messpixel.",
      ],
      [
        "Externe Inhalte",
        "Wenn du externe Dienste wie YouTube, WhatsApp oder einen Ticketanbieter öffnest, gelten deren Cookie- und Datenschutzhinweise.",
      ],
      [
        "Auswahl ändern",
        "Du kannst deine Auswahl jederzeit über die Cookie-Einstellungen ändern. Cookies lassen sich auch in den Einstellungen deines Browsers löschen.",
      ],
    ],
  },
  consent: {
    title: "Einwilligung",
    sections: [
      [
        "Mitgliederverzeichnis",
        "Mit der Einwilligung im Registrierungsformular erlaubst du notwork, deinen Namen, deine Profilbeschreibung, deine Fähigkeiten, dein ausgewähltes Land und gegebenenfalls dein Profilfoto im Verzeichnis anzuzeigen.",
      ],
      [
        "Weitere Einwilligungen",
        "Für KI-gestützte Analysen, die Verwendung von Antworten zur Weiterentwicklung des Matchings, den Versand von Werbe-E-Mails und die Veröffentlichung von Veranstaltungsfotos oder Bewertungen gelten jeweils die Auswahlmöglichkeiten im betreffenden Formular.",
      ],
      [
        "Widerruf",
        "Du kannst eine Einwilligung für die Zukunft widerrufen. Für die Entfernung eines veröffentlichten Profils oder Inhalts wende dich an berk@notwork.me.",
      ],
    ],
  },
} as const;

export function GermanLegal({ kind }: { kind: keyof typeof documents }) {
  const doc = documents[kind];
  return (
    <GermanySite>
      <article className="de-card de-legal">
        <h1>{doc.title}</h1>
        {doc.sections.map(([title, body]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
        <div className="de-actions">
          <Link className="de-secondary" to="/de/datenschutz">
            Datenschutzhinweise
          </Link>
          <Link className="de-secondary" to="/de/cookies">
            Cookie-Richtlinie
          </Link>
          <Link className="de-secondary" to="/de/einwilligung">
            Einwilligung
          </Link>
          {kind === "cookies" && (
            <button
              className="de-primary"
              onClick={() => window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT))}
            >
              Cookie-Einstellungen öffnen
            </button>
          )}
        </div>
      </article>
    </GermanySite>
  );
}
