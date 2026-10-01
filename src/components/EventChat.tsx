import { useEffect, useRef, useState } from "react";
import { eventChatRequest, type EventChatMessage } from "@/lib/event-network-api";
import { MessageCircle, Send } from "lucide-react";

export function EventChat({ token, groupId }: { token: string; groupId: string }) {
  const [rows, setRows] = useState<EventChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const pending = useRef<{ id: string; text: string } | null>(null);
  useEffect(() => {
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
  }, [token, groupId]);
  return (
    <section className="event-chat" aria-label="Grup sohbeti">
      <header className="event-chat-heading">
        <span className="event-chat-icon">
          <MessageCircle size={22} />
        </span>
        <span>
          Grup sohbeti<small>Buradan haberleş, kolayca buluş</small>
        </span>
        <span className="event-chat-live">CANLI</span>
      </header>
      <p className="chat-note">Mesajları yalnızca eşleştiğin gruptaki kişiler görebilir.</p>
      <div className="chat-messages" role="log" aria-label="Grup mesajları" aria-live="polite">
        {rows.length ? (
          rows.map((row) => (
            <article key={`${row.participantId}:${row.id}`}>
              <header>
                <strong>
                  {row.name} · {row.code}
                </strong>
                <time>
                  {new Date(row.createdAt).toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </header>
              <p>{row.text}</p>
            </article>
          ))
        ) : (
          <p>İlk selam senden gelsin.</p>
        )}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.trim() || sending) return;
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
          aria-label="Grup sohbetine mesaj"
          placeholder="Nerede buluşalım?"
          maxLength={500}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button disabled={sending || !draft.trim()} aria-label="Mesaj gönder">
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
