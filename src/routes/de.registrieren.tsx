import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GermanySite, germanySeo } from "@/components/germany/GermanySite";
import { registerMember } from "@/lib/member-profile-api";
import { memberCountry } from "@/lib/member-country";
import { compressProfilePhoto } from "@/lib/profile-photo";

export const Route = createFileRoute("/de/registrieren")({
  head: () => germanySeo("/de/registrieren", "Registrieren", "Erstelle dein notwork Profil.", true),
  component: Registration,
});

function Registration() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (key: string) => String(form.get(key) ?? "").trim();
    if (!/[A-Za-z]/.test(field("password")) || !/[0-9]/.test(field("password"))) {
      setError("Das Passwort braucht mindestens einen Buchstaben und eine Zahl.");
      return;
    }
    if (form.get("password") !== form.get("confirmation")) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const photo = form.get("photo");
      let photoDataUrl = "";
      if (photo instanceof File && photo.size) {
        try {
          photoDataUrl = await compressProfilePhoto(photo);
        } catch {
          setError("Das Foto konnte nicht verarbeitet werden. Wähle ein anderes Bild.");
          return;
        }
      }
      await registerMember({
        name: field("name"),
        email: field("email"),
        password: field("password"),
        country: memberCountry(field("country")),
        attendedEventClaim: "germany-community",
        introduction: field("introduction"),
        lookingFor: field("lookingFor"),
        canHelpWith: field("canHelpWith"),
        phone: "",
        linkedin: "",
        instagram: "",
        referrer: "",
        photoDataUrl,
        consent: form.has("consent"),
      });
      await navigate({ to: "/de/profil" });
    } catch (error) {
      setError(
        error instanceof Error && error.message.includes("profil zaten var")
          ? "Für diese E-Mail-Adresse gibt es bereits ein Profil. Melde dich an."
          : "Die Registrierung ist fehlgeschlagen. Prüfe deine Angaben und versuche es erneut.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <GermanySite>
      <section className="de-card de-account">
        <h1>Konto erstellen</h1>
        <p>Erstelle dein Profil für die notwork Community.</p>
        <form onSubmit={submit}>
          <label>
            Vor- und Nachname
            <input name="name" autoComplete="name" minLength={3} maxLength={100} required />
          </label>
          <label>
            E-Mail-Adresse
            <input name="email" autoComplete="email" type="email" maxLength={120} required />
          </label>
          <label>
            Passwort
            <input
              name="password"
              autoComplete="new-password"
              type="password"
              minLength={10}
              maxLength={120}
              required
            />
          </label>
          <label>
            Passwort wiederholen
            <input
              name="confirmation"
              autoComplete="new-password"
              type="password"
              minLength={10}
              maxLength={120}
              required
            />
          </label>
          <label>
            Land im öffentlichen Profil
            <select name="country" defaultValue="DE">
              <option value="">Keine Angabe</option>
              <option value="DE">Deutschland</option>
              <option value="TR">Türkei</option>
            </select>
          </label>
          <label>
            Profilfoto (optional)
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
          </label>
          {(
            [
              ["introduction", "Stell dich vor"],
              ["lookingFor", "Welche Kontakte suchst du?"],
              ["canHelpWith", "Wobei kannst du anderen helfen?"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <small>Mindestens 140 Zeichen</small>
              <textarea name={key} minLength={140} maxLength={500} required />
            </label>
          ))}
          <p>
            <Link to="/de/datenschutz">Datenschutzhinweise</Link> ·{" "}
            <Link to="/de/einwilligung">Einwilligung</Link>
          </p>
          <label className="de-consent-check">
            <input name="consent" type="checkbox" required />
            <span>
              Ich willige ein, dass mein Name, meine Profilbeschreibung, meine Fähigkeiten, mein
              ausgewähltes Land und gegebenenfalls mein Profilfoto im notwork Mitgliederverzeichnis
              angezeigt werden.
            </span>
          </label>
          <button className="de-primary" disabled={busy}>
            {busy ? "Konto wird erstellt …" : "Konto erstellen"}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
        <Link to="/de/profil" className="de-profile-link">
          Ich habe schon ein Konto
        </Link>
      </section>
    </GermanySite>
  );
}
