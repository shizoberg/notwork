import { useState } from "react";
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
  updatedAt: string | null;
};
export function AnnouncementAdmin({ password }: { password: string }) {
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
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, action, draft, email, evidence, previewName }),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = (await response.json()) as Payload;
      setData(result);
      setDraft(result.draft);
      setDirty(false);
      setMessage(
        action === "save"
          ? "Taslak kaydedildi. E-posta gönderilmedi."
          : action === "consent"
            ? "İzin kaydı eklendi. E-posta gönderilmedi."
            : "Taslak hazır. E-posta gönderilmedi.",
      );
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
        Gönderen: Berk · notwork &lt;berk@notwork.me&gt;. Yanıtlar aynı adrese gelir. Bu ekran
        taslak hazırlar; toplu gönderim başlatmaz.
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
          <p className="text-sm text-foreground/60">
            {data.providerConfigured
              ? "Resend anahtarı yapılandırılmış. Gönderimden önce alan adı ve teslimat testi doğrulanmalı."
              : "Resend gönderimi için RESEND_API_KEY ve gönderen alan adı doğrulaması gerekiyor."}
          </p>
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
          <button className={button} disabled={busy} onClick={() => void run("save")}>
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
