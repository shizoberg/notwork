import { useState } from "react";
import { Network, RotateCcw } from "lucide-react";

const groups = [
  ["Deniz", "Alex", "Mika"],
  ["Robin", "Ece", "Sam"],
];

export function MatchMiniDemo({ german = false }: { german?: boolean }) {
  const [group, setGroup] = useState(-1);
  const names = groups[group % groups.length];
  return (
    <section className="de-card match-mini">
      <Network size={23} aria-hidden="true" />
      <h2>notwork Match</h2>
      <p>
        {german
          ? "Probiere aus, wie notwork beim Event kleine Gesprächsgruppen bildet."
          : "Etkinlikte üç kişilik tanışma gruplarının nasıl oluştuğunu dene."}
      </p>
      {names && (
        <div className="match-mini-result" aria-live="polite">
          <strong>{german ? "Deine Beispielgruppe" : "Örnek grubun"}</strong>
          <ul>
            {names.map((name) => (
              <li key={name}>
                <span aria-hidden="true">{name[0]}</span>
                {name}
              </li>
            ))}
          </ul>
          <p>
            {german
              ? "Gesprächseinstieg: Woran arbeitest du gerade?"
              : "İlk soru: Şu sıralar ne üzerinde çalışıyorsun?"}
          </p>
        </div>
      )}
      <button
        className="de-primary"
        type="button"
        onClick={() => setGroup((previous) => previous + 1)}
      >
        {group >= 0 && <RotateCcw size={15} aria-hidden="true" />}
        {german
          ? group < 0
            ? "Demo starten"
            : "Neue Beispielgruppe"
          : group < 0
            ? "Demoyu başlat"
            : "Yeni örnek grup"}
      </button>
    </section>
  );
}
