import { useState } from "react";
import { ExternalLink, FlaskConical, RefreshCcw } from "lucide-react";
import { saveEventPreview } from "@/lib/event-preview";
import {
  createEventProductNamespace,
  type EventProductKey,
  type NotworkEvent,
} from "@/lib/event-registry";
import { getEventNetworkAdmin, seedEventNetworkDemo } from "@/lib/event-network-api";
import type { EventNetworkAdminPayload } from "@/lib/event-network";
import { getWordcloudAdmin, updateWordcloudAdmin } from "@/lib/wordcloud-api";
import { getFiveAdmin, updateFiveAdmin, type FiveAdminPayload } from "@/lib/five";

type WordcloudAdminPayload = Awaited<ReturnType<typeof getWordcloudAdmin>>;
type ProductSnapshots = {
  matchlab?: EventNetworkAdminPayload;
  wordcloud?: WordcloudAdminPayload;
  five?: FiveAdminPayload;
};

const productDescriptions: Record<EventProductKey, string> = {
  matchlab: "Sanal katılımcılar, oluşan gruplar ve eşleşme gerekçeleri",
  wordcloud: "Sanal yanıtlar ve soru bazında öne çıkan kelimeler",
  five: "Örnek problemler, başvurular ve görüşmeler",
};

export function EventTestCenter({ event, password }: { event: NotworkEvent; password: string }) {
  const [snapshots, setSnapshots] = useState<ProductSnapshots>({});
  const [busy, setBusy] = useState<EventProductKey | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selection = { eventId: event.id };

  async function inspect(product: EventProductKey, seed = false) {
    setBusy(product);
    setError("");
    setMessage("");
    try {
      const data =
        product === "matchlab"
          ? seed
            ? await seedEventNetworkDemo(password, selection)
            : await getEventNetworkAdmin(password, selection, "demo")
          : product === "wordcloud"
            ? seed
              ? await updateWordcloudAdmin(password, { action: "seedLoadTest" }, selection, "demo")
              : await getWordcloudAdmin(password, selection, "demo")
            : seed
              ? await updateFiveAdmin(password, "seedDemo", selection, "demo")
              : await getFiveAdmin(password, selection, "demo");
      if (data.database?.mode !== "demo")
        throw new Error("Demo veri alanı doğrulanamadı. Sonuç gösterilmedi.");
      setSnapshots((current) => ({ ...current, [product]: data }));
      setMessage(
        seed
          ? `${event.products[product].label} için sanal veriler hazır.`
          : `${event.products[product].label} demo sonuçları yüklendi.`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Demo verileri alınamadı.");
    } finally {
      setBusy(null);
    }
  }

  function openPreview(step: "registration" | "apps") {
    saveEventPreview(event);
    const search = new URLSearchParams({ preview: "event", eventId: event.id });
    if (step === "apps") search.set("step", "apps");
    window.open(`/linkler?${search.toString()}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="mt-6 space-y-4" aria-label="Etkinlik test merkezi">
      <div className="rounded-[1.8rem] border border-primary/30 bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--primary)/0.10))] p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
          <FlaskConical size={16} /> Sanal test alanı
        </div>
        <h3 className="mt-2 text-2xl font-black tracking-tight">
          {event.shortTitle} test sonuçları
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-foreground/65">
          Her uygulamanın demo verisi bu etkinliğe ayrı kaydedilir. Buradaki işlemler canlı
          katılımcıları, eşleşmeleri ve cevapları değiştirmez.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openPreview("registration")}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            <ExternalLink size={15} /> Kayıt akışını dene
          </button>
          <button
            type="button"
            onClick={() => openPreview("apps")}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-2 text-sm font-bold"
          >
            <ExternalLink size={15} /> Uygulama ekranını dene
          </button>
        </div>
        <p className="mt-3 text-xs text-foreground/50">
          Ekran önizlemesi bu tarayıcıda çalışır. Aşağıdaki sonuçlar ise sunucudaki ayrı demo veri
          alanından okunur.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold"
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {(["matchlab", "wordcloud", "five"] as const).map((product) => {
          const enabled = event.products[product].enabled;
          const snapshot = snapshots[product];
          const namespace = createEventProductNamespace(event, product, "demo");
          return (
            <article
              key={product}
              className="rounded-[1.6rem] border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-xl font-black">{event.products[product].label}</h4>
                  <p className="mt-1 text-sm text-foreground/60">{productDescriptions[product]}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${enabled ? "bg-primary/15 text-primary-deep" : "bg-muted text-foreground/50"}`}
                >
                  {enabled ? "Etkinlikte açık" : "Etkinlikte kapalı"}
                </span>
              </div>
              <p className="mt-3 break-all text-xs text-foreground/45">
                Demo veri yolu: {namespace.keyPrefix}
              </p>
              {enabled ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void inspect(product)}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    <RefreshCcw size={15} />{" "}
                    {busy === product ? "Yükleniyor..." : "Demo sonuçlarını gör"}
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void inspect(product, true)}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
                  >
                    {product === "matchlab"
                      ? "12 kişiyle eşleşmeyi test et"
                      : product === "wordcloud"
                        ? "100 sanal yanıt oluştur"
                        : "Örnek problem oluştur"}
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-foreground/50">
                  Bu uygulama etkinlik akışında kapalı. Test etmek için önce etkinlik ayarlarından
                  aç.
                </p>
              )}
              {enabled && product !== "five" ? (
                <p className="mt-2 text-xs text-foreground/50">
                  Sanal veri oluşturma bu uygulamanın önceki demo sonuçlarının yerini alır.
                </p>
              ) : null}
              {product === "matchlab" && snapshots.matchlab ? (
                <MatchResults data={snapshots.matchlab} />
              ) : null}
              {product === "wordcloud" && snapshots.wordcloud ? (
                <WordcloudResults data={snapshots.wordcloud} />
              ) : null}
              {product === "five" && snapshots.five ? <FiveResults data={snapshots.five} /> : null}
              {enabled && !snapshot ? (
                <p className="mt-4 text-sm text-foreground/50">
                  Sonuçları görmek için demo verilerini yükle.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-foreground/60">{label}</div>
    </div>
  );
}

