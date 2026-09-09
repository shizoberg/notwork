import { useRef, useState } from "react";
type Draft = {
  id: string;
  greeting: string;
  subject: string;
  preheader: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
};
type Payload = {
  draft: Draft;
  html: string;
  counts: { total: number; subscribed: number; unknown: number; unsubscribed: number };
  providerConfigured: boolean;
  gmail: {
    configured: boolean;
    connected: boolean;
    email: string | null;
    missing: string[];
    callbackUrl: string;
  };
  operation: { status: string } | null;
  progress: {
    total: number;
    accepted: number;
    skipped: number;
    attention: number;
    remaining: number;
  };
  campaignLocked: boolean;
  updatedAt: string | null;
};
export function AnnouncementAdmin({ password }: { password: string }) {
  const stopSending = useRef(false);
  const [data, setData] = useState<Payload | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [previewName, setPreviewName] = useState("Berk");
  const [email, setEmail] = useState("");
  const [evidence, setEvidence] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  async function run(action: string) {
    setBusy(true);
    setMessage("");
    try {
      stopSending.current = false;
      const operationId = crypto.randomUUID();
      let more = false;
      do {
        const response = await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            password,
            action,
            draft,
            email,
            evidence,
            previewName,
            operationId,
          }),
        });
        if (!response.ok) throw new Error(await response.text());
        const result = (await response.json()) as Payload & { authorizeUrl?: string };
        if (result.authorizeUrl) {
          window.location.assign(result.authorizeUrl);
          return;
        }
        setData(result);
        setDraft(result.draft);
        setDirty(false);
        setMessage(
          action === "send"
            ? `Gmail’e kabul edilen: ${result.progress.accepted} · Kalan: ${result.progress.remaining} · İnceleme gereken: ${result.progress.attention}${result.operation?.status === "blocked-limit" ? " · Günlük uygulama sınırına ulaşıldı, sonraki gün devam edebilirsin." : ""}`
            : action === "test"
              ? result.operation?.status === "accepted"
                ? "Test Gmail tarafından kabul edildi. berk@carewithki.com gelen kutusunu kontrol et."
                : "Test sonucu: " + result.operation?.status
              : action === "save"
                ? "Taslak kaydedildi. E-posta gönderilmedi."
                : action === "consent"
                  ? "İzin kaydı eklendi. E-posta gönderilmedi."
                  : "Taslak hazır. E-posta gönderilmedi.",
        );
        more =
          action === "send" &&
          result.progress.remaining > 0 &&
          result.progress.attention === 0 &&
          result.operation?.status !== "blocked-limit" &&
          !stopSending.current;
      } while (more);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "İşlem başarısız");
    } finally {
      setBusy(false);
    }
  }
  const field = "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm";
  const button =
    "rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50";
  return (
    <section className="my-6 space-y-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold">17 Eylül · Etkinlik duyurusu</h2>
      <p className="text-sm text-foreground/65">
        Gönderen: Berk · notwork &lt;berk@notwork.me&gt;. Yanıtlar aynı adrese gelir. Gmail
        bağlantısı kurulduktan sonra test ve izinli alıcılara gönderim yapılabilir.
      </p>
      {!data && (
        <button className={button} disabled={busy} onClick={() => void run("load")}>
          Duyuru taslağını aç
        </button>
      )}
      {data && draft && (
        <>
          <p className="text-sm">
            {data.counts.total} adres · {data.counts.subscribed} izinli · {data.counts.unknown} izni
            bilinmiyor · {data.counts.unsubscribed} abonelikten çıktı
          </p>
          <div className="space-y-3 rounded-xl border border-border p-4 text-sm">
            <p>
              {data.gmail.connected
                ? `Gmail bağlı: ${data.gmail.email}`
                : "Gmail henüz bağlı değil."}
            </p>
            {!data.gmail.configured && (
              <div>
                <p>Netlify Functions ortamında tamamlanacak ayarlar:</p>
                <ul>
                  {data.gmail.missing.map((key) => (
                    <li key={key}>
                      <code>{key}</code>
                    </li>
                  ))}
                </ul>
                <p className="mt-2">
                  Google OAuth yönlendirme adresi:{" "}
                  <code className="break-all">{data.gmail.callbackUrl}</code>
                </p>
              </div>
            )}
            <button
              className={button}
              disabled={busy || dirty || !data.gmail.configured}
              onClick={() => void run("connectGmail")}
            >
              Google hesabını bağla / yenile
            </button>
            <button
              className={button}
              disabled={busy || dirty || !data.gmail.connected}
              onClick={() => void run("test")}
            >
              berk@carewithki.com’a test gönder
            </button>
            <button
              className={button}
              disabled={
                busy ||
                dirty ||
                !data.gmail.connected ||
                (!data.counts.subscribed && !data.progress.remaining) ||
                data.progress.attention > 0 ||
                (data.campaignLocked && !data.progress.remaining)
              }
              onClick={() => void run("send")}
            >
              İzinli alıcılara gönder {data.progress.remaining ? "· devam et" : ""}
            </button>
            {busy && (
              <button
                className={button}
                onClick={() => {
                  stopSending.current = true;
                }}
              >
                Bu grup bitince durdur
              </button>
            )}
            <p>
              {data.progress.accepted} Gmail tarafından kabul edildi · {data.progress.remaining}{" "}
              bekliyor · {data.progress.skipped} atlandı · {data.progress.attention} inceleme
              gerekiyor
            </p>
            <p className="text-xs text-foreground/60">
              Gönderim başlatıldığında kampanya içeriği ve alıcıları sabitlenir. Gmail kabulü
              teslimat garantisi değildir. Hatalı veya belirsiz işlemler otomatik tekrarlanmaz.
            </p>
          </div>
          <label className="block text-sm">
            Önizlemede kullanılacak isim
            <input
              className={field}
              value={previewName}
              maxLength={80}
              onChange={(event) => {
                setPreviewName(event.target.value);
                setDirty(true);
              }}
            />
          </label>
          <p className="text-xs text-foreground/60">
            Hitap, konu veya içerikte {"{{isim}}"} yazabilirsin. Her alıcının kendi adı kullanılır;
            isim yoksa boş bırakılır. İçerikte zaten selam varsa hitap alanıyla birlikte
            düzenleyebilirsin. İzin istemek için izni bilinmeyen kişilere duyuru gönderilmez.
          </p>
          <div className="grid gap-3">
            {(
              [
                ["greeting", "Kişiye özel hitap"],
                ["subject", "Konu"],
                ["preheader", "Önizleme metni"],
                ["body", "E-posta içeriği"],
                ["ctaLabel", "Buton yazısı"],
                ["ctaUrl", "Etkinlik bağlantısı"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-sm">
                {label}
                {key === "body" ? (
                  <textarea
                    rows={15}
                    className={field}
                    value={draft[key]}
                    onChange={(e) => {
                      setDraft({ ...draft, [key]: e.target.value });
                      setDirty(true);
                    }}
                  />
                ) : (
                  <input
                    className={field}
                    value={draft[key]}
                    onChange={(e) => {
                      setDraft({ ...draft, [key]: e.target.value });
                      setDirty(true);
                    }}
                  />
                )}
              </label>
            ))}
          </div>
          <button
            className={button}
            disabled={busy || data.campaignLocked}
            onClick={() => void run("save")}
          >
            Taslağı kaydet ve önizlemeyi yenile
          </button>
          <p className="text-xs text-foreground/60">
            {dirty
              ? "Önizleme son kaydedilen sürümü gösteriyor."
              : "Önizlemedeki abonelikten çık bağlantısı örnektir. Gerçek gönderimde her alıcıya özel bağlantı üretilir."}
          </p>
          <iframe
            title="17 Eylül duyuru e-postası önizlemesi"
            sandbox=""
            srcDoc={data.html}
            className="h-[750px] w-full rounded-xl border border-border bg-white"
          />
          <details className="border-t border-border pt-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Belgelenmiş duyuru izni ekle
            </summary>
            <p className="mt-3 text-xs text-foreground/60">
              Yalnızca mevcut bir duyuru izninin kaynağını kaydet. Üyelik, etkinlik katılımı veya
              profil görünürlüğü izni tek başına duyuru izni değildir. Abonelikten çıkanlar yeniden
              eklenmez.
            </p>
            <label className="text-sm">
              E-posta
              <input
                type="email"
                className={field}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="text-sm">
              İzin kaynağı ve tarihi
              <textarea
                className={field}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </label>
            <button
              className={`${button} mt-3`}
              disabled={busy || dirty || !email || evidence.trim().length < 10}
              onClick={() => void run("consent")}
            >
              İzin kaydını ekle
            </button>
          </details>
        </>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
