import { useEffect, useRef, useState } from "react";
import { eventChatRequest, type EventChatMessage } from "@/lib/event-network-api";
import { MessageCircle, Send } from "lucide-react";

export function EventChat({ token }: { token: string }) {
  const [rows, setRows] = useState<EventChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const pending = useRef<{ id: string; text: string } | null>(null);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const next = await eventChatRequest(token);
        if (!cancelled) setRows(next);
      } catch {
        if (!cancelled) setError("Sohbete bağlanılamadı. Yeniden deniyoruz.");
      }
    };
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token, open]);
  return (
    <details className="match-photo event-chat" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <MessageCircle size={20} />
        <span>
          Etkinlik sohbeti<small>Buradan haberleş, kolayca buluş</small>
        </span>
        <span aria-hidden="true">＋</span>
      </summary>
      <p className="chat-note">Bu etkinliğe kayıtlı herkes mesajları görebilir.</p>
      <div className="chat-messages" role="log" aria-label="Etkinlik mesajları" aria-live="polite">
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
            setRows(await eventChatRequest(token, pending.current.text, pending.current.id));
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
          aria-label="Etkinlik sohbetine mesaj"
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
    </details>
  );
}
