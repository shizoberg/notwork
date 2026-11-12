import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GermanySite, germanySeo } from "@/components/germany/GermanySite";
import {
  changeMemberPassword,
  completeMemberPasswordReset,
  getMyMemberProfile,
  loginMember,
  logoutMember,
  updateMyMemberProfile,
  uploadMemberPhoto,
  requestMemberPasswordReset,
} from "@/lib/member-profile-api";
import { compressProfilePhoto } from "@/lib/profile-photo";
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
  const [resetToken, setResetToken] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setResetToken(new URLSearchParams(location.search).get("reset") || "");
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
        {resetToken ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await completeMemberPasswordReset(resetToken, password);
                history.replaceState(history.state, "", "/de/profil");
                setResetToken("");
                setPassword("");
                setError("");
                setProfile(null);
                setSaved(true);
              } catch {
                setError(
                  "Der Link ist ungültig oder abgelaufen. Das neue Passwort braucht mindestens zehn Zeichen, einen Buchstaben und eine Zahl.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Neues Passwort
              <input
                type="password"
                autoComplete="new-password"
                minLength={10}
                pattern="(?=.*[A-Za-z])(?=.*[0-9]).{10,}"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button className="de-primary" disabled={busy}>
              Passwort zurücksetzen
            </button>
          </form>
        ) : profile === undefined ? (
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
            <Link to="/de/registrieren" className="de-profile-link">
              Konto erstellen ↗
            </Link>
            <button
              type="button"
              className="de-profile-link"
              onClick={() => setResetOpen((open) => !open)}
            >
              Passwort vergessen?
            </button>
          </form>
        ) : (
          <>
            <h2>{profile.name}</h2>
            {profile.mustChangePassword ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    setProfile(await changeMemberPassword(password));
                    setPassword("");
                    setError("");
                  } catch {
                    setError("Das Passwort konnte nicht geändert werden.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label>
                  Neues Passwort
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                <button className="de-primary" disabled={busy}>
                  Passwort ändern
                </button>
              </form>
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
                <label>
                  Profilbeschreibung
                  <textarea
                    maxLength={320}
                    value={profile.bio}
                    onChange={(e) => {
                      setProfile({ ...profile, bio: e.target.value });
                      setSaved(false);
                    }}
                  />
                </label>
                <label>
                  Profilüberschrift
                  <input
                    maxLength={120}
                    value={profile.headline}
                    onChange={(e) => {
                      setProfile({ ...profile, headline: e.target.value });
                      setSaved(false);
                    }}
                  />
                </label>
                <button className="de-primary" disabled={busy}>
                  Speichern
                </button>
              </form>
            )}
            {!profile.mustChangePassword && (
              <label>
                Profilfoto ändern
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={async (e) => {
                    const file = e.currentTarget.files?.[0];
                    if (!file) return;
                    setBusy(true);
                    try {
                      const updated = await uploadMemberPhoto(await compressProfilePhoto(file));
                      setProfile((previous) =>
                        previous ? { ...previous, photoUrl: updated.photoUrl } : previous,
                      );
                      setError("");
                    } catch {
                      setError("Das Profilfoto konnte nicht gespeichert werden.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </label>
            )}
            {saved && <p role="status">Profil gespeichert.</p>}
            <div className="de-actions">
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
        {!profile && !resetToken && saved && (
          <p role="status">Passwort gespeichert. Du kannst dich anmelden.</p>
        )}
        {!profile && !resetToken && resetOpen && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              try {
                await requestMemberPasswordReset(String(data.get("email")), "de");
                setResetSent(true);
                setError("");
              } catch {
                setError("Die Anfrage konnte nicht gesendet werden.");
              }
            }}
          >
            <label>
              E-Mail für die Passwortänderung
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <button className="de-secondary">Link anfordern</button>
            {resetSent && (
              <p role="status">Wenn ein Konto existiert, erhältst du einen Link per E-Mail.</p>
            )}
          </form>
        )}
        {error && <p role="alert">{error}</p>}
      </section>
    </GermanySite>
  );
}
