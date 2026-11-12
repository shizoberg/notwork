import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CountryTag } from "@/components/CountryTag";
import { GermanySite, germanySeo } from "@/components/germany/GermanySite";
import { getPublicMemberProfile } from "@/lib/member-profile-api";
import type { PublicNotworkMemberProfile } from "@/lib/member-profile";

export const Route = createFileRoute("/de/u/$username")({
  head: ({ params }) =>
    germanySeo(
      `/de/u/${encodeURIComponent(params.username)}`,
      "Mitgliedsprofil",
      "Mitglied der notwork Community.",
      true,
    ),
  component: GermanyPublicProfile,
});

function GermanyPublicProfile() {
  const { username } = Route.useParams();
  const [profile, setProfile] = useState<PublicNotworkMemberProfile>();
  const [error, setError] = useState(false);
  useEffect(() => {
    let current = true;
    setProfile(undefined);
    setError(false);
    getPublicMemberProfile(username)
      .then((data) => {
        if (current) setProfile(data);
      })
      .catch(() => {
        if (current) setError(true);
      });
    return () => {
      current = false;
    };
  }, [username]);
  return (
    <GermanySite active="/de/networking">
      <Link className="de-profile-link" to="/de/networking">
        ← Zur Community
      </Link>
      {!profile ? (
        <p role="status">
          {error ? "Dieses Profil ist nicht verfügbar." : "Profil wird geladen …"}
        </p>
      ) : (
        <section className="de-card de-public-profile">
          {profile.photoUrl && <img className="de-avatar" src={profile.photoUrl} alt="" />}
          <h1>
            {profile.name} <CountryTag german country={profile.country} />
          </h1>
          <p>{profile.headline}</p>
          {profile.bio && <p>{profile.bio}</p>}
          {profile.skills.length > 0 && (
            <>
              <h2>Fähigkeiten</h2>
              <ul>
                {profile.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </>
          )}
          {profile.verifiedMember && <p>✓ Verifiziertes notwork Mitglied</p>}
        </section>
      )}
    </GermanySite>
  );
}
