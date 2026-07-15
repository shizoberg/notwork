import { createFileRoute, Link } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { addEventReview } from "@/lib/event-reviews";

const events = [
  { id: "14-temmuz-2026", title: "14 Temmuz notwork İzmir", location: "Mahal Bomonti İzmir" },
  { id: "22-mayis", title: "22 Mayıs notwork", location: "İstinyeArt İzmir" },
  { id: "10-nisan", title: "10 Nisan notwork", location: "İstinyeArt İzmir" },
  { id: "8-mart", title: "8 Mart notwork", location: "İstinyeArt İzmir" },
  { id: "10-subat", title: "10 Şubat notwork", location: "İstinyeArt İzmir" },
  { id: "16-ocak", title: "16 Ocak notwork", location: "İstinyeArt İzmir" },
  { id: "8-aralik", title: "8 Aralık notwork", location: "İstinyeArt İzmir" },
];

export const Route = createFileRoute("/etkinlik-degerlendirme")({
  head: () => ({
    meta: [
      { title: "Etkinlik Değerlendirme | notwork İzmir" },
      {
        name: "description",
        content:
          "Katıldığın notwork etkinliğini seç, fotoğrafını ekle, yorumunu yaz ve 5 yıldız üzerinden puanla.",
      },
      { property: "og:title", content: "notwork Etkinlik Değerlendirme" },
      { property: "og:url", content: "https://notwork.me/etkinlik-degerlendirme" },
    ],
    links: [{ rel: "canonical", href: "https://notwork.me/etkinlik-degerlendirme" }],
  }),
  component: EventReviewPage,
});

async function imageToDataUrl(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSize = 980;
  const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Fotoğraf işlenemedi");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function EventReviewPage() {
  const [eventId, setEventId] = useState("14-temmuz-2026");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const selectedEvent = events.find((event) => event.id === eventId) || events[0];

  const onPhotoChange = async (file?: File) => {
    setError("");
    if (!file) {
      setPhotoDataUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Lütfen fotoğraf formatında bir dosya seç.");
      return;
    }
    if (file.size > 8_000_000) {
      setError("Fotoğraf çok büyük. 8 MB altında bir görsel seçebilir misin?");
      return;
    }
    try {
      setPhotoDataUrl(await imageToDataUrl(file));
    } catch {
      setError("Fotoğraf işlenemedi. Farklı bir görsel deneyebilirsin.");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const cleanComment = comment.trim().replace(/\s+/g, " ");
    if (!cleanComment) {
      setError("Yorumunu yazmadan değerlendirme gönderemeyiz.");
      return;
    }
    if (!consent) {
      setError("Yorumunun paylaşılması ve KVKK metni için onay kutusunu işaretlemelisin.");
      return;
    }
    setSubmitting(true);
    try {
      await addEventReview({
        eventId,
        eventTitle: selectedEvent.title,
        name: name.trim(),
        rating,
        comment: cleanComment,
        photoDataUrl: photoDataUrl || undefined,
        privateNote: privateNote.trim() || undefined,
        consent,
      });
      setNotice("Değerlendirmen alındı. Yorumun etkinlik sayfasında görünecek, özel notun sadece ekibe iletildi.");
      setName("");
      setRating(5);
      setComment("");
      setPrivateNote("");
      setPhotoDataUrl("");
      setConsent(false);
    } catch {
      setError("Değerlendirme gönderilemedi. Bir kez daha deneyebilir misin?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-5xl px-5 pb-10 pt-12 text-center sm:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-deep">
            <span className="h-2 w-2 rounded-full bg-primary blink" />
            düşüncelerini bizle paylaş
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-black leading-[0.9] tracking-[-0.05em] sm:text-7xl">
            Etkinlik
            <br />
            <span className="text-primary-deep">değerlendirme</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foreground/65">
            Katıldığın etkinliği seç, fotoğrafını ve yorumunu ekle. Paylaşılabilir yorumlar geçmiş
            etkinlik kartlarında ve etkinlik sayfasında görünebilir.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-5 pb-20">
          <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground/60">Etkinlik*</span>
              <select
                value={eventId}
                onChange={(event) => setEventId(event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                required
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} · {event.location}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground/60">Adın</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="İsmini yazmak istemezsen boş bırakabilirsin"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <div className="grid gap-2">
              <span className="text-xs font-semibold text-foreground/60">Puanın*</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition ${
                      star <= rating ? "text-primary-deep" : "text-border"
                    }`}
                    aria-label={`${star} yıldız ver`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground/60">Yorumun*</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value.slice(0, 700))}
                rows={5}
                placeholder="Etkinlikte ne hissettin, ne iyi çalıştı, ne aklında kaldı?"
                className="resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                required
              />
              <span className="text-right text-[11px] text-foreground/40">{comment.length}/700</span>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground/60">Fotoğraf</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => onPhotoChange(event.target.files?.[0])}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
              />
            </label>
            {photoDataUrl && (
              <img
                src={photoDataUrl}
                alt="Seçilen değerlendirme fotoğrafı"
                className="max-h-72 rounded-2xl border border-border object-cover"
              />
            )}

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground/60">
                Ekibe özel notum
              </span>
              <textarea
                value={privateNote}
                onChange={(event) => setPrivateNote(event.target.value.slice(0, 1000))}
                rows={4}
                placeholder="Bu alan sadece notwork ekibine gider; sayfada görünmez."
                className="resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/70">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                required
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span>
                Paylaşılabilir yorumumun, puanımın ve yüklediğim fotoğrafın notwork geçmiş etkinlik
                alanlarında yayınlanmasını; ekibe özel notumun sadece notwork ekibi tarafından
                görülmesini ve{" "}
                <Link to="/kvkk" className="font-semibold text-primary-deep underline">
                  KVKK Aydınlatma Metni
                </Link>
                ’ni okuduğumu/onayladığımı kabul ediyorum.
              </span>
            </label>

            {notice && (
              <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary-deep">
                {notice}
              </p>
            )}
            {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-6 py-3.5 font-black text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "gönderiliyor…" : "değerlendirmemi gönder"}
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
