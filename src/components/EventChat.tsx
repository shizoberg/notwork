import { useEffect, useRef, useState } from "react";
import { eventChatRequest, type EventChatMessage } from "@/lib/event-network-api";
import { MessageCircle, Send } from "lucide-react";

export function EventChat({
  token,
  groupId,
  demo = false,
  german = false,
}: {
  token: string;
  groupId: string;
  demo?: boolean;
  german?: boolean;
}) {
  const [rows, setRows] = useState<EventChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const pending = useRef<{ id: string; text: string } | null>(null);
  const title = german ? "Gruppenchat" : "Grup sohbeti";
  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    let loading = false;
    const refresh = async () => {
      if (document.visibilityState !== "visible" || loading) return;
      loading = true;
      try {
        const next = await eventChatRequest(token, undefined, undefined, groupId);
        if (!cancelled) {
          setRows(next);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Sohbete bağlanılamadı. Yeniden deniyoruz.");
      } finally {
        loading = false;
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 20_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [token, groupId, demo]);
  return (
    <section className="event-chat" aria-label={title}>
      <header className="event-chat-heading">
        <span className="event-chat-icon">
          <MessageCircle size={22} />
        </span>
        <span>
          {title}
          <small>
            {german ? "Verabredet euch für euer Treffen" : "Buradan haberleş, kolayca buluş"}
          </small>
        </span>
        <span className="event-chat-live">{demo ? "DEMO" : "CANLI"}</span>
      </header>
      <p className="chat-note">
        {demo
          ? german
            ? "Nachrichten bleiben in dieser Demo."
            : "Mesajlar bu demoda kalır."
          : "Mesajları yalnızca eşleştiğin gruptaki kişiler görebilir."}
      </p>
      <div
        className="chat-messages"
        role="log"
        aria-label={german ? "Gruppennachrichten" : "Grup mesajları"}
        aria-live="polite"
      >
        {rows.length ? (
          rows.map((row) => (
            <article key={`${row.participantId}:${row.id}`}>
              <header>
                <strong>
                  {row.name} · {row.code}
                </strong>
                <time>
                  {new Date(row.createdAt).toLocaleTimeString(german ? "de-DE" : "tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </header>
              <p>{row.text}</p>
            </article>
          ))
        ) : (
          <p>{german ? "Schreib die erste Nachricht." : "İlk selam senden gelsin."}</p>
        )}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.trim() || sending) return;
          if (demo) {
            setRows((messages) => [
              ...messages,
              {
                id: crypto.randomUUID(),
                participantId: "preview-person",
                name: german ? "Du" : "Sen",
                code: "C03",
                text: draft.trim(),
                createdAt: new Date().toISOString(),
              },
            ]);
            setDraft("");
            return;
          }
          setSending(true);
          setError("");
          if (pending.current?.text !== draft)
            pending.current = { id: crypto.randomUUID(), text: draft };
          try {
            setRows(
              await eventChatRequest(token, pending.current.text, pending.current.id, groupId),
            );
            setDraft("");
            pending.current = null;
          } catch (e) {
            setError(e instanceof Error ? e.message : "Mesaj gönderilemedi");
          } finally {
            setSending(false);
          }
        }}
      >
        <input
          aria-label={german ? "Nachricht an die Gruppe" : "Grup sohbetine mesaj"}
          placeholder={german ? "Wo treffen wir uns?" : "Nerede buluşalım?"}
          maxLength={500}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          disabled={sending || !draft.trim()}
          aria-label={german ? "Nachricht senden" : "Mesaj gönder"}
        >
          <Send size={18} />
        </button>
      </form>
      {error && (
        <p role="status" className="chat-note">
          {error}
        </p>
      )}
    </section>
  );
}
