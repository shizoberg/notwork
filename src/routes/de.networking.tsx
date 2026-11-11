import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { CountryTag } from "@/components/CountryTag";
import { GermanySite, germanySeo } from "@/components/germany/GermanySite";
import { listMembers, type Member } from "@/lib/networking-api";

export const Route = createFileRoute("/de/networking")({
  head: () =>
    germanySeo(
      "/de/networking",
      "Networking",
      "Finde Menschen in der notwork Community und entdecke ihre Profile.",
    ),
  component: GermanyNetworking,
});

function GermanyNetworking() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [germanyOnly, setGermanyOnly] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [visible, setVisible] = useState(24);

  useEffect(() => {
    let current = true;
    listMembers()
      .then((rows) => {
        if (current) {
          setMembers(rows);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (current) setStatus("error");
      });
    return () => {
      current = false;
    };
  }, []);
  const filtered = members.filter(
    (member) =>
      (!germanyOnly || member.country === "DE") &&
      [member.name, member.title, ...member.skills]
        .join(" ")
        .toLocaleLowerCase("de")
        .includes(query.trim().toLocaleLowerCase("de")),
  );

  return (
    <GermanySite active="/de/networking">
      <section className="de-hero">
        <p className="de-kicker">NOTWORK COMMUNITY</p>
        <h1>Entdecke die Community</h1>
        <p>Finde Menschen, die deine Interessen teilen oder eine neue Perspektive mitbringen.</p>
      </section>
      <div className="de-filter">
        <label>
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(24);
            }}
            aria-label="Mitglieder suchen"
            placeholder="Name, Beruf oder Fähigkeiten"
          />
        </label>
        <label className="de-check">
          <input
            type="checkbox"
            checked={germanyOnly}
            onChange={(e) => {
              setGermanyOnly(e.target.checked);
              setVisible(24);
            }}
          />{" "}
          Nur Deutschland
        </label>
      </div>
      {status !== "ready" ? (
        <p role="status">
          {status === "loading"
            ? "Profile werden geladen …"
            : "Die Profile konnten nicht geladen werden."}
        </p>
      ) : !filtered.length ? (
        <div className="de-card de-empty">
          <UsersRound />
          <p>Keine passenden Profile gefunden.</p>
        </div>
      ) : (
        <div className="de-member-grid">
          {filtered.slice(0, visible).map((member) => (
            <article key={member.id} className="de-card de-member-card">
              {member.photoUrl ? (
                <img src={member.photoUrl} alt="" loading="lazy" />
              ) : (
                <span className="de-avatar" aria-hidden="true">
                  {member.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
              <h2>
                {member.name} <CountryTag german country={member.country} />
              </h2>
              <p>{member.title}</p>
              {member.verifiedMember && <small>✓ Verifiziertes Mitglied</small>}
              {member.username && (
                <Link
                  className="de-profile-link"
                  to="/de/u/$username"
                  params={{ username: member.username }}
                >
                  Profil ansehen ↗
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
      {filtered.length > visible && (
        <button
          className="de-secondary mt-6"
          type="button"
          onClick={() => setVisible((count) => count + 24)}
        >
          Mehr Profile anzeigen
        </button>
      )}
    </GermanySite>
  );
}
