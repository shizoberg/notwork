import { useCallback, useEffect, useState } from "react";
import {
  launchCompanyQuestions,
  novemberEventSlug,
  pollRequest,
  type PollPayload,
  type PollQuestion,
} from "@/lib/event-poll";

export function EventPollAdmin({
  event,
  password,
  nodes = false,
  organizerName = "launchspace",
}: {
  event: string;
  password: string;
  nodes?: boolean;
  organizerName?: string;
}) {
  const [newPoll, setNewPoll] = useState(false);
  const [questions, setQuestions] = useState<PollQuestion[] | null>(null);
  const [baseRevision, setBaseRevision] = useState(0);
  const [baseDatasetId, setBaseDatasetId] = useState<string>();
  const [notice, setNotice] = useState("");
  const [data, setData] = useState<PollPayload | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [draft, setDraft] = useState("");
  const load = useCallback(async () => {
    const r = await pollRequest(event, { action: "admin", password });
    setData(r);
    return r;
  }, [event, password]);
  useEffect(() => {
    let current = true;
    setData(null);
    setDraft("");
    setQuestions(null);
    setNewPoll(false);
    setNotice("");
    const refresh = () => {
      if (!document.hidden)
        void pollRequest(event, { action: "admin", password })
          .then((r) => {
            if (current) setData(r);
          })
          .catch((e) => {
            if (current) setError(e.message);
          });
    };
    refresh();
    const timer = setInterval(refresh, 7000);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [event, password]);
  async function act(
    action: string,
    input: Record<string, unknown> = {},
    revision = data?.config.revision,
    datasetId = data?.database.datasetId,
  ) {
    if (!data) return false;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      setData(
        await pollRequest(event, {
          action,
          password,
          revision,
          datasetId,
          ...input,
        }),
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem başarısız");
      await load().catch(() => {});
      return false;
    } finally {
      setBusy(false);
    }
  }
  if (nodes && event === novemberEventSlug)
    return (
      <section className="ls-panel ls-nodes-poll" aria-label="Anket yönetimi">
        <div className="ls-nodes-section-head">
          <div>
            <p className="ls-eyebrow">{organizerName}</p>
            <h2>Oylamalar</h2>
          </div>
          <a
            className="ls-secondary"
            href={`/launch-space-sahne?event=${encodeURIComponent(event)}`}
            target="_blank"
            rel="noreferrer"
          >
            Sahneyi aç ↗
          </a>
        </div>
        {error && (
          <p role="alert" className="ls-caption">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="ls-caption">
            {notice}
          </p>
        )}
        {!data ? (
          <p className="ls-caption">Anket yükleniyor…</p>
        ) : (
          <>
            <p className="ls-caption">
              {data.total} yanıt · {data.config.isOpen ? "Oylama açık" : "Oylama kapalı"}
            </p>
            {!questions && (
              <div className="ls-actions">
                <button
                  className="ls-primary"
                  disabled={busy}
                  onClick={() => {
                    setBaseRevision(data.config.revision);
                    setBaseDatasetId(data.database.datasetId);
                    setNewPoll(true);
                    setQuestions(
                      launchCompanyQuestions.map((question) => ({ ...question, title: "" })),
                    );
                  }}
                >
                  Yeni oylama oluştur
                </button>
                <button
                  className="ls-secondary"
                  disabled={busy}
                  onClick={() => void act("open", { isOpen: !data.config.isOpen })}
                >
                  {data.config.isOpen ? "Oylamayı kapat" : "Oylamayı aç"}
                </button>
                {data.config.publishedQuestion !== null && (
                  <button
                    className="ls-secondary"
                    disabled={busy}
                    onClick={() => void act("publish", { questionIndex: null })}
                  >
                    Sahneyi beklet
                  </button>
                )}
                {!questions && (
                  <button
                    className="ls-secondary"
                    disabled={busy || data.total > 0}
                    onClick={() => {
                      setBaseRevision(data.config.revision);
                      setBaseDatasetId(data.database.datasetId);
                      setNewPoll(false);
                      setQuestions(data.config.questions);
                    }}
                  >
                    Soruları düzenle
                  </button>
                )}
              </div>
            )}
            {questions ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void act(
                    newPoll ? "newPoll" : "configure",
                    { questions },
                    baseRevision,
                    baseDatasetId,
                  ).then((ok) => {
                    if (ok) {
                      setQuestions(null);
                      setNotice(
                        newPoll
                          ? "Oylama açıldı ve katılımcı ekranlarına gönderildi."
                          : "Anket kaydedildi.",
                      );
                    }
                  });
                }}
              >
                <h3>{newPoll ? "Yeni oylama" : "Soruları düzenle"}</h3>
                {newPoll && (
                  <p className="ls-caption">
                    Kaydettiğinde yeni oylama açılır. Önceki oylamanın sonuçları arşive alınır.
                  </p>
                )}
                <fieldset disabled={busy || (!newPoll && data.total > 0)}>
                  {questions.map((q, i) => (
                    <section key={i} className="ls-flow-question">
                      <label>
                        Soru {i + 1}
                        <input
                          required
                          maxLength={180}
                          value={q.title}
                          onChange={(e) =>
                            setQuestions(
                              questions.map((item, index) =>
                                index === i ? { ...item, title: e.target.value } : item,
                              ),
                            )
                          }
                        />
                      </label>
                      {q.options.map((option, j) => (
                        <div className="ls-poll-editor-row" key={j}>
                          <label>
                            Seçenek {j + 1}
                            <input
                              required
                              maxLength={80}
                              value={option}
                              onChange={(e) =>
                                setQuestions(
                                  questions.map((item, index) =>
                                    index === i
                                      ? {
                                          ...item,
                                          options: item.options.map((o, k) =>
                                            k === j ? e.target.value : o,
                                          ),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </label>
                          <button
                            type="button"
                            className="ls-secondary"
                            aria-label={`Seçenek ${j + 1} kaldır`}
                            disabled={q.options.length <= 2}
                            onClick={() =>
                              setQuestions(
                                questions.map((item, index) =>
                                  index === i
                                    ? { ...item, options: item.options.filter((_, k) => k !== j) }
                                    : item,
                                ),
                              )
                            }
                          >
                            Kaldır
                          </button>
                        </div>
                      ))}
                      <div className="ls-actions">
                        <button
                          type="button"
                          className="ls-secondary"
                          disabled={q.options.length >= 8}
                          onClick={() =>
                            setQuestions(
                              questions.map((item, index) =>
                                index === i ? { ...item, options: [...item.options, ""] } : item,
                              ),
                            )
                          }
                        >
                          Seçenek ekle
                        </button>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            className="ls-secondary"
                            onClick={() =>
                              setQuestions(questions.filter((_, index) => index !== i))
                            }
                          >
                            Soruyu kaldır
                          </button>
                        )}
                      </div>
                    </section>
                  ))}
                  <div className="ls-actions">
                    {questions.length < 5 && (
                      <button
                        type="button"
                        className="ls-secondary"
                        onClick={() =>
                          setQuestions([...questions, { id: "", title: "", options: ["", ""] }])
                        }
                      >
                        Soru ekle
                      </button>
                    )}
                    <button className="ls-primary">
                      {newPoll ? "Oylamayı oluştur ve gönder" : "Değişiklikleri kaydet"}
                    </button>
                  </div>
                </fieldset>
                <button type="button" className="ls-back" onClick={() => setQuestions(null)}>
                  İptal
                </button>
              </form>
            ) : (
              data.results?.map((result, index) => (
                <article className="ls-flow-question" key={result.question.id}>
                  <h3>{result.question.title}</h3>
                  <ul className="ls-nodes-votes">
                    {result.counts.map(({ label, count }) => (
                      <li key={label}>
                        <span>{label}</span>
                        <strong>{count}</strong>
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={busy || data.config.publishedQuestion === index}
                    className="ls-secondary"
                    onClick={() => void act("publish", { questionIndex: index })}
                  >
                    {data.config.publishedQuestion === index
                      ? "Sahnede gösteriliyor"
                      : "Sonuçları sahneye ver"}
                  </button>
                </article>
              ))
            )}
            {!!data.previousPolls?.length && (
              <details className="ls-flow-question">
                <summary>Önceki oylamalar ({data.previousPolls.length})</summary>
                {[...data.previousPolls].reverse().map((vote) => (
                  <details className="ls-flow-question" key={vote.id}>
                    <summary>
                      {vote.title} · {vote.total} yanıt
                    </summary>
                    {vote.results.map((result) => (
                      <div key={result.question.id}>
                        <h4>{result.question.title}</h4>
                        <ul className="ls-nodes-votes">
                          {result.counts.map(({ label, count }) => (
                            <li key={label}>
                              <span>{label}</span>
                              <strong>{count}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </details>
                ))}
              </details>
            )}
            {!newPoll && data.total > 0 && (
              <p className="ls-caption">
                Yanıt alındığı için soru ve seçenekler düzenlemeye kapalı.
              </p>
            )}
          </>
        )}
      </section>
    );
  return (
    <section
      className="rounded-3xl border border-primary/25 bg-card p-5 sm:p-7"
      style={{ marginTop: 24 }}
      aria-label="Canlı anket yönetimi"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">
            ETKİNLİĞE ÖZEL ·{" "}
            {data?.config.questions.length ?? (event === novemberEventSlug ? 1 : 5)} SORU
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            {event === novemberEventSlug ? organizerName : "notwork anket"}
          </h2>
        </div>
        <a
          className="rounded-full border px-4 py-2 text-sm"
          target="_blank"
          rel="noreferrer"
          href={`/launch-space-sahne?event=${encodeURIComponent(event)}`}
        >
          Sahne ekranını aç ↗
        </a>
      </div>
      {error ? (
        <p role="alert" className="my-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {!data ? (
        <p className="mt-5">Anket yükleniyor…</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            <strong>{data.total}</strong> yanıt · {data.database.mode} ·{" "}
            {data.config.isOpen ? "Cevap alınıyor" : "Cevap alımı kapalı"} ·{" "}
            {data.config.publishedQuestion === null
              ? "Sahne beklemede"
              : `Sahnede soru ${data.config.publishedQuestion + 1}`}
          </p>
          <div className="my-4 flex flex-wrap gap-2">
            <button
              disabled={busy}
              className="rounded-full border px-4 py-2 text-sm"
              onClick={() => void act("publish", { questionIndex: null })}
            >
              Sahneyi beklemeye al
            </button>
            <button
              disabled={busy}
              className="rounded-full border px-4 py-2 text-sm"
              onClick={() => void load().catch((e) => setError(e.message))}
            >
              Yenile
            </button>
          </div>
          <div className="grid gap-3">
            {data.results?.map((r, i) => (
              <article key={r.question.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">
                    {i + 1}. {r.question.title}
                  </h3>
                  <button
                    disabled={busy}
                    aria-pressed={data.config.publishedQuestion === i}
                    className="shrink-0 rounded-full border border-primary/40 px-3 py-2 text-xs"
                    onClick={() => void act("publish", { questionIndex: i })}
                  >
                    {data.config.publishedQuestion === i ? "Yayında" : "Sahneye ver"}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.counts.map((c) => (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs" key={c.label}>
                      {c.label} · {c.count}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <details className="mt-5 rounded-2xl border p-4">
            <summary className="cursor-pointer text-sm">Taslak soruları düzenle</summary>
            <p className="my-3 text-xs text-muted-foreground">
              {event === novemberEventSlug ? "1–5 soru" : "Tam 5 soru"}, her soruda 2–8 seçenek.
              Yanıt geldikten sonra soru değiştirilmez.
            </p>
            <textarea
              aria-label="Anket soruları JSON"
              className="min-h-72 w-full rounded-xl border bg-background p-3 font-mono text-xs"
              value={draft || JSON.stringify(data.config.questions, null, 2)}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              disabled={busy || data.total > 0}
              className="mt-3 rounded-full border px-4 py-2 text-sm"
              onClick={() => {
                try {
                  void act("configure", {
                    questions: JSON.parse(draft || JSON.stringify(data.config.questions)),
                  });
                } catch {
                  setError("JSON biçimini kontrol et");
                }
              }}
            >
              Soruları kaydet
            </button>
          </details>
          {data.database.mode === "demo" ? (
            <button
              disabled={busy}
              className="mt-4 text-xs text-muted-foreground underline"
              onClick={() => {
                if (confirm("Yalnızca bu etkinliğin demo anket yanıtları silinsin mi?"))
                  void act("reset");
              }}
            >
              Bu etkinliğin demo anketini sıfırla
            </button>
          ) : null}
          <p className="mt-3 break-all text-[11px] text-muted-foreground">
            {data.database.keyPrefix}
          </p>
        </>
      )}
    </section>
  );
}
