import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export function MatchRating({ initialRating, onRate }: {
  initialRating?: number;
  onRate: (rating: number) => Promise<unknown>;
}) {
  const [rating, setRating] = useState(initialRating || 0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (initialRating) setRating(initialRating); }, [initialRating]);
  async function rate(value: number) {
    setSaving(true);
    setNotice("");
    try {
      await onRate(value);
      setRating(value);
      setNotice("Teşekkürler, puanın kaydedildi.");
    } catch {
      setNotice("Puan kaydedilemedi. Tekrar deneyebilirsin.");
    } finally { setSaving(false); }
  }
  return <section className="ls-panel ls-match-rating">
    <h2>Eşleşmeyi puanla</h2>
    <p className="ls-caption">Bu tanışma senin için ne kadar faydalıydı?</p>
    <div className="ls-rating-stars" role="group" aria-label="Eşleşme puanı">
      {[1, 2, 3, 4, 5].map(value => <button key={value} type="button"
        aria-label={`${value} yıldız`} aria-pressed={rating === value}
        disabled={saving} onClick={() => void rate(value)}
        className={value <= rating ? "is-rated" : ""}>
        <Star aria-hidden="true" fill={value <= rating ? "currentColor" : "none"} />
      </button>)}
    </div>
    <p className="ls-caption" role="status">{saving ? "Kaydediliyor…" : notice || (rating ? `${rating}/5 · Puanını değiştirebilirsin.` : "İsteğe bağlı · 1 düşük, 5 çok iyi")}</p>
  </section>;
}
