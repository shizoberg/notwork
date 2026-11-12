import { EventChat } from "@/components/EventChat";
import { EventThinkingStatus } from "@/components/EventThinkingStatus";
import { EventFlowBanner } from "@/components/EventFlowBanner";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, CheckCircle2, Maximize2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
  rotateEventNetworkMatch,
} from "@/lib/event-network-api";
import {
  getEventSelectionFromLocation,
  getPublicEventContext,
  withEventSelection,
} from "@/lib/event-registry";
import { useEventPreview } from "@/lib/event-preview";
import { matchPreview, registration as matchPreviewRegistration } from "@/lib/match-preview";

import { germanMatch } from "@/lib/match-language";

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

export function EventMatch({
  embedded = false,
  german = false,
}: { embedded?: boolean; german?: boolean } = {}) {
  const demoRound = useRef(1);
  const configuredPreview = useEventPreview();
  const preview = embedded || configuredPreview;
  const t = (text: string) => (german ? (germanMatch[text] ?? text) : text);
  const eventSelection = useMemo(() => getEventSelectionFromLocation(), []);
  const tokenStorageKey = getEventNetworkTokenStorageKey(eventSelection);
  const [token, setToken] = useState("");
  const [group, setGroup] = useState<EventNetworkMatchGroup | null>(null);
  const [registration, setRegistration] = useState<EventNetworkRegistration | null>(null);
  const [presence, setPresence] = useState<EventNetworkPresence>("open");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "empty" | "paused">("idle");
  const [message, setMessage] = useState("");
  const [waitingCount, setWaitingCount] = useState(1);
  const [waitingReason, setWaitingReason] = useState<"admin" | "matching" | undefined>();
  const [isCompleting, setIsCompleting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [reviewConsent, setReviewConsent] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [groupNameOpen, setGroupNameOpen] = useState(false);
  const [rotationPromptOpen, setRotationPromptOpen] = useState(false);
  const reviewPanelRef = useRef<HTMLDetailsElement>(null);

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
    async (nextToken: string, silent = false) => {
      if (!nextToken) return;
      if (
        !embedded &&
        preview &&
        new URLSearchParams(window.location.search).get("demo") === "waiting"
      ) {
        setStatus("empty");
        return;
      }
      if (!silent) {
        setStatus("loading");
        setMessage("");
      }
      try {
        const result = embedded
          ? matchPreview(demoRound.current)
          : await getEventNetworkMatch(nextToken, eventSelection);
        setWaitingCount("waitingCount" in result ? result.waitingCount || 1 : 1);
        setWaitingReason("waitingReason" in result ? result.waitingReason : undefined);
        setPresence(result.presence);
        setRegistration(result.registration);
        setGroup(result.group);
        setStatus(result.status === "ready" ? "ready" : result.status);
        return result;
      } catch (error) {
        if (!silent) {
          setMessage(error instanceof Error ? error.message : "Eşleşme alınamadı.");
          setStatus("idle");
        }
      }
    },
    [embedded, eventSelection, preview],
  );

  useEffect(() => {
    if (preview === null) return;
    let cancelled = false;
    async function restore() {
      let recoveredToken = preview
        ? "local-match-preview"
        : localStorage.getItem(tokenStorageKey) || "";
      try {
        if (preview) {
          if (cancelled) return;
          const result = matchPreview(embedded ? demoRound.current : undefined);
          setToken("local-match-preview");
          setRegistration(matchPreviewRegistration);
          setPresence(result.presence);
          const waitingDemo =
            !embedded && new URLSearchParams(window.location.search).get("demo") === "waiting";
          setGroup(waitingDemo ? null : result.group);
          setWaitingCount(waitingDemo ? 1 : 3);
          setStatus(waitingDemo ? "empty" : "ready");
          return;
        }
        if (!recoveredToken) {
          try {
            const { event } = await getPublicEventContext(eventSelection);
            recoveredToken =
              localStorage.getItem(getEventNetworkTokenStorageKey({ eventId: event.id })) ||
              localStorage.getItem(getEventNetworkTokenStorageKey({ event: event.slug })) ||
              "";
            if (recoveredToken) localStorage.setItem(tokenStorageKey, recoveredToken);
          } catch {
            // The normal profile session can still restore this event registration.
          }
        }
        setStatus("loading");
        let recovered;
        if (recoveredToken) {
          try {
            recovered = await getEventNetworkMe(recoveredToken, eventSelection);
          } catch {
            recovered = null;
          }
        }
        if (!recovered) {
          recovered = await resumeEventNetwork(eventSelection);
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
  }, [tokenStorageKey, preview, embedded, eventSelection, loadMatch]);

  useEffect(() => {
    if (preview || !token || !["ready", "empty"].includes(status)) return;
    let pending = false;
    const interval = window.setInterval(
      async () => {
        if (document.visibilityState !== "visible" || pending) return;
        pending = true;
        try {
          await loadMatch(token, true);
        } finally {
          pending = false;
        }
      },
      status === "empty" ? 15_000 : 12_000,
    );
    return () => window.clearInterval(interval);
  }, [group, loadMatch, preview, status, token]);

  useEffect(() => {
    if (preview || !group?.id || !token || status !== "ready") return;
    const promptKey = `notwork-match-next-prompt:${group.id}`;
    if (localStorage.getItem(promptKey)) return;
    const dueAt = Date.parse(group.generatedAt) + 15 * 60_000;
    const timer = window.setTimeout(
      () => setRotationPromptOpen(true),
      Math.max(0, dueAt - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [group?.id, group?.generatedAt, preview, status, token]);

  useEffect(() => {
    setComment("");
    setPhotoDataUrl("");
    setReviewConsent(false);
    setRating(5);
    setRotationPromptOpen(false);
  }, [group?.id]);

  const dismissRotationPrompt = () => {
    if (group && !embedded)
      localStorage.setItem(`notwork-match-next-prompt:${group.id}`, "dismissed");
    setRotationPromptOpen(false);
  };

  const rotateMatch = async () => {
    if (!group || !token || isCompleting) return;
    const currentGroupId = group.id;
    setIsCompleting(true);
    setMessage("");
    setRotationPromptOpen(false);
    try {
      if (embedded) {
        demoRound.current++;
      } else {
        await rotateEventNetworkMatch(token, currentGroupId, eventSelection);
        localStorage.setItem(`notwork-match-next-prompt:${currentGroupId}`, "accepted");
      }
      setGroup(null);
      const nextMatch = await loadMatch(token);
      setMessage(
        nextMatch?.group?.id === currentGroupId
          ? "Onayın alındı. Yeni eşleşme için tüm grup üyeleri onaylamalı."
          : nextMatch?.group
            ? t("Yeni grubun hazır. Tanışma zamanı.")
            : "Bekleme havuzundasın. Yeni kişiler katılınca eşleşmen otomatik açılacak.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Yeni eşleşme başlatılamadı.");
      setRotationPromptOpen(true);
    } finally {
      setIsCompleting(false);
    }
  };

  const completeMatch = async () => {
    if (!token) return;
    const cleanComment = comment.trim().replace(/\s+/g, " ");
    if (!cleanComment) {
      setMessage("Grubu kapatmadan önce etkinlikle ilgili ilk yorumunu yazmalısın.");
      return;
    }
    if (!reviewConsent) {
      setMessage("Yorum, puan ve varsa fotoğraf için yayınlama açık rızasını vermelisin.");
      return;
    }
    if (isCurrentPhotoOwner && !photoDataUrl) {
      setMessage("Bu grupta fotoğraf görevi sende. Ortam veya selfie fotoğrafı eklemelisin.");
      return;
    }
    setIsCompleting(true);
    setMessage("");
    try {
      const previousGroupId = group?.id;
      const review = {
        groupId: group?.id,
        rating,
        comment: cleanComment,
        photoDataUrl: photoDataUrl || undefined,
        consent: reviewConsent,
      };
      if (embedded) demoRound.current++;
      const completed =
        embedded ||
        (await completeEventNetworkMatchWithReview(token, review)).status === "completed";
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      const nextMatch = await loadMatch(token);
      if (completed) {
        setComment("");
        setPhotoDataUrl("");
        setReviewConsent(false);
        setRating(5);
      }
      if (nextMatch)
        setMessage(
          nextMatch.group?.id === previousGroupId
            ? "Onayın alındı. Yeni eşleşme için grubundaki herkesin onayı bekleniyor."
            : nextMatch.group
              ? t("Yeni grubun hazır. Tanışma zamanı.")
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

  const Content = embedded ? "div" : "main";
  return (
    <div
      className={`match-glass event-tool bg-[#edf5fa] text-foreground ${embedded ? "rounded-3xl" : "min-h-screen"}`}
      data-match-demo={embedded || undefined}
    >
      {!embedded && (
        <>
          <SiteNav variant="event" />
          <EventFlowBanner product="matchlab" />
        </>
      )}
      <Content id="matchlab" className="scroll-mt-24 overflow-hidden">
        <section className="relative px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
          <div className="relative mx-auto max-w-3xl">
            <div className="match-brand-row mb-6">
              {embedded ? (
                <h2 className="match-brand-gradient">notwork match</h2>
              ) : (
                <h1 className="match-brand-gradient">notwork match</h1>
              )}
              <span className="match-beta-badge">beta v3.0</span>
            </div>

            <section
              className={`match-workspace ${isCompleting ? "is-matching" : ""}`}
              aria-busy={isCompleting}
            >
              {isCompleting && (
                <div className="match-transition" role="status">
                  <MatchLoadingVisual />
                  <EventThinkingStatus
                    title={t("Yeni bağlantılar aranıyor")}
                    phrases={[
                      t("ihtiyaçların okunuyor"),
                      t("katkılar karşılaştırılıyor"),
                      t("yeni grubun hazırlanıyor"),
                    ]}
                  />
                </div>
              )}
              {group && (
                <p className="match-intro">
                  {embedded
                    ? german
                      ? "Interaktive Vorschau mit Beispielgruppe"
                      : "Örnek grupla etkileşimli demo"
                    : "notwork algoritması sizleri eşleştirdi."}
                </p>
              )}
              {registration && !group && (
                <div className="match-self">
                  <span>{t("Senin kodun")}</span>
                  <strong>{registration.participant.publicCode}</strong>
                </div>
              )}

              {status === "loading" ? <LoadingCard /> : null}
              {status === "paused" ? (
                <EmptyState title="Şu an eşleşmeye kapalı görünüyorsun." />
              ) : null}
              {status === "empty" ? (
                <EmptyState
                  title={
                    waitingReason === "admin"
                      ? "Kaydın tamam, birlikte başlayacağız"
                      : waitingReason === "matching"
                        ? "Eşleşmeler hazırlanıyor"
                        : "Grubun için katılımcılar bekleniyor"
                  }
                  text={
                    waitingReason === "admin"
                      ? "Etkinlik ekibi eşleştirmeyi başlattığında grubun burada görünecek. Tekrar kayıt olmana gerek yok."
                      : waitingReason === "matching"
                        ? "Katılımcılar gruplara yerleştiriliyor. Grubun hazır olduğunda burada görünecek."
                        : `Şu an havuzda sen dahil ${waitingCount} uygun kişi var. Üçlü grup için en az 3 kişi gerekiyor. Biraz bekle; yeni kişiler geldiğinde eşleşmen otomatik açılacak. İstersen sonra tekrar deneyebilirsin.`
                  }
                />
              ) : null}
              {message ? (
                <div className="match-status-note" role="status">
                  <span aria-hidden="true" className="match-status-dot" />
                  <p>{t(message)}</p>
                </div>
              ) : null}

              {status === "ready" && group ? (
                <div className="space-y-5">
                  <div className="match-group-identity">
                    <div className="match-group-summary">
                      <div className="match-group-name">
                        <span>
                          {group.round > 1
                            ? `${group.round}. ${t("tur · senin grubun")}`
                            : t("Senin grubun")}
                        </span>
                        <h2>{t(group.groupName)}</h2>
                      </div>
                      {registration && (
                        <div className="match-personal-code">
                          <span>{t("Senin kodun")}</span>
                          <strong>{registration.participant.publicCode}</strong>
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => setGroupNameOpen(true)}>
                      <Maximize2 size={17} aria-hidden="true" />
                      {t("Grup adını büyüt")}
                    </button>
                    <Dialog open={groupNameOpen} onOpenChange={setGroupNameOpen}>
                      <DialogContent className="five-code-fullscreen match-group-name-fullscreen">
                        <DialogTitle className="sr-only">{t(group.groupName)}</DialogTitle>
                        <DialogDescription className="sr-only">
                          {t("Grup adını göstererek diğer üyeleri bulabilirsin")}
                        </DialogDescription>
                        <div className="five-code-brand" aria-label="notwork">
                          notwork
                        </div>
                        <div
                          className={`five-code-number${group.groupName.length > 18 ? " is-long" : ""}`}
                        >
                          {t(group.groupName)}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {token && (
                    <EventChat
                      key={group.id}
                      token={token}
                      groupId={group.id}
                      demo={Boolean(preview)}
                      german={german}
                    />
                  )}
                  <div className="match-people">
                    {otherMembers.map((member) => (
                      <article key={member.participantId}>
                        <div className="match-code is-person-name">
                          <h2>{member.name}</h2>
                        </div>
                        <p className="match-person-code">{member.publicCode}</p>
                        <p>{member.offers.map(t).join(" · ")}</p>
                        {member.isPhotoOwner && (
                          <Camera size={14} aria-label={t("Fotoğraf görevi")} />
                        )}
                      </article>
                    ))}
                  </div>
                  {group.aiAnalysis && (
                    <div className="ntw-ai-analysis" role="note">
                      <span>
                        <Sparkles size={14} />
                        {group.analysisSource === "ai"
                          ? t("ntw ai analiz")
                          : t("ntw eşleşme analizi")}
                      </span>
                      <p>{t(group.aiAnalysis)}</p>
                    </div>
                  )}
                  {!currentMemberDone ? (
                    <details ref={reviewPanelRef} className="match-photo">
                      <summary>
                        <Camera size={20} />
                        <span>
                          {t("Bir anı bırak")}
                          <small>
                            {isCurrentPhotoOwner
                              ? t("Fotoğraf görevi sende")
                              : t("Yorum ve fotoğraf")}
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
                              {t("bu buluşmadan")}
                            </p>
                            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                              {t("Nasıl geçti?")}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-foreground/65">
                              {isCurrentPhotoOwner
                                ? t(
                                    "Bu grubun fotoğraf görevi sende: ortamı veya bir grup selfie'si çekip ekle.",
                                  )
                                : t(
                                    "Ortamdan ilk hissini yaz. Fotoğraf görevi bu grupta başka bir kişide.",
                                  )}
                            </p>
                          </div>
                        </div>

                        {preview && token === "local-match-preview" && (
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
                            {t("Örnek fotoğraf ekle · demo")}
                          </button>
                        )}
                        <div className="mt-4 grid gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-foreground/45">
                              {t("etkinlik puanın")}
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
                                  aria-label={`${star} ${t("yıldız ver")}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>

                          <label className="grid gap-2 text-sm font-bold">
                            {t("Etkinlikle ilgili ilk yorumun")}
                            <textarea
                              value={comment}
                              onChange={(event) => setComment(event.target.value.slice(0, 240))}
                              rows={3}
                              placeholder={t("Ortam, insanlar, ilk his, sahnede aklında kalan...")}
                              className="resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-[#8ee4e8]"
                            />
                            <span className="text-right text-[11px] text-foreground/35">
                              {comment.length}/240
                            </span>
                          </label>

                          <label className="grid gap-2 text-sm font-bold">
                            {isCurrentPhotoOwner
                              ? t("Fotoğrafın zorunlu")
                              : t("Fotoğraf opsiyonel")}
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(event) => void onPhotoChange(event.target.files?.[0])}
                              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-[#8ee4e8] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-[#071112]"
                            />
                            {isPhotoProcessing ? (
                              <span className="text-xs text-foreground/50">
                                {t("Fotoğraf sıkıştırılıyor...")}
                              </span>
                            ) : null}
                          </label>
                          {photoDataUrl ? (
                            <img
                              src={photoDataUrl}
                              alt={t("Match Lab kapanış fotoğrafı")}
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
                              {t(
                                "Yorumumun, puanımın ve varsa fotoğrafımın notwork etkinlik alanlarında yayınlanmasına açık rıza veriyorum.",
                              )}{" "}
                              <Link
                                to={german ? "/de/einwilligung" : "/acik-riza"}
                                className="font-bold text-foreground/80 underline"
                              >
                                {t("Açık Rıza Metni")}
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
                            ? t("Fotoğraf hazırlanıyor...")
                            : isCompleting
                              ? t("Kaydediliyor…")
                              : currentMemberDone
                                ? t("Kaydedildi")
                                : t("Yorumu paylaş ve yeni gruba geç")}
                        </button>
                      </div>
                    </details>
                  ) : null}
                  <div className="match-icebreaker">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
                      {t("İlk sözü aç")}
                    </p>
                    <ol className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-foreground/75">
                      {(group.conversationPrompts || [group.conversationPrompt]).map((prompt) => (
                        <li key={prompt} className="match-question">
                          {t(prompt)}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : null}
              <p className="match-motto">{t("Her an network kıymetlidir.")}</p>
              {group && (
                <div className="match-next-actions">
                  <button
                    className="tool-primary match-next-button"
                    disabled={isCompleting}
                    onClick={() => setRotationPromptOpen(true)}
                  >
                    {t("Yeni eşleşme iste →")}
                  </button>
                  {!currentMemberDone && (
                    <button
                      className="match-review-link"
                      onClick={() => {
                        if (!reviewPanelRef.current) return;
                        reviewPanelRef.current.open = true;
                        reviewPanelRef.current.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                    >
                      {t("Önce bu gruba fotoğraf ve yorum bırak")}
                    </button>
                  )}
                </div>
              )}
              <Dialog
                open={rotationPromptOpen && Boolean(group)}
                onOpenChange={(open) => {
                  if (!open) dismissRotationPrompt();
                  else setRotationPromptOpen(true);
                }}
              >
                <DialogContent className="match-rotation-dialog">
                  <DialogTitle>{t("Yeni kişilerle eşleşmek ister misin?")}</DialogTitle>
                  <DialogDescription>
                    {t(
                      "Evet dersen bu grup kapanır ve herkes daha önce tanışmadığı boşta olan katılımcılarla yeniden eşleşir.",
                    )}
                  </DialogDescription>
                  <div className="match-rotation-actions">
                    <button type="button" onClick={dismissRotationPrompt} disabled={isCompleting}>
                      {t("Bu grupta kal")}
                    </button>
                    <button
                      type="button"
                      onClick={() => void rotateMatch()}
                      disabled={isCompleting}
                    >
                      {isCompleting ? t("Yeni kişiler aranıyor…") : t("Evet, yeni eşleşme bul")}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
              {status === "idle" && token ? (
                <button
                  onClick={() => void loadMatch(token)}
                  className="w-full rounded-full bg-[#8ee4e8] px-5 py-4 text-sm font-black text-[#071112]"
                >
                  {t("Eşleşmemi getir")}
                </button>
              ) : null}

              {!token && !embedded ? (
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
            {t(
              "Yeni grup belirlediğinde mevcut grup kapanır ve herkes ortak havuza döner. Diğer kişilerin onayını beklemen gerekmez.",
            )}
          </p>
        </section>
      </Content>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="match-loading-card" role="status">
      <MatchLoadingVisual />
      <EventThinkingStatus
        title="Eşleşmen hazırlanıyor"
        phrases={[
          "profilindeki ipuçları okunuyor",
          "uyumlu bağlantılar karşılaştırılıyor",
          "tanışma grubun kuruluyor",
        ]}
      />
      <span className="match-loading-progress" aria-hidden="true">
        <i />
      </span>
    </div>
  );
}

function MatchLoadingVisual() {
  return (
    <span className="match-loading-visual" aria-hidden="true">
      <i className="match-loading-ring ring-one" />
      <i className="match-loading-ring ring-two" />
      <i className="match-loading-person person-one" />
      <i className="match-loading-person person-two" />
      <i className="match-loading-person person-three" />
      <img src="/brand/notwork-logo.png" alt="" className="match-loading-logo" />
    </span>
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
