import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GermanySite, germanySeo } from "@/components/germany/GermanySite";
import {
  getMyMemberProfile,
  loginMember,
  logoutMember,
  updateMyMemberProfile,
} from "@/lib/member-profile-api";
import { memberCountry, type MemberCountry } from "@/lib/member-country";
import type { NotworkMemberProfile } from "@/lib/member-profile";

export const Route = createFileRoute("/de/profil")({
  head: () =>
    germanySeo(
      "/de/profil",
      "Mein Profil",
      "Melde dich bei notwork an und verwalte dein Land im Profil.",
      true,
    ),
  component: GermanyProfile,
});

function GermanyProfile() {
  const [profile, setProfile] = useState<NotworkMemberProfile | null>();
  const [country, setCountry] = useState<MemberCountry>();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let current = true;
    getMyMemberProfile()
      .then((data) => {
        if (current) {
          setProfile(data);
          setCountry(data?.country);
        }
      })
      .catch(() => {
        if (current) setProfile(null);
      });
    return () => {
      current = false;
    };
  }, []);
  async function login() {
    setBusy(true);
    setError("");
    try {
      const data = await loginMember(identity.trim(), password);
      setProfile(data);
      setCountry(data.country);
      setPassword("");
    } catch {
      setError("Die Anmeldung ist fehlgeschlagen. Prüfe deine Zugangsdaten.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!profile) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const { headline, bio, skills, experiences, links, phone, publicProfileEnabled } = profile;
      const data = await updateMyMemberProfile({
        headline,
        bio,
        skills,
        experiences,
        links,
        phone: phone ?? "",
        publicProfileEnabled,
        country: country ?? null,
      });
      setProfile(data);
      setSaved(true);
    } catch {
      setError("Das Land konnte nicht gespeichert werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <GermanySite>
      <section className="de-card de-account">
        <h1>Mein Profil</h1>
        {profile === undefined ? (
          <p role="status">Profil wird geladen …</p>
        ) : !profile ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void login();
            }}
          >
            <label>
              E-Mail oder Benutzername
              <input
                autoComplete="username"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                required
              />
            </label>
            <label>
              Passwort
              <input
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button className="de-primary" disabled={busy}>
              {busy ? "Anmeldung läuft …" : "Anmelden"}
            </button>
            <a href="/profil?mode=register" lang="tr" className="de-profile-link">
              Registrieren (Türkisch) ↗
            </a>
          </form>
        ) : (
          <>
            <h2>{profile.name}</h2>
            {profile.mustChangePassword ? (
              <p>Bitte ändere zuerst dein Passwort im Profil.</p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void save();
                }}
              >
                <label>
                  Öffentlich sichtbares Land
                  <select
                    value={country ?? ""}
                    onChange={(e) => {
                      setCountry(memberCountry(e.target.value));
                      setSaved(false);
                    }}
                  >
                    <option value="">Keine Angabe</option>
                    <option value="DE">🇩🇪 Deutschland</option>
                    <option value="TR">🇹🇷 Türkei</option>
                  </select>
                </label>
                <button className="de-primary" disabled={busy}>
                  Speichern
                </button>
              </form>
            )}
            {saved && <p role="status">Land gespeichert.</p>}
            <div className="de-actions">
              <a href="/profil" lang="tr" className="de-secondary">
                Vollständige Profileinstellungen (Türkisch) ↗
              </a>
              <button
                type="button"
                className="de-secondary"
                onClick={() =>
                  void logoutMember()
                    .then(() => setProfile(null))
                    .catch(() => setError("Abmelden fehlgeschlagen."))
                }
              >
                Abmelden
              </button>
            </div>
          </>
        )}
        {error && <p role="alert">{error}</p>}
      </section>
    </GermanySite>
  );
}
