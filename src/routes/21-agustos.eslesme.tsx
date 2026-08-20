import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import type {
  EventNetworkMatchGroup,
  EventNetworkPresence,
  EventNetworkRegistration,
} from "@/lib/event-network";
import {
  completeEventNetworkMatch,
  getEventNetworkMe,
  getEventNetworkMatch,
} from "@/lib/event-network-api";

const tokenStorageKey = "notwork_21_agustos_network_token";

export const Route = createFileRoute("/21-agustos/eslesme")({
  head: () => ({
    meta: [{ title: "notwork.matchlab v1.0" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AugustMatchPage,
});

function AugustMatchPage() {
  const [token, setToken] = useState("");
  const [group, setGroup] = useState<EventNetworkMatchGroup | null>(null);
  const [registration, setRegistration] = useState<EventNetworkRegistration | null>(null);
  const [presence, setPresence] = useState<EventNetworkPresence>("open");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "empty" | "paused">("idle");
  const [message, setMessage] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

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

  const loadMatch = useCallback(
    async (nextToken = token) => {
      if (!nextToken) return;
      setStatus("loading");
      setMessage("");
      try {
        const result = await getEventNetworkMatch(nextToken);
        setPresence(result.presence);
        setRegistration(result.registration);
        setGroup(result.group);
        setStatus(result.status === "ready" ? "ready" : result.status);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Eşleşme alınamadı.");
        setStatus("idle");
      }
    },
    [token],
  );

  useEffect(() => {
    const savedToken = localStorage.getItem(tokenStorageKey) || "";
    setToken(savedToken);
    if (savedToken) {
      void getEventNetworkMe(savedToken)
        .then(setRegistration)
        .catch(() => setRegistration(null));
      void loadMatch(savedToken);
    } else {
      setStatus("idle");
    }
  }, [loadMatch]);

  const completeMatch = async () => {
    if (!token) return;
    setIsCompleting(true);
    setMessage("");
    try {
      await completeEventNetworkMatch(token);
      await loadMatch(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Grup tamamlanamadı.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071112] text-white">
      <SiteNav variant="eventDark" />
      <main className="overflow-hidden">
        <section className="relative px-4 pb-12 pt-20 sm:px-8 sm:pt-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(113,204,210,0.24),transparent_32%),radial-gradient(circle_at_90%_18%,rgba(255,209,102,0.13),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_44%)]" />
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <Link
                to="/linkler"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.12em] text-white/80 backdrop-blur transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Linklere dön
              </Link>
              <span className="rounded-full border border-[#8ee4e8]/25 bg-[#8ee4e8]/10 px-3 py-2 text-[0.68rem] font-black tracking-[0.16em] text-[#8ee4e8]">
                notwork.matchlab v1.0
              </span>
            </div>

            <section className="rounded-[2.2rem] border border-white/12 bg-white/[0.08] p-4 shadow-[0_0_80px_rgba(113,204,210,0.18)] backdrop-blur-xl sm:p-6">
              {registration ? (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/45">
                      Senin kodun
                    </p>
                    <p className="mt-1 text-sm font-bold text-white/70">
                      {registration.profile.firstName} {registration.profile.lastName}
                    </p>
                  </div>
                  <span className="rounded-2xl bg-[#8ee4e8] px-4 py-3 text-4xl font-black tracking-[-0.08em] text-[#071112]">
                    {registration.participant.publicCode}
                  </span>
                </div>
              ) : null}

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
                <p className="mb-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{message}</p>
              ) : null}

              {status === "ready" && group ? (
                <div className="space-y-5">
                  <div className="rounded-[1.8rem] bg-[#8ee4e8] p-5 text-[#071112]">
                    <p className="text-xs font-black uppercase tracking-[0.22em] opacity-70">
                      3 kişilik grup · tur {group.round}
                    </p>
                    <h1 className="mt-3 text-3xl font-black leading-none tracking-[-0.04em] sm:text-5xl">
                      Sizin buluşacağınız kodlar
                    </h1>
                    <p className="mt-4 text-5xl font-black tracking-[-0.08em] sm:text-7xl">
                      {meetingCodes}
                    </p>
                    <p className="mt-4 text-sm font-bold leading-5 opacity-75">
                      Bu kodları mekânda bul, kısa tanışma yap ve bitince aşağıdaki butona bas.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {otherMembers.map((member) => (
                      <article
                        key={member.participantId}
                        className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-3xl font-black tracking-[-0.06em] text-[#8ee4e8]">
                              {member.publicCode}
                            </p>
                            <h2 className="mt-2 text-xl font-black">{member.name}</h2>
                          </div>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-[0.68rem] font-black text-white/55">
                            eşleşme
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                          yardımcı olabilir
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white/70">
                          {member.offers.join(" · ")}
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ee4e8]">
                      Icebreaker soruları
                    </p>
                    <ol className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-white/75">
                      {(group.conversationPrompts || [group.conversationPrompt]).map(
                        (prompt, index) => (
                          <li key={prompt} className="rounded-2xl bg-white/[0.06] p-3">
                            {index + 1}. {prompt}
                          </li>
                        ),
                      )}
                    </ol>
                  </div>

                  <button
                    type="button"
                    onClick={() => void completeMatch()}
                    disabled={isCompleting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-black text-[#071112] transition hover:bg-[#8ee4e8] disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    {isCompleting ? "Grup tamamlanıyor..." : "Bu grup ile network done"}
                  </button>

                  {currentMember ? (
                    <p className="text-center text-xs font-semibold text-white/40">
                      Senin kodun: {currentMember.publicCode}. Grup bitmeden yeni eşleşme verilmez.
                    </p>
                  ) : null}
                </div>
              ) : null}

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
                  <p className="text-sm text-white/60">
                    Önce QR giriş ekranında kısa kaydı tamamla.
                  </p>
                  <Link
                    to="/linkler"
                    className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-[#071112]"
                  >
                    Kayıt ekranına git
                  </Link>
                </div>
              ) : null}
            </section>
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-5 pb-8">
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-5 text-white/45">
            Match Lab sadece üçlü gruplar oluşturur. Yeni grup almak için önce mevcut grubunu
            tamamlaman gerekir. Kullanım KVKK Aydınlatma Metni kapsamındadır.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-[#8ee4e8]" />
      <p className="text-sm font-black uppercase tracking-[0.2em] text-white/50">
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
      {text ? <p className="mt-3 text-sm leading-6 text-white/65">{text}</p> : null}
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
