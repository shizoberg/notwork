import { useState } from "react";
import { rateEventMatch } from "@/lib/event-network-api";
import type { EventSelection } from "@/lib/event-registry";

export function MatchFeedback({
  token,
  groupId,
  selection,
}: {
  token: string;
  groupId: string;
  selection: EventSelection;
}) {
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState<{ score: number; consent: boolean }>();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function save() {
    setBusy(true);
    setError(false);
    try {
      await rateEventMatch(token, groupId, score, consent, selection);
      setSaved({ score, consent });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="rounded-2xl border border-border bg-background p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <fieldset disabled={busy}>
        <legend className="text-sm font-bold">Bu eşleşme senin için ne kadar verimliydi?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="grid min-h-10 min-w-10 cursor-pointer place-items-center rounded-lg border border-border text-sm font-bold has-[:checked]:border-primary has-[:checked]:bg-primary/20 has-[:focus-visible]:outline"
            >
              <input
                className="sr-only"
                type="radio"
                name="match-score"
                value={value}
                checked={score === value}
                onChange={() => setScore(value)}
              />
              {value}
            </label>
          ))}
          <button
            type="submit"
            disabled={!score || (score === saved?.score && consent === saved.consent)}
            className="rounded-lg bg-primary/15 px-3 py-2 text-sm font-bold disabled:opacity-60"
          >
            Puanı kaydet
          </button>
        </div>
        <label className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          Puanımın, grubun kural puanı ve tur numarasıyla birlikte eşleşme modelini geliştirmek için
          kullanılmasına izin veriyorum. İsteğe bağlı.
        </label>
      </fieldset>
      {saved && (
        <p className="mt-2 text-xs" role="status">
          {saved.score}/5 kaydedildi.
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          Puan kaydedilemedi. Aktif grubunu kontrol edip tekrar dene.
        </p>
      )}
    </form>
  );
}
