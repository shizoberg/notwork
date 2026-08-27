import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Archive,
  BarChart3,
  CalendarDays,
  Check,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  MessageSquareQuote,
  MousePointerClick,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WordcloudAnswer, WordcloudQuestion, WordcloudResults } from "@/lib/event-wordcloud";
import type { EventNetworkRegistration } from "@/lib/event-network";
import {
  createEventProductNamespace,
  defaultEventRegistrationPrompts,
  eventProductKeys,
  updateEventRegistry,
  withEventSelection,
  type EventDataMode,
  type EventLifecycleStatus,
  type EventProductKey,
  type EventProductState,
  type EventRegistryDraft,
  type EventRegistryInfo,
  type EventRegistryPayload,
  type EventSelection,
  type NotworkEvent,
} from "@/lib/event-registry";
import { getFiveAdmin, updateFiveAdmin, type FiveAdminPayload } from "@/lib/five";
import type {
  MemberProfilesAdminPayload,
  NotworkMemberReference,
  NotworkMemberProfile,
  TemporaryMemberCredential,
} from "@/lib/member-profile";
import {
  getEventNetworkAdmin,
  resetEventNetworkDemo,
  seedEventNetworkSamples,
} from "@/lib/event-network-api";
import { getWordcloudAdmin, updateWordcloudAdmin } from "@/lib/wordcloud-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "notwork Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

type AnalyticsEvent = {
  id: string;
  timestamp: string;
  type: string;
  path: string;
  sessionId: string;
  label: string;
  target: string;
  value: number;
  referrer: string;
  source: string;
  campaign: string;
  device: string;
};

type AnalyticsDailySummary = {
  version: 1;
  date: string;
  updatedAt: string;
  eventCount: number;
  skipped: number;
  counts: Record<string, number>;
  sessionIds: string[];
  ticketClicksByEvent: {
    july14: number;
    august21: number;
    september17?: number;
    october9?: number;
  };
  pageTimeTotal: number;
  pageTimeCount: number;
  topPages: Record<string, number>;
  topActions: Record<string, number>;
  sources: Record<string, number>;
  scrollDepth: Record<string, number>;
  devices: Record<string, number>;
  buttonActions: Record<string, number>;
  pageMetrics?: Record<
    string,
    {
      pageViews: number;
      clicks: number;
      ticketClicks: number;
      pageTimeTotal: number;
      pageTimeCount: number;
      sessionIds: string[];
      buttonActions: Record<string, number>;
    }
  >;
};

type AnalyticsCoverage = {
  from: string;
  to: string;
  requestedDays: number;
  activityDays: number;
  readyDays: number;
  missingDays: string[];
  isComplete: boolean;
  generatedAt: string;
};

type AnalyticsAdminResponse = {
  schemaVersion: 2;
  events: AnalyticsEvent[];
  summaries: AnalyticsDailySummary[];
  days: number;
  missingDays: string[];
  coverage: AnalyticsCoverage;
  truncated: boolean;
  skipped: number;
};

type BackfillProgress = {
  running: boolean;
  completed: number;
  total: number;
  failed: number;
};

type NetworkMember = {
  id: string;
  name: string;
  title: string;
  skills: string;
  email: string;
  instagram: string;
  linkedin: string;
  motivation: string;
  contact: string;
  createdAt: string;
  username: string;
};

type ChangeRequest = {
  id: string;
  username: string;
  requestedAt: string;
  current: NetworkMember;
  proposed: NetworkMember;
};

type StartupApplication = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  projectName: string;
  stage: string;
  projectSummary: string;
  need: string;
  notification: {
    recipients: string[];
    status: "sent" | "not_configured" | "failed";
    error?: string;
  };
};

const blankMember: NetworkMember = {
  id: "",
  name: "",
  title: "",
  skills: "",
  email: "",
  instagram: "",
  linkedin: "",
  motivation: "",
  contact: "",
  createdAt: "",
  username: "",
};

const blankWordcloudQuestion: Partial<WordcloudQuestion> = {
  id: "",
  order: 1,
  title: "",
  helper: "",
  isActive: true,
  maxAnswersPerSession: 1,
};

const eventNames: Record<string, string> = {
  session_start: "Oturum başladı",
  page_view: "Sayfa görüntülendi",
  click: "Tıklama",
  ticket_click: "Bilet butonu",
  scroll_depth: "Kaydırma",
  page_time: "Sayfada geçirilen süre",
  form_submit: "Form gönderimi",
};

type AdminTab = "events" | "eventTools" | "analytics" | "networking" | "profiles" | "applications";

type EventDatabaseInfo = {
  storeName: string;
  datasetCode: string;
  activeDatabaseCode: string;
  demoDatabaseCode: string;
  liveDatabaseCode: string;
  keyPrefix: string;
  mode: "demo" | "live";
};

const adminTabs: Array<{ id: AdminTab; label: string; description: string }> = [
  {
    id: "events",
    label: "Etkinlikler",
    description: "Etkinlik oluştur, ürünleri ve veriyi ayarla",
  },
  {
    id: "eventTools",
    label: "Etkinlik verileri",
    description: "21 Ağustos, 17 Eylül ve 9 Ekim ürün kayıtları",
  },
  { id: "analytics", label: "Analiz", description: "Trafik, bilet ve aksiyon grafikleri" },
  { id: "networking", label: "Networking", description: "Genel topluluk ağı ve onaylar" },
  {
    id: "profiles",
    label: "Profiller",
    description: "Doğrulanmış üyeler, rozetler ve geçici girişler",
  },
  { id: "applications", label: "Başvurular", description: "Network Startup proje başvuruları" },
];

const adminUiVersion = "Admin v3 · etkinlik platformu";

const eventToolsSlugs = ["21-agustos-2026", "17-eylul-2026", "9-ekim-2026"];

const eventPageAnalyticsOptions = [
  { path: "/17-eylul", label: "17 Eylül · Chill & Chat" },
  { path: "/9-ekim", label: "9 Ekim · Classic" },
  { path: "/21agustos", label: "21 Ağustos · Rene Lokal" },
];

type EventEditorDraft = {
  id: string;
  revision: number;
  title: string;
  shortTitle: string;
  slug: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: EventLifecycleStatus;
  location: NotworkEvent["location"];
  entry: Omit<NotworkEvent["entry"], "isPrimary">;
  products: NotworkEvent["products"];
};

const eventStatusLabels: Record<EventLifecycleStatus, string> = {
  draft: "Taslak",
  scheduled: "Planlandı",
  live: "Canlı",
  completed: "Tamamlandı",
  archived: "Arşiv",
};

const productStateLabels: Record<EventProductState, string> = {
  disabled: "Kapalı",
  draft: "Hazırlanıyor",
  ready: "Hazır",
  live: "Canlı",
  paused: "Duraklatıldı",
  archived: "Arşiv",
};

const productStateDescriptions: Array<{ label: string; description: string }> = [
  { label: "Hazırlanıyor", description: "Ayar ve test sürüyor; katılımcıya açmaya hazır değil." },
  { label: "Hazır", description: "Test edildi; etkinlik günü canlıya alınmayı bekliyor." },
  { label: "Canlı", description: "Katılımcı kullanımı ve anlık veri toplama aktif." },
  { label: "Duraklatıldı", description: "Yeni işlem geçici olarak durur; mevcut veri korunur." },
  { label: "Arşiv", description: "Etkinlik tamamlandı; kayıtlar geçmiş veri olarak saklanır." },
];

const productDescriptions: Record<EventProductKey, string> = {
  matchlab: "Etkinlik içi üçlü eşleşmeler ve görüşme akışı",
  wordcloud: "Canlı anket, cevap moderasyonu ve sahne ekranı",
  five: "Problemler, çözüm talepleri ve beş dakikalık görüşmeler",
};

function toDateTimeInput(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function blankEventEditorDraft(): EventEditorDraft {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 7);
  startsAt.setHours(19, 30, 0, 0);
  const endsAt = new Date(startsAt.getTime() + 3 * 60 * 60 * 1000);
  return {
    id: "",
    revision: 0,
    title: "",
    shortTitle: "",
    slug: "",
    startsAt: toDateTimeInput(startsAt.toISOString()),
    endsAt: toDateTimeInput(endsAt.toISOString()),
    timezone: "Europe/Istanbul",
    status: "draft",
    location: { name: "", address: "", city: "İzmir", mapUrl: "" },
    entry: {
      isOpen: false,
      requireRegistration: true,
      registrationPrompts: { ...defaultEventRegistrationPrompts },
    },
    products: Object.fromEntries(
      eventProductKeys.map((product) => [
        product,
        {
          enabled: false,
          visible: true,
          state: "disabled",
          dataMode: "demo",
          label: product === "matchlab" ? "ntw.matchlab" : `ntw.${product}`,
          order: product === "five" ? 1 : product === "wordcloud" ? 2 : 3,
        },
      ]),
    ) as NotworkEvent["products"],
  };
}

function eventToEditorDraft(event: NotworkEvent): EventEditorDraft {
  return {
    id: event.id,
    revision: event.revision,
    title: event.title,
    shortTitle: event.shortTitle,
    slug: event.slug,
    startsAt: toDateTimeInput(event.startsAt),
    endsAt: toDateTimeInput(event.endsAt),
    timezone: event.timezone,
    status: event.status,
    location: { ...event.location },
    entry: {
      isOpen: event.entry.isOpen,
      requireRegistration: event.entry.requireRegistration,
      registrationPrompts: {
        ...defaultEventRegistrationPrompts,
        ...event.entry.registrationPrompts,
      },
    },
    products: Object.fromEntries(
      eventProductKeys.map((product) => [
        product,
        {
          ...event.products[product],
          order:
            event.products[product].order ||
            (product === "five" ? 1 : product === "wordcloud" ? 2 : 3),
        },
      ]),
    ) as NotworkEvent["products"],
  };
}

function eventEditorPayload(draft: EventEditorDraft): EventRegistryDraft {
  return {
    title: draft.title,
    shortTitle: draft.shortTitle,
    slug: draft.slug,
    startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : "",
    endsAt: draft.endsAt ? new Date(draft.endsAt).toISOString() : "",
    timezone: draft.timezone,
    status: draft.status,
    location: draft.location,
    entry: draft.entry,
    products: draft.products,
  };
}

