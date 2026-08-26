import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Handshake,
  Lightbulb,
  LockKeyhole,
  MessageCircleMore,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  Send,
  Sparkles,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

import { SiteFooter, SiteNav } from "@/components/SiteNav";
import {
  fiveCategories,
  fiveCategoryLabel,
  getFiveEventTokenStorageKey,
  fiveHelpTypes,
  fiveRequest,
  type FiveCategory,
  type FiveChatMessage,
  type FiveEncounter,
  type FiveEncounterParticipant,
  type FiveHelpType,
  type FiveIdentity,
  type FiveProblem,
  type FiveSessionPayload,
} from "@/lib/five";
import { getEventSelectionFromLocation, withEventSelection } from "@/lib/event-registry";
import { createNoIndexSeo } from "@/lib/seo";

export const Route = createFileRoute("/five_/live")({
  head: () =>
    createNoIndexSeo({
      title: "ntw.five live | Etkinlik Problem Havuzu",
      description: "Notwork etkinliğine özel canlı problem ve beş dakikalık çözüm görüşmesi alanı.",
      path: "/five/live",
    }),
  component: FiveLivePage,
});

type ActiveTab = "pool" | "requests" | "meeting";

function FiveLivePage() {
  const [session, setSession] = useState<FiveSessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<FiveProblem | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("pool");
  const [composerOpen, setComposerOpen] = useState(false);

  const token = () =>
    typeof window === "undefined" ? "" : localStorage.getItem(getFiveEventTokenStorageKey()) || "";

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const nextSession = await fiveRequest<FiveSessionPayload>({
        action: "session",
        accessToken: token(),
      });
      setSession(nextSession);
      setError("");
      if (nextSession.state.activeEncounter) setActiveTab("meeting");
    } catch (requestError) {
      if (showLoading) {
        setSession(null);
        setError(requestError instanceof Error ? requestError.message : "Oturum bulunamadı");
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(true);
  }, [refresh]);

  useEffect(() => {
    if (!session) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh(false);
    }, 5_500);
    return () => window.clearInterval(interval);
  }, [refresh, session]);

  const mutate = async (input: Record<string, unknown>, successTab?: ActiveTab) => {
    setIsMutating(true);
    setError("");
    try {
      const nextSession = await fiveRequest<FiveSessionPayload>({
        ...input,
        accessToken: token(),
      });
      setSession(nextSession);
      setSelectedProblem(null);
      if (nextSession.state.activeEncounter) setActiveTab("meeting");
      else if (successTab) setActiveTab(successTab);
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "İşlem tamamlanamadı");
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) return <FiveLoading />;
  if (!session) return <FiveEntryGate message={error} />;

  const activeEncounter = session.state.activeEncounter;
  const incomingCount = session.state.incoming.filter(
    (request) => request.status === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-[#f3fafa] text-[#071213]">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden bg-[#071213] text-white">
          <div className="five-orb five-orb-one opacity-55" />
          <div className="five-grid" />
          <div className="relative mx-auto max-w-6xl px-5 py-8 sm:py-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#8ee4e8]">
                  <Radio className="h-3.5 w-3.5 animate-pulse" /> live problem network
                </div>
                <h1 className="mt-3 font-display text-5xl font-black tracking-[-0.065em] sm:text-7xl">
                  ntw.<span className="text-[#78d9da]">five</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/52 sm:text-base">
                  Problemi seç, katkını anlat, kabul edilince buluş ve beş dakikada ilerlet.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/7 p-3 backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#78d9da] font-display text-sm font-black text-[#071213]">
                  {session.identity.publicCode}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black">{session.identity.name}</div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white/38">
                    {session.identity.type === "member" ? "notwork üyesi" : "event katılımcısı"}
                  </div>
                </div>
                <BusinessQrButton person={session.identity} inverse />
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-white/6 p-1.5 backdrop-blur-xl sm:max-w-xl">
              <TabButton
                active={activeTab === "pool"}
                onClick={() => setActiveTab("pool")}
                label="problemler"
              />
              <TabButton
                active={activeTab === "requests"}
                onClick={() => setActiveTab("requests")}
                label={`talepler${incomingCount ? ` · ${incomingCount}` : ""}`}
              />
              <TabButton
                active={activeTab === "meeting"}
                onClick={() => setActiveTab("meeting")}
                label="görüşmem"
                pulse={Boolean(activeEncounter)}
              />
            </div>
          </div>
        </section>

        {error ? (
          <div className="mx-auto mt-4 max-w-6xl px-5">
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} aria-label="Uyarıyı kapat">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="mx-auto max-w-6xl px-5 py-7 sm:py-12">
          {activeTab === "pool" ? (
            <ProblemPool
              session={session}
              onHelp={setSelectedProblem}
              onOpenComposer={() => setComposerOpen(true)}
            />
          ) : null}
          {activeTab === "requests" ? (
            <RequestCenter session={session} isMutating={isMutating} onMutate={mutate} />
          ) : null}
          {activeTab === "meeting" ? (
            <MeetingRoom session={session} isMutating={isMutating} onMutate={mutate} />
          ) : null}
        </div>
      </main>
      <SiteFooter />

      {selectedProblem ? (
        <HelpSheet
          problem={selectedProblem}
          isSubmitting={isMutating}
          onClose={() => setSelectedProblem(null)}
          onSubmit={(values) =>
            mutate({ action: "help", problemId: selectedProblem.id, ...values }, "requests")
          }
        />
      ) : null}
      {composerOpen ? (
        <ProblemComposer
          isSubmitting={isMutating}
          onClose={() => setComposerOpen(false)}
          onSubmit={async (values) => {
            const completed = await mutate({ action: "submitLive", ...values }, "pool");
            if (completed) setComposerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function FiveLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071213] text-white">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#78d9da] text-[#071213]">
          <RefreshCw className="h-7 w-7 animate-spin" />
        </div>
        <div className="mt-5 font-display text-4xl font-black tracking-[-0.055em]">ntw.five</div>
        <p className="mt-2 text-sm text-white/45">canlı havuz hazırlanıyor</p>
      </div>
    </div>
  );
}

function FiveEntryGate({ message }: { message: string }) {
  const eventSelection = getEventSelectionFromLocation();
  const liveUrl = withEventSelection("/five/live", eventSelection);
  const profileUrl = `/profil?next=${encodeURIComponent(liveUrl)}`;
  const registrationUrl = withEventSelection(
    `/linkler?next=${encodeURIComponent(liveUrl)}`,
    eventSelection,
  );

  return (
    <div className="min-h-screen bg-[#071213] text-white">
      <SiteNav variant="eventDark" />
      <main className="relative isolate overflow-hidden">
        <div className="five-orb five-orb-one" />
        <div className="five-grid" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-5 py-12">
          <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[#8ee4e8]">
                etkinlik girişi
              </div>
              <h1 className="mt-4 font-display text-6xl font-black leading-[0.82] tracking-[-0.07em] sm:text-8xl">
                ntw.<span className="text-[#78d9da]">five</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg">
                Problemleri ve çözüm taleplerini görebilmek için Notwork kimliğinle devam et.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/12 bg-white/[0.07] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#78d9da] text-[#071213]">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                Nasıl katılacaksın?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/48">
                Üyeysen profil oturumunu aç. Etkinlik alanındaysan QR giriş formunu doldur; bu özel
                bağlantıdan oluşturulan profil admin onayı beklemeden etkinleşir.
              </p>
              {message ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/48">
                  {message}
                </div>
              ) : null}
              <div className="mt-5 grid gap-2.5">
                <a
                  href={profileUrl}
                  className="flex min-h-13 items-center justify-between rounded-2xl bg-[#78d9da] px-4 py-3.5 font-black text-[#071213]"
                >
                  <span className="flex items-center gap-2">
                    <UserRoundCheck className="h-5 w-5" /> Notwork profilim var
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={registrationUrl}
                  className="flex min-h-13 items-center justify-between rounded-2xl border border-white/14 bg-white/5 px-4 py-3.5 font-black text-white"
                >
                  <span className="flex items-center gap-2">
                    <UsersRound className="h-5 w-5" /> Etkinlik QR kaydı oluştur
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <a
                href={withEventSelection("/five", eventSelection)}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white/48 hover:text-white"
              >
                giriş yapmadan problem bırak <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  pulse = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  pulse?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-h-10 rounded-xl px-2 text-[11px] font-black transition sm:text-xs ${active ? "bg-[#78d9da] text-[#071213]" : "text-white/52 hover:bg-white/7 hover:text-white"}`}
    >
      {label}
      {pulse ? (
        <span className="absolute right-2 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      ) : null}
    </button>
  );
}

function ProblemPool({
  session,
  onHelp,
  onOpenComposer,
}: {
  session: FiveSessionPayload;
  onHelp: (problem: FiveProblem) => void;
  onOpenComposer: () => void;
}) {
  const rows = session.board;
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-deep">
            canlı havuz · {rows.length}
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-5xl">
            Hangi probleme dokunabilirsin?
          </h2>
        </div>
        <button
          type="button"
          onClick={onOpenComposer}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3 sm:text-sm sm:font-black"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">problem ekle</span>
        </button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((problem) => (
          <article
            key={problem.id}
            className={`flex min-h-72 flex-col rounded-[1.7rem] border p-5 shadow-sm ${problem.isOwner ? "border-primary bg-primary/8" : "border-border bg-white"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#071213] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#8ee4e8]">
                {problem.shortCode}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.13em] text-muted-foreground">
                {fiveCategoryLabel(problem.category)}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-black leading-tight tracking-[-0.035em]">
              {problem.title}
            </h3>
            <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {problem.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {problem.signals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full bg-background px-2.5 py-1 text-[10px] font-bold text-muted-foreground"
                >
                  {signal}
                </span>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
              <div className="min-w-0">
                <div className="truncate text-sm font-black">{problem.ownerName}</div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {problem.ownerPublicCode || "eventte"}
                </div>
              </div>
              <BusinessQrButton
                person={{
                  id: problem.ownerId,
                  name: problem.ownerName,
                  username: problem.ownerUsername,
                  publicCode: problem.ownerPublicCode,
                  photoUrl: problem.ownerPhotoUrl || "",
                  profileUrl: problem.ownerProfileUrl || "",
                  businessCardEnabled: Boolean(problem.ownerBusinessCardEnabled),
                }}
              />
              {problem.isOwner ? (
                <span className="rounded-full bg-primary/15 px-3 py-2 text-[10px] font-black text-primary-deep">
                  senin problemin
                </span>
              ) : problem.hasRequested ? (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700">
                  <Check className="h-3.5 w-3.5" /> talep gönderildi
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onHelp(problem)}
                  className="rounded-full bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground"
                >
                  katkı sunabilirim
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RequestCenter({
  session,
  isMutating,
  onMutate,
}: {
  session: FiveSessionPayload;
  isMutating: boolean;
  onMutate: (input: Record<string, unknown>, tab?: ActiveTab) => Promise<boolean>;
}) {
  const problemById = useMemo(
    () => new Map(session.board.map((problem) => [problem.id, problem])),
    [session.board],
  );
  const incoming = session.state.incoming;
  const outgoing = session.state.outgoing;
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <RequestList title="problemlerine gelenler" empty="Henüz gelen katkı talebi yok.">
        {incoming.map((request) => (
          <article key={request.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <PersonSummary
                person={{
                  id: request.requesterId,
                  name: request.requesterName,
                  username: request.requesterUsername,
                  publicCode: request.requesterPublicCode,
                  photoUrl: request.requesterPhotoUrl || "",
                  profileUrl: request.requesterProfileUrl || "",
                  businessCardEnabled: Boolean(request.requesterBusinessCardEnabled),
                }}
                subtitle={
                  fiveHelpTypes.find((type) => type.value === request.helpType)?.label ||
                  "katkı talebi"
                }
              />
              <StatusPill status={request.status} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{request.pitch}</p>
            <div className="mt-3 rounded-xl bg-background px-3 py-2 text-xs font-bold text-muted-foreground">
              {problemById.get(request.problemId)?.title || "problemin"}
            </div>
            {request.status === "pending" ? (
              <button
                type="button"
                disabled={isMutating}
                onClick={() =>
                  void onMutate({ action: "accept", requestId: request.id }, "meeting")
                }
                className="profile-primary-button mt-3 w-full"
              >
                görüşmeye kabul et <Handshake className="h-4 w-4" />
              </button>
            ) : null}
          </article>
        ))}
      </RequestList>
      <RequestList
        title="gönderdiğin talepler"
        empty="Henüz bir probleme katkı talebi göndermedin."
      >
        {outgoing.map((request) => (
          <article key={request.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-black">
                  {problemById.get(request.problemId)?.title || "problem"}
                </div>
                <div className="mt-1 text-xs font-bold text-primary-deep">
                  problem sahibi: {problemById.get(request.problemId)?.ownerName || "katılımcı"}
                </div>
              </div>
              <StatusPill status={request.status} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{request.pitch}</p>
          </article>
        ))}
      </RequestList>
    </section>
  );
}

function RequestList({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const rows = Array.isArray(children) ? children : [children];
  return (
    <div>
      <h2 className="text-2xl font-black tracking-[-0.04em]">{title}</h2>
      <div className="mt-4 grid gap-3">
        {rows.length && rows.some(Boolean) ? (
          children
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white px-4 py-10 text-center text-sm text-muted-foreground">
            {empty}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const label =
    {
      pending: "bekliyor",
      accepted: "kabul edildi",
      completed: "tamamlandı",
      declined: "reddedildi",
      cancelled: "iptal",
    }[status] || status;
  return (
    <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground">
      {label}
    </span>
  );
}

function MeetingRoom({
  session,
  isMutating,
  onMutate,
}: {
  session: FiveSessionPayload;
  isMutating: boolean;
  onMutate: (input: Record<string, unknown>, tab?: ActiveTab) => Promise<boolean>;
}) {
  const encounter = session.state.activeEncounter;
  const isLocalDemo =
    typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (!encounter)
    return (
      <div className="rounded-[2rem] border border-dashed border-primary/25 bg-white px-5 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary-deep">
          <Clock3 className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black">Henüz aktif görüşmen yok.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Bir probleme katkı talebi gönder veya kendi problemine gelen taleplerden birini kabul et.
        </p>
        {isLocalDemo ? (
          <button
            type="button"
            disabled={isMutating}
            onClick={() => void onMutate({ action: "demoEncounter" }, "meeting")}
            className="profile-primary-button mx-auto mt-5"
          >
            demo görüşmeyi aç <Sparkles className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    );
  return (
    <ActiveEncounter
      encounter={encounter}
      messages={session.state.activeEncounterMessages}
      identityId={session.identity.id}
      isMutating={isMutating}
      onMutate={onMutate}
    />
  );
}

function ActiveEncounter({
  encounter,
  messages,
  identityId,
  isMutating,
  onMutate,
}: {
  encounter: FiveEncounter;
  messages: FiveChatMessage[];
  identityId: string;
  isMutating: boolean;
  onMutate: (input: Record<string, unknown>, tab?: ActiveTab) => Promise<boolean>;
}) {
  const participants = [encounter.owner, ...encounter.helpers];
  const confirmed = encounter.confirmations.includes(identityId);
  const voted = encounter.extensionVotes.includes(identityId);
  const [outcome, setOutcome] = useState<FiveEncounter["outcome"]>("");
  const [message, setMessage] = useState("");
  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    const sent = await onMutate({ action: "message", message }, "meeting");
    if (sent) setMessage("");
  };
  return (
    <section className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-primary/20 bg-white shadow-[0_24px_70px_rgba(4,35,38,0.09)]">
      <div className="bg-[#071213] p-5 text-white sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8ee4e8]">
            {encounter.status === "active" ? "görüşme başladı" : "grup hazırlanıyor"}
          </div>
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-[10px] font-black">
            {participants.length} kişi
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
          {encounter.problemTitle}
        </h2>
        {encounter.status === "active" ? (
          <FiveCountdown endsAt={encounter.endsAt} />
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm leading-relaxed text-white/52">
            Herkes buluştuğunda “hazırım” desin. Sayaç, bütün katılımcılar onayladığında aynı anda
            başlar.
          </div>
        )}
      </div>
      <div className="p-5 sm:p-8">
        <div className="grid gap-2 sm:grid-cols-3">
          {participants.map((participant) => {
            const isConfirmed = encounter.confirmations.includes(participant.id);
            return (
              <div
                key={participant.id}
                className={`rounded-2xl border p-3 ${isConfirmed ? "border-emerald-200 bg-emerald-50" : "border-border bg-background"}`}
              >
                <PersonSummary
                  person={participant}
                  subtitle={isConfirmed ? "hazır" : "onay bekliyor"}
                  positive={isConfirmed}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-5 rounded-2xl border border-border bg-background p-3 sm:p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-deep">
            <MessageCircleMore className="h-4 w-4" /> buluşma chat
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Konumunu yaz; grubun seni etkinlik alanında kolayca bulsun.
          </p>
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {messages.length ? (
              messages.map((row) => (
                <div
                  key={row.id}
                  className={`rounded-xl px-3 py-2 text-sm ${row.senderId === identityId ? "ml-5 bg-primary text-primary-foreground" : "mr-5 border border-border bg-white"}`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.08em] opacity-60">
                    <span>
                      {row.senderName} · {row.senderPublicCode}
                    </span>
                    <span>
                      {new Date(row.createdAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 leading-relaxed">{row.text}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-white px-3 py-5 text-center text-xs text-muted-foreground">
                İlk mesajı gönder ve buluşma noktanı paylaş.
              </div>
            )}
          </div>
          <form onSubmit={submitMessage} className="mt-3 flex gap-2">
            <input
              required
              minLength={2}
              maxLength={240}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="profile-input min-w-0 flex-1"
              placeholder="ör. sahnenin sağındayım"
            />
            <button
              type="submit"
              disabled={isMutating || message.trim().length < 2}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              aria-label="Mesaj gönder"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
        {encounter.status === "waiting" ? (
          <button
            type="button"
            disabled={isMutating || confirmed}
            onClick={() => void onMutate({ action: "confirm" }, "meeting")}
            className="profile-primary-button mt-5 w-full"
          >
            {confirmed ? "diğer katılımcılar bekleniyor" : "buluştuk, hazırım"}
            <CheckCircle2 className="h-4 w-4" />
          </button>
        ) : null}
        {encounter.status === "active" ? (
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl bg-primary/8 p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-primary-deep">
                <MessageCircleMore className="h-4 w-4" /> açılış sorusu
              </div>
              <p className="mt-2 text-sm font-bold leading-relaxed">
                Bu problem yarın çözülmüş olsa ilk fark edeceğin değişiklik ne olurdu?
              </p>
            </div>
            {!encounter.extensionUsed ? (
              <button
                type="button"
                disabled={isMutating || voted}
                onClick={() => void onMutate({ action: "extend" }, "meeting")}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white px-4 text-sm font-black text-primary-deep"
              >
                {voted ? "diğer onaylar bekleniyor" : "+5 dakika öner"}
                <Plus className="h-4 w-4" />
              </button>
            ) : (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-700">
                grup ortak kararla +5 dakika aldı
              </div>
            )}
            <label>
              <span className="mb-2 block text-sm font-black">Görüşmenin sonucu</span>
              <select
                value={outcome}
                onChange={(event) => setOutcome(event.target.value as FiveEncounter["outcome"])}
                className="profile-input"
              >
                <option value="">sonuç seç</option>
                <option value="solution">çözüm oluştu</option>
                <option value="next-step">net bir sonraki adım var</option>
                <option value="referral">doğru bağlantı bulundu</option>
                <option value="continue-later">görüşmeye devam edeceğiz</option>
                <option value="not-fit">bu eşleşme uygun değildi</option>
              </select>
            </label>
            <button
              type="button"
              disabled={isMutating || !outcome}
              onClick={() => void onMutate({ action: "complete", outcome }, "pool")}
              className="profile-primary-button w-full"
            >
              görüşmeyi tamamla <Check className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FiveCountdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((Date.parse(endsAt) - now) / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return (
    <div className="mt-6 flex items-end justify-between gap-4">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">
          kalan süre
        </div>
        <div className="mt-1 font-display text-7xl font-black leading-none tracking-[-0.07em] text-[#8ee4e8]">
          {minutes}:{String(rest).padStart(2, "0")}
        </div>
      </div>
      <Clock3 className="mb-2 h-7 w-7 text-white/28" />
    </div>
  );
}

function HelpSheet({
  problem,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  problem: FiveProblem;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: { helpType: FiveHelpType; pitch: string }) => Promise<boolean>;
}) {
  const [helpType, setHelpType] = useState<FiveHelpType>("direct");
  const [pitch, setPitch] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ helpType, pitch });
  };
  return (
    <ModalShell onClose={onClose}>
      <form onSubmit={submit}>
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-deep">
          {problem.shortCode} · {problem.ownerName}
        </div>
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.04em]">
          {problem.title}
        </h2>
        <p className="mt-3 rounded-2xl bg-background p-3 text-sm leading-relaxed text-muted-foreground">
          Beklenen sonuç: {problem.desiredOutcome}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {fiveHelpTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setHelpType(type.value)}
              className={`min-h-12 rounded-xl border px-3 text-left text-[11px] font-black ${helpType === type.value ? "border-primary bg-primary/12 text-primary-deep" : "border-border bg-background"}`}
            >
              {type.label}
            </button>
          ))}
        </div>
        <label className="mt-4 block">
          <span className="mb-2 flex items-center justify-between text-sm font-black">
            Katkını kısaca anlat
            <span className="text-[10px] text-muted-foreground">{pitch.length}/180 · min. 20</span>
          </span>
          <textarea
            required
            minLength={20}
            maxLength={180}
            rows={4}
            value={pitch}
            onChange={(event) => setPitch(event.target.value)}
            className="profile-input resize-none"
            placeholder="fikrin, deneyimin veya tanıdığın bağlantı"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="profile-primary-button mt-4 w-full"
        >
          talebi gönder <Send className="h-4 w-4" />
        </button>
      </form>
    </ModalShell>
  );
}

function ProblemComposer({
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    tried: "",
    desiredOutcome: "",
    category: "startup" as FiveCategory,
  });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ ...form, attending: true, consent: true });
  };
  return (
    <ModalShell onClose={onClose}>
      <form onSubmit={submit}>
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-deep">
          canlı problem
        </div>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">
          Neyi ilerletmek istiyorsun?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kısa ve net yaz; odadaki insanlar birkaç saniyede anlayabilsin.
        </p>
        <div className="mt-5 grid gap-3">
          <select
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({ ...current, category: event.target.value as FiveCategory }))
            }
            className="profile-input"
          >
            {fiveCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <ModalField label="problem başlığı" count={`${form.title.length}/80`}>
            <input
              required
              minLength={8}
              maxLength={80}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              className="profile-input"
              placeholder="tek cümlede problem"
            />
          </ModalField>
          <ModalField label="problemi anlat" count={`${form.description.length}/360 · min. 40`}>
            <textarea
              required
              minLength={40}
              maxLength={360}
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="profile-input resize-none"
              placeholder="bağlamı ve tıkandığın noktayı anlat"
            />
          </ModalField>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModalField label="ne denedin?" count={`${form.tried.length}/220 · min. 15`}>
              <textarea
                required
                minLength={15}
                maxLength={220}
                rows={3}
                value={form.tried}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tried: event.target.value }))
                }
                className="profile-input resize-none"
                placeholder="denediğin yol"
              />
            </ModalField>
            <ModalField
              label="5 dakika sonunda"
              count={`${form.desiredOutcome.length}/160 · min. 15`}
            >
              <textarea
                required
                minLength={15}
                maxLength={160}
                rows={3}
                value={form.desiredOutcome}
                onChange={(event) =>
                  setForm((current) => ({ ...current, desiredOutcome: event.target.value }))
                }
                className="profile-input resize-none"
                placeholder="beklediğin sonuç"
              />
            </ModalField>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="profile-primary-button mt-5 w-full"
        >
          problemi yayınla <Lightbulb className="h-4 w-4" />
        </button>
      </form>
    </ModalShell>
  );
}

function ModalField({
  label,
  count,
  children,
}: {
  label: string;
  count: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-3 text-xs font-black">
        <span>{label}</span>
        <span className="text-[9px] text-muted-foreground">{count}</span>
      </span>
      {children}
    </label>
  );
}

type FivePerson = FiveEncounterParticipant | FiveIdentity;

function PersonSummary({
  person,
  subtitle,
  positive = false,
}: {
  person: FivePerson;
  subtitle: string;
  positive?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary font-display text-[10px] font-black text-primary-foreground">
        {person.photoUrl ? (
          <img src={person.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          person.publicCode
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black">{person.name}</div>
        <div
          className={`mt-0.5 truncate text-[10px] font-bold ${positive ? "text-emerald-700" : "text-muted-foreground"}`}
        >
          {person.publicCode} · {subtitle}
        </div>
      </div>
      <BusinessQrButton person={person} />
    </div>
  );
}

function BusinessQrButton({ person, inverse = false }: { person: FivePerson; inverse?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!person.username || !person.businessCardEnabled) return null;
  const profileUrl = `https://notwork.me/u/${encodeURIComponent(person.username)}`;
  const close = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
  };
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${inverse ? "border-white/12 bg-white/8 text-white" : "border-border bg-white text-primary-deep"}`}
        aria-label={`${person.name} business QR kodunu göster`}
      >
        <QrCode className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#031011]/78 p-5 backdrop-blur-md"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={close}
            aria-label="QR kodu kapat"
          />
          <div className="relative w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto h-20 w-20 overflow-hidden rounded-2xl bg-primary">
              {person.photoUrl ? (
                <img
                  src={person.photoUrl}
                  alt={person.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-lg font-black">
                  {person.publicCode}
                </div>
              )}
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">{person.name}</h3>
            <p className="mt-1 text-xs font-bold text-muted-foreground">notwork business card</p>
            <div className="mx-auto mt-5 w-fit rounded-2xl border border-border bg-white p-4">
              <QRCode value={profileUrl} size={176} />
            </div>
            <a
              href={person.profileUrl || `/u/${person.username}`}
              target="_blank"
              rel="noreferrer"
              className="profile-primary-button mt-5 w-full"
            >
              profili aç <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[#031011]/72 p-0 backdrop-blur-md sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
