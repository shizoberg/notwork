import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, RefreshCcw, Sparkles, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import type {
  EventNetworkMatchGroup,
  EventNetworkPresence,
  EventNetworkRegistration,
} from "@/lib/event-network";
import {
  getEventNetworkMe,
  getEventNetworkMatch,
  seedEventNetworkSamples,
  updateEventNetworkPresence,
} from "@/lib/event-network-api";

const tokenStorageKey = "notwork_21_agustos_network_token";

export const Route = createFileRoute("/21-agustos/eslesme")({
  head: () => ({
    meta: [
      { title: "21 Ağustos notwork Eşleşme" },
      { name: "robots", content: "noindex, nofollow" },
    ],
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
  const [seeding, setSeeding] = useState(false);

  const currentMember = useMemo(
    () => group?.members.find((member) => member.isCurrentUser) || null,
    [group],
  );
  const otherMembers = useMemo(
    () => group?.members.filter((member) => !member.isCurrentUser) || [],
    [group],
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
    }
  }, [loadMatch]);

  const updatePresence = async (nextPresence: EventNetworkPresence) => {
    if (!token) return;
    setPresence(nextPresence);
    try {
      await updateEventNetworkPresence(token, nextPresence);
      const currentRegistration = await getEventNetworkMe(token);
      setRegistration(currentRegistration);
      if (nextPresence === "paused") {
        setStatus("paused");
        setGroup(null);
        return;
      }
      await loadMatch(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Durum güncellenemedi.");
    }
  };

  const startSample = async () => {
    setSeeding(true);
    setMessage("");
    try {
      const data = await seedEventNetworkSamples();
      const sampleToken = data.registrations[0]?.accessToken;
      if (!sampleToken) throw new Error("Sample token üretilemedi.");
      setRegistration(data.registrations[0]);
      localStorage.setItem(tokenStorageKey, sampleToken);
      setToken(sampleToken);
      await loadMatch(sampleToken);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sample veri yüklenemedi.");
    } finally {
      setSeeding(false);
    }
  };

  const glowClass =
    presence === "open"
      ? "shadow-[0_0_70px_rgba(34,197,94,0.32)]"
      : presence === "meeting"
        ? "shadow-[0_0_70px_rgba(250,204,21,0.35)]"
        : "shadow-[0_0_70px_rgba(239,68,68,0.32)]";

  return (
    <div className="min-h-screen bg-[#071112] text-white">
      <SiteNav variant="eventDark" />
      <main className="overflow-hidden">
        <section className="relative px-5 pb-14 pt-24 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(113,204,210,0.28),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(255,209,102,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_45%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <Link
                to="/linkler"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/80 backdrop-blur transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Linklere geri dön
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#8ee4e8]">
                <Sparkles className="h-4 w-4" /> 21 Ağustos Notworking · Match Lab
              </span>
              <div>
                <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl">
                  Eşleşmeni bul, konuşmayı başlat.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                  Sistem her denemede sunucudan güncel kayıtları okur; 2’li, 3’lü veya 4’lü küçük
                  gruplar önerir. Kodları bul, tanış, sonra yeni eşleşmeye geç.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                {registration ? (
                  <div className="mb-4 rounded-[1.5rem] border border-[#8ee4e8]/30 bg-[#8ee4e8]/12 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ee4e8]">
                      Senin notwork kodun
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-2xl bg-[#8ee4e8] px-5 py-3 text-4xl font-black tracking-[-0.06em] text-[#071112]">
                        {registration.participant.publicCode}
                      </span>
                      <span className="text-sm font-semibold leading-5 text-white/65">
                        {registration.profile.firstName} {registration.profile.lastName}
                        <br />
                        Eşleşmede bu kodla seni bulacaklar.
                      </span>
                    </div>
                  </div>
                ) : null}
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                  Müsaitlik durumun
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <PresenceButton
                    active={presence === "meeting"}
                    color="yellow"
                    label="Şu an görüşüyorum"
                    onClick={() => void updatePresence("meeting")}
                  />
                  <PresenceButton
                    active={presence === "open"}
                    color="green"
                    label="Yeni kişiye açığım"
                    onClick={() => void updatePresence("open")}
                  />
                  <PresenceButton
                    active={presence === "paused"}
                    color="red"
                    label="Bana atama"
                    onClick={() => void updatePresence("paused")}
                  />
                </div>
              </div>

              {!token ? (
                <div className="rounded-[2rem] border border-dashed border-[#8ee4e8]/50 bg-[#8ee4e8]/10 p-5">
                  <p className="text-sm leading-6 text-white/75">
                    Test için sample kayıtları yükleyip demo eşleşme ekranını açabilirsin. Bu
                    aksiyon sadece lokal ortamda çalışır.
                  </p>
                  <button
                    onClick={() => void startSample()}
                    disabled={seeding}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#8ee4e8] px-5 py-3 text-sm font-black text-[#071112] disabled:opacity-60"
                  >
                    {seeding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                    Sample veriyi yükle ve göster
                  </button>
                </div>
              ) : null}
            </div>

            <div
              className={`relative rounded-[2.5rem] border border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl ${glowClass}`}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8ee4e8]/25 blur-3xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-[#0d1a1c]/90 p-5 sm:p-7">
                {status === "loading" ? <LoadingCard /> : null}
                {status === "paused" ? <PausedCard /> : null}
                {status === "empty" ? <EmptyCard /> : null}
                {message ? (
                  <p className="mb-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">
                    {message}
                  </p>
                ) : null}

                {status === "ready" && group ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8ee4e8]">
                          {group.groupSize} kişilik grup · Tur {group.round}
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                          Bu kodları bul
                        </h2>
                      </div>
                      <button
                        onClick={() => void loadMatch()}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/15"
                      >
                        <RefreshCcw className="h-4 w-4" /> Diğer eşleşmeye geç
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {otherMembers.map((member, index) => (
                        <div
                          key={member.participantId}
                          className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-2xl bg-[#8ee4e8] px-4 py-3 text-3xl font-black tracking-[-0.06em] text-[#071112]">
                              {member.publicCode}
                            </span>
                            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                              #{index + 1}
                            </span>
                          </div>
                          <h3 className="mt-4 text-xl font-black">{member.name}</h3>
                          <p className="mt-1 text-sm text-white/55">{member.offers.join(" · ")}</p>
                          <p className="mt-3 rounded-2xl bg-black/20 p-3 text-sm leading-5 text-white/70">
                            “{member.needs}”
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[1.6rem] border border-[#8ee4e8]/25 bg-[#8ee4e8]/10 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ee4e8]">
                        Neye göre önerildi?
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/75">{group.reason}</p>
                      <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-white/45">
                        Konuşma sorusu
                      </p>
                      <p className="mt-2 text-lg font-black leading-6">
                        {group.conversationPrompt}
                      </p>
                    </div>

                    {currentMember ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] bg-black/20 p-4 text-sm text-white/60">
                        <span>
                          Sen: <strong className="text-white">{currentMember.name}</strong>
                        </span>
                        <span className="font-black text-[#8ee4e8] sm:hidden">
                          Kodun: {currentMember.publicCode}
                        </span>
                      </div>
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
                      Önce network kaydını tamamlaman gerekiyor.
                    </p>
                    <Link
                      to="/21-agustos/network"
                      className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-[#071112]"
                    >
                      Kayıt ekranına git
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 pb-8">
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-5 text-white/45">
            Match Lab, etkinlik sırasında verdiğin network kayıt bilgilerine göre öneri üretir.
            Eşleşme ekranını kullanarak{" "}
            <Link to="/kvkk" className="font-bold text-[#8ee4e8] underline">
              KVKK Aydınlatma Metni
            </Link>{" "}
            kapsamında bilgilendirildiğini kabul edersin.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function PresenceButton({
  active,
  color,
  label,
  onClick,
}: {
  active: boolean;
  color: "yellow" | "green" | "red";
  label: string;
  onClick: () => void;
}) {
  const colors = {
    yellow: active
      ? "bg-yellow-300 text-[#231b00] shadow-[0_0_32px_rgba(250,204,21,0.42)]"
      : "bg-white/8 text-white/70",
    green: active
      ? "bg-green-300 text-[#042111] shadow-[0_0_32px_rgba(34,197,94,0.42)]"
      : "bg-white/8 text-white/70",
    red: active
      ? "bg-red-400 text-white shadow-[0_0_32px_rgba(239,68,68,0.42)]"
      : "bg-white/8 text-white/70",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-left text-xs font-black transition ${colors[color]}`}
    >
      {label}
    </button>
  );
}

function LoadingCard() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-[#8ee4e8]" />
      <p className="text-sm font-black uppercase tracking-[0.2em] text-white/50">
        Sunucudan güncel eşleşme alınıyor
      </p>
    </div>
  );
}

function PausedCard() {
  return (
    <div className="min-h-[320px] rounded-[2rem] border border-red-300/20 bg-red-400/10 p-6 text-center">
      <p className="text-4xl">⛔</p>
      <h2 className="mt-4 text-3xl font-black">Şu an sana kişi atamıyoruz.</h2>
      <p className="mt-3 text-sm leading-6 text-white/65">
        Tekrar eşleşmek istediğinde “Yeni kişiye açığım” seçeneğine basman yeterli.
      </p>
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="min-h-[320px] rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 text-center">
      <p className="text-4xl">🫧</p>
      <h2 className="mt-4 text-3xl font-black">Şimdilik uygun grup yok.</h2>
      <p className="mt-3 text-sm leading-6 text-white/65">
        Biraz sonra tekrar dene; sistem her istekte güncel kayıtları yeniden okuyor.
      </p>
    </div>
  );
}
