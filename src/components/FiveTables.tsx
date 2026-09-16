import { useEffect, useState } from "react";
import { SiteNav } from "./SiteNav";
import { EventThinkingStatus } from "./EventThinkingStatus";
import { useEventPreview } from "@/lib/event-preview";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Camera, Clock3, ArrowUpRight, LogOut, Plus } from "lucide-react";
import { fiveRequest, getFiveEventTokenStorageKey } from "@/lib/five";
import { resumeEventNetwork } from "@/lib/event-network-api";
import { withEventSelection, getEventSelectionFromLocation } from "@/lib/event-registry";
import {
  emptyTables,
  hasCompleteTableOutcome,
  joinTable,
  publishTableOutcome,
  tableAction,
  tableChat,
  tableOutcome,
  type ProblemTable,
  type TableState,
} from "@/lib/five-table-model";
type Board = { id: string; title: string; description: string }[];
type Payload = {
  identity: { id: string; name: string; code: string };
  board: Board;
  table: ProblemTable | null;
  serverNow: number;
};
const demoBoard: Board = [
  {
    id: "p1",
    title: "İlk müşterilerime nasıl ulaşırım?",
    description:
      "Yeni ürünümü doğru insanlara ulaştırmak için uygulanabilir bir ilk adım arıyorum.",
  },
  {
    id: "p2",
    title: "Fikrimi nasıl test ederim?",
    description:
      "Büyük bir yatırım yapmadan önce fikrime gerçekten ihtiyaç var mı öğrenmek istiyorum.",
  },
];
const demoPerson = {
  id: "demo-self",
  name: "Sen",
  code: "C03",
  problem: "İlk müşterilerime nasıl ulaşırım?",
};
function demoRequest(action: string, input: Record<string, unknown>): Payload {
  const saved = JSON.parse(localStorage.getItem("five-tables-demo") || "null") || {
    state: emptyTables(),
    offset: 0,
    board: demoBoard,
  };
  const state = saved.state as TableState;
  const now = Date.now() + saved.offset;
  if (action === "tableChat") tableChat(state, demoPerson.id, String(input.tableId), String(input.messageId), String(input.text), now);
  if (action === "tableOutcome") {
    tableOutcome(
      state,
      demoPerson.id,
      String(input.tableId),
      Boolean(input.solved),
      String(input.solution),
      Number(input.rating),
      String(input.comment),
      Boolean(input.reviewConsent),
      now,
    );
    publishTableOutcome(state, demoPerson.id, String(input.tableId), now);
  }
  if (action === "tableJoin")
    joinTable(
      state,
      demoPerson,
      saved.board.find((p: { id: string }) => p.id === input.problemId),
    );
  if (action === "demoFill") {
    const table = state.tables[state.members[demoPerson.id]];
    for (let i = 1; i <= 3; i++)
      joinTable(
        state,
        {
          id: `${table.id}-demo-${i}`,
          name: ["Deniz", "Ece", "Can"][i - 1],
          code: `D${i}0`,
          problem: [
            "Fikrimin doğru hedef kitlesini nasıl bulurum?",
            "İlk ürünümü nasıl sadeleştiririm?",
            "Topluluğumu nasıl büyütürüm?",
          ][i - 1],
        },
        { id: table.problemId, title: table.title },
      );
  }
  if (action === "demoTime") saved.offset += 300001;
  if(action === "demoPhoto") {
    const table=state.tables[state.members[demoPerson.id]];
    tableAction(state,table.photoOwner,table.id,"photo",now,table.round);
  }
  const operation = (
    { tableStart: "start", tableNext: "next", tableLeave: "leave", tablePhoto: "photo" } as const
  )[action as "tableStart" | "tableNext" | "tableLeave" | "tablePhoto"];
  if (operation) {
    if (operation === "photo" && (!input.photoDataUrl || !input.consent))
      throw new Error("Fotoğraf ve saklama izni gerekli.");
    tableAction(state, demoPerson.id, String(input.tableId), operation, now, Number(input.round));
  }
  if (action === "submitLive")
    saved.board.push({
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
    });
  localStorage.setItem("five-tables-demo", JSON.stringify(saved));
  return {
    identity: demoPerson,
    board: saved.board,
    table: state.tables[state.members[demoPerson.id]] || null,
    serverNow: Date.now() + saved.offset,
  };
}
export function FiveTables() {
  const [codeOpen, setCodeOpen] = useState(false);
  const [transitionAction, setTransitionAction] = useState("");
  const [message, setMessage] = useState("");
  const [fiveMode, setFiveMode] = useState<"choose" | "problem" | "solve">("choose");
  const [solved, setSolved] = useState<boolean | null>(null);
  const [solution, setSolution] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewConsent, setReviewConsent] = useState(false);
  const preview = useEventPreview();
  const [data, setData] = useState<Payload | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [clock, setClock] = useState(Date.now()),
    [offset, setOffset] = useState(0),
    [photo, setPhoto] = useState(""),
    [consent, setConsent] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tried: "",
    desiredOutcome: "",
    consent: false,
  });
  async function request(action = "tableState", input: Record<string, unknown> = {}) {
    const result = preview
      ? demoRequest(action, input)
      : await fiveRequest<Payload>({
          action,
          ...input,
          accessToken: localStorage.getItem(getFiveEventTokenStorageKey()) || "",
        });
    setData(result);
    setOffset(result.serverNow - Date.now());
    return result;
  }
  useEffect(() => {
    if (preview === null) return;
    let active = true;
    async function start() {
      try {
        await request();
      } catch {
        try {
          if (!preview) {
            const registration = await resumeEventNetwork();
            if (registration.accessToken)
              localStorage.setItem(getFiveEventTokenStorageKey(), registration.accessToken);
          }
          if (active) await request();
        } catch (e) {
          if (active) setError(e instanceof Error ? e.message : "Oturumuna bağlanılamadı");
        }
      }
    }
    void start();
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible")
        void request().catch(() => setError("Bağlantı bekleniyor. Masan korunuyor."));
    }, 5000);
    const tick = window.setInterval(() => setClock(Date.now()), 1000);
    return () => {
      active = false;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [preview]);
  const table = data?.table;
  const remaining = table ? Math.max(0, Math.ceil((table.endsAt - clock - offset) / 1000)) : 0;
  async function act(action: string, input: Record<string, unknown> = {}) {
    if (busy) return;
    const animatedAction = ["tableJoin", "tableStart", "tableNext", "tableLeave"].includes(
      action,
    );
    const transitionStartedAt = performance.now();
    if (animatedAction) setTransitionAction(action);
    setBusy(true);
    setError("");
    try {
      await request(action, { tableId: table?.id, round: table?.round, ...input });
      if (action === "tableLeave" || action === "tableNext") {
        setPhoto("");
        setConsent(false);
      }
      if (action === "tableLeave") {
        setSolved(null);
        setSolution("");
        setReviewRating(5);
        setReviewComment("");
        setReviewConsent(false);
      }
      if (animatedAction) {
        const remaining = 900 - (performance.now() - transitionStartedAt);
        if (remaining > 0)
          await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem tamamlanamadı");
    } finally {
      setTransitionAction("");
      setBusy(false);
    }
  }
  async function loadPhoto(file: File) {
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024)
      throw new Error("8 MB altında bir fotoğraf seç.");
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 760 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    setPhoto(canvas.toDataURL("image/jpeg", 0.65));
  }
  return (
    <div className="event-tool five-tables">
      <SiteNav variant="event" />
      <main className="app-preview" id="five-tables">
        {transitionAction && (
          <div className="five-thinking-overlay" role="status">
            <span className="five-thinking-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <EventThinkingStatus
              title={
                transitionAction === "tableLeave"
                  ? "Yeni ihtimaller açılıyor"
                  : "Masan hazırlanıyor"
              }
              phrases={
                transitionAction === "tableLeave"
                  ? [
                      "çözümün kaydediliyor",
                      "ortak havuza dönülüyor",
                      "yeni problemler getiriliyor",
                    ]
                  : [
                      "problemin okunuyor",
                      "çözüm ortakların bulunuyor",
                      "grup kodun hazırlanıyor",
                    ]
              }
            />
          </div>
        )}
        <h1>ntw.five</h1>
        <p>5 dakikada üretilen çözümler</p>
        {preview && <p className="five-demo-label">Demo · örnek kişiler · canlıya gönderilmez</p>}
        {error && (
          <p className="match-status-note" role="status">
            {error}
          </p>
        )}
        {error.includes("önceki Five") && (
          <a href={withEventSelection("/five/live?legacy=1", getEventSelectionFromLocation())}>
            Önceki görüşmeyi aç →
          </a>
        )}
        {!data ? (
          <div className="tool-surface">
            <p>{error ? "Profilinle giriş yaparak devam edebilirsin." : "Masan hazırlanıyor…"}</p>
            {error && (
              <a href={withEventSelection("/linkler", getEventSelectionFromLocation())}>
                Giriş yap →
              </a>
            )}
          </div>
        ) : !table ? (
          <>
            {fiveMode === "choose" ? (
              <section className="five-paths" aria-label="Five başlangıç seçenekleri">
                <button onClick={() => setFiveMode("problem")}><strong>Problemini yaz</strong><span>Kendi problemine bir çözüm masası aç</span><ArrowUpRight size={18} /></button>
                <button onClick={() => setFiveMode("solve")}><strong>Problemlere çözüm olan gruplara katıl</strong><span>Açık gruplardan birine katıl</span><ArrowUpRight size={18} /></button>
              </section>
            ) : (
              <button className="five-demo-action" onClick={() => setFiveMode("choose")}>← seçeneklere dön</button>
            )}
            {fiveMode !== "choose" && <>
            <div className="five-pool-heading">
              <span>{fiveMode === "problem" ? "Problemini yaz" : "Problem masaları"}</span>
              <button aria-label="Problem ekle" onClick={() => setFiveMode("problem")}>
                <Plus size={20} />
              </button>
            </div>
            {fiveMode === "problem" && (
              <form
                className="tool-surface five-compose"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (preview) {
                    await act("submitLive", form);
                    setFiveMode("solve");
                  } else {
                    setBusy(true);
                    try {
                      await fiveRequest({
                        action: "submitLive",
                        ...form,
                        category: "other",
                        attending: true,
                        accessToken: localStorage.getItem(getFiveEventTokenStorageKey()) || "",
                      });
                      await request();
                      setFiveMode("solve");
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Problem eklenemedi");
                    } finally {
                      setBusy(false);
                    }
                  }
                }}
              >
                {(
                  [
                    ["title", "Problemin", 6, 48],
                    ["description", "Biraz anlat", 30, 10000],
                    ["tried", "Şimdiye kadar ne denedin?", 8, 100],
                    ["desiredOutcome", "Nasıl bir çözüm arıyorsun?", 8, 80],
                  ] as const
                ).map(([key, label, min, max]) => (
                  <label key={key}>
                    {label}
                    <textarea
                      required
                      minLength={min}
                      maxLength={key === "description" ? undefined : max}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </label>
                ))}
                <label>
                  <input
                    type="checkbox"
                    required
                    checked={form.consent}
                    onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  />{" "}
                  Problemimin etkinlik katılımcılarıyla paylaşılmasını kabul ediyorum.
                </label>
                <button className="tool-primary" disabled={busy}>
                  Problemi ekle
                </button>
              </form>
            )}
            {fiveMode === "solve" && data.board.length === 0 && (
              <p className="tool-surface">İlk problem masasını sen aç.</p>
            )}
            {fiveMode === "solve" && data.board.map((problem) => (
              <section className="tool-surface" key={problem.id}>
                <span className="tool-eyebrow">4 kişi · ortak çözüm</span>
                <h2>{problem.title}</h2>
                <p>{problem.description}</p>
                <button
                  className="tool-primary"
                  disabled={busy}
                  onClick={() => void act("tableJoin", { problemId: problem.id })}
                >
                  Bu masaya katıl
                  <ArrowUpRight size={18} />
                </button>
              </section>
            ))}
            </>}
          </>
        ) : (
          <>
            <section className="tool-surface five-table-room">
              <div className="five-table-heading">
                <span>Grup kodun</span>
                <strong>{table.code}</strong>
              </div>
              <button className="five-demo-action" onClick={() => setCodeOpen(true)}>Grup kodunu büyüt</button>
              <Dialog open={codeOpen} onOpenChange={setCodeOpen}>
                <DialogContent
                  className="five-code-fullscreen"
                  style={{ left: 0, top: 0, width: "100vw", height: "100dvh", maxWidth: "none", transform: "none", translate: "none" }}
                >
                  <DialogTitle className="sr-only">Grup kodun {table.code}</DialogTitle>
                  <DialogDescription className="sr-only">Bu kodu göstererek grubunu bulabilirsin</DialogDescription>
                  <div className="five-code-brand" aria-label="notwork">notwork</div>
                  <div className="five-code-number">{table.code}</div>
                </DialogContent>
              </Dialog>
              <h2>{table.topics[table.round] || table.title}</h2>
              <div className="five-seats">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i}>
                    <span>{table.people[i]?.code || "＋"}</span>
                    <small>{table.people[i]?.name || "Bekleniyor"}</small>
                  </div>
                ))}
              </div>
              {table.photoOwner && <p className="five-photographer"><Camera size={16} /> Grup fotoğrafçısı · {table.people.find((person) => person.id === table.photoOwner)?.name}</p>}
              {(table.phase === "waiting" || table.phase === "ready") && (
                <>
                  <p>{table.people.length}/4 kişi · bu kodla aynı masada buluşun.</p>
                  {table.phase === "ready" && (
                    <button
                      disabled={busy}
                      className="tool-primary"
                      onClick={() => void act("tableStart")}
                    >
                      Buluştuk, 5 dakikayı başlat
                      <Clock3 size={18} />
                    </button>
                  )}
                  {preview && table.phase === "waiting" && (
                    <button className="five-demo-action" onClick={() => void act("demoFill")}>
                      3 demo katılımcı ekle
                    </button>
                  )}
                </>
              )}
              {table.phase === "active" && (
                <>
                  <div className="meeting-clock" aria-label="Kalan süre">
                    {String(Math.floor(remaining / 60)).padStart(2, "0")}:
                    {String(remaining % 60).padStart(2, "0")}
                  </div>
                  <p className="five-round">
                    Tur {table.round + 1}/4 · bu problem için birlikte düşünün.
                  </p>
                  {preview && remaining > 0 && (
                    <button className="five-demo-action" onClick={() => void act("demoTime")}>
                      Demo: 5 dakikayı ilerlet
                    </button>
                  )}
                  {remaining === 0 &&
                    !table.photoSaved &&
                    (table.photoOwner === data.identity.id ? (
                      <div className="five-photo-task">
                        <h3>
                          <Camera size={18} /> Grup selfiesi
                        </h3>
                        <p>Bu grubun fotoğrafçısı sensin. Herkesi selfieye al.</p>
                        <input
                          aria-label="Masa fotoğrafı"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void loadPhoto(file).catch((e) => setError(e.message));
                          }}
                        />
                        {preview && (
                          <button
                            className="five-demo-action"
                            onClick={async () => {
                              const response = await fetch("/community/23.jpg");
                              await loadPhoto(
                                new File([await response.blob()], "demo.jpg", {
                                  type: "image/jpeg",
                                }),
                              );
                            }}
                          >
                            Örnek fotoğraf ekle
                          </button>
                        )}
                        {photo && <img src={photo} alt="Masa fotoğrafı önizlemesi" />}
                        <label>
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                          />{" "}
                          Fotoğraftakilerin izni var; fotoğrafın etkinlik kaydında saklanmasını ve
                          notwork etkinlik alanlarında yayınlanmasını kabul ediyorum.
                        </label>
                        <button
                          className="tool-primary"
                          disabled={busy || !photo || !consent}
                          onClick={() => void act("tablePhoto", { photoDataUrl: photo, consent })}
                        >
                          Fotoğrafı kaydet
                        </button>
                      </div>
                    ) : (
                      <div>
                      <p>
                        Fotoğraf görevi {table.people.find((p) => p.id === table.photoOwner)?.name}{" "}
                        kişisinde.
                      </p>
                      {preview && <button className="five-demo-action" onClick={()=>void act("demoPhoto")}>Demo: görevli fotoğrafı tamamlasın</button>}
                      </div>
                    ))}
                  {remaining === 0 && table.photoSaved && (
                    <button
                      className="tool-primary"
                      disabled={busy}
                      onClick={() => void act("tableNext")}
                    >
                      {table.round === 3 ? "Masayı tamamla" : "Sıradaki kişinin problemine geç"}
                    </button>
                  )}
                </>
              )}
              {table.phase === "finished" && (
                hasCompleteTableOutcome(table.outcomes?.[data.identity.id]) ? (
                  <p>Çözüm notun kaydedildi. Hazırsan gruptan ayrılabilirsin.</p>
                ) : (
                  <form
                    className="five-outcome"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (solved === null) {
                        setError("Problemin çözülüp çözülmediğini seç.");
                        return;
                      }
                      void act("tableOutcome", {
                        solved,
                        solution,
                        rating: reviewRating,
                        comment: reviewComment,
                        reviewConsent,
                      });
                    }}
                  >
                    <h3>Bu grup problemi çözdü mü?</h3>
                    <div className="five-outcome-choice"><button type="button" className={solved === true ? "is-selected" : ""} onClick={() => setSolved(true)}>Evet</button><button type="button" className={solved === false ? "is-selected" : ""} onClick={() => setSolved(false)}>Henüz değil</button></div>
                    <textarea required minLength={3} maxLength={300} value={solution} onChange={(event) => setSolution(event.target.value)} placeholder="Bulduğunuz çözümü veya sonraki adımı yazın" />
                    <div className="five-outcome-review">
                      <span>Bu masayı puanla</span>
                      <div className="five-outcome-stars" aria-label="Masa puanın">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            aria-label={`${star} yıldız ver`}
                            aria-pressed={reviewRating === star}
                            onClick={() => setReviewRating(star)}
                            className={star <= reviewRating ? "is-selected" : ""}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <label>
                      Bu buluşmadan kısa yorumun
                      <textarea
                        required
                        minLength={3}
                        maxLength={240}
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value.slice(0, 240))}
                        placeholder="Bu masa sana ne kattı?"
                      />
                      <small>{reviewComment.length}/240</small>
                    </label>
                    <label className="five-outcome-consent">
                      <input
                        type="checkbox"
                        checked={reviewConsent}
                        onChange={(event) => setReviewConsent(event.target.checked)}
                      />
                      <span>
                        Puanımın, yorumumun ve grup fotoğrafının etkinlik yorumlarında
                        yayınlanmasını kabul ediyorum.
                      </span>
                    </label>
                    <button
                      className="tool-primary"
                      disabled={
                        busy ||
                        solved === null ||
                        solution.trim().length < 3 ||
                        reviewComment.trim().length < 3 ||
                        !reviewConsent
                      }
                    >
                      Çözümü ve yorumu kaydet
                    </button>
                  </form>
                )
              )}
            </section>
            <section className="tool-surface five-group-chat" aria-label="Grup sohbeti">
              <h2>Grup sohbeti</h2>
              <p>Burada buluşalım · yalnızca bu masadaki kişiler</p>
              <div className="five-chat-messages" role="log" aria-live="polite">
                {(table.messages || []).map((m) => <div key={`${m.personId}-${m.id}`} className={m.personId === data.identity.id ? "is-self" : ""}><small>{m.name}</small><p>{m.text}</p></div>)}
                {!table.messages?.length && <p>İlk mesajı bırak · nerede buluşuyorsunuz?</p>}
              </div>
              <form onSubmit={async (e) => { e.preventDefault(); if (!message.trim() || busy) return; setBusy(true); setError(""); try { await request("tableChat", { tableId: table.id, messageId: crypto.randomUUID(), text: message }); setMessage(""); } catch (e) { setError(e instanceof Error ? e.message : "Mesaj gönderilemedi"); } finally { setBusy(false); } }}>
                <input aria-label="Grubuna mesaj" placeholder="Grubuna bir mesaj yaz" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
                <button className="tool-primary" disabled={busy || !message.trim()}>Gönder</button>
              </form>
            </section>
            <button
              className="tool-primary five-leave"
              disabled={
                busy ||
                (table.phase === "finished" &&
                  !hasCompleteTableOutcome(table.outcomes?.[data.identity.id]))
              }
              onClick={() => void act("tableLeave")}
            >
              Masadan ayrıl
              <LogOut size={17} />
            </button>
          </>
        )}
      </main>
    </div>
  );
}
