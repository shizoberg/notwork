import { createFileRoute } from "@tanstack/react-router";
import { RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { wordcloudSize, type WordcloudResults } from "@/lib/event-wordcloud";
import { getWordcloudResults, getWordcloudStreamUrl } from "@/lib/wordcloud-api";

export const Route = createFileRoute("/21-agustos/sonuclar")({
  head: () => ({
    meta: [
      { title: "ntw.wordcloud canlı sonuçlar | notwork" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WordcloudResultsPage,
});

function WordcloudResultsPage() {
  const [data, setData] = useState<WordcloudResults | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState("");
  const [status, setStatus] = useState("Bağlanıyor");

  useEffect(() => {
    let ignore = false;

    const applyResults = (results: WordcloudResults) => {
      if (ignore) return;
      setData(results);
      setActiveQuestionId((current) => current || results.activeQuestionId);
      setStatus("Canlı");
    };

    async function load() {
      try {
        applyResults(await getWordcloudResults());
      } catch {
        if (!ignore) setStatus("Tekrar deneniyor");
      }
    }

    load();
    const interval = window.setInterval(load, 2500);

    const stream = new EventSource(getWordcloudStreamUrl());
    stream.addEventListener("results", (event) => {
      try {
        applyResults(JSON.parse((event as MessageEvent).data) as WordcloudResults);
      } catch {
        setStatus("Veri okunamadı");
      }
    });
    stream.onerror = () => setStatus("Canlı bağlantı yenileniyor");

    return () => {
      ignore = true;
      if (interval) window.clearInterval(interval);
      stream.close();
    };
  }, []);

  const activeQuestion = data?.questions.find((question) => question.id === activeQuestionId);
  const words = useMemo(() => data?.results[activeQuestionId] || [], [activeQuestionId, data]);
  const maxCount = useMemo(() => Math.max(...words.map((word) => word.count), 1), [words]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#071114] text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em] text-primary">
              notwork live
            </div>
            <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] sm:text-6xl">
              ntw.wordcloud
            </h1>
          </div>
          <div className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            {status} · {data?.totalVisibleAnswers || 0} cevap
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {data?.questions.map((question) => (
            <button
              key={question.id}
              onClick={() => setActiveQuestionId(question.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                question.id === activeQuestionId
                  ? "bg-primary text-primary-foreground"
                  : "border border-white/15 bg-white/5 text-white/70"
              }`}
            >
              {question.order}. soru
            </button>
          ))}
        </div>

        <section className="mt-6 flex flex-1 flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-primary/10 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">
                Aktif soru
              </p>
              <h2 className="mt-2 max-w-4xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                {activeQuestion?.title || "Soru bekleniyor"}
              </h2>
            </div>
            <button
              onClick={() => void getWordcloudResults().then(setData)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75"
            >
              <RefreshCcw className="h-4 w-4" />
              Yenile
            </button>
          </div>

          <div className="relative mt-8 flex flex-1 items-center justify-center overflow-hidden rounded-[2rem] bg-[#0b1a1f] p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(143,203,208,0.22),transparent_32%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.08),transparent_28%)]" />
            {words.length ? (
              <div className="relative flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-5 text-center">
                {words.map((word, index) => (
                  <span
                    key={word.text}
                    className="inline-flex animate-[pulse_4s_ease-in-out_infinite] items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 font-black text-primary shadow-lg shadow-primary/10 transition-all duration-500"
                    style={{
                      fontSize: `${wordcloudSize(word.count, maxCount)}rem`,
                      animationDelay: `${index * 90}ms`,
                    }}
                    title={`${word.count} cevap`}
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            ) : (
              <div className="relative text-center">
                <p className="text-3xl font-black">İlk cevapları bekliyoruz.</p>
                <p className="mt-2 text-white/45">
                  Katılımcılar cevap verdikçe burası otomatik dolacak.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
