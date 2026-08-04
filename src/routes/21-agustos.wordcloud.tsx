import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { cleanWordcloudAnswer, type WordcloudQuestion } from "@/lib/event-wordcloud";
import {
  createWordcloudSession,
  getWordcloudBootstrap,
  submitWordcloudAnswer,
} from "@/lib/wordcloud-api";

const sessionStorageKey = "notwork_21_agustos_wordcloud_session";

export const Route = createFileRoute("/21-agustos/wordcloud")({
  head: () => ({
    meta: [
      { title: "21 Ağustos WordCloud | notwork" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WordcloudParticipantPage,
});

function WordcloudParticipantPage() {
  const [questions, setQuestions] = useState<WordcloudQuestion[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [sentQuestions, setSentQuestions] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeQuestion = questions[activeIndex];
  const progress = questions.length ? Math.round(((activeIndex + 1) / questions.length) * 100) : 0;
  const isDone = questions.length > 0 && Object.keys(sentQuestions).length >= questions.length;

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const existing =
          typeof window !== "undefined" ? localStorage.getItem(sessionStorageKey) || "" : "";
        const [{ sessionId: nextSessionId }, bootstrap] = await Promise.all([
          createWordcloudSession(existing),
          getWordcloudBootstrap(existing),
        ]);
        if (ignore) return;
        localStorage.setItem(sessionStorageKey, nextSessionId);
        setSessionId(nextSessionId);
        setQuestions(bootstrap.questions);
      } catch {
        if (!ignore) setMessage("WordCloud şu an yüklenemedi. Birazdan tekrar dene.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const nextUnsentIndex = useMemo(
    () => questions.findIndex((question) => !sentQuestions[question.id]),
    [questions, sentQuestions],
  );

  async function submitAnswer() {
    if (!activeQuestion || !sessionId) return;
    const cleaned = cleanWordcloudAnswer(answer);
    if (!cleaned) {
      setMessage("Tek kelime ya da kısa bir cevap yazman yeterli.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await submitWordcloudAnswer({
        sessionId,
        questionId: activeQuestion.id,
        answer: cleaned,
      });
      setSentQuestions((current) => ({ ...current, [activeQuestion.id]: cleaned }));
      setAnswer("");
      const nextIndex = questions.findIndex(
        (question, index) => index > activeIndex && !sentQuestions[question.id],
      );
      if (nextIndex >= 0) setActiveIndex(nextIndex);
      else if (nextUnsentIndex >= 0 && nextUnsentIndex !== activeIndex)
        setActiveIndex(nextUnsentIndex);
      setMessage("Cevabın buluta eklendi ✨");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cevap kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4fbfb] text-foreground">
      <SiteNav variant="event" />
      <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-xl flex-col px-5 py-8">
        <Link
          to="/linkler"
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary-deep shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Linklere geri dön
        </Link>
        <div className="rounded-[2rem] border border-primary/20 bg-white p-5 shadow-xl shadow-primary/10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-deep">
            <Sparkles className="h-3.5 w-3.5" />
            21 Ağustos notwork
          </div>
          <h1 className="mt-5 font-display text-4xl font-black leading-none tracking-[-0.04em]">
            WordCloud’a
            <br />
            cevabını bırak
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground/60">
            Telefonundan hızlıca cevap ver; sonuçlar sahnedeki ekranda otomatik büyüsün.
          </p>
        </div>

        <section className="mt-5 flex-1 rounded-[2rem] border border-primary/20 bg-white p-5 shadow-lg shadow-primary/10">
          {loading ? (
            <div className="py-20 text-center text-sm text-foreground/60">Yükleniyor...</div>
          ) : !activeQuestion ? (
            <div className="py-20 text-center text-sm text-foreground/60">
              Aktif soru bulunamadı.
            </div>
          ) : (
            <>
              <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-primary-deep/70">
                Soru {activeIndex + 1} / {questions.length}
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">
                {activeQuestion.title}
              </h2>
              <p className="mt-2 text-sm text-foreground/55">{activeQuestion.helper}</p>

              <label className="mt-6 block text-sm font-semibold" htmlFor="wordcloud-answer">
                Cevabın
              </label>
              <input
                id="wordcloud-answer"
                value={answer}
                maxLength={60}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void submitAnswer();
                }}
                placeholder="Örn: cesaret"
                className="mt-2 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-lg font-semibold outline-none transition focus:border-primary"
              />
              <div className="mt-2 flex justify-between text-xs text-foreground/45">
                <span>Kısa cevaplar daha güzel görünür.</span>
                <span>{answer.length}/60</span>
              </div>

              <button
                onClick={submitAnswer}
                disabled={saving}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Ekleniyor..."
                  : sentQuestions[activeQuestion.id]
                    ? "Cevabı güncelle"
                    : "Buluta ekle"}
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-2xl border px-3 py-3 text-left text-xs font-bold transition ${
                      index === activeIndex
                        ? "border-primary bg-primary/10 text-primary-deep"
                        : "border-primary/10 bg-background"
                    }`}
                  >
                    {sentQuestions[question.id] ? <Check className="mb-1 h-4 w-4" /> : null}
                    Soru {index + 1}
                  </button>
                ))}
              </div>
            </>
          )}

          {message ? (
            <div className="mt-5 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary-deep">
              {message}
            </div>
          ) : null}
          {isDone ? (
            <div className="mt-4 grid gap-3">
              <a
                href="/21-agustos/sonuclar"
                className="block rounded-full border border-primary/30 px-5 py-3 text-center text-sm font-bold text-primary-deep"
              >
                Canlı sonuç ekranını gör
              </a>
              <Link
                to="/linkler"
                className="block rounded-full bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground"
              >
                Linkler sayfasına geri dön
              </Link>
            </div>
          ) : null}
        </section>
        <p className="mt-4 rounded-2xl border border-primary/15 bg-white/70 px-4 py-3 text-xs leading-5 text-foreground/50">
          Anket cevapların anonim etkinlik sonucu olarak kullanılabilir. Devam ederek
          <Link to="/kvkk" className="mx-1 font-bold text-primary-deep underline">
            KVKK Aydınlatma Metni
          </Link>
          kapsamında bilgilendirildiğini kabul edersin.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
