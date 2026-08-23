import { Send, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import {
  findNtwAssistantAnswer,
  ntwQuickQuestions,
  type NtwAssistantAnswer,
} from "@/lib/ntw-assistant";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  cta?: string;
  href?: string;
};

const welcomeMessage: ChatMessage = {
  id: 0,
  role: "assistant",
  text: "selam! Ben ntw. Site içindeki güncel bilgilerle sana yardımcı olabilirim. Ne öğrenmek istiyorsun?",
};

export function NtwAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const messageListRef = useRef<HTMLDivElement>(null);
  const responseTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isTyping, messages, open]);

  const askQuestion = (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isTyping) return;

    const response = findNtwAssistantAnswer(cleanQuestion);
    const messageId = Date.now();
    setMessages((current) => [...current, { id: messageId, role: "user", text: cleanQuestion }]);
    setInput("");
    setIsTyping(true);

    const responseDelay = Math.min(1400, Math.max(700, response.answer.length * 4));
    responseTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, toChatMessage(response, messageId + 1)]);
      setIsTyping(false);
      responseTimerRef.current = null;
    }, responseDelay);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    askQuestion(input);
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="ntw asistan arka planını kapat"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-background/45 backdrop-blur-[3px] transition"
        />
      )}
      <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {open && (
          <div className="w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-3xl border border-primary/35 bg-background/98 shadow-[0_24px_80px_-24px_color-mix(in_oklab,var(--primary)_65%,#000)] ring-1 ring-background/80 backdrop-blur-2xl">
            <div className="border-b border-border/70 bg-gradient-to-r from-primary/15 via-primary/8 to-background p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 shrink-0">
                  <NtwMascotSvg compact />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-black text-foreground">ntw asistan</div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2 py-1 text-[10px] font-black text-primary-deep">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-55" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                      çevrimiçi
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/60">
                    aktif · notwork hakkında sor, en uygun cevabı bulayım.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="ntw asistanı kapat"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-background/70 text-foreground transition hover:bg-background"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div
              ref={messageListRef}
              aria-live="polite"
              aria-busy={isTyping}
              className="max-h-[min(52vh,430px)] space-y-3 overflow-y-auto px-3 py-4 [scrollbar-width:thin]"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border bg-card text-foreground/75"
                    }`}
                  >
                    <p>{message.text}</p>
                    {message.href && message.cta && (
                      <a
                        href={message.href}
                        target={message.href.startsWith("http") ? "_blank" : undefined}
                        rel={message.href.startsWith("http") ? "noreferrer" : undefined}
                        className={`mt-2.5 inline-flex rounded-full px-3 py-1.5 text-xs font-black transition ${
                          message.role === "user"
                            ? "bg-primary-foreground/15 text-primary-foreground"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        {message.cta}
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start" role="status" aria-label="ntw yazıyor">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-3 text-foreground/65">
                    <div className="flex gap-1" aria-hidden="true">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                          style={{ animationDelay: `${dot * 120}ms` }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold">ntw yazıyor…</span>
                  </div>
                </div>
              )}
            </div>

            {messages.length === 1 && !isTyping && (
              <div className="flex gap-2 overflow-x-auto border-t border-border/60 px-3 py-2.5 [scrollbar-width:none]">
                {ntwQuickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => askQuestion(question)}
                    disabled={isTyping}
                    className="shrink-0 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-[11px] font-bold text-foreground/70 transition hover:border-primary hover:text-foreground"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-border/70 p-3">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <label htmlFor="ntw-assistant-input" className="sr-only">
                  ntw asistana mesaj yaz
                </label>
                <input
                  id="ntw-assistant-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={isTyping ? "ntw yanıt hazırlıyor…" : "ör. yeni etkinlik ne zaman?"}
                  autoComplete="off"
                  disabled={isTyping}
                  className="h-11 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="submit"
                  aria-label="mesajı gönder"
                  disabled={!input.trim() || isTyping}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={17} />
                </button>
              </form>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "ntw asistanı kapat" : "ntw asistanı aç"}
          aria-expanded={open}
          className="group relative h-16 w-16 rounded-full border border-primary/30 bg-background shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-primary sm:h-24 sm:w-24"
        >
          <span className="absolute -left-1.5 -top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-black text-primary-foreground shadow-md sm:-left-2 sm:-top-2 sm:px-2 sm:py-1 sm:text-[10px]">
            ntw
          </span>
          <span className="absolute right-0 top-0 flex h-4 w-4" aria-label="çevrimiçi">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-background bg-emerald-500" />
          </span>
          <NtwMascotSvg />
        </button>
      </div>
    </>
  );
}

function toChatMessage(answer: NtwAssistantAnswer, id: number): ChatMessage {
  return {
    id,
    role: "assistant",
    text: answer.answer,
    cta: answer.cta,
    href: answer.href,
  };
}

function NtwMascotSvg({ compact = false }: { compact?: boolean }) {
  const gradientId = compact ? "ntwAssistantBodyCompact" : "ntwAssistantBody";
  const screenId = compact ? "ntwAssistantScreenCompact" : "ntwAssistantScreen";

  return (
    <svg viewBox="0 0 160 160" role="img" className="h-full w-full drop-shadow-xl">
      <defs>
        <linearGradient id={gradientId} x1="26" x2="130" y1="24" y2="145">
          <stop offset="0" stopColor="#bfeff1" />
          <stop offset="0.52" stopColor="#8fcbd0" />
          <stop offset="1" stopColor="#5aa7ba" />
        </linearGradient>
        <linearGradient id={screenId} x1="46" x2="120" y1="48" y2="94">
          <stop offset="0" stopColor="#142643" />
          <stop offset="1" stopColor="#1d315a" />
        </linearGradient>
      </defs>
      <path
        d="M46 35c5-17 24-22 37-12 11-13 36-4 37 15 17 2 24 18 15 32 9 12 2 31-13 34-1 20-24 29-39 17-15 12-38 2-40-17-17-4-23-24-12-36-9-11-2-29 15-33Z"
        fill={`url(#${gradientId})`}
        stroke="#173f68"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect
        x="39"
        y="48"
        width="83"
        height="51"
        rx="15"
        fill={`url(#${screenId})`}
        stroke="#0d203a"
        strokeWidth="5"
      />
      <path
        d="M59 64l13 12-13 12"
        fill="none"
        stroke="#b8fff5"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M91 80h17" stroke="#b8fff5" strokeWidth="6" strokeLinecap="round" />
      <path
        d="M51 104c-10 5-15 14-11 23 4 10 18 11 25 3"
        fill="#74b7cf"
        stroke="#173f68"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M111 104c11 5 16 14 12 23-4 10-18 11-25 3"
        fill="#74b7cf"
        stroke="#173f68"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M61 121c-5 11-1 21 11 21s17-10 13-21"
        fill="#6eadc8"
        stroke="#173f68"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M91 121c-4 11 1 21 13 21s16-10 11-21"
        fill="#6eadc8"
        stroke="#173f68"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="59"
        y="103"
        width="45"
        height="20"
        rx="10"
        fill="#7fd3df"
        stroke="#173f68"
        strokeWidth="4"
      />
      <text
        x="81"
        y="117"
        textAnchor="middle"
        fontSize="12"
        fontWeight="900"
        fill="#12324f"
        letterSpacing="1.5"
      >
        ntw
      </text>
    </svg>
  );
}
