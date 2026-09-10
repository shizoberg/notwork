import { EventChat } from "@/components/EventChat";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import type {
  EventNetworkMatchGroup,
  EventNetworkPresence,
  EventNetworkRegistration,
} from "@/lib/event-network";
import {
  completeEventNetworkMatchWithReview,
  getEventNetworkMe,
  resumeEventNetwork,
  getEventNetworkMatch,
  getEventNetworkTokenStorageKey,
} from "@/lib/event-network-api";
import { getEventSelectionFromLocation, withEventSelection } from "@/lib/event-registry";

async function imageToDataUrl(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSize = 760;
  const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Fotoğraf işlenemedi");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.66);
}

export const Route = createFileRoute("/21-agustos/eslesme")({
  head: () => ({
    meta: [{ title: "ntw.matchlab v1.0" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AugustMatchPage,
});

function AugustMatchPage() {
  const eventSelection = getEventSelectionFromLocation();
  const tokenStorageKey = getEventNetworkTokenStorageKey(eventSelection);
  const [token, setToken] = useState("");
  const [group, setGroup] = useState<EventNetworkMatchGroup | null>(null);
  const [registration, setRegistration] = useState<EventNetworkRegistration | null>(null);
  const [presence, setPresence] = useState<EventNetworkPresence>("open");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "empty" | "paused">("idle");
  const [message, setMessage] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [reviewConsent, setReviewConsent] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);

  const currentMember = useMemo(
    () => group?.members.find((member) => member.isCurrentUser) || null,
    [group],
  );
  const otherMembers = useMemo(
    () => group?.members.filter((member) => !member.isCurrentUser) || [],
    [group],
  );
  const meetingCodes = useMemo(
    () => otherMembers.map((member) => member.publicCode).join(" · "),
    [otherMembers],
  );
  const doneCount = useMemo(
    () => group?.members.filter((member) => member.isDone).length || 0,
    [group],
  );
  const currentMemberDone = Boolean(currentMember?.isDone);
  const isCurrentPhotoOwner = Boolean(currentMember?.isPhotoOwner);
  const photoOwner = useMemo(
    () => group?.members.find((member) => member.isPhotoOwner) || null,
    [group],
  );

  const loadMatch = useCallback(
    async (nextToken = token, silent = false) => {
      if (!nextToken) return;
      if (!silent) {
        setStatus("loading");
        setMessage("");
      }
      try {
        const result = await getEventNetworkMatch(nextToken);
        setPresence(result.presence);
        setRegistration(result.registration);
        setGroup(result.group);
        setStatus(result.status === "ready" ? "ready" : result.status);
        return result;
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Eşleşme alınamadı.");
        setStatus("idle");
      }
    },
    [token],
  );

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      const preview =
        import.meta.env.DEV &&
        new URLSearchParams(window.location.search).get("preview") === "event";
      let recoveredToken = preview
        ? "local-match-preview"
        : localStorage.getItem(tokenStorageKey) || "";
      try {
        let recovered;
        if (recoveredToken) {
          try {
            recovered = await getEventNetworkMe(recoveredToken);
          } catch {
            recovered = null;
          }
        }
        if (!recovered) {
          recovered = await resumeEventNetwork();
          recoveredToken = recovered.accessToken || "";
          if (recoveredToken) localStorage.setItem(tokenStorageKey, recoveredToken);
        }
        if (cancelled) return;
        setToken(recoveredToken);
        setRegistration(recovered);
        await loadMatch(recoveredToken);
      } catch {
        if (!cancelled) {
          setStatus("idle");
          setMessage(
            "Kaydın korunuyor. Profilinle giriş yaparak kaldığın yerden devam edebilirsin.",
          );
        }
      }
    }
    void restore();
    return () => {
      cancelled = true;
    };
  }, [tokenStorageKey]);

  useEffect(() => {
    if (!token || status !== "ready" || !group) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadMatch(token, true);
    }, 5_000);
    return () => window.clearInterval(interval);
  }, [group, loadMatch, status, token]);

  const completeMatch = async (skipReview = false) => {
    if (!token) return;
    const cleanComment = comment.trim().replace(/\s+/g, " ");
    if (!skipReview && !cleanComment) {
      setMessage("Grubu kapatmadan önce etkinlikle ilgili ilk yorumunu yazmalısın.");
      return;
    }
    if (!skipReview && !reviewConsent) {
      setMessage("Yorum, puan ve varsa fotoğraf için yayınlama açık rızasını vermelisin.");
      return;
    }
    if (!skipReview && isCurrentPhotoOwner && !photoDataUrl) {
      setMessage("Bu grupta fotoğraf görevi sende. Ortam veya selfie fotoğrafı eklemelisin.");
      return;
    }
    setIsCompleting(true);
    setMessage("");
    try {
      const result = await completeEventNetworkMatchWithReview(token, {
        groupId: group?.id,
        skipReview,
        rating,
        comment: cleanComment,
        photoDataUrl: photoDataUrl || undefined,
        consent: reviewConsent,
      });
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      const nextMatch = await loadMatch(token);
      if (result.status === "completed") {
        setComment("");
        setPhotoDataUrl("");
        setReviewConsent(false);
        setRating(5);
      }
      if (nextMatch)
        setMessage(
          nextMatch.group
            ? "Yeni grubun hazır. Tanışma zamanı."
            : "Yeni bağlantıların için uygun kişiler bekleniyor.",
        );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Grup tamamlanamadı.");
    } finally {
      setIsCompleting(false);
    }
  };

  const onPhotoChange = async (file?: File) => {
    setMessage("");
    if (!file) {
      setPhotoDataUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMessage("Lütfen fotoğraf formatında bir dosya seç.");
      return;
    }
    if (file.size > 8_000_000) {
      setMessage("Fotoğraf çok büyük. 8 MB altında bir görsel seçebilir misin?");
      return;
    }
    setIsPhotoProcessing(true);
    try {
      setPhotoDataUrl(await imageToDataUrl(file));
    } catch {
      setMessage("Fotoğraf işlenemedi. Farklı bir görsel deneyebilirsin.");
    } finally {
      setIsPhotoProcessing(false);
    }
  };

  return (
    <div className="match-glass event-tool min-h-screen bg-[#edf5fa] text-foreground">
      <SiteNav variant="event" />
      <main id="matchlab" className="scroll-mt-24 overflow-hidden">
        <section className="relative px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.08em] text-foreground sm:text-7xl">
                ntw.matchlab
              </h1>
            </div>

            <section
              className={`match-workspace ${isCompleting ? "is-matching" : ""}`}
              aria-busy={isCompleting}
            >
              {isCompleting && (
                <div className="match-transition" role="status">
                  <Loader2 className="animate-spin" size={28} />
                  <p>Yeni bağlantılar aranıyor</p>
                </div>
              )}
              {group && <p className="match-intro">notwork algoritması sizleri eşleştirdi.</p>}
              {registration && (
                <div className="match-self">
                  <span>Senin kodun</span>
                  <strong>{registration.participant.publicCode}</strong>
                </div>
              )}

              {status === "loading" ? <LoadingCard /> : null}
              {status === "paused" ? (
                <EmptyState title="Şu an eşleşmeye kapalı görünüyorsun." />
              ) : null}
              {status === "empty" ? (
                <EmptyState
                  title="Şimdilik uygun boş üçlü grup yok."
                  text="Biraz sonra tekrar dene; sistem sadece grubunu bitiren ve boşta olan kişilerle yeni üçlü grup kurar."
                />
              ) : null}
              {message ? (
                <div className="match-status-note" role="status">
                  <span aria-hidden="true" className="match-status-dot" />
                  <p>{message}</p>
                </div>
              ) : null}

              {status === "ready" && group ? (
                <div className="space-y-5">
                  <div className="match-people">
                    {otherMembers.map((member) => (
                      <article key={member.participantId}>
                        <div className="match-code">{member.publicCode}</div>
                        <h2>{member.name}</h2>
                        <p>{member.offers.join(" · ")}</p>
                        {member.isPhotoOwner && <Camera size={14} aria-label="Fotoğraf görevi" />}
                      </article>
                    ))}
                  </div>
                  <div className="match-icebreaker">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
                      İlk sözü aç
                    </p>
                    <ol className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-foreground/75">
                      {(group.conversationPrompts || [group.conversationPrompt]).map(
                        (prompt, index) => (
                          <li key={prompt} className="match-question">
                            {prompt}
                          </li>
                        ),
                      )}
                    </ol>
                  </div>

                  {!currentMemberDone ? (
                    <details className="match-photo">
                      <summary>
                        <Camera size={20} />
                        <span>
                          Bir anı bırak
                          <small>
                            {isCurrentPhotoOwner ? "Fotoğraf görevi sende" : "Yorum ve fotoğraf"}
                          </small>
                        </span>
                        <span aria-hidden="true">＋</span>
                      </summary>
                      <div className="match-photo-content">
                        <div className="flex items-start gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#8ee4e8] text-[#071112]">
                            <Camera className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary-deep">
                              bu buluşmadan
                            </p>
                            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                              Nasıl geçti?
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-foreground/65">
                              {isCurrentPhotoOwner
                                ? "Bu grubun fotoğraf görevi sende: ortamı veya bir grup selfie'si çekip ekle."
                                : "Ortamdan ilk hissini yaz. Fotoğraf görevi bu grupta başka bir kişide."}
                            </p>
                          </div>
                        </div>

                        {import.meta.env.DEV && token === "local-match-preview" && (
                          <button
                            className="tool-primary"
                            onClick={async () => {
                              try {
                                const response = await fetch("/community/23.jpg");
                                if (!response.ok) throw new Error("Örnek fotoğraf yüklenemedi");
                                setPhotoDataUrl(
                                  await imageToDataUrl(
                                    new File([await response.blob()], "ornek.jpg", {
                                      type: "image/jpeg",
                                    }),
                                  ),
                                );
                                setMessage(
                                  "Örnek fotoğraf hazır. Yorum ve yayın iznini aşağıdan tamamlayabilirsin. Fotoğraf sunucuya gönderilmez.",
                                );
                              } catch (error) {
                                setMessage(
                                  error instanceof Error ? error.message : "Fotoğraf yüklenemedi",
                                );
                              }
                            }}
                          >
                            Örnek fotoğraf ekle · demo
                          </button>
                        )}
                        <div className="mt-4 grid gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/45">
                              etkinlik puanın
                            </p>
                            <div className="mt-2 flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  className={`text-3xl transition ${
                                    star <= rating ? "text-[#ffd166]" : "text-foreground/20"
                                  }`}
                                  aria-label={`${star} yıldız ver`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>

                          <label className="grid gap-2 text-sm font-bold">
                            Etkinlikle ilgili ilk yorumun
                            <textarea
                              value={comment}
                              onChange={(event) => setComment(event.target.value.slice(0, 240))}
                              rows={3}
                              placeholder="Ortam, insanlar, ilk his, sahnede aklında kalan..."
                              className="resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-[#8ee4e8]"
                            />
                            <span className="text-right text-[11px] text-foreground/35">
                              {comment.length}/240
                            </span>
                          </label>

                          <label className="grid gap-2 text-sm font-bold">
                            {isCurrentPhotoOwner ? "Fotoğrafın zorunlu" : "Fotoğraf opsiyonel"}
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(event) => void onPhotoChange(event.target.files?.[0])}
                              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-[#8ee4e8] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-[#071112]"
                            />
                            {isPhotoProcessing ? (
                              <span className="text-xs text-foreground/50">
                                Fotoğraf sıkıştırılıyor...
                              </span>
                            ) : null}
                          </label>
                          {photoDataUrl ? (
                            <img
                              src={photoDataUrl}
                              alt="Match Lab kapanış fotoğrafı"
                              className="max-h-64 rounded-2xl border border-white/10 object-cover"
                            />
                          ) : null}

                          <label className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-foreground/65">
                            <input
                              type="checkbox"
                              checked={reviewConsent}
                              onChange={(event) => setReviewConsent(event.target.checked)}
                              className="mt-1 h-4 w-4 shrink-0 accent-[#8ee4e8]"
                            />
                            <span>
                              Yorumumun, puanımın ve varsa fotoğrafımın notwork etkinlik alanlarında
                              yayınlanmasına açık rıza veriyorum.{" "}
                              <Link
                                to="/acik-riza"
                                className="font-bold text-foreground/80 underline"
                              >
                                Açık Rıza Metni
                              </Link>
                            </span>
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={() => void completeMatch()}
                          disabled={isCompleting || isPhotoProcessing || currentMemberDone}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-black text-[#071112] transition hover:bg-[#8ee4e8] disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          {isPhotoProcessing
                            ? "Fotoğraf hazırlanıyor..."
                            : isCompleting
                              ? "Kaydediliyor…"
                              : currentMemberDone
                                ? "Kaydedildi"
                                : "Yorumu paylaş ve yeni gruba geç"}
                        </button>
                      </div>
                    </details>
                  ) : null}
                </div>
              ) : null}

              {token && <EventChat token={token} />}
              <p className="match-motto">Her an network kıymetlidir.</p>
              {group && (
                <button
                  className="tool-primary match-next-button"
                  disabled={isCompleting}
                  onClick={() => void completeMatch(true)}
                >
                  Yeni grup belirle →
                </button>
              )}
              {status === "idle" && token ? (
                <button
                  onClick={() => void loadMatch()}
                  className="w-full rounded-full bg-[#8ee4e8] px-5 py-4 text-sm font-black text-[#071112]"
                >
                  Eşleşmemi getir
                </button>
              ) : null}

              {!token ? (
                <div className="text-center">
                  <p className="text-sm text-foreground/60">
                    Profilinle giriş yaparak kayıt ve grubuna geri dön.
                  </p>
                  <a
                    href={withEventSelection("/linkler", eventSelection)}
                    className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-[#071112]"
                  >
                    Kayıt ekranına git
                  </a>
                </div>
              ) : null}
            </section>
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-5 pb-8">
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-5 text-foreground/45">
            Yeni grup belirlediğinde mevcut grup kapanır ve herkes ortak havuza döner. Diğer
            kişilerin onayını beklemen gerekmez.
          </p>
        </section>
      </main>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary-deep" />
      <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground/50">
        Boşta olan kişilerden üçlü grup kuruluyor
      </p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-6 text-center">
      <p className="text-4xl">🫧</p>
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      {text ? <p className="mt-3 text-sm leading-6 text-foreground/65">{text}</p> : null}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-5 rounded-full bg-[#8ee4e8] px-5 py-3 text-sm font-black text-[#071112]"
      >
        Tekrar dene
      </button>
    </div>
  );
}
