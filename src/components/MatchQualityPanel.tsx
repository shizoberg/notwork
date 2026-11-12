import { useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import type { assessMatchQuality } from "@/lib/match-quality";

type Quality = ReturnType<typeof assessMatchQuality> & { events: { id: string; title: string }[] };
const average = (scores: number[]) =>
  scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;
const show = (value: number | null | undefined) =>
  value == null ? "—" : value.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

export function MatchQualityPanel({ password }: { password: string }) {
  const [data, setData] = useState<Quality>();
  const [eventId, setEventId] = useState("");
  const [limit, setLimit] = useState(40);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/event-products/network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "matchQuality", password }),
      });
      if (!response.ok) throw new Error("Match arşivi yüklenemedi. Tekrar dene.");
      setData((await response.json()) as Quality);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Match arşivi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  const rows = (data?.groups ?? [])
    .filter((row) => !eventId || row.eventId === eventId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const events =
    data?.events.filter(({ id }) => data.groups.some((row) => row.eventId === id)) ?? [];
  const groupAverages = rows.flatMap((row) => {
    const score = average(row.direct);
    return score === null ? [] : [score];
  });

  const historical = rows.flatMap((row) => row.eventRatings);
  const historicalGroupCount = rows.filter((row) => row.eventRatings.length).length;
  const coverage = rows.length ? historicalGroupCount / rows.length : null;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black">
            <BarChart3 size={20} aria-hidden="true" /> Notwork AI · Eşleşme kalitesi
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Canlı grup arşivi, katılımcı puanları ve regresyon doğrulaması.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-bold disabled:opacity-60"
        >
          <RefreshCw size={15} aria-hidden="true" className={loading ? "animate-spin" : ""} />
          {loading ? "Arşiv okunuyor…" : data ? "Yenile" : "Arşivi analiz et"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {data && (
        <>
          <label className="mt-5 flex flex-wrap items-center gap-2 text-sm font-bold">
            Etkinlik
            <select
              value={eventId}
              onChange={(event) => {
                setEventId(event.target.value);
                setLimit(40);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              <option value="">Tüm canlı etkinlikler</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Arşivlenen grup", rows.length],
              ["Verim puanı olan grup", groupAverages.length],
              ["Ort. grup verimi / 5", show(average(groupAverages))],
              ["Eski yorum bağlı grup", historicalGroupCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-lg font-black">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">
            Eski yorumlar {historical.length} · Ortalama {show(average(historical))}/5 · Grup
            kapsaması{" "}
            {coverage === null
              ? "—"
              : coverage.toLocaleString("tr-TR", { style: "percent", maximumFractionDigits: 1 })}
          </p>
          <div className="mt-4 rounded-xl bg-muted/60 p-3 text-sm">
            <p className="font-bold">
              {data.model.validated
                ? "Regresyon doğrulandı"
                : data.model.mae === null
                  ? "Regresyon için yeterli veri yok"
                  : "Regresyon ortalama puan tahminini geçemedi"}
            </p>
            <p className="mt-1 text-muted-foreground">
              İzinli grup puanlarıyla kural puanı ve tur numarası üzerinden 1–5 arası grup verimi
              tahmin edilir. Son puanlı etkinlik doğrulamada kullanılır. Eğitim ve doğrulama için
              sırasıyla en az 20 ve 5 grup gerekir.
            </p>
            <p className="mt-2">
              İzinli gruplar {data.model.eligibleGroups} · Eğitim {data.model.trainingGroups} ·
              Doğrulama {data.model.holdoutGroups} · Ortalama mutlak hata {show(data.model.mae)} ·
              Sabit ortalama hatası {show(data.model.baselineMae)}
            </p>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Kural puanı eşleşme öncesi uyumu gösterir. Eski etkinlik yorumları grup verimi modeline
            girmez. Puan vermeyen katılımcıların deneyimi ölçülmedi.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-border">
                <tr>
                  {[
                    "Grup / Etkinlik",
                    "Tur",
                    "Kural puanı",
                    "Grup verimi / 5",
                    "Eski yorum / 5",
                    "Model / 5",
                  ].map((title) => (
                    <th key={title} scope="col" className="px-2 py-2">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, limit).map((row) => (
                  <tr key={`${row.eventId}:${row.id}`} className="border-b border-border/60">
                    <td className="px-2 py-2 font-semibold">
                      {row.name}
                      <small className="block font-normal text-muted-foreground">
                        {events.find((event) => event.id === row.eventId)?.title}
                      </small>
                    </td>
                    <td className="px-2 py-2">{row.round}</td>
                    <td className="px-2 py-2">{show(row.ruleScore)}</td>
                    <td className="px-2 py-2">
                      {show(average(row.direct))}
                      {row.direct.length > 0 && ` (${row.direct.length})`}
                    </td>
                    <td className="px-2 py-2">
                      {show(average(row.eventRatings))}
                      {row.eventRatings.length > 0 && ` (${row.eventRatings.length})`}
                    </td>
                    <td className="px-2 py-2">{show(row.prediction)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > limit && (
            <button
              type="button"
              onClick={() => setLimit((current) => current + 40)}
              className="mt-4 rounded-xl border border-border px-3 py-2 text-sm font-bold"
            >
              Daha fazla grup
            </button>
          )}
        </>
      )}
    </section>
  );
}