function MatchResults({ data }: { data: EventNetworkAdminPayload }) {
  const groups = data.groups || [];
  const matched = new Set(groups.flatMap((group) => group.memberNames));
  return (
    <div className="mt-5 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Kayıt" value={data.registrations.length} />
        <Stat label="Grup" value={groups.length} />
        <Stat label="Gruptaki kişi" value={matched.size} />
      </div>
      {groups.length ? (
        <div className="space-y-2">
          {groups.slice(0, 8).map((group) => (
            <div
              key={group.id}
              className="rounded-xl border border-border bg-background/60 p-3 text-sm"
            >
              <strong>{group.groupName}</strong>
              <span className="ml-2 text-xs text-foreground/50">Tur {group.round}</span>
              <p className="mt-1 text-foreground/65">{group.memberNames.join(" · ")}</p>
              <p className="mt-1 text-xs text-foreground/50">{group.reason}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-foreground/55">Henüz demo grubu oluşmadı.</p>
      )}
    </div>
  );
}

function WordcloudResults({ data }: { data: WordcloudAdminPayload }) {
  return (
    <div className="mt-5 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Soru" value={data.questions.length} />
        <Stat label="Görünür yanıt" value={data.results.totalVisibleAnswers} />
      </div>
      {data.questions.map((question) => (
        <div
          key={question.id}
          className="rounded-xl border border-border bg-background/60 p-3 text-sm"
        >
          <strong>{question.title}</strong>
          <p className="mt-1 text-foreground/65">
            {(data.results.results[question.id] || [])
              .slice(0, 6)
              .map((word) => `${word.text} (${word.count})`)
              .join(" · ") || "Henüz yanıt yok"}
          </p>
        </div>
      ))}
    </div>
  );
}

function FiveResults({ data }: { data: FiveAdminPayload }) {
  return (
    <div className="mt-5 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Problem" value={data.problems.length} />
        <Stat label="Başvuru" value={data.requests.length} />
        <Stat label="Görüşme" value={data.encounters.length} />
      </div>
      {data.problems.slice(0, 6).map((problem) => (
        <div
          key={problem.id}
          className="rounded-xl border border-border bg-background/60 p-3 text-sm"
        >
          <strong>{problem.title}</strong>
          <p className="mt-1 text-xs text-foreground/55">
            {problem.category} · {problem.requestCount} başvuru
          </p>
        </div>
      ))}
    </div>
  );
}
