import { useEffect, useState } from "react";
import { SiteNav } from "./SiteNav";
import { Camera, Clock3, ArrowUpRight, LogOut, Plus } from "lucide-react";
import { fiveRequest, getFiveEventTokenStorageKey } from "@/lib/five";
import { resumeEventNetwork } from "@/lib/event-network-api";
import { withEventSelection, getEventSelectionFromLocation } from "@/lib/event-registry";
import {
  emptyTables,
  joinTable,
  tableAction,
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
          id: `demo-${i}`,
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
  const preview =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "event";
  const [data, setData] = useState<Payload | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [clock, setClock] = useState(Date.now()),
    [offset, setOffset] = useState(0),
    [photo, setPhoto] = useState(""),
    [consent, setConsent] = useState(false),
    [compose, setCompose] = useState(false);
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
  }, []);
  const table = data?.table;
  const remaining = table ? Math.max(0, Math.ceil((table.endsAt - clock - offset) / 1000)) : 0;
  async function act(action: string, input: Record<string, unknown> = {}) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await request(action, { tableId: table?.id, round: table?.round, ...input });
      if (action === "tableLeave" || action === "tableNext") {
        setPhoto("");
        setConsent(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem tamamlanamadı");
    } finally {
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
            <div className="five-pool-heading">
              <span>Problem masaları</span>
              <button aria-label="Problem ekle" onClick={() => setCompose(!compose)}>
                <Plus size={20} />
              </button>
            </div>
            {compose && (
              <form
                className="tool-surface five-compose"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (preview) {
                    await act("submitLive", form);
                    setCompose(false);
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
                      setCompose(false);
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
            {data.board.length === 0 && (
              <p className="tool-surface">İlk problem masasını sen aç.</p>
            )}
            {data.board.map((problem) => (
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
          </>
        ) : (
          <>
            <section className="tool-surface five-table-room">
              <div className="five-table-heading">
                <span>Masa kodun</span>
                <strong>{table.code}</strong>
              </div>
              <h2>{table.topics[table.round] || table.title}</h2>
              <div className="five-seats">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i}>
                    <span>{table.people[i]?.code || "＋"}</span>
                    <small>{table.people[i]?.name || "Bekleniyor"}</small>
                  </div>
                ))}
              </div>
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
                          <Camera size={18} /> Bir masa fotoğrafı
                        </h3>
                        <p>Bu buluşmanın fotoğraf görevi sende.</p>
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
                          Fotoğraftakilerin izni var, etkinlik kaydında saklanmasını kabul ediyorum.
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
                <p>Dört tur, yeni çözüm fikirleri. Bir sonraki masada görüşürüz.</p>
              )}
            </section>
            <button
              className="tool-primary five-leave"
              disabled={busy}
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