function AdminPage() {
  const [password, setPassword] = useState("");
  const [days, setDays] = useState(30);
  const [events, setEvents] = useState<AnalyticsEvent[] | null>(null);
  const [dailySummaries, setDailySummaries] = useState<AnalyticsDailySummary[]>([]);
  const [analyticsCoverage, setAnalyticsCoverage] = useState<AnalyticsCoverage | null>(null);
  const [missingAnalyticsDays, setMissingAnalyticsDays] = useState<string[]>([]);
  const [backfillProgress, setBackfillProgress] = useState<BackfillProgress>({
    running: false,
    completed: 0,
    total: 0,
    failed: 0,
  });
  const [members, setMembers] = useState<NetworkMember[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [startupApplications, setStartupApplications] = useState<StartupApplication[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<NotworkMemberProfile[]>([]);
  const [memberReferences, setMemberReferences] = useState<NotworkMemberReference[]>([]);
  const [temporaryCredentials, setTemporaryCredentials] = useState<TemporaryMemberCredential[]>([]);
  const [profileMessage, setProfileMessage] = useState("");
  const [memberDraft, setMemberDraft] = useState<NetworkMember>(blankMember);
  const [editingUsername, setEditingUsername] = useState("");
  const [networkMessage, setNetworkMessage] = useState("");
  const [wordcloudQuestions, setWordcloudQuestions] = useState<WordcloudQuestion[]>([]);
  const [wordcloudAnswers, setWordcloudAnswers] = useState<WordcloudAnswer[]>([]);
  const [wordcloudResults, setWordcloudResults] = useState<WordcloudResults | null>(null);
  const [wordcloudDatabase, setWordcloudDatabase] = useState<EventDatabaseInfo | null>(null);
  const [wordcloudDraft, setWordcloudDraft] =
    useState<Partial<WordcloudQuestion>>(blankWordcloudQuestion);
  const [wordcloudMessage, setWordcloudMessage] = useState("");
  const [eventRegistrations, setEventRegistrations] = useState<EventNetworkRegistration[]>([]);
  const [eventDatabase, setEventDatabase] = useState<EventDatabaseInfo | null>(null);
  const [fiveData, setFiveData] = useState<FiveAdminPayload | null>(null);
  const [fiveMessage, setFiveMessage] = useState("");
  const [eventRegistry, setEventRegistry] = useState<NotworkEvent[]>([]);
  const [eventRegistryInfo, setEventRegistryInfo] = useState<EventRegistryInfo | null>(null);
  const [eventEditor, setEventEditor] = useState<EventEditorDraft>(blankEventEditorDraft);
  const [eventRegistryMessage, setEventRegistryMessage] = useState("");
  const [eventRegistryLoading, setEventRegistryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("events");
  const [selectedToolsEventSlug, setSelectedToolsEventSlug] = useState("21-agustos-2026");
  const [selectedEventAnalyticsPath, setSelectedEventAnalyticsPath] = useState("/17-eylul");
  const backfillRunningRef = useRef(false);
  const selectedDaysRef = useRef(days);

  const selectedToolsEvent = useMemo(
    () =>
      eventRegistry.find((event) => event.slug === selectedToolsEventSlug) ||
      eventRegistry.find((event) => event.slug === "21-agustos-2026") ||
      null,
    [eventRegistry, selectedToolsEventSlug],
  );

  const selectedToolsEventSelection: EventSelection = { event: selectedToolsEventSlug };

  const loadNetwork = async (nextPassword = password) => {
    const response = await fetch("/api/networking/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: nextPassword, action: "list" }),
    });
    if (!response.ok) throw new Error("Networking verisi alınamadı.");
    const data = (await response.json()) as { members: NetworkMember[]; requests: ChangeRequest[] };
    setMembers(data.members);
    setRequests(data.requests);
  };

  const loadWordcloud = async (nextPassword = password, eventSlug = selectedToolsEventSlug) => {
    const data = await getWordcloudAdmin(nextPassword, { event: eventSlug });
    setWordcloudQuestions(data.questions);
    setWordcloudAnswers(data.answers);
    setWordcloudResults(data.results);
    setWordcloudDatabase(data.database || null);
    return data;
  };

  const loadEventNetwork = async (nextPassword = password, eventSlug = selectedToolsEventSlug) => {
    const data = await getEventNetworkAdmin(nextPassword, { event: eventSlug });
    setEventRegistrations(data.registrations);
    setEventDatabase(data.database || null);
    return data;
  };

  const loadFive = async (nextPassword = password, eventSlug = selectedToolsEventSlug) => {
    const data = await getFiveAdmin(nextPassword, { event: eventSlug });
    setFiveData(data);
    return data;
  };

  const applyEventRegistry = (data: EventRegistryPayload, preferredEventId = "") => {
    setEventRegistry(data.events);
    setEventRegistryInfo(data.registry);
    const selected =
      data.selectedEvent ||
      data.events.find((event) => event.id === preferredEventId) ||
      data.events.find((event) => event.id === data.registry.primaryEventId) ||
      data.events[0];
    if (selected) setEventEditor(eventToEditorDraft(selected));
  };

  const loadEventRegistry = async (nextPassword = password, preferredEventId = "") => {
    const data = await updateEventRegistry(nextPassword, { action: "list" });
    applyEventRegistry(data, preferredEventId);
    return data;
  };

  const loadSelectedEventTools = async (
    eventSlug: string,
    nextPassword = password,
    availableEvents = eventRegistry,
  ) => {
    const selectedEvent = availableEvents.find((event) => event.slug === eventSlug);
    if (!selectedEvent) throw new Error("Etkinlik ürün ayarları bulunamadı.");

    setNetworkMessage("");
    setWordcloudMessage("");
    setFiveMessage("");

    const tasks: Array<Promise<unknown>> = [];
    if (selectedEvent.products.matchlab.enabled) {
      tasks.push(
        loadEventNetwork(nextPassword, eventSlug).then(async (data) => {
          if (
            eventSlug === "17-eylul-2026" &&
            selectedEvent.products.matchlab.dataMode === "demo" &&
            data.registrations.length === 0
          ) {
            await seedEventNetworkSamples({ event: eventSlug });
            await loadEventNetwork(nextPassword, eventSlug);
          }
        }),
      );
    } else {
      setEventRegistrations([]);
      setEventDatabase(null);
    }
    if (selectedEvent.products.wordcloud.enabled) {
      tasks.push(loadWordcloud(nextPassword, eventSlug));
    } else {
      setWordcloudQuestions([]);
      setWordcloudAnswers([]);
      setWordcloudResults(null);
      setWordcloudDatabase(null);
    }
    if (selectedEvent.products.five.enabled) {
      tasks.push(loadFive(nextPassword, eventSlug));
    } else {
      setFiveData(null);
    }

    const results = await Promise.allSettled(tasks);
    const failed = results.filter((result) => result.status === "rejected").length;
    if (failed) throw new Error(`${failed} etkinlik ürünü yüklenemedi.`);
  };

  const selectEventRegistryItem = (event: NotworkEvent) => {
    setEventRegistryMessage("");
    setEventEditor(eventToEditorDraft(event));
  };

  const saveEventRegistryItem = async () => {
    setEventRegistryLoading(true);
    setEventRegistryMessage("");
    try {
      const data = await updateEventRegistry(password, {
        action: eventEditor.id ? "update" : "create",
        eventId: eventEditor.id || undefined,
        expectedRevision: eventEditor.id ? eventEditor.revision : undefined,
        event: eventEditorPayload(eventEditor),
      });
      applyEventRegistry(data, data.selectedEvent?.id);
      setEventRegistryMessage(eventEditor.id ? "Etkinlik güncellendi." : "Etkinlik oluşturuldu.");
    } catch (caught) {
      setEventRegistryMessage(caught instanceof Error ? caught.message : "Etkinlik kaydedilemedi.");
    } finally {
      setEventRegistryLoading(false);
    }
  };

  const setPrimaryEventRegistryItem = async () => {
    if (!eventEditor.id) return;
    setEventRegistryLoading(true);
    setEventRegistryMessage("");
    try {
      const data = await updateEventRegistry(password, {
        action: "setPrimary",
        eventId: eventEditor.id,
      });
      applyEventRegistry(data, eventEditor.id);
      setEventRegistryMessage("Ana etkinlik girişi güncellendi.");
    } catch (caught) {
      setEventRegistryMessage(
        caught instanceof Error ? caught.message : "Ana etkinlik değiştirilemedi.",
      );
    } finally {
      setEventRegistryLoading(false);
    }
  };

  const archiveEventRegistryItem = async () => {
    if (!eventEditor.id) return;
    setEventRegistryLoading(true);
    setEventRegistryMessage("");
    try {
      const data = await updateEventRegistry(password, {
        action: "archive",
        eventId: eventEditor.id,
        expectedRevision: eventEditor.revision,
      });
      applyEventRegistry(data, eventEditor.id);
      setEventRegistryMessage("Etkinlik ve ürünleri arşivlendi; veriler silinmedi.");
    } catch (caught) {
      setEventRegistryMessage(caught instanceof Error ? caught.message : "Etkinlik arşivlenemedi.");
    } finally {
      setEventRegistryLoading(false);
    }
  };

  const loadStartupApplications = async (nextPassword = password) => {
    const response = await fetch("/api/startup-applications?action=list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: nextPassword }),
    });
    if (!response.ok) throw new Error("Startup başvuruları alınamadı.");
    const data = (await response.json()) as { applications: StartupApplication[] };
    setStartupApplications(data.applications);
  };

  const loadMemberProfiles = async (nextPassword = password) => {
    const response = await fetch("/api/admin/member-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: nextPassword, action: "list" }),
    });
    if (!response.ok) throw new Error("Üye profilleri alınamadı.");
    const data = (await response.json()) as MemberProfilesAdminPayload;
    setMemberProfiles(data.profiles);
    setMemberReferences(data.references || []);
  };

  const memberProfileAction = async (action: "syncMembers" | "issueCredentials") => {
    setProfileMessage("");
    setTemporaryCredentials([]);
    const response = await fetch("/api/admin/member-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action }),
    });
    if (!response.ok) {
      setProfileMessage(await response.text());
      return;
    }
    const data = (await response.json()) as MemberProfilesAdminPayload;
    setMemberProfiles(data.profiles);
    setMemberReferences(data.references || []);
    setTemporaryCredentials(data.credentials || []);
    setProfileMessage(
      action === "syncMembers"
        ? `${data.syncedCount || 0} doğrulanmış etkinlik üyesi profil sistemine eşitlendi.`
        : `${data.credentials?.length || 0} geçici şifre üretildi. Bu liste yalnızca şu anda gösterilir.`,
    );
  };

  const moderateMemberReference = async (
    reference: NotworkMemberReference,
    referenceStatus: "approved" | "rejected",
  ) => {
    setProfileMessage("");
    const response = await fetch("/api/admin/member-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        action: "moderateReference",
        targetUsername: reference.targetUsername,
        authorUsername: reference.authorUsername,
        referenceStatus,
      }),
    });
    if (!response.ok) {
      setProfileMessage(await response.text());
      return;
    }
    const data = (await response.json()) as MemberProfilesAdminPayload;
    setMemberProfiles(data.profiles);
    setMemberReferences(data.references || []);
    setProfileMessage(
      referenceStatus === "approved" ? "Referans yayınlandı." : "Referans reddedildi.",
    );
  };

  const moderateMemberProfile = async (
    profile: NotworkMemberProfile,
    profileStatus: "approved" | "rejected",
  ) => {
    setProfileMessage("");
    const response = await fetch("/api/admin/member-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        action: "moderateProfile",
        targetUsername: profile.username,
        profileStatus,
      }),
    });
    if (!response.ok) {
      setProfileMessage(await response.text());
      return;
    }
    const data = (await response.json()) as MemberProfilesAdminPayload;
    setMemberProfiles(data.profiles);
    setMemberReferences(data.references || []);
    setProfileMessage(
      profileStatus === "approved"
        ? `${profile.name} üyeliğe onaylandı.`
        : `${profile.name} başvurusu reddedildi.`,
    );
  };

  const resetMemberPassword = async (profile: NotworkMemberProfile) => {
    setProfileMessage("");
    setTemporaryCredentials([]);
    const response = await fetch("/api/admin/member-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        action: "resetCredential",
        targetUsername: profile.username,
      }),
    });
    if (!response.ok) {
      setProfileMessage(await response.text());
      return;
    }
    const data = (await response.json()) as MemberProfilesAdminPayload;
    setMemberProfiles(data.profiles);
    setMemberReferences(data.references || []);
    setTemporaryCredentials(data.credentials || []);
    setProfileMessage(
      `${profile.name} için yeni geçici şifre üretildi. CSV dosyasını şimdi indir.`,
    );
  };

  const seedEventNetwork = async () => {
    setNetworkMessage("");
    try {
      await seedEventNetworkSamples(selectedToolsEventSelection);
      await loadEventNetwork(password, selectedToolsEventSlug);
      setNetworkMessage(
        `${selectedToolsEvent?.shortTitle || "Etkinlik"} demo test verisi oluşturuldu.`,
      );
    } catch (caught) {
      setNetworkMessage(caught instanceof Error ? caught.message : "Demo test verisi eklenemedi.");
    }
  };

  const resetEventNetwork = async () => {
    setNetworkMessage("");
    try {
      const data = await resetEventNetworkDemo(password, selectedToolsEventSelection);
      setEventRegistrations(data.registrations);
      setEventDatabase(data.database || null);
      setNetworkMessage(
        `${selectedToolsEvent?.shortTitle || "Etkinlik"} MatchLab demo verisi sıfırlandı.`,
      );
    } catch (caught) {
      setNetworkMessage(caught instanceof Error ? caught.message : "Demo verisi sıfırlanamadı.");
    }
  };

  const wordcloudAction = async (
    payload:
      | { action: "saveQuestion"; question: Partial<WordcloudQuestion> }
      | { action: "deleteQuestion"; questionId: string }
      | { action: "toggleAnswer"; answerId: string; isVisible: boolean }
      | { action: "resetDemo" }
      | { action: "seedLoadTest" },
  ) => {
    setWordcloudMessage("");
    try {
      const data = await updateWordcloudAdmin(password, payload, selectedToolsEventSelection);
      setWordcloudQuestions(data.questions);
      setWordcloudAnswers(data.answers);
      setWordcloudResults(data.results);
      setWordcloudDatabase(data.database || null);
      setWordcloudDraft(blankWordcloudQuestion);
      setWordcloudMessage(
        payload.action === "seedLoadTest"
          ? "100 kişilik WordCloud test verisi oluşturuldu."
          : payload.action === "resetDemo"
            ? "WordCloud demo verisi sıfırlandı."
            : "WordCloud güncellendi.",
      );
    } catch (caught) {
      setWordcloudMessage(caught instanceof Error ? caught.message : "WordCloud güncellenemedi.");
    }
  };

  const fiveAction = async (action: "seedDemo" | "resetDemo") => {
    setFiveMessage("");
    try {
      const data = await updateFiveAdmin(password, action, selectedToolsEventSelection);
      setFiveData(data);
      setFiveMessage(
        action === "seedDemo"
          ? "ntw.five demo verisi hazırlandı."
          : "ntw.five demo verisi sıfırlandı.",
      );
    } catch (caught) {
      setFiveMessage(caught instanceof Error ? caught.message : "ntw.five güncellenemedi.");
    }
  };

  const networkAction = async (
    action: "create" | "update" | "delete" | "approve" | "reject",
    payload: Record<string, unknown> = {},
  ) => {
    setNetworkMessage("");
    const response = await fetch("/api/networking/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action, ...payload }),
    });
    if (!response.ok) {
      setNetworkMessage(await response.text());
      return;
    }
    const data = (await response.json()) as { members: NetworkMember[]; requests: ChangeRequest[] };
    setMembers(data.members);
    setRequests(data.requests);
    setMemberDraft(blankMember);
    setEditingUsername("");
    setNetworkMessage("İşlem tamamlandı.");
  };

  const applyAnalyticsData = (data: AnalyticsAdminResponse) => {
    setEvents(Array.isArray(data.events) ? data.events : []);
    setDailySummaries(Array.isArray(data.summaries) ? data.summaries : []);
    setAnalyticsCoverage(data.coverage || null);
    setMissingAnalyticsDays(Array.isArray(data.missingDays) ? data.missingDays : []);
  };

  const fetchAnalytics = async (nextDays: number) => {
    const response = await fetch("/api/analytics/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, days: nextDays }),
    });
    if (response.status === 401) throw new Error("Şifre yanlış.");
    if (!response.ok) throw new Error("Rapor şu anda alınamadı.");
    const data = (await response.json()) as Partial<AnalyticsAdminResponse>;
    if (data.schemaVersion !== 2 || !Array.isArray(data.summaries) || !data.coverage) {
      throw new Error(
        "Analytics servisi eski sürümde çalışıyor. Son Netlify deploy'unu kontrol edip tekrar dene.",
      );
    }
    return data as AnalyticsAdminResponse;
  };

  const backfillAnalytics = (daysToPrepare: string[]) => {
    if (!daysToPrepare.length || backfillRunningRef.current) return;
    backfillRunningRef.current = true;
    setBackfillProgress({ running: true, completed: 0, total: daysToPrepare.length, failed: 0 });

    void (async () => {
      let completed = 0;
      let failed = 0;
      let nextMissingDays: string[] = [];
      try {
        for (let index = 0; index < daysToPrepare.length; index += 2) {
          const batch = daysToPrepare.slice(index, index + 2);
          const results = await Promise.allSettled(
            batch.map(async (day) => {
              const response = await fetch("/api/analytics/rollup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, day }),
              });
              if (!response.ok) throw new Error(await response.text());
            }),
          );
          completed += batch.length;
          failed += results.filter((result) => result.status === "rejected").length;
          setBackfillProgress({
            running: true,
            completed,
            total: daysToPrepare.length,
            failed,
          });
        }

        const refreshed = await fetchAnalytics(selectedDaysRef.current);
        applyAnalyticsData(refreshed);
        nextMissingDays = failed === 0 ? refreshed.missingDays : [];
        if (failed > 0) {
          setError(
            `${failed} günlük geçmiş veri hazırlanamadı. Analiz sekmesindeki tekrar dene butonunu kullanabilirsin.`,
          );
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Geçmiş analiz hazırlanamadı.");
      } finally {
        backfillRunningRef.current = false;
        setBackfillProgress((current) => ({ ...current, running: false }));
        if (nextMissingDays.length) backfillAnalytics(nextMissingDays);
      }
    })();
  };

  const loadReport = async (nextDays = days) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAnalytics(nextDays);
      applyAnalyticsData(data);
      selectedDaysRef.current = nextDays;
      setDays(nextDays);
      backfillAnalytics(data.missingDays);
      let registryEvents = eventRegistry;
      let failedLoads = 0;
      try {
        const registryData = await loadEventRegistry(password);
        registryEvents = registryData.events;
      } catch {
        failedLoads += 1;
      }
      const auxiliaryLoads = await Promise.allSettled([
        loadNetwork(password),
        loadSelectedEventTools(selectedToolsEventSlug, password, registryEvents),
        loadStartupApplications(password),
        loadMemberProfiles(password),
      ]);
      failedLoads += auxiliaryLoads.filter((result) => result.status === "rejected").length;
      if (failedLoads > 0) {
        setError(
          `Analiz yüklendi; ${failedLoads} ek admin modülü geçici olarak yüklenemedi. Sekmelerden tekrar deneyebilirsin.`,
        );
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Rapor alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const report = useMemo(
    () => buildReport(events || [], dailySummaries, days),
    [events, dailySummaries, days],
  );
  const eventPageReport = useMemo(
    () => buildEventPageReport(dailySummaries, selectedEventAnalyticsPath, days),
    [dailySummaries, selectedEventAnalyticsPath, days],
  );

  if (events === null) {
    return (
      <main
        data-analytics-ignore
        className="grid min-h-screen place-items-center bg-background px-5 text-foreground"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void loadReport();
          }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg"
        >
          <a href="/" className="font-brand text-2xl">
            notwork
          </a>
          <h1 className="mt-8 text-2xl font-black">Admin paneli</h1>
          <p className="mt-2 text-sm text-foreground/55">
            Trafik, dönüşüm ve networking kayıtlarını yönetmek için şifreni gir.
          </p>
          <label className="mt-6 block text-xs text-foreground/60">
            Şifre
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "giriş yapılıyor…" : "giriş yap"}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main data-analytics-ignore className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-brand text-2xl">notwork</div>
            <h1 className="mt-2 text-3xl font-black">Admin paneli</h1>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
              {adminUiVersion}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => void loadReport(range)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                  days === range
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                }`}
              >
                {range} gün
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setEvents(null);
                setDailySummaries([]);
                setAnalyticsCoverage(null);
                setMissingAnalyticsDays([]);
                setEventRegistry([]);
                setEventRegistryInfo(null);
                setEventEditor(blankEventEditorDraft());
                setPassword("");
              }}
              className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold"
            >
              çıkış
            </button>
          </div>
        </header>

        <nav className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveAdminTab(tab.id)}
              className={`rounded-[1.5rem] border p-4 text-left transition ${
                activeAdminTab === tab.id
                  ? "border-primary/50 bg-primary/12 shadow-[0_18px_50px_rgba(143,203,208,0.18)]"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span className="text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
                Sekme
              </span>
              <span className="mt-1 block text-xl font-black">{tab.label}</span>
              <span className="mt-1 block text-sm text-foreground/50">{tab.description}</span>
            </button>
          ))}
        </nav>

        {error ? (
          <div className="mt-5 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {error}
          </div>
        ) : null}

        <div className={activeAdminTab === "events" ? "" : "hidden"}>
          <EventRegistryAdmin
            events={eventRegistry}
            registry={eventRegistryInfo}
            draft={eventEditor}
            message={eventRegistryMessage}
            loading={eventRegistryLoading}
            setDraft={setEventEditor}
            selectEvent={selectEventRegistryItem}
            createEvent={() => {
              setEventRegistryMessage("");
              setEventEditor(blankEventEditorDraft());
            }}
            refresh={() => loadEventRegistry(password, eventEditor.id)}
            saveEvent={saveEventRegistryItem}
            setPrimaryEvent={setPrimaryEventRegistryItem}
            archiveEvent={archiveEventRegistryItem}
          />
        </div>

        <section
          className={`mt-6 rounded-[2rem] border border-primary/25 bg-primary/10 p-5 ${
            activeAdminTab === "eventTools" ? "" : "hidden"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-primary-deep">
                Etkinlik ürün verileri
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">
                {selectedToolsEvent?.title || "Etkinlik seç"}
              </h2>
              <p className="mt-1 text-sm text-foreground/60">
                MatchLab, WordCloud ve ntw.five verilerini aynı panelden yönet.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedToolsEvent
                  ? eventProductKeys.map((product) => (
                      <span
                        key={product}
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          selectedToolsEvent.products[product].enabled
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-background/70 text-foreground/40"
                        }`}
                      >
                        {selectedToolsEvent.products[product].label} ·{" "}
                        {selectedToolsEvent.products[product].enabled ? "aktif" : "kapalı"}
                      </span>
                    ))
                  : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={withEventSelection("/linkler", selectedToolsEventSelection)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-primary/30 bg-background px-4 py-2 text-sm font-bold"
              >
                Linkler girişini aç
              </a>
              <button
                type="button"
                onClick={() =>
                  void loadSelectedEventTools(selectedToolsEventSlug, password, eventRegistry)
                }
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                <RefreshCcw size={15} /> verileri yenile
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {eventToolsSlugs.map((eventSlug) => {
              const item = eventRegistry.find((event) => event.slug === eventSlug);
              if (!item) return null;
              const isActive = eventSlug === selectedToolsEventSlug;
              return (
                <button
                  key={eventSlug}
                  type="button"
                  onClick={() => {
                    setSelectedToolsEventSlug(eventSlug);
                    void loadSelectedEventTools(eventSlug, password, eventRegistry);
                  }}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    isActive
                      ? "border-primary bg-background shadow-[0_16px_40px_rgba(143,203,208,0.22)]"
                      : "border-primary/20 bg-background/55 hover:border-primary/50"
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
                    Etkinlik
                  </span>
                  <span className="mt-1 block text-xl font-black">{item.shortTitle}</span>
                  <span className="mt-1 block text-sm text-foreground/50">
                    {eventProductKeys
                      .filter((product) => item.products[product].enabled)
                      .map((product) => item.products[product].label)
                      .join(" · ") || "Ürün kapalı"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          className={`mt-7 overflow-hidden rounded-[2rem] border border-primary/25 bg-[radial-gradient(circle_at_top_left,rgba(143,203,208,0.22),transparent_34%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--background)))] p-5 shadow-[var(--shadow-card)] ${
            activeAdminTab === "analytics" ? "" : "hidden"
          }`}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary-deep">
                notwork analytics
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                Trafik komuta merkezi
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-foreground/60">
                Ziyaret, bilet tıklaması, buton davranışı ve sayfada geçirilen süreyi tek ekranda
                takip et.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm">
              <span className="text-foreground/45">Tarih aralığı</span>
              <div className="font-black">{days} gün</div>
            </div>
          </div>
          {analyticsCoverage ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-background/75 p-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
                  Veri kapsamı
                </div>
                <p className="mt-1 text-sm font-bold">
                  {formatAnalyticsDate(analyticsCoverage.from)} –{" "}
                  {formatAnalyticsDate(analyticsCoverage.to)}
                </p>
                <p className="mt-1 text-xs text-foreground/55">
                  {backfillProgress.running
                    ? `Geçmiş veriler hazırlanıyor: ${backfillProgress.completed}/${backfillProgress.total} gün`
                    : missingAnalyticsDays.length
                      ? `${missingAnalyticsDays.length} aktif gün henüz hazırlanmadı.`
                      : `${analyticsCoverage.activityDays} aktif gün eksiksiz raporlanıyor.`}
                </p>
              </div>
              {backfillProgress.running ? (
                <div className="w-full max-w-xs">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{
                        width: `${Math.round(
                          (backfillProgress.completed / Math.max(1, backfillProgress.total)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                  {backfillProgress.failed > 0 ? (
                    <p className="mt-1 text-right text-xs text-destructive">
                      {backfillProgress.failed} gün tekrar denenecek
                    </p>
                  ) : null}
                </div>
              ) : missingAnalyticsDays.length ? (
                <button
                  type="button"
                  onClick={() => backfillAnalytics(missingAnalyticsDays)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground"
                >
                  <RefreshCcw size={14} /> geçmiş veriyi hazırla
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-2 text-xs font-black text-primary-deep">
                  <Check size={14} /> eksiksiz
                </span>
              )}
            </div>
          ) : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Metric icon={Users} label="Oturum" value={report.sessions} />
            <Metric icon={Eye} label="Sayfa görüntüleme" value={report.pageViews} />
            <Metric icon={Ticket} label="Bilet tıklaması" value={report.ticketClicks} highlight />
            <Metric
              icon={BarChart3}
              label="Bilet dönüşümü"
              value={`%${report.conversion}`}
              highlight
            />
            <Metric icon={MousePointerClick} label="Toplam tıklama" value={report.clicks} />
            <Metric icon={Activity} label="Ort. süre" value={`${report.averageTime} sn`} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Metric
              icon={Ticket}
              label="17 Eylül etkinlik tıklaması"
              value={report.ticketClicksByEvent.september17}
              highlight
            />
            <Metric
              icon={Ticket}
              label="9 Ekim etkinlik tıklaması"
              value={report.ticketClicksByEvent.october9}
              highlight
            />
          </div>
          <details className="mt-3 rounded-2xl border border-border bg-background px-4 py-3">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-foreground/55">
              Geçmiş etkinlik verileri
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Metric
                icon={Ticket}
                label="14 Temmuz bilet tıklaması"
                value={report.ticketClicksByEvent.july14}
              />
              <Metric
                icon={Ticket}
                label="21 Ağustos bilet tıklaması"
                value={report.ticketClicksByEvent.august21}
              />
            </div>
          </details>
        </section>

        <section
          className={`mt-6 overflow-hidden rounded-[2rem] border border-border bg-card p-5 ${
            activeAdminTab === "analytics" ? "" : "hidden"
          }`}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                Etkinlik sayfası analizi
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
                Sayfa ve bilet performansı
              </h2>
              <p className="mt-1 text-sm text-foreground/55">
                Etkinliği değiştir; grafikler ve buton verileri seçilen sayfaya göre güncellensin.
              </p>
            </div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {eventPageAnalyticsOptions.map((option) => (
                <button
                  key={option.path}
                  type="button"
                  onClick={() => setSelectedEventAnalyticsPath(option.path)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${
                    selectedEventAnalyticsPath === option.path
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric icon={Eye} label="Sayfa görüntüleme" value={eventPageReport.pageViews} />
            <Metric icon={Users} label="Tekil oturum" value={eventPageReport.sessions} />
            <Metric
              icon={Ticket}
              label="Bilet tıklaması"
              value={eventPageReport.ticketClicks}
              highlight
            />
            <Metric
              icon={BarChart3}
              label="Bilet dönüşümü"
              value={`%${eventPageReport.conversion}`}
              highlight
            />
            <Metric icon={Activity} label="Ort. süre" value={`${eventPageReport.averageTime} sn`} />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <ChartCard
              title="Etkinlik sayfası trafik grafiği"
              description={`${days} günlük seçili sayfa görünümü`}
            >
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={eventPageReport.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    minTickGap={28}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))" }} />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    name="Sayfa"
                    stroke="#2f9aa5"
                    fill="#8fcbd055"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="ticketClicks"
                    name="Bilet"
                    stroke="#d4af37"
                    fill="transparent"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ReportList title="Bu sayfadaki butonlar" rows={eventPageReport.buttonActions} />
          </div>
        </section>

        <section
          className={`mt-6 grid gap-5 xl:grid-cols-[1.3fr_0.7fr] ${
            activeAdminTab === "analytics" ? "" : "hidden"
          }`}
        >
          <ChartCard
            title="Günlük trafik akışı"
            description="Sayfa görüntüleme, oturum ve bilet ilgisi"
          >
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={report.timeline}>
                <defs>
                  <linearGradient id="views" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8fcbd0" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#8fcbd0" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="tickets" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  minTickGap={28}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))" }} />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  name="Sayfa"
                  stroke="#2f9aa5"
                  fill="url(#views)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  name="Oturum"
                  stroke="#6a7ee8"
                  fill="transparent"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="ticketClicks"
                  name="Bilet"
                  stroke="#d4af37"
                  fill="url(#tickets)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cihaz dağılımı" description="Mobil / tablet / desktop kırılımı">
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={report.devices}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={4}
                >
                  {report.devices.map((entry, index) => (
                    <Cell
                      key={entry.label}
                      fill={["#8fcbd0", "#d4af37", "#6a7ee8", "#ef7b7b"][index % 4]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid gap-2">
              {report.devices.map((device) => (
                <div
                  key={device.label}
                  className="flex justify-between rounded-xl bg-muted/50 px-3 py-2 text-xs"
                >
                  <span>{device.label}</span>
                  <strong>{device.value}</strong>
                </div>
              ))}
            </div>
          </ChartCard>
        </section>

        <section
          className={`mt-6 grid gap-5 xl:grid-cols-3 ${
            activeAdminTab === "analytics" ? "" : "hidden"
          }`}
        >
          <ChartCard title="Buton takip paneli" description="En çok tıklanan CTA ve linkler">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={report.buttonActions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 14, borderColor: "hsl(var(--border))" }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#8fcbd0" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ReportList title="En çok görüntülenen sayfalar" rows={report.topPages} />
          <ReportList title="Trafik kaynakları" rows={report.sources} />
        </section>

        <section
          className={`mt-6 grid gap-5 lg:grid-cols-2 ${
            activeAdminTab === "analytics" ? "" : "hidden"
          }`}
        >
          <ActionTable title="Son buton ve CTA tıklamaları" events={report.buttonEvents} />
          <ActionTable
            title="Son form ve networking aksiyonları"
            events={report.formAndNetworkEvents}
          />
        </section>

        <section
          className={`mt-6 grid gap-5 lg:grid-cols-2 ${
            activeAdminTab === "analytics" ? "" : "hidden"
          }`}
        >
          <ReportList title="En çok kullanılan aksiyonlar" rows={report.topActions} />
          <ReportList title="Kaydırma derinliği" rows={report.scrollDepth} suffix=" ulaşım" />
        </section>

        <div className={activeAdminTab === "eventTools" ? "" : "hidden"}>
          {selectedToolsEvent?.products.wordcloud.enabled ? (
            <WordcloudAdmin
              eventTitle={selectedToolsEvent.shortTitle}
              selection={selectedToolsEventSelection}
              questions={wordcloudQuestions}
              answers={wordcloudAnswers}
              results={wordcloudResults}
              database={wordcloudDatabase}
              draft={wordcloudDraft}
              message={wordcloudMessage}
              setDraft={setWordcloudDraft}
              refresh={() => loadWordcloud(password, selectedToolsEventSlug)}
              wordcloudAction={wordcloudAction}
            />
          ) : null}

          {selectedToolsEvent?.products.matchlab.enabled ? (
            <EventNetworkAdmin
              eventTitle={selectedToolsEvent.shortTitle}
              selection={selectedToolsEventSelection}
              registrations={eventRegistrations}
              database={eventDatabase}
              message={networkMessage}
              refresh={() => loadEventNetwork(password, selectedToolsEventSlug)}
              seedSamples={seedEventNetwork}
              resetDemo={resetEventNetwork}
            />
          ) : null}

          {selectedToolsEvent?.products.five.enabled ? (
            <FiveAdmin
              eventTitle={selectedToolsEvent.shortTitle}
              selection={selectedToolsEventSelection}
              data={fiveData}
              message={fiveMessage}
              refresh={() => loadFive(password, selectedToolsEventSlug)}
              runAction={fiveAction}
            />
          ) : null}

          {selectedToolsEvent &&
          eventProductKeys.every((product) => !selectedToolsEvent.products[product].enabled) ? (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-foreground/55">
              Bu etkinlik için henüz aktif bir ürün yok. Etkinlikler sekmesinden ürün açabilirsin.
            </div>
          ) : null}
        </div>

        <div className={activeAdminTab === "networking" ? "" : "hidden"}>
          <NetworkingAdmin
            members={members}
            requests={requests}
            draft={memberDraft}
            editingUsername={editingUsername}
            message={networkMessage}
            setDraft={setMemberDraft}
            setEditingUsername={setEditingUsername}
            networkAction={networkAction}
          />
        </div>

        <div className={activeAdminTab === "profiles" ? "" : "hidden"}>
          <MemberProfilesAdmin
            profiles={memberProfiles}
            references={memberReferences}
            credentials={temporaryCredentials}
            message={profileMessage}
            refresh={() => loadMemberProfiles(password)}
            syncMembers={() => memberProfileAction("syncMembers")}
            issueCredentials={() => memberProfileAction("issueCredentials")}
            moderateProfile={moderateMemberProfile}
            resetPassword={resetMemberPassword}
            moderateReference={moderateMemberReference}
          />
        </div>

        <div className={activeAdminTab === "applications" ? "" : "hidden"}>
          <StartupApplicationsAdmin
            applications={startupApplications}
            refresh={() => loadStartupApplications(password)}
          />
        </div>

        <section
          className={`mt-6 overflow-hidden rounded-2xl border border-border bg-card ${
            activeAdminTab === "analytics" ? "" : "hidden"
          }`}
        >
          <div className="border-b border-border px-5 py-4 font-bold">Son 100 aksiyon</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/60 text-xs text-foreground/50">
                <tr>
                  <th className="px-4 py-3">Zaman</th>
                  <th className="px-4 py-3">Aksiyon</th>
                  <th className="px-4 py-3">Sayfa</th>
                  <th className="px-4 py-3">Detay</th>
                  <th className="px-4 py-3">Cihaz</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 100).map((event) => (
                  <tr key={event.id} className="border-t border-border/70">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground/50">
                      {new Date(event.timestamp).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {eventNames[event.type] || event.type}
                    </td>
                    <td className="px-4 py-3">{event.path}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-foreground/60">
                      {event.label ||
                        (event.value
                          ? `${event.value}${event.type === "page_time" ? " sn" : "%"}`
                          : "—")}
                    </td>
                    <td className="px-4 py-3 text-foreground/50">{event.device || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function StartupApplicationsAdmin({
  applications,
  refresh,
}: {
  applications: StartupApplication[];
  refresh: () => Promise<void>;
}) {
  const notificationLabels: Record<StartupApplication["notification"]["status"], string> = {
    sent: "mail gönderildi",
    not_configured: "mail servisi ayarlı değil",
    failed: "mail gönderilemedi",
  };

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-xl font-black">Network Startup başvuruları</h2>
          <p className="mt-1 text-sm text-foreground/50">
            Formdan gelen projeler burada tutulur; bildirimler Berk maillerine gönderilir.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          <RefreshCcw size={14} /> yenile
        </button>
      </div>

      <div className="grid gap-3 border-b border-border bg-muted/35 p-5 md:grid-cols-3">
        <Metric icon={Users} label="Toplam başvuru" value={applications.length} highlight />
        <Metric
          icon={Check}
          label="Mail bildirimi giden"
          value={applications.filter((item) => item.notification.status === "sent").length}
        />
        <Metric
          icon={Eye}
          label="Bekleyen / panelde"
          value={applications.filter((item) => item.notification.status !== "sent").length}
        />
      </div>

      <div className="grid gap-4 p-5">
        {applications.map((application) => (
          <article
            key={application.id}
            className="rounded-2xl border border-border bg-background p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs text-foreground/45">
                  {new Date(application.createdAt).toLocaleString("tr-TR")}
                </div>
                <h3 className="mt-1 text-lg font-black">
                  {application.projectName || "İsimsiz proje"}
                </h3>
                <p className="mt-1 text-sm font-bold">
                  {application.name} ·{" "}
                  <a className="text-primary-deep underline" href={`mailto:${application.email}`}>
                    {application.email}
                  </a>
                </p>
                {application.phone ? (
                  <p className="mt-1 text-sm text-foreground/55">{application.phone}</p>
                ) : null}
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary-deep">
                {application.stage}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-muted/60 p-3">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-foreground/45">
                  Proje özeti
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground/70">
                  {application.projectSummary}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-foreground/45">
                  Aradığı destek
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground/70">
                  {application.need || "Belirtilmedi."}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-foreground/50">
              <span>
                Bildirim:{" "}
                <strong className="text-foreground">
                  {notificationLabels[application.notification.status]}
                </strong>
              </span>
              <span>{application.notification.recipients.join(" / ")}</span>
            </div>
            {application.notification.error ? (
              <p className="mt-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                {application.notification.error}
              </p>
            ) : null}
          </article>
        ))}

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-foreground/45">
            Henüz Network Startup başvurusu yok.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function downloadTemporaryCredentials(credentials: TemporaryMemberCredential[]) {
  const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    ["ad soyad", "eposta", "kullanıcı adı", "geçici şifre"],
    ...credentials.map((credential) => [
      credential.name,
      credential.email,
      credential.username,
      credential.temporaryPassword,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `notwork-gecici-uyelik-sifreleri-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function MemberProfilesAdmin({
  profiles,
  references,
  credentials,
  message,
  refresh,
  syncMembers,
  issueCredentials,
  moderateProfile,
  resetPassword,
  moderateReference,
}: {
  profiles: NotworkMemberProfile[];
  references: NotworkMemberReference[];
  credentials: TemporaryMemberCredential[];
  message: string;
  refresh: () => Promise<void>;
  syncMembers: () => Promise<void>;
  issueCredentials: () => Promise<void>;
  moderateProfile: (
    profile: NotworkMemberProfile,
    status: "approved" | "rejected",
  ) => Promise<void>;
  resetPassword: (profile: NotworkMemberProfile) => Promise<void>;
  moderateReference: (
    reference: NotworkMemberReference,
    status: "approved" | "rejected",
  ) => Promise<void>;
}) {
  const verifiedCount = profiles.filter((profile) => profile.verifiedMember).length;
  const issuedCount = profiles.filter((profile) => profile.credentialIssuedAt).length;
  const publicCount = profiles.filter((profile) => profile.publicProfileEnabled).length;
  const pendingProfileCount = profiles.filter((profile) => profile.status === "pending").length;
  const eventQrProfiles = profiles.filter((profile) => profile.membershipSource === "event-qr");
  const pendingReferenceCount = references.filter(
    (reference) => reference.status === "pending",
  ).length;
  const profileNames = new Map(profiles.map((profile) => [profile.username, profile.name]));

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
            <ShieldCheck size={16} /> Notwork Profile
          </div>
          <h2 className="mt-2 text-2xl font-black">Üye profilleri ve başvurular</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground/55">
            Normal profil başvurularını buradan onayla. Etkinlik alanındaki özel QR akışından kayıt
            olan katılımcılar otomatik doğrulanır ve ayrı kategoride görünür.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-bold"
        >
          <RefreshCcw size={14} /> yenile
        </button>
      </div>

      <div className="grid gap-3 border-b border-border bg-muted/35 p-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <Metric icon={Users} label="Profil kaydı" value={profiles.length} highlight />
        <Metric icon={ShieldCheck} label="Onay bekleyen profil" value={pendingProfileCount} />
        <Metric icon={ShieldCheck} label="Doğrulanmış etkinlik üyesi" value={verifiedCount} />
        <Metric icon={Ticket} label="Etkinlik QR üyesi" value={eventQrProfiles.length} />
        <Metric icon={KeyRound} label="Geçici şifre atanmış" value={issuedCount} />
        <Metric icon={Eye} label="Yayındaki business kart" value={publicCount} />
        <Metric
          icon={MessageSquareQuote}
          label="Onay bekleyen referans"
          value={pendingReferenceCount}
        />
      </div>

      <div className="border-b border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-primary-deep">
              Otomatik doğrulanan üyeler
            </div>
            <h3 className="mt-1 text-lg font-black">Etkinlik QR katılımcıları</h3>
            <p className="mt-1 text-xs leading-5 text-foreground/50">
              Etkinlik girişindeki özel kayıt akışından gelenler admin onayı beklemez.
            </p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-black text-primary-deep">
            {eventQrProfiles.length} üye
          </span>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {eventQrProfiles.slice(0, 20).map((profile) => (
            <div
              key={profile.id}
              className="min-w-[220px] rounded-2xl border border-primary/20 bg-primary/5 p-3"
            >
              <div className="font-black">{profile.name}</div>
              <div className="mt-1 text-xs text-foreground/50">@{profile.username}</div>
              <div className="mt-2 text-[11px] font-bold text-primary-deep">
                {profile.autoApprovedEventId || profile.attendedEvents.at(-1) || "etkinlik"}
              </div>
            </div>
          ))}
          {eventQrProfiles.length === 0 ? (
            <p className="rounded-2xl bg-muted/60 px-4 py-3 text-sm font-semibold text-foreground/45">
              Henüz etkinlik QR kaydı yok.
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-b border-border p-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void syncMembers()}
            className="rounded-full bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground"
          >
            etkinlik üyelerini eşitle
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Yalnızca henüz şifresi olmayan doğrulanmış üyeler için geçici şifre üretilecek. Devam edilsin mi?",
                )
              ) {
                void issueCredentials();
              }
            }}
            disabled={verifiedCount === 0}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-black disabled:opacity-40"
          >
            <KeyRound size={16} /> geçici şifreleri üret
          </button>
          {credentials.length > 0 ? (
            <button
              type="button"
              onClick={() => downloadTemporaryCredentials(credentials)}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-black text-background"
            >
              CSV indir · {credentials.length} üye
            </button>
          ) : null}
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-primary-deep">{message}</p> : null}
        {credentials.length > 0 ? (
          <p className="mt-2 text-xs font-semibold text-destructive">
            Bu şifre listesi sayfa yenilenince kaybolur. CSV dosyasını şimdi indir ve güvenli tut.
          </p>
        ) : null}
      </div>

      <div className="border-b border-border p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-primary-deep">
              Üyelik başvuruları
            </div>
            <h3 className="mt-1 text-lg font-black">Admin onay kuyruğu</h3>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-black text-primary-deep">
            {pendingProfileCount} bekliyor
          </span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {profiles
            .filter((profile) => profile.status === "pending")
            .map((profile) => (
              <article
                key={profile.id}
                className="rounded-2xl border border-primary/25 bg-primary/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{profile.name}</div>
                    <div className="mt-1 text-xs font-semibold text-foreground/50">
                      @{profile.username} · {profile.email}
                    </div>
                  </div>
                  <span className="rounded-full bg-background px-3 py-1 text-[11px] font-black">
                    {profile.registration?.attendedEventClaim === "referral"
                      ? "üye referansı"
                      : profile.registration?.attendedEventClaim || "etkinlik belirtilmedi"}
                  </span>
                </div>
                {profile.registration?.referrer ? (
                  <p className="mt-3 rounded-xl bg-background p-3 text-xs font-semibold">
                    Referans: {profile.registration.referrer}
                  </p>
                ) : null}
                <div className="mt-3 space-y-2 text-xs leading-5 text-foreground/65">
                  <p>
                    <strong>Kendini tanıt:</strong> {profile.registration?.introduction}
                  </p>
                  <p>
                    <strong>Aradığı:</strong> {profile.registration?.lookingFor}
                  </p>
                  <p>
                    <strong>Katkısı:</strong> {profile.registration?.canHelpWith}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void moderateProfile(profile, "approved")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-black text-primary-foreground"
                  >
                    <Check size={14} /> üyeliği onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => void moderateProfile(profile, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-black"
                  >
                    <X size={14} /> reddet
                  </button>
                </div>
              </article>
            ))}
        </div>
        {pendingProfileCount === 0 ? (
          <p className="mt-4 rounded-2xl bg-muted/60 p-4 text-sm font-semibold text-foreground/45">
            Onay bekleyen profil başvurusu yok.
          </p>
        ) : null}
      </div>

      <div className="border-b border-border p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-primary-deep">
              Üye referansları
            </div>
            <h3 className="mt-1 text-lg font-black">Onay kuyruğu</h3>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-black">
            {pendingReferenceCount} bekliyor
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {references
            .filter((reference) => reference.status === "pending")
            .map((reference) => (
              <article
                key={reference.id}
                className="rounded-2xl border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-foreground/55">
                  <span>{reference.authorName}</span>
                  <span>→</span>
                  <span>
                    {profileNames.get(reference.targetUsername) || `@${reference.targetUsername}`}
                  </span>
                  <span className="rounded-full bg-primary/15 px-2 py-1 text-primary-deep">
                    {reference.skill}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6">“{reference.message}”</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void moderateReference(reference, "approved")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-black text-primary-foreground"
                  >
                    <Check size={14} /> yayınla
                  </button>
                  <button
                    type="button"
                    onClick={() => void moderateReference(reference, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-black"
                  >
                    <X size={14} /> reddet
                  </button>
                </div>
              </article>
            ))}
        </div>
        {pendingReferenceCount === 0 ? (
          <p className="mt-4 rounded-2xl bg-muted/60 p-4 text-sm font-semibold text-foreground/45">
            Onay bekleyen referans yok.
          </p>
        ) : null}
      </div>

      <div className="max-h-[620px] overflow-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="sticky top-0 bg-muted text-xs text-foreground/50">
            <tr>
              <th className="px-4 py-3">Üye</th>
              <th className="px-4 py-3">Doğrulama</th>
              <th className="px-4 py-3">Kayıt kaynağı</th>
              <th className="px-4 py-3">Etkinlikler</th>
              <th className="px-4 py-3">Profil durumu</th>
              <th className="px-4 py-3">Business kart</th>
              <th className="px-4 py-3">Giriş</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-t border-border/70">
                <td className="px-4 py-3">
                  <div className="font-bold">{profile.name}</div>
                  <div className="text-xs text-foreground/45">
                    @{profile.username} · {profile.email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {profile.verifiedMember ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-black text-primary-deep">
                      <ShieldCheck size={13} /> Doğrulanmış Notwork Üyesi
                    </span>
                  ) : (
                    <span className="text-xs text-foreground/40">doğrulanmadı</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-foreground/60">
                  {profile.membershipSource === "event-qr"
                    ? "etkinlik QR · otomatik"
                    : profile.membershipSource === "profile-application"
                      ? "profil başvurusu"
                      : "etkinlik aktarımı"}
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-foreground/60">
                  {profile.attendedEvents.join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  {profile.status === "pending"
                    ? "onay bekliyor"
                    : profile.status === "rejected"
                      ? "reddedildi"
                      : profile.status}
                </td>
                <td className="px-4 py-3 text-xs font-semibold">
                  {profile.publicProfileEnabled ? (
                    <a
                      href={`/u/${encodeURIComponent(profile.username)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-deep hover:underline"
                    >
                      yayında →
                    </a>
                  ) : (
                    <span className="text-foreground/40">kapalı</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-foreground/55">
                  <div>
                    {profile.credentialIssuedAt
                      ? `şifre atandı · ${new Date(profile.credentialIssuedAt).toLocaleDateString("tr-TR")}`
                      : "şifre bekliyor"}
                  </div>
                  {profile.status === "active" || profile.status === "invited" ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `${profile.name} için yeni geçici şifre üretilecek ve açık oturumları kapatılacak. Devam edilsin mi?`,
                          )
                        ) {
                          void resetPassword(profile);
                        }
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 font-black text-foreground hover:bg-muted"
                    >
                      <KeyRound size={13} /> şifreyi sıfırla
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {profiles.length === 0 ? (
          <div className="p-8 text-center text-sm text-foreground/45">
            Henüz profil kaydı yok. Önce etkinlik üyelerini eşitle.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function NetworkingAdmin({
  members,
  requests,
  draft,
  editingUsername,
  message,
  setDraft,
  setEditingUsername,
  networkAction,
}: {
  members: NetworkMember[];
  requests: ChangeRequest[];
  draft: NetworkMember;
  editingUsername: string;
  message: string;
  setDraft: (member: NetworkMember) => void;
  setEditingUsername: (username: string) => void;
  networkAction: (
    action: "create" | "update" | "delete" | "approve" | "reject",
    payload?: Record<string, unknown>,
  ) => Promise<void>;
}) {
  const set =
    (key: keyof NetworkMember) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft({ ...draft, [key]: event.target.value });

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.25fr]">
      <article className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Networking üyeleri</h2>
            <p className="mt-1 text-sm text-foreground/50">
              Ekle, düzenle, sil. Admin değişiklikleri direkt yayına çıkar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDraft(blankMember);
              setEditingUsername("");
            }}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold"
          >
            <Plus size={14} /> yeni
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void networkAction(editingUsername ? "update" : "create", {
              username: editingUsername || draft.username,
              member: draft,
            });
          }}
          className="mt-5 grid gap-3 sm:grid-cols-2"
        >
          <AdminField
            label="Kullanıcı adı"
            value={draft.username}
            onChange={set("username")}
            disabled={Boolean(editingUsername)}
            required
          />
          <AdminField label="Ad Soyad" value={draft.name} onChange={set("name")} required />
          <AdminField label="Rol" value={draft.title} onChange={set("title")} required />
          <AdminField label="E-posta" value={draft.email} onChange={set("email")} required />
          <AdminField label="Instagram" value={draft.instagram} onChange={set("instagram")} />
          <AdminField label="LinkedIn" value={draft.linkedin} onChange={set("linkedin")} />
          <AdminField
            className="sm:col-span-2"
            label="Yetenekler"
            value={draft.skills}
            onChange={set("skills")}
          />
          <label className="sm:col-span-2 flex flex-col gap-1.5 text-xs text-foreground/60">
            Motivasyon
            <textarea
              value={draft.motivation}
              onChange={set("motivation")}
              rows={3}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {editingUsername ? "kaydı güncelle" : "yeni kayıt ekle"}
          </button>
          {message && (
            <p className="self-center text-sm font-semibold text-primary-deep">{message}</p>
          )}
        </form>
      </article>

      <article className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-xl font-black">Onay bekleyen değişiklikler · {requests.length}</h2>
        <div className="mt-4 grid gap-3">
          {requests.length === 0 && (
            <p className="text-sm text-foreground/45">Bekleyen değişiklik yok.</p>
          )}
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold">{request.current.name}</div>
                  <div className="text-xs text-foreground/45">
                    @{request.username} · {new Date(request.requestedAt).toLocaleString("tr-TR")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void networkAction("approve", { requestId: request.id })}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Check size={14} /> onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => void networkAction("reject", { requestId: request.id })}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold"
                  >
                    <X size={14} /> reddet
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <ChangeBox title="Mevcut" member={request.current} />
                <ChangeBox title="Önerilen" member={request.proposed} />
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-2">
        <div className="border-b border-border px-5 py-4 font-bold">
          Üye listesi · {members.length}
        </div>
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 bg-muted text-xs text-foreground/50">
              <tr>
                <th className="px-4 py-3">Üye</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Sosyal</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.username} className="border-t border-border/70">
                  <td className="px-4 py-3">
                    <div className="font-bold">{member.name}</div>
                    <div className="text-xs text-foreground/45">@{member.username}</div>
                  </td>
                  <td className="px-4 py-3">{member.title}</td>
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3 text-xs text-foreground/55">
                    {member.instagram ? `IG: ${member.instagram}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDraft(member);
                          setEditingUsername(member.username);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="rounded-full border border-border p-2"
                        aria-label={`${member.name} düzenle`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`${member.name} kaydı silinsin mi?`)) {
                            void networkAction("delete", { username: member.username });
                          }
                        }}
                        className="rounded-full border border-border p-2 text-destructive"
                        aria-label={`${member.name} sil`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function WordcloudAdmin({
  eventTitle,
  selection,
  questions,
  answers,
  results,
  database,
  draft,
  message,
  setDraft,
  refresh,
  wordcloudAction,
}: {
  eventTitle: string;
  selection: EventSelection;
  questions: WordcloudQuestion[];
  answers: WordcloudAnswer[];
  results: WordcloudResults | null;
  database: EventDatabaseInfo | null;
  draft: Partial<WordcloudQuestion>;
  message: string;
  setDraft: (question: Partial<WordcloudQuestion>) => void;
  refresh: () => Promise<void>;
  wordcloudAction: (
    payload:
      | { action: "saveQuestion"; question: Partial<WordcloudQuestion> }
      | { action: "deleteQuestion"; questionId: string }
      | { action: "toggleAnswer"; answerId: string; isVisible: boolean }
      | { action: "resetDemo" }
      | { action: "seedLoadTest" },
  ) => Promise<void>;
}) {
  const visibleAnswers = answers.filter((answer) => answer.isVisible);
  const [selectedQuestionId, setSelectedQuestionId] = useState("all");
  const questionById = useMemo(
    () => Object.fromEntries(questions.map((question) => [question.id, question])),
    [questions],
  );
  const filteredAnswers = useMemo(
    () =>
      answers
        .filter(
          (answer) => selectedQuestionId === "all" || answer.questionId === selectedQuestionId,
        )
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        ),
    [answers, selectedQuestionId],
  );

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">{eventTitle} WordCloud soruları</h2>
            <p className="mt-1 text-sm text-foreground/50">
              Soruları buradan değiştir; cevap formu ve canlı ekran otomatik güncellenir.
            </p>
            <p className="mt-2 text-xs text-foreground/45">
              Aktif DB: <span className="font-bold">{database?.activeDatabaseCode || "-"}</span> ·{" "}
              {database?.mode === "live" ? "canlı" : "demo"}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <a
              href={withEventSelection("/21-agustos/sonuclar", selection)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-2 text-xs font-black text-background"
            >
              canlı ekranı aç
            </a>
            <a
              href={withEventSelection("/21-agustos/wordcloud", selection)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-black"
            >
              anket ekranı
            </a>
            <button
              type="button"
              onClick={() => void wordcloudAction({ action: "seedLoadTest" })}
              className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/10 px-3 py-2 text-xs font-black text-primary-deep"
            >
              100 kişi test
            </button>
            <button
              type="button"
              onClick={() => void wordcloudAction({ action: "resetDemo" })}
              className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-3 py-2 text-xs font-black text-destructive"
            >
              demo sıfırla
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold"
            >
              <RefreshCcw size={14} /> yenile
            </button>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void wordcloudAction({ action: "saveQuestion", question: draft });
          }}
          className="mt-5 grid gap-3"
        >
          <AdminField
            label="Sıra"
            type="number"
            min={1}
            value={draft.order || 1}
            onChange={(event) => setDraft({ ...draft, order: Number(event.target.value) })}
            required
          />
          <AdminField
            label="Soru"
            value={draft.title || ""}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="Örn: Bu gece hangi bağlantıyı arıyorsun?"
            required
          />
          <label className="flex flex-col gap-1.5 text-xs text-foreground/60">
            Yardım metni
            <textarea
              value={draft.helper || ""}
              onChange={(event) => setDraft({ ...draft, helper: event.target.value })}
              rows={3}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="Katılımcıya kısa ipucu"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={draft.isActive !== false}
              onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
            />
            Formda aktif göster
          </label>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {draft.id ? "soruyu güncelle" : "test sorusu ekle"}
          </button>
          {message && <p className="text-sm font-semibold text-primary-deep">{message}</p>}
        </form>
      </article>

      <article className="rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric icon={BarChart3} label="Soru" value={questions.length} />
          <Metric icon={Eye} label="Görünür cevap" value={visibleAnswers.length} highlight />
          <Metric
            icon={EyeOff}
            label="Gizli cevap"
            value={answers.length - visibleAnswers.length}
          />
        </div>

        <div className="mt-5 grid gap-3">
          {questions.map((question) => (
            <div key={question.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-primary-deep">Soru {question.order}</div>
                  <h3 className="mt-1 font-black">{question.title}</h3>
                  <p className="mt-1 text-sm text-foreground/55">{question.helper}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-deep">
                  {question.isActive ? "aktif" : "pasif"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDraft(question)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
                >
                  düzenle
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void wordcloudAction({ action: "deleteQuestion", questionId: question.id })
                  }
                  className="rounded-full border border-destructive/30 px-3 py-1.5 text-xs font-bold text-destructive"
                >
                  sil
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(results?.results[question.id] || []).slice(0, 8).map((word) => (
                  <span
                    key={word.text}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary-deep"
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-2">
        <div className="border-b border-border px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-black">WordCloud cevapları · {filteredAnswers.length}</div>
              <p className="mt-1 text-sm text-foreground/50">
                Sunum anında cevapları burada temizle; gizlediğin cevap canlı ekrandan düşer.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-black text-primary-foreground"
            >
              <RefreshCcw size={14} /> cevapları yenile
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedQuestionId("all")}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${
                selectedQuestionId === "all"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background"
              }`}
            >
              tüm cevaplar
            </button>
            {questions.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setSelectedQuestionId(question.id)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${
                  selectedQuestionId === question.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background"
                }`}
              >
                soru {question.order}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="sticky top-0 bg-muted text-xs text-foreground/50">
              <tr>
                <th className="px-4 py-3">Cevap</th>
                <th className="px-4 py-3">Soru</th>
                <th className="px-4 py-3">Zaman</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnswers.map((answer) => (
                <tr key={answer.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-bold">{answer.rawText}</td>
                  <td className="max-w-sm px-4 py-3 text-foreground/55">
                    {questionById[answer.questionId]?.title || answer.questionId}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground/45">
                    {new Date(answer.createdAt).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">{answer.isVisible ? "görünür" : "gizli"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        void wordcloudAction({
                          action: "toggleAnswer",
                          answerId: answer.id,
                          isVisible: !answer.isVisible,
                        })
                      }
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
                    >
                      {answer.isVisible ? "gizle" : "göster"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAnswers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-foreground/45">
                    Bu filtrede henüz cevap yok.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function EventNetworkAdmin({
  eventTitle,
  selection,
  registrations,
  database,
  message,
  refresh,
  seedSamples,
  resetDemo,
}: {
  eventTitle: string;
  selection: EventSelection;
  registrations: EventNetworkRegistration[];
  database: EventDatabaseInfo | null;
  message: string;
  refresh: () => Promise<void>;
  seedSamples: () => Promise<void>;
  resetDemo: () => Promise<void>;
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-xl font-black">{eventTitle} MatchLab kayıtları</h2>
          <p className="mt-1 text-sm text-foreground/50">
            Etkinlik kodu, yetkinlikler, ihtiyaç ve izin tercihleri. Şimdilik demo database ile
            oynuyoruz.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={withEventSelection("/linkler", selection)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border px-3 py-2 text-xs font-bold"
          >
            Test kaydı aç
          </a>
          <button
            type="button"
            onClick={() => void seedSamples()}
            className="rounded-full border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary-deep"
          >
            Demo test verisi oluştur
          </button>
          <button
            type="button"
            onClick={() => void resetDemo()}
            className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive"
          >
            Demo sıfırla
          </button>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
          >
            <RefreshCcw size={14} /> yenile
          </button>
        </div>
      </div>
      <div className="grid gap-3 border-b border-border bg-muted/35 p-5 md:grid-cols-3">
        <DatabaseBadge
          label="Anlık kullanılan database kodu"
          value={database?.activeDatabaseCode || `${selection.event || "event"}-demo`}
          highlight
        />
        <DatabaseBadge
          label="Demo database"
          value={database?.demoDatabaseCode || `${selection.event || "event"}-demo`}
        />
        <DatabaseBadge
          label="Canlı gün açılacak database"
          value={database?.liveDatabaseCode || `${selection.event || "event"}-live`}
        />
        <div className="rounded-2xl border border-border bg-background p-4 text-xs text-foreground/55 md:col-span-3">
          <div className="font-black text-foreground">Teknik store</div>
          <div className="mt-1">
            Store: <span className="font-bold">{database?.storeName || "event-network"}</span>
          </div>
          <div>
            Prefix:{" "}
            <span className="font-bold">
              {database?.keyPrefix || `events/${selection.event || "event"}/demo/matchlab`}
            </span>
          </div>
          <div className="mt-2 text-primary-deep">
            Veri modu Etkinlikler sekmesinden demo veya canlı olarak değiştirilebilir. Her etkinlik
            kendi izole MatchLab verisini kullanır.
          </div>
        </div>
        {message ? (
          <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary-deep md:col-span-3">
            {message}
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-muted text-xs text-foreground/50">
            <tr>
              <th className="px-4 py-3">Kod</th>
              <th className="px-4 py-3">Katılımcı</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Yardım edebilir</th>
              <th className="px-4 py-3">İhtiyaç</th>
              <th className="px-4 py-3">İzinler</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration.participant.id} className="border-t border-border/70">
                <td className="px-4 py-3">
                  <span className="rounded-xl bg-primary/10 px-3 py-2 font-black text-primary-deep">
                    {registration.participant.publicCode}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold">
                  {registration.profile.firstName} {registration.profile.lastName}
                </td>
                <td className="px-4 py-3">{registration.profile.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {registration.offers.map((offer) => (
                      <span
                        key={offer}
                        className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary-deep"
                      >
                        {offer}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="max-w-xs px-4 py-3 text-foreground/60">
                  <div className="line-clamp-2">{registration.needs}</div>
                  {registration.needTag ? (
                    <div className="mt-1 text-xs font-bold text-primary-deep">
                      #{registration.needTag}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs text-foreground/55">
                  <div>Genel ağ: {registration.profile.generalNetworkOptIn ? "evet" : "hayır"}</div>
                  <div>E-posta: {registration.profile.marketingOptIn ? "evet" : "hayır"}</div>
                </td>
              </tr>
            ))}
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-foreground/45">
                  Henüz {eventTitle} MatchLab kaydı yok.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FiveAdmin({
  eventTitle,
  selection,
  data,
  message,
  refresh,
  runAction,
}: {
  eventTitle: string;
  selection: EventSelection;
  data: FiveAdminPayload | null;
  message: string;
  refresh: () => Promise<FiveAdminPayload>;
  runAction: (action: "seedDemo" | "resetDemo") => Promise<void>;
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-xl font-black">{eventTitle} ntw.five</h2>
          <p className="mt-1 text-sm text-foreground/50">
            Katılımcı problemleri, çözüm talepleri ve beş dakikalık görüşmeler.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={withEventSelection("/five/live", selection)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border px-3 py-2 text-xs font-bold"
          >
            ntw.five ekranını aç
          </a>
          <button
            type="button"
            onClick={() => void runAction("seedDemo")}
            className="rounded-full border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary-deep"
          >
            Demo veriyi hazırla
          </button>
          <button
            type="button"
            onClick={() => void runAction("resetDemo")}
            className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive"
          >
            Demo sıfırla
          </button>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
          >
            <RefreshCcw size={14} /> yenile
          </button>
        </div>
      </div>

      <div className="grid gap-3 border-b border-border bg-muted/35 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={MessageSquareQuote} label="Problem" value={data?.problems.length || 0} />
        <Metric icon={MousePointerClick} label="Çözüm talebi" value={data?.requests.length || 0} />
        <Metric icon={Users} label="Görüşme" value={data?.encounters.length || 0} highlight />
        <DatabaseBadge
          label="Aktif database"
          value={data?.database.activeDatabaseCode || `${selection.event || "event"}-demo`}
          highlight
        />
        <div className="rounded-2xl border border-border bg-background p-4 text-xs text-foreground/55 sm:col-span-2 lg:col-span-4">
          <div className="font-black text-foreground">İzole ntw.five store</div>
          <div className="mt-1">
            Store: <span className="font-bold">{data?.database.storeName || "ntw-five"}</span>
          </div>
          <div>
            Prefix: <span className="font-bold">{data?.database.keyPrefix || "-"}</span>
          </div>
          <div className="mt-2 text-primary-deep">
            Demo verileri yalnızca bu etkinliğin demo alanında tutulur; canlı veriye karışmaz.
          </div>
        </div>
        {message ? (
          <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary-deep sm:col-span-2 lg:col-span-4">
            {message}
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-muted text-xs text-foreground/50">
            <tr>
              <th className="px-4 py-3">Kod</th>
              <th className="px-4 py-3">Problem sahibi</th>
              <th className="px-4 py-3">Problem</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Talep</th>
              <th className="px-4 py-3">Görüşme</th>
            </tr>
          </thead>
          <tbody>
            {(data?.problems || []).map((problem) => (
              <tr key={problem.id} className="border-t border-border/70">
                <td className="px-4 py-3 font-black text-primary-deep">{problem.shortCode}</td>
                <td className="px-4 py-3">
                  <div className="font-bold">{problem.ownerName}</div>
                  <div className="text-xs text-foreground/45">{problem.ownerEmail || "-"}</div>
                </td>
                <td className="max-w-sm px-4 py-3">
                  <div className="font-bold">{problem.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-foreground/50">
                    {problem.description}
                  </div>
                </td>
                <td className="px-4 py-3">{problem.category}</td>
                <td className="px-4 py-3 font-black">{problem.requestCount}</td>
                <td className="px-4 py-3 font-black">{problem.conversationCount}</td>
              </tr>
            ))}
            {!data?.problems.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-foreground/45">
                  Bu etkinlik için henüz ntw.five problemi yok.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EventRegistryAdmin({
  events,
  registry,
  draft,
  message,
  loading,
  setDraft,
  selectEvent,
  createEvent,
  refresh,
  saveEvent,
  setPrimaryEvent,
  archiveEvent,
}: {
  events: NotworkEvent[];
  registry: EventRegistryInfo | null;
  draft: EventEditorDraft;
  message: string;
  loading: boolean;
  setDraft: React.Dispatch<React.SetStateAction<EventEditorDraft>>;
  selectEvent: (event: NotworkEvent) => void;
  createEvent: () => void;
  refresh: () => Promise<void>;
  saveEvent: () => Promise<void>;
  setPrimaryEvent: () => Promise<void>;
  archiveEvent: () => Promise<void>;
}) {
  const selectedEvent = events.find((event) => event.id === draft.id);
  const isPrimary = Boolean(draft.id && registry?.primaryEventId === draft.id);
  const updateProduct = (
    product: EventProductKey,
    updater: (
      current: NotworkEvent["products"][EventProductKey],
    ) => NotworkEvent["products"][EventProductKey],
  ) => {
    setDraft((current) => ({
      ...current,
      products: { ...current.products, [product]: updater(current.products[product]) },
    }));
  };

  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <aside className="self-start rounded-[2rem] border border-border bg-card p-4 shadow-sm xl:sticky xl:top-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
              Etkinlik merkezi
            </div>
            <h2 className="mt-1 text-2xl font-black">Etkinlikler</h2>
            <p className="mt-1 text-sm text-foreground/55">
              Her etkinliğin ürünleri ve verisi ayrı tutulur.
            </p>
          </div>
          <button
            type="button"
            onClick={createEvent}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-black text-primary-foreground"
          >
            <Plus size={14} /> yeni
          </button>
        </div>

        <div className="mt-4 grid max-h-[620px] gap-2 overflow-y-auto pr-1">
          {events.map((event) => {
            const enabledProducts = eventProductKeys.filter(
              (product) => event.products[product].enabled,
            ).length;
            const active = draft.id === event.id;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => selectEvent(event)}
                className={`rounded-2xl border p-3 text-left transition ${
                  active
                    ? "border-primary/55 bg-primary/12"
                    : "border-border bg-background hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="line-clamp-1 font-black">{event.shortTitle}</span>
                  {event.entry.isPrimary ? (
                    <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-black uppercase text-primary-foreground">
                      ana
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-foreground/55">
                  <span>{new Date(event.startsAt).toLocaleDateString("tr-TR")}</span>
                  <span>·</span>
                  <span>{eventStatusLabels[event.status]}</span>
                  <span>·</span>
                  <span>{enabledProducts} ürün</span>
                </div>
              </button>
            );
          })}
          {!events.length ? (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-foreground/50">
              Henüz etkinlik kaydı yok.
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-black disabled:opacity-50"
        >
          <RefreshCcw size={14} /> listeyi yenile
        </button>
      </aside>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void saveEvent();
        }}
        className="rounded-[2rem] border border-border bg-card p-4 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-deep">
              {draft.id ? "Etkinlik ayarları" : "Yeni etkinlik"}
            </div>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {draft.title || "Etkinlik bilgilerini gir"}
            </h2>
            {draft.id ? (
              <p className="mt-1 font-mono text-[11px] text-foreground/45">
                {draft.id} · rev {draft.revision}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {draft.id && !isPrimary && draft.status !== "archived" ? (
              <button
                type="button"
                onClick={() => void setPrimaryEvent()}
                disabled={loading}
                className="rounded-full border border-primary/35 px-3 py-2 text-xs font-black disabled:opacity-50"
              >
                ana etkinlik yap
              </button>
            ) : null}
            {isPrimary ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-2 text-xs font-black text-primary-deep">
                <Check size={14} /> ana giriş etkinliği
              </span>
            ) : null}
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold">
            {message}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <AdminField
            label="Etkinlik adı"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <AdminField
            label="Kısa ad"
            value={draft.shortTitle}
            onChange={(event) =>
              setDraft((current) => ({ ...current, shortTitle: event.target.value }))
            }
            placeholder="9 Ekim"
          />
          <AdminField
            label="URL adı"
            value={draft.slug}
            onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
            placeholder="9-ekim-2026"
          />
          <label className="flex flex-col gap-1.5 text-xs text-foreground/60">
            Durum
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as EventLifecycleStatus,
                }))
              }
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {Object.entries(eventStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <AdminField
            label="Başlangıç"
            type="datetime-local"
            value={draft.startsAt}
            onChange={(event) =>
              setDraft((current) => ({ ...current, startsAt: event.target.value }))
            }
            required
          />
          <AdminField
            label="Bitiş"
            type="datetime-local"
            value={draft.endsAt}
            onChange={(event) =>
              setDraft((current) => ({ ...current, endsAt: event.target.value }))
            }
          />
          <AdminField
            label="Mekân"
            value={draft.location.name}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                location: { ...current.location, name: event.target.value },
              }))
            }
          />
          <AdminField
            label="Şehir"
            value={draft.location.city}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                location: { ...current.location, city: event.target.value },
              }))
            }
          />
          <AdminField
            label="Adres"
            value={draft.location.address}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                location: { ...current.location, address: event.target.value },
              }))
            }
            className="sm:col-span-2"
          />
          <AdminField
            label="Harita bağlantısı"
            type="url"
            value={draft.location.mapUrl}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                location: { ...current.location, mapUrl: event.target.value },
              }))
            }
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={draft.entry.isOpen}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  entry: { ...current.entry, isOpen: event.target.checked },
                }))
              }
              className="size-4 accent-[hsl(var(--primary))]"
            />
            Katılımcı girişi açık
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={draft.entry.requireRegistration}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  entry: { ...current.entry, requireRegistration: event.target.checked },
                }))
              }
              className="size-4 accent-[hsl(var(--primary))]"
            />
            Önce profil/kayıt iste
          </label>
        </div>

        <div className="mt-7 flex items-center gap-2">
          <MessageSquareQuote size={18} className="text-primary-deep" />
          <h3 className="font-black">Etkinlik özel soruları</h3>
        </div>
        <p className="mt-1 text-sm text-foreground/55">
          Kayıtlı veya yeni katılımcı standart bilgilerini girdikten sonra bu etkinliğe özel üç
          soruyu yanıtlar.
        </p>
        <div className="mt-4 grid gap-3">
          {(
            [
              ["introLabel", "1. soru", "introPlaceholder", "1. soru açıklaması"],
              ["offersLabel", "2. soru", "offersPlaceholder", "2. soru açıklaması"],
              ["needsLabel", "3. soru", "needsPlaceholder", "3. soru açıklaması"],
            ] as const
          ).map(([labelKey, label, placeholderKey, placeholderLabel]) => (
            <div
              key={labelKey}
              className="grid gap-2 rounded-2xl border border-border bg-background p-3 sm:grid-cols-2"
            >
              <AdminField
                label={label}
                value={draft.entry.registrationPrompts[labelKey]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    entry: {
                      ...current.entry,
                      registrationPrompts: {
                        ...current.entry.registrationPrompts,
                        [labelKey]: event.target.value,
                      },
                    },
                  }))
                }
              />
              <AdminField
                label={placeholderLabel}
                value={draft.entry.registrationPrompts[placeholderKey]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    entry: {
                      ...current.entry,
                      registrationPrompts: {
                        ...current.entry.registrationPrompts,
                        [placeholderKey]: event.target.value,
                      },
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center gap-2">
          <Database size={18} className="text-primary-deep" />
          <h3 className="font-black">Etkinlik ürünleri</h3>
        </div>
        <p className="mt-1 text-sm text-foreground/55">
          Ürünü aç, linklerde göster ve demo/canlı verisini etkinlik bazında seç.
        </p>

        <div className="mt-4 grid gap-3">
          {eventProductKeys.map((product) => {
            const config = draft.products[product];
            const eventIdentity = {
              id: draft.id || "yeni-etkinlik",
              slug: draft.slug || "yeni-etkinlik",
            };
            const demoNamespace = createEventProductNamespace(eventIdentity, product, "demo");
            const liveNamespace = createEventProductNamespace(eventIdentity, product, "live");
            return (
              <article
                key={product}
                className={`rounded-[1.5rem] border p-4 ${
                  config.enabled ? "border-primary/40 bg-primary/8" : "border-border bg-background"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-black">{config.label}</h4>
                    <p className="mt-1 text-xs text-foreground/50">
                      {productDescriptions[product]}
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-black">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(event) =>
                        updateProduct(product, (current) => ({
                          ...current,
                          enabled: event.target.checked,
                          state: event.target.checked
                            ? current.state === "disabled"
                              ? "draft"
                              : current.state
                            : "disabled",
                        }))
                      }
                      className="size-4 accent-[hsl(var(--primary))]"
                    />
                    {config.enabled ? "aktif" : "kapalı"}
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <label className="flex flex-col gap-1.5 text-xs text-foreground/60">
                    Link sırası
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={config.order}
                      onChange={(event) =>
                        updateProduct(product, (current) => ({
                          ...current,
                          order: Math.max(1, Math.min(20, Number(event.target.value) || 1)),
                        }))
                      }
                      className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs text-foreground/60">
                    Veri modu
                    <select
                      value={config.dataMode}
                      disabled={!config.enabled}
                      onChange={(event) =>
                        updateProduct(product, (current) => ({
                          ...current,
                          dataMode: event.target.value as EventDataMode,
                        }))
                      }
                      className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none disabled:opacity-45"
                    >
                      <option value="demo">Demo</option>
                      <option value="live">Canlı</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs text-foreground/60">
                    Ürün durumu
                    <select
                      value={config.state}
                      disabled={!config.enabled}
                      onChange={(event) =>
                        updateProduct(product, (current) => ({
                          ...current,
                          state: event.target.value as EventProductState,
                        }))
                      }
                      className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-bold outline-none disabled:opacity-45"
                    >
                      {Object.entries(productStateLabels)
                        .filter(([value]) => value !== "disabled")
                        .map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-3 self-end rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold">
                    <input
                      type="checkbox"
                      checked={config.visible}
                      disabled={!config.enabled}
                      onChange={(event) =>
                        updateProduct(product, (current) => ({
                          ...current,
                          visible: event.target.checked,
                        }))
                      }
                      className="size-4 accent-[hsl(var(--primary))]"
                    />
                    Linklerde göster
                  </label>
                </div>

                {config.enabled ? (
                  <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
                    <div className="rounded-xl bg-card px-3 py-2">
                      <span className="font-black uppercase tracking-wider text-foreground/40">
                        Demo
                      </span>
                      <div className="mt-1 break-all font-mono">{demoNamespace.keyPrefix}</div>
                    </div>
                    <div className="rounded-xl bg-card px-3 py-2">
                      <span className="font-black uppercase tracking-wider text-foreground/40">
                        Canlı
                      </span>
                      <div className="mt-1 break-all font-mono">{liveNamespace.keyPrefix}</div>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-background p-4 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h3 className="text-sm font-black">Veri modu ne yapar?</h3>
            <div className="mt-2 grid gap-2 text-xs leading-5 text-foreground/60">
              <p>
                <strong className="text-foreground">Demo:</strong> Güvenli test verisidir; canlı
                katılımcı kayıtlarına karışmaz.
              </p>
              <p>
                <strong className="text-foreground">Canlı:</strong> Etkinlik günü gerçek
                katılımcıların kullandığı kalıcı veri alanıdır.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black">Ürün durumları</h3>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {productStateDescriptions.map((item) => (
                <p
                  key={item.label}
                  className="rounded-xl bg-card px-3 py-2 text-[11px] leading-4 text-foreground/55"
                >
                  <strong className="text-foreground">{item.label}:</strong> {item.description}
                </p>
              ))}
            </div>
          </div>
        </div>

        {draft.id && draft.slug ? (
          <div className="mt-5 rounded-[1.5rem] border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <Eye size={18} className="mt-0.5 shrink-0 text-primary-deep" />
              <div>
                <h3 className="font-black">Etkinlik kontrol bağlantıları</h3>
                <p className="mt-1 text-xs text-foreground/50">
                  Her bağlantı bu etkinliğin seçili demo veya canlı veri alanını kullanır.
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href={withEventSelection("/linkler", { event: draft.slug })}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-sm font-black transition hover:border-primary/60"
              >
                Etkinlik girişini aç
              </a>
              {(
                [
                  ["matchlab", "/21-agustos/eslesme"],
                  ["wordcloud", "/21-agustos/wordcloud"],
                  ["five", "/five/live"],
                ] as const
              ).map(([product, path]) => {
                const config = draft.products[product];
                return (
                  <a
                    key={product}
                    href={withEventSelection(path, { event: draft.slug })}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={!config.enabled}
                    onClick={(event) => {
                      if (!config.enabled) event.preventDefault();
                    }}
                    className={`rounded-xl border px-3 py-3 text-sm font-black transition ${
                      config.enabled
                        ? "border-border bg-card hover:border-primary/45"
                        : "cursor-not-allowed border-border bg-card text-foreground/30"
                    }`}
                  >
                    {config.label} · {config.enabled ? config.dataMode : "kapalı"}
                  </a>
                );
              })}
              {draft.products.wordcloud.enabled ? (
                <a
                  href={withEventSelection("/21-agustos/sonuclar", { event: draft.slug })}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-border bg-card px-3 py-3 text-sm font-black transition hover:border-primary/45"
                >
                  WordCloud sahne ekranı
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <div className="text-xs text-foreground/45">
            {selectedEvent
              ? `Son güncelleme: ${new Date(selectedEvent.updatedAt).toLocaleString("tr-TR")}`
              : "Yeni etkinlik henüz kaydedilmedi."}
          </div>
          <div className="flex flex-wrap gap-2">
            {draft.id && !isPrimary && draft.status !== "archived" ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Etkinlik arşivlensin mi? Veriler silinmeyecek.")) {
                    void archiveEvent();
                  }
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-4 py-2.5 text-sm font-black text-destructive disabled:opacity-50"
              >
                <Archive size={15} /> arşivle
              </button>
            ) : null}
            <button
              type="submit"
              disabled={loading || draft.status === "archived"}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground disabled:opacity-50"
            >
              <Check size={16} /> {loading ? "kaydediliyor…" : draft.id ? "kaydet" : "oluştur"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function DatabaseBadge({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-primary/45 bg-primary/12" : "border-border bg-background"
      }`}
    >
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/45">
        {label}
      </div>
      <div className="mt-2 font-mono text-lg font-black text-primary-deep">{value}</div>
    </div>
  );
}

function AdminField({
  label,
  className = "",
  ...props
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 text-xs text-foreground/60 ${className}`}>
      {label}
      <input
        {...props}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
      />
    </label>
  );
}

function ChangeBox({ title, member }: { title: string; member: NetworkMember }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <div className="mb-2 font-bold">{title}</div>
      <div>{member.name}</div>
      <div>{member.title}</div>
      <div>{member.email}</div>
      <div>{member.instagram ? `@${member.instagram}` : "instagram yok"}</div>
      <div className="mt-1 line-clamp-3 text-foreground/55">
        {member.motivation || "motivasyon yok"}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="mt-1 text-xs text-foreground/45">{description}</p>
        </div>
        <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-deep">
          live
        </div>
      </div>
      {children}
    </article>
  );
}

function ActionTable({ title, events }: { title: string; events: AnalyticsEvent[] }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-black">{title}</h2>
        <p className="mt-1 text-xs text-foreground/45">Son 20 kayıt</p>
      </div>
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="sticky top-0 bg-muted text-xs text-foreground/50">
            <tr>
              <th className="px-4 py-3">Zaman</th>
              <th className="px-4 py-3">Aksiyon</th>
              <th className="px-4 py-3">Sayfa</th>
              <th className="px-4 py-3">Hedef</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 20).map((event) => (
              <tr key={event.id} className="border-t border-border/70">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground/50">
                  {new Date(event.timestamp).toLocaleString("tr-TR")}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {event.label || eventNames[event.type] || event.type}
                </td>
                <td className="px-4 py-3">{event.path}</td>
                <td className="max-w-xs truncate px-4 py-3 text-foreground/55">
                  {event.target || "—"}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-foreground/45">
                  Henüz veri yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${highlight ? "border-primary/40 bg-primary/10" : "border-border bg-card"}`}
    >
      <Icon size={18} className="text-primary-deep" />
      <div className="mt-4 text-2xl font-black">{value}</div>
      <div className="mt-1 text-xs text-foreground/50">{label}</div>
    </article>
  );
}

function ReportList({
  title,
  rows,
  suffix = "",
}: {
  title: string;
  rows: Array<[string, number]>;
  suffix?: string;
}) {
  const maximum = Math.max(1, ...rows.map(([, value]) => value));
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {rows.length ? (
          rows.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between gap-3 text-xs">
                <span className="truncate">{label}</span>
                <strong>
                  {value}
                  {suffix}
                </strong>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(4, (value / maximum) * 100)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-foreground/45">Henüz veri yok.</p>
        )}
      </div>
    </article>
  );
}

function buildReport(
  events: AnalyticsEvent[],
  summaries: AnalyticsDailySummary[],
  requestedDays: number,
) {
  const count = (type: string) =>
    summaries.reduce((total, summary) => total + (summary.counts[type] || 0), 0);
  const sessions = new Set(summaries.flatMap((summary) => summary.sessionIds)).size;
  const ticketClicks = count("ticket_click");
  const ticketClicksByEvent = summaries.reduce(
    (totals, summary) => ({
      july14: totals.july14 + summary.ticketClicksByEvent.july14,
      august21: totals.august21 + summary.ticketClicksByEvent.august21,
      september17: totals.september17 + (summary.ticketClicksByEvent.september17 || 0),
      october9: totals.october9 + (summary.ticketClicksByEvent.october9 || 0),
    }),
    { july14: 0, august21: 0, september17: 0, october9: 0 },
  );
  const pageTimeTotal = summaries.reduce((total, summary) => total + summary.pageTimeTotal, 0);
  const pageTimeCount = summaries.reduce((total, summary) => total + summary.pageTimeCount, 0);
  const buttonEvents = events.filter((event) => ["click", "ticket_click"].includes(event.type));
  const formAndNetworkEvents = events.filter(
    (event) =>
      event.type === "form_submit" ||
      event.path.includes("networking") ||
      event.label.toLocaleLowerCase("tr-TR").includes("ağa ekle") ||
      event.label.toLocaleLowerCase("tr-TR").includes("güncelle"),
  );
  return {
    sessions,
    pageViews: count("page_view"),
    ticketClicks,
    ticketClicksByEvent,
    conversion: sessions ? ((ticketClicks / sessions) * 100).toFixed(1) : "0.0",
    clicks: count("click") + ticketClicks,
    averageTime: pageTimeCount ? Math.round(pageTimeTotal / pageTimeCount) : 0,
    topPages: topRows(mergeSummaryRecords(summaries, "topPages")),
    topActions: topRows(mergeSummaryRecords(summaries, "topActions")),
    sources: topRows(mergeSummaryRecords(summaries, "sources")),
    scrollDepth: topRows(mergeSummaryRecords(summaries, "scrollDepth")),
    devices: topRows(mergeSummaryRecords(summaries, "devices")).map(([label, value]) => ({
      label,
      value,
    })),
    buttonActions: topRows(mergeSummaryRecords(summaries, "buttonActions")).map(
      ([label, value]) => ({ label: label.slice(0, 18), value }),
    ),
    buttonEvents,
    formAndNetworkEvents,
    timeline: buildAnalyticsTimeline(summaries, requestedDays),
  };
}

function buildEventPageReport(
  summaries: AnalyticsDailySummary[],
  selectedPath: string,
  requestedDays: number,
) {
  const normalizedPath = normalizeAnalyticsPath(selectedPath);
  const sessions = new Set<string>();
  const buttonActions: Record<string, number> = {};
  let pageViews = 0;
  let ticketClicks = 0;
  let pageTimeTotal = 0;
  let pageTimeCount = 0;

  const metricForSummary = (summary: AnalyticsDailySummary) => {
    const matching = Object.entries(summary.pageMetrics || {}).filter(
      ([path]) => normalizeAnalyticsPath(path) === normalizedPath,
    );
    const metric = {
      pageViews: 0,
      ticketClicks: 0,
      pageTimeTotal: 0,
      pageTimeCount: 0,
      sessionIds: [] as string[],
      buttonActions: {} as Record<string, number>,
    };
    for (const [, page] of matching) {
      metric.pageViews += page.pageViews || 0;
      metric.ticketClicks += page.ticketClicks || 0;
      metric.pageTimeTotal += page.pageTimeTotal || 0;
      metric.pageTimeCount += page.pageTimeCount || 0;
      metric.sessionIds.push(...(page.sessionIds || []));
      for (const [label, value] of Object.entries(page.buttonActions || {})) {
        metric.buttonActions[label] = (metric.buttonActions[label] || 0) + value;
      }
    }
    return metric;
  };

  for (const summary of summaries) {
    const metric = metricForSummary(summary);
    pageViews += metric.pageViews;
    ticketClicks += metric.ticketClicks;
    pageTimeTotal += metric.pageTimeTotal;
    pageTimeCount += metric.pageTimeCount;
    metric.sessionIds.forEach((sessionId) => sessions.add(sessionId));
    for (const [label, value] of Object.entries(metric.buttonActions)) {
      buttonActions[label] = (buttonActions[label] || 0) + value;
    }
  }

  const summariesByDate = new Map(summaries.map((summary) => [summary.date, summary]));
  const today = new Date();
  const safeDays = Math.max(1, Math.min(90, requestedDays));
  const timeline = Array.from({ length: safeDays }, (_, index) => {
    const offset = safeDays - index - 1;
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset),
    );
    const dateKey = date.toISOString().slice(0, 10);
    const summary = summariesByDate.get(dateKey);
    const metric = summary ? metricForSummary(summary) : null;
    return {
      day: formatAnalyticsDateShort(dateKey),
      pageViews: metric?.pageViews || 0,
      ticketClicks: metric?.ticketClicks || 0,
    };
  });

  return {
    pageViews,
    sessions: sessions.size,
    ticketClicks,
    conversion: sessions.size ? ((ticketClicks / sessions.size) * 100).toFixed(1) : "0.0",
    averageTime: pageTimeCount ? Math.round(pageTimeTotal / pageTimeCount) : 0,
    buttonActions: topRows(buttonActions),
    timeline,
  };
}

function normalizeAnalyticsPath(value: string) {
  const path = (value || "/").split(/[?#]/, 1)[0] || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function buildAnalyticsTimeline(summaries: AnalyticsDailySummary[], requestedDays: number) {
  const summariesByDate = new Map(summaries.map((summary) => [summary.date, summary]));
  const today = new Date();
  const safeDays = Math.max(1, Math.min(90, requestedDays));

  return Array.from({ length: safeDays }, (_, index) => {
    const offset = safeDays - index - 1;
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset),
    );
    const dateKey = date.toISOString().slice(0, 10);
    const summary = summariesByDate.get(dateKey);

    return {
      day: formatAnalyticsDateShort(dateKey),
      pageViews: summary?.counts.page_view || 0,
      sessions: summary?.counts.session_start || 0,
      ticketClicks: summary?.counts.ticket_click || 0,
      clicks: (summary?.counts.click || 0) + (summary?.counts.ticket_click || 0),
    };
  });
}

type SummaryRecordKey =
  | "topPages"
  | "topActions"
  | "sources"
  | "scrollDepth"
  | "devices"
  | "buttonActions";

function mergeSummaryRecords(summaries: AnalyticsDailySummary[], key: SummaryRecordKey) {
  const merged: Record<string, number> = {};
  for (const summary of summaries) {
    for (const [label, value] of Object.entries(summary[key])) {
      merged[label] = (merged[label] || 0) + value;
    }
  }
  return merged;
}

function topRows(values: Record<string, number>): Array<[string, number]> {
  return Object.entries(values)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 8);
}

function formatAnalyticsDate(value: string) {
  return new Date(`${value}T12:00:00.000Z`).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatAnalyticsDateShort(value: string) {
  return new Date(`${value}T12:00:00.000Z`).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
  });
}
