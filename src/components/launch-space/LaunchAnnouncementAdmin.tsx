import { useEffect, useState } from "react";
import { novemberEventSlug, pollRequest } from "@/lib/event-poll";
import type { LaunchAnnouncement } from "@/lib/launch-dataset";

export function LaunchAnnouncementAdmin() {
  const [current, setCurrent] = useState<LaunchAnnouncement | null>(null);
  const [datasetId, setDatasetId] = useState<string>();
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    void pollRequest(novemberEventSlug, { action: "admin" })
      .then((data) => {
        if (!mounted) return;
        setCurrent(data.announcement ?? null);
        setDatasetId(data.database.datasetId);
        setReady(true);
      })
      .catch((e) => {
        if (mounted) setError(e.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function publish(message: string) {
    setBusy(true);
    setStatus("");
    setError("");
    try {
      const data = await pollRequest(novemberEventSlug, {
        action: "announce",
        datasetId,
        text: message,
      });
      setCurrent(data.announcement ?? null);
      setText("");
      setStatus(message ? "Duyuru yayınlandı." : "Duyuru yayından kaldırıldı.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Duyuru yayınlanamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ls-panel" aria-labelledby="launch-announcement-title">
      <h2 id="launch-announcement-title">Duyuru</h2>
      <p className="ls-caption">
        Duyuru, aktif veri setindeki katılımcı ekranlarının üstünde görünür.
      </p>
      {current && (
        <div className="ls-bulletin">
          <strong>Yayındaki duyuru</strong>
          <p className="ls-flow-copy">{current.text}</p>
          <button className="ls-secondary" disabled={busy} onClick={() => void publish("")}>
            Yayından kaldır
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) void publish(text.trim());
        }}
      >
        <label>
          Duyuru metni
          <textarea
            required
            maxLength={300}
            value={text}
            disabled={!ready || busy}
            onChange={(e) => setText(e.target.value)}
            placeholder="Örn. Sunumlar beş dakika içinde başlıyor."
          />
        </label>
        <div className="ls-actions">
          <button className="ls-primary" disabled={!ready || busy || !text.trim()}>
            {busy ? "Kaydediliyor…" : "Duyuruyu yayınla"}
          </button>
          <small className="ls-caption">{text.length}/300</small>
        </div>
      </form>
      {status && (
        <p role="status" className="ls-caption">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="ls-caption">
          {error}
        </p>
      )}
    </section>
  );
}
