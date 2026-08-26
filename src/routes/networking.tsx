import { createFileRoute, Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { getMyMemberProfile, MemberProfileApiError } from "@/lib/member-profile-api";
import type { NotworkMemberProfile } from "@/lib/member-profile";
import { createSeo } from "@/lib/seo";
import {
  addMember,
  createUsername,
  listMembers,
  parseSkills,
  saveMember,
  type Member,
  updateMember,
} from "@/lib/networking-api";

export const Route = createFileRoute("/networking")({
  head: () =>
    createSeo({
      title: "İzmir Networking Ağı | notwork Network Club",
      description:
        "notwork İzmir networking ağına katıl; yeteneklerini ve aradığın bağlantıları paylaş, network club topluluğunda doğru insanlarla tanış.",
      path: "/networking",
      keywords: ["İzmir iş ağı", "İzmir girişimci ağı", "İzmir profesyonel network"],
    }),
  component: NetworkingPage,
});

const roleGroups = [
  {
    id: "technology",
    label: "Teknoloji & Veri",
    keywords: [
      "yazılım",
      "developer",
      "frontend",
      "backend",
      "fullstack",
      "veri",
      "data",
      "react",
      "typescript",
      "python",
      "api",
      "excel",
      "ai",
      "yapay zeka",
      "otomasyon",
    ],
  },
  {
    id: "design",
    label: "Tasarım & Ürün",
    keywords: ["tasarım", "ux", "ui", "figma", "illüstr", "moda", "ürün", "product", "grafik"],
  },
  {
    id: "architecture",
    label: "Mimari & Mekân",
    keywords: ["mimar", "mimarlık", "iç mimar", "mekan", "mekân", "tasarımı", "dekorasyon"],
  },
  {
    id: "content",
    label: "İçerik & Sahne",
    keywords: [
      "içerik",
      "fotoğraf",
      "fotoğrafçı",
      "video",
      "müzik",
      "sahne",
      "kurgu",
      "prodüksiyon",
      "youtuber",
      "podcast",
      "reklam",
    ],
  },
  {
    id: "marketing",
    label: "Pazarlama & Satış",
    keywords: ["pazarlama", "satış", "marka", "sosyal medya", "growth", "performans", "reklam"],
  },
  {
    id: "community",
    label: "Topluluk & Etkinlik",
    keywords: ["topluluk", "etkinlik", "organizasyon", "turizm", "seyahat"],
  },
  {
    id: "business",
    label: "Girişim & Strateji",
    keywords: ["girişim", "startup", "strateji", "proje", "kurucu", "founder", "iş geliştirme"],
  },
  {
    id: "finance",
    label: "Finans & Operasyon",
    keywords: ["finans", "muhasebe", "bütçe", "yatırım", "operasyon", "raporlama", "analiz"],
  },
  {
    id: "health",
    label: "Sağlık & İyi Oluş",
    keywords: ["doktor", "hekim", "sağlık", "diyet", "fizyoterapi", "hemşire", "eczacı", "terapi"],
  },
  {
    id: "people",
    label: "İnsan & Gelişim",
    keywords: [
      "psikolog",
      "insan kaynakları",
      "ik",
      "eğitim",
      "kariyer",
      "işe alım",
      "koç",
      "mentör",
      "empati",
    ],
  },
  {
    id: "legal",
    label: "Hukuk & Danışmanlık",
    keywords: ["hukuk", "avukat", "danışman", "danışmanlık", "sözleşme", "kvkk"],
  },
  {
    id: "other",
    label: "Diğer Bağlamlar",
    keywords: [],
  },
] as const;

const maxMembersPerVisualCluster = 18;

const roleSubgroups: Record<
  string,
  Array<{
    id: string;
    label: string;
    keywords: string[];
  }>
> = {
  technology: [
    {
      id: "software",
      label: "Yazılım",
      keywords: ["yazılım", "developer", "frontend", "backend", "fullstack", "react", "typescript"],
    },
    { id: "data-ai", label: "AI & Veri", keywords: ["veri", "data", "ai", "yapay zeka", "python"] },
    {
      id: "automation",
      label: "Otomasyon",
      keywords: ["otomasyon", "api", "excel", "nocode", "no-code"],
    },
  ],
  design: [
    { id: "ux-ui", label: "UX/UI", keywords: ["ux", "ui", "figma", "product", "ürün"] },
    { id: "brand", label: "Grafik & Marka", keywords: ["grafik", "marka", "illüstr", "logo"] },
    { id: "fashion", label: "Moda & Ürün", keywords: ["moda", "stil", "tekstil"] },
  ],
  content: [
    {
      id: "photo-video",
      label: "Fotoğraf & Video",
      keywords: ["fotoğraf", "fotoğrafçı", "video", "kurgu"],
    },
    { id: "social", label: "Sosyal Medya", keywords: ["sosyal medya", "reklam", "influencer"] },
    { id: "stage", label: "Sahne & Ses", keywords: ["sahne", "müzik", "podcast", "youtuber"] },
  ],
  marketing: [
    { id: "sales-growth", label: "Satış & Growth", keywords: ["satış", "growth", "performans"] },
    { id: "brand-marketing", label: "Marka & Reklam", keywords: ["marka", "reklam", "pazarlama"] },
    { id: "social-marketing", label: "Sosyal Medya", keywords: ["sosyal medya", "içerik"] },
  ],
  business: [
    {
      id: "startup",
      label: "Startup & Kurucu",
      keywords: ["startup", "girişim", "kurucu", "founder"],
    },
    { id: "strategy", label: "Strateji & Proje", keywords: ["strateji", "proje", "iş geliştirme"] },
  ],
  community: [
    { id: "events", label: "Etkinlik", keywords: ["etkinlik", "organizasyon"] },
    { id: "community-build", label: "Topluluk", keywords: ["topluluk", "community"] },
    { id: "travel", label: "Turizm", keywords: ["turizm", "seyahat"] },
  ],
  people: [
    { id: "psychology", label: "Psikoloji", keywords: ["psikolog", "terapi", "empati"] },
    {
      id: "hr",
      label: "İK & Kariyer",
      keywords: ["insan kaynakları", "ik", "kariyer", "işe alım"],
    },
    { id: "education", label: "Eğitim & Mentörlük", keywords: ["eğitim", "koç", "mentör"] },
  ],
};

function getMemberProfile(member: Member) {
  return normalizeSearchText(
    `${member.title} ${member.skills.join(" ")} ${member.motivation || ""}`,
  );
}

function getRoleGroup(member: Member) {
  const profile = getMemberProfile(member);
  return (
    roleGroups.find(
      (group) =>
        group.id !== "other" &&
        group.keywords.some((keyword) => profile.includes(normalizeSearchText(keyword))),
    ) || roleGroups[roleGroups.length - 1]
  );
}

function getRoleSubgroup(member: Member, groupId: string) {
  const profile = getMemberProfile(member);
  const subgroups = roleSubgroups[groupId] || [];
  return (
    subgroups.find((subgroup) =>
      subgroup.keywords.some((keyword) => profile.includes(normalizeSearchText(keyword))),
    ) || { id: "general", label: "Genel", keywords: [] }
  );
}

function chunkMembers(members: Member[], size = maxMembersPerVisualCluster) {
  return Array.from({ length: Math.ceil(members.length / size) }, (_, index) =>
    members.slice(index * size, index * size + size),
  );
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeInstagramUsername(value: string) {
  const username = value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#\s]/)[0];
  return /^[a-zA-Z0-9._]+$/.test(username) ? username : "";
}

function normalizeLinkedinUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/)?(www\.)?linkedin\.com\//i.test(trimmed)) {
    return `https://${trimmed.replace(/^https?:\/\//i, "").replace(/\?.*$/, "")}`;
  }
  return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? `https://www.linkedin.com/in/${trimmed}` : "";
}

function getContactDetails(value?: string) {
  if (!value) return {};
  const fields = Object.fromEntries(
    value.split(" || ").map((part) => {
      const separator = part.indexOf(":");
      return separator > 0
        ? [part.slice(0, separator), part.slice(separator + 1)]
        : ["legacy", part];
    }),
  );
  const email = fields.email || value.match(/[^\s|]+@[^\s|]+\.[^\s|]+/)?.[0];
  const instagramMatch = value.match(/(?:^|[\s|])@([a-zA-Z0-9._]+)/);
  const instagram = fields.instagram || instagramMatch?.[1];
  const linkedin = fields.linkedin;
  const about = fields.about;
  return { about, email, instagram, linkedin };
}

function getMemberContact(member: Member) {
  const legacy = getContactDetails(member.contact);
  return {
    email: member.email || legacy.email,
    instagram: member.instagram || legacy.instagram,
    linkedin: member.linkedin || legacy.linkedin,
    about: member.motivation || legacy.about,
  };
}

const complementaryGroups: Record<string, string[]> = {
  technology: ["design", "marketing", "business", "finance"],
  design: ["technology", "marketing", "content", "architecture"],
  architecture: ["design", "business", "content", "marketing"],
  content: ["marketing", "community", "design", "business"],
  marketing: ["content", "business", "technology", "design"],
  community: ["content", "people", "business", "marketing"],
  business: ["technology", "marketing", "people", "finance", "legal"],
  finance: ["business", "technology", "legal", "marketing"],
  health: ["people", "content", "business", "marketing"],
  people: ["business", "community", "technology", "health"],
  legal: ["business", "finance", "technology", "community"],
  other: ["business", "community", "marketing", "people"],
};

const eventBadges = [
  {
    source: "14temmuznetworking",
    label: "14 Temmuz katılımcıları",
  },
  {
    source: "21agustos",
    label: "21 Ağustos katılımcıları",
  },
  {
    source: "21-agustos",
    label: "21 Ağustos katılımcıları",
  },
] as const;

function getEventLabel(source: string) {
  return eventBadges.find((badge) => badge.source === source)?.label || "notwork katılımcısı";
}

function getMemberEventBadges(member: Member) {
  const raw = normalizeSearchText(
    `${member.contact || ""} ${member.motivation || ""} ${member.title || ""}`,
  );
  const createdAt = member.createdAt ? new Date(member.createdAt) : null;
  const isJuly14Registration =
    createdAt?.getFullYear() === 2026 && createdAt.getMonth() === 6 && createdAt.getDate() === 14;
  const isAugust21Registration =
    createdAt?.getFullYear() === 2026 && createdAt.getMonth() === 7 && createdAt.getDate() === 21;

  return eventBadges.filter((badge) => {
    if (raw.includes(normalizeSearchText(`event:${badge.source}`))) return true;
    if (badge.source === "14temmuznetworking" && isJuly14Registration) return true;
    if (badge.source === "21agustos" && isAugust21Registration) return true;
    return false;
  });
}

const ignoredWords = new Set([
  "ve",
  "ile",
  "bir",
  "icin",
  "için",
  "olarak",
  "uzmani",
  "uzmanı",
  "yonetimi",
  "yönetimi",
]);

function profileWords(member: Member) {
  return `${member.title} ${member.skills.join(" ")} ${member.motivation || ""}`
    .toLocaleLowerCase("tr-TR")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 3 && !ignoredWords.has(word));
}

function getRecommendations(member: Member, members: Member[]) {
  const memberGroup = getRoleGroup(member);
  const memberWords = new Set(profileWords(member));
  const memberEvents = getMemberEventBadges(member).map((badge) => badge.source);

  return members
    .filter((candidate) => candidate.id !== member.id)
    .map((candidate) => {
      const candidateGroup = getRoleGroup(candidate);
      const sharedSkills = member.skills.filter((skill) => candidate.skills.includes(skill));
      const candidateEvents = getMemberEventBadges(candidate).map((badge) => badge.source);
      const sharedEvents = candidateEvents.filter((event) => memberEvents.includes(event));
      const sharedThemes = [
        ...new Set(profileWords(candidate).filter((word) => memberWords.has(word))),
      ]
        .filter((word) => !sharedSkills.some((skill) => skill.includes(word)))
        .slice(0, 2);
      const complementary = complementaryGroups[memberGroup.id]?.includes(candidateGroup.id);
      const sameGroup = memberGroup.id === candidateGroup.id;
      let score = sharedSkills.length * 6 + sharedThemes.length * 2;
      if (complementary) score += 8;
      if (sameGroup) score += 4;
      if (sharedEvents.length > 0) score += 3;
      if (candidate.skills.length > 0 && member.skills.length > 0 && sharedSkills.length === 0)
        score += 1;
      if (candidate.linkedin) score += 1;
      if (candidate.motivation) score += 1;

      const reasons: string[] = [];
      if (complementary) {
        reasons.push(`${memberGroup.label} ile ${candidateGroup.label} birbirini tamamlıyor`);
      }
      if (sharedSkills.length > 0) {
        reasons.push(`Ortak alan: ${sharedSkills.slice(0, 2).join(", ")}`);
      } else if (sharedEvents.length > 0) {
        reasons.push(`Aynı etkinlik geçmişi: ${getEventLabel(sharedEvents[0])}`);
      } else if (sharedThemes.length > 0) {
        reasons.push(`Benzer hedefler: ${sharedThemes.join(", ")}`);
      }
      if (sameGroup && reasons.length < 2) reasons.push(`Aynı uzmanlık çevresinde çalışıyorsunuz`);
      if (reasons.length === 0) reasons.push(`Farklı uzmanlıklar yeni bir iş birliği yaratabilir`);

      return { member: candidate, reasons: reasons.slice(0, 2), score };
    })
    .sort(
      (first, second) =>
        second.score - first.score || first.member.name.localeCompare(second.member.name, "tr"),
    )
    .slice(0, 5);
}

const networkingVariants = {
  general: {
    eyebrow: "canlı yetenek ağı",
    titlePrefix: "kim, ne",
    titleAccent: "yapabiliyor?",
    intro:
      "notwork topluluğunun yetenek haritası. Kendini ekle, ortak yeteneklere sahip insanlarla bağlan. Aynı yeteneği paylaşanlar ağda birbirine bağlanır.",
    loadError: "Networking kayıtları şu anda yüklenemiyor.",
    formNote: "Bilgilerin ortak networking veritabanına eklenir ve ağda görünür.",
    countLabel: "ağ",
    graphHint: "kaydırarak ağı gez",
    graphEmpty: "henüz kimse yok — formdan ekle.",
    membersTitle: "üyeler",
    membersEmpty: "henüz kimse yok — ilk sen ekle.",
    shellClass: "bg-background text-foreground",
    eventSource: "",
    style: undefined,
  },
  july14: {
    eyebrow: "14 temmuz notwork community",
    titlePrefix: "bugün burada network'ünü",
    titleAccent: "hızlıca geliştir.",
    intro:
      "Aynı salonda buluşan notwork community haritasına kendini ekle; etkinlikte tanışabileceğin insanları, rollerini ve ortak bağlamları canlı gör.",
    loadError: "14 Temmuz notwork ağı şu anda yüklenemiyor.",
    formNote:
      "Bilgilerin hem 14 Temmuz etkinlik ağında hem de genel notwork networking veritabanında görünür.",
    countLabel: "14 temmuz ağı",
    graphHint: "salon ağını kaydırarak gez",
    graphEmpty: "henüz etkinlik ağı boş — ilk community düğümünü sen ekle.",
    membersTitle: "14 Temmuz notwork ağı",
    membersEmpty: "henüz 14 Temmuz ağına kayıt yok — ilk sen ekle.",
    shellClass: "bg-background text-foreground",
    eventSource: "14temmuznetworking",
    style: undefined,
  },
} as const;

type NetworkingVariant = keyof typeof networkingVariants;

function NetworkingPage() {
  return <NetworkingExperience />;
}

function normalizeLookup(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function withEventSource(member: Member, eventSource: string): Member {
  const marker = `event:${eventSource}`;
  const contact = member.contact?.includes(marker)
    ? member.contact
    : [member.contact, marker].filter(Boolean).join(" || ");
  return { ...member, contact };
}

export function NetworkingExperience({ variant = "general" }: { variant?: NetworkingVariant }) {
  const config = networkingVariants[variant];
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberProfile, setMemberProfile] = useState<NotworkMemberProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    title: "",
    skills: "",
    email: "",
    instagram: "",
    linkedin: "",
    about: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [updateMode, setUpdateMode] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [editingUsername, setEditingUsername] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const [activeGroupId, setActiveGroupId] = useState("all");
  const [error, setError] = useState("");
  const [checkInQuery, setCheckInQuery] = useState("");
  const [checkInMessage, setCheckInMessage] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    listMembers()
      .then(setMembers)
      .catch(() => setError(config.loadError))
      .finally(() => setLoading(false));
  }, [config.loadError]);

  useEffect(() => {
    let active = true;
    void getMyMemberProfile()
      .then((profile) => {
        if (active) setMemberProfile(profile);
      })
      .catch((caught) => {
        if (!(caught instanceof MemberProfileApiError && caught.status === 401)) {
          console.error(caught);
        }
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const canViewContacts = Boolean(memberProfile?.verifiedMember);

  const set =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const fullName = form.name.trim().replace(/\s+/g, " ");
    if (fullName.split(" ").length < 2) {
      setError("Lütfen adını ve soyadını birlikte yaz.");
      return;
    }
    if (!form.title.trim() || !isEmail(form.email.trim())) {
      setError("Rolünü ve geçerli bir e-posta adresini yaz.");
      return;
    }
    const instagram = normalizeInstagramUsername(form.instagram);
    if (form.instagram.trim() && !instagram) {
      setError("Instagram kullanıcı adını @kullaniciadi şeklinde yaz.");
      return;
    }
    const linkedin = normalizeLinkedinUrl(form.linkedin);
    if (form.linkedin.trim() && !linkedin) {
      setError("Geçerli bir LinkedIn profil bağlantısı veya kullanıcı adı yaz.");
      return;
    }
    const about = form.about.trim().replace(/\s+/g, " ");
    if (!about) {
      setError("Topluluğa neden katılmak istediğini ve ne katabileceğini yaz.");
      return;
    }
    if (!form.consent) {
      setError("Ağda görünür olmak için profil görünürlüğü açık rızasını vermelisin.");
      return;
    }
    setSubmitting(true);
    try {
      const memberData = {
        name: fullName.slice(0, 60),
        title: form.title.trim().slice(0, 40),
        skills: parseSkills(form.skills),
        email: form.email.trim(),
        instagram: instagram || undefined,
        linkedin: linkedin || undefined,
        motivation: about.replace(/\|\|/g, "|").slice(0, 140),
        contact: config.eventSource ? `event:${config.eventSource}` : undefined,
        consentAt: new Date().toISOString(),
      };
      if (editingUsername) {
        await updateMember(editingUsername, memberData);
        setNotice(
          `Değişikliklerin onaya gönderildi. Admin onayladıktan sonra kartın güncellenecek. Kullanıcı adın: ${editingUsername}`,
        );
      } else {
        const username = createUsername(
          fullName,
          members.map((member) => member.username),
        );
        await addMember({ ...memberData, username });
        setNotice(`Ağa eklendin. Bilgilerini güncellemek için kullanıcı adın: ${username}`);
      }
      setMembers(await listMembers());
      setForm({
        name: "",
        title: "",
        skills: "",
        email: "",
        instagram: "",
        linkedin: "",
        about: "",
        consent: false,
      });
      setEditingUsername("");
      setUsernameInput("");
    } catch {
      setError(
        editingUsername
          ? "Bilgiler güncellenemedi. Lütfen tekrar dene."
          : "Kayıt eklenemedi. Lütfen tekrar dene.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const loadMemberForEditing = () => {
    setError("");
    setNotice("");
    const username = usernameInput.trim().toLowerCase().replace(/^@/, "");
    const member = members.find((item) => item.username === username);
    if (!member) {
      setError("Bu kullanıcı adıyla eşleşen bir kayıt bulunamadı.");
      return;
    }
    setEditingUsername(member.username);
    setForm({
      name: member.name,
      title: member.title,
      skills: member.skills.join(", "),
      email: member.email || "",
      instagram: member.instagram ? `@${member.instagram}` : "",
      linkedin: member.linkedin || "",
      about: member.motivation || "",
      consent: false,
    });
    setNotice(`${member.username} kaydı açıldı. Alanları değiştirip güncelleyebilirsin.`);
  };

  const startEditingMember = (member: Member) => {
    setUpdateMode(true);
    setEditingUsername(member.username);
    setUsernameInput(member.username);
    setForm({
      name: member.name,
      title: member.title,
      skills: member.skills.join(", "),
      email: member.email || "",
      instagram: member.instagram ? `@${member.instagram}` : "",
      linkedin: member.linkedin || "",
      about: member.motivation || "",
      consent: false,
    });
    setSelectedMember(null);
    setNotice(`${member.username} kaydı açıldı. Alanları değiştirip güncelleyebilirsin.`);
    window.setTimeout(() => {
      document.getElementById("networking-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const addExistingToEvent = async () => {
    if (!config.eventSource) return;
    setError("");
    setNotice("");
    setCheckInMessage("");
    const query = checkInQuery.trim().replace(/^@/, "");
    if (!query) {
      setCheckInMessage("Username veya ad soyad yazman yeterli.");
      return;
    }

    const normalized = normalizeLookup(query);
    const match =
      members.find((member) => normalizeLookup(member.username) === normalized) ||
      members.find((member) => normalizeLookup(member.name) === normalized);

    if (!match) {
      setCheckInMessage(
        "Bu isim/username eski kayıtlarda yok. Aşağıdaki kısa formu doldur; seni 14 Temmuz ağına ekleyelim.",
      );
      setForm((current) => ({ ...current, name: query.includes(" ") ? query : current.name }));
      return;
    }

    if (match.contact?.includes(`event:${config.eventSource}`)) {
      setCheckInMessage(
        `${match.name} zaten 14 Temmuz ağına ekli. Kullanıcı adın: ${match.username}`,
      );
      return;
    }

    setCheckingIn(true);
    try {
      await saveMember(withEventSource(match, config.eventSource));
      const nextMembers = await listMembers();
      setMembers(nextMembers);
      setCheckInQuery("");
      setCheckInMessage(`${match.name} 14 Temmuz ağına eklendi. Hadi sahada bağ kurma zamanı.`);
    } catch {
      setCheckInMessage("Kayıt özel ağa eklenemedi. Bir kez daha dene.");
    } finally {
      setCheckingIn(false);
    }
  };

  const scopedMembers = useMemo(
    () =>
      config.eventSource
        ? members.filter((member) => member.contact?.includes(`event:${config.eventSource}`))
        : members,
    [config.eventSource, members],
  );

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return scopedMembers;
    return scopedMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.title.toLowerCase().includes(query) ||
        member.skills.some((skill) => skill.includes(query)) ||
        member.email?.toLowerCase().includes(query) ||
        member.instagram?.toLowerCase().includes(query) ||
        member.linkedin?.toLowerCase().includes(query) ||
        member.motivation?.toLowerCase().includes(query) ||
        member.contact?.toLowerCase().includes(query),
    );
  }, [scopedMembers, filter]);

  const memberTabs = useMemo(
    () => [
      { id: "all", label: "Tümü", count: filtered.length },
      ...roleGroups
        .map((group) => ({
          id: group.id,
          label: group.label,
          count: filtered.filter((member) => getRoleGroup(member).id === group.id).length,
        }))
        .filter((group) => group.count > 0),
    ],
    [filtered],
  );

  const visibleMembers = useMemo(
    () =>
      activeGroupId === "all"
        ? filtered
        : filtered.filter((member) => getRoleGroup(member).id === activeGroupId),
    [activeGroupId, filtered],
  );

  useEffect(() => {
    if (activeGroupId !== "all" && !memberTabs.some((tab) => tab.id === activeGroupId)) {
      setActiveGroupId("all");
    }
  }, [activeGroupId, memberTabs]);

  return (
    <div className={`min-h-screen flex flex-col ${config.shellClass}`} style={config.style}>
      <SiteNav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16 pb-6">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-foreground/70 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary blink" />
            <span>{config.eyebrow}</span>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="max-w-3xl text-4xl font-black tracking-[-0.04em] leading-[0.95] sm:text-6xl">
              {config.titlePrefix} <span className="text-primary">{config.titleAccent}</span>
            </h1>
            {variant === "july14" && <NtwMascot />}
          </div>
          <p className="mt-4 text-foreground/70 max-w-2xl text-base sm:text-lg">{config.intro}</p>
        </section>

        {config.eventSource && (
          <section className="mx-auto max-w-6xl px-5 pb-6">
            <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-primary-deep">
                    hızlı giriş
                  </div>
                  <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">
                    Hesabın varsa username’ini yaz, seni 14 Temmuz ağına ekleyelim.
                  </h2>
                  <p className="mt-1 text-sm text-foreground/60">
                    Username’i bilmiyorsan ad soyad yaz; eski kayıtlarla eşleştiririz. Eşleşme
                    bulamazsak aşağıdaki formdan yeni kayıt açabilirsin.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:w-[430px]">
                  <input
                    value={checkInQuery}
                    onChange={(event) => setCheckInQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addExistingToEvent();
                    }}
                    placeholder="username veya ad soyad"
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={addExistingToEvent}
                    disabled={checkingIn}
                    className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {checkingIn ? "ekleniyor…" : "ağa ekle"}
                  </button>
                </div>
              </div>
              {checkInMessage && (
                <p className="mt-3 rounded-xl bg-background/80 px-3 py-2 text-sm font-semibold text-primary-deep">
                  {checkInMessage}
                </p>
              )}
            </div>
          </section>
        )}

        {!profileLoading && !memberProfile ? (
          <section className="mx-auto max-w-6xl px-5 pb-10">
            <form
              id="networking-form"
              onSubmit={onSubmit}
              className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-6"
            >
              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-foreground/80">
                  {editingUsername ? `${editingUsername} bilgilerini güncelle` : "Kendini ekle"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (updateMode) {
                      setEditingUsername("");
                      setUsernameInput("");
                      setForm({
                        name: "",
                        title: "",
                        skills: "",
                        email: "",
                        instagram: "",
                        linkedin: "",
                        about: "",
                        consent: false,
                      });
                    }
                    setUpdateMode((current) => !current);
                    setError("");
                    setNotice("");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {updateMode ? "yeni kayıt formuna dön" : "verilerimi güncellemek istiyorum"}
                </button>
              </div>
              {updateMode && (
                <div className="sm:col-span-2 grid gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <Field
                    label="Kullanıcı adın"
                    placeholder="berkaktas"
                    value={usernameInput}
                    onChange={(event) => setUsernameInput(event.target.value)}
                    autoComplete="username"
                  />
                  <button
                    type="button"
                    onClick={loadMemberForEditing}
                    className="rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    bilgilerimi getir
                  </button>
                </div>
              )}
              <Field
                label="Ad Soyad*"
                placeholder="Berk Aktaş"
                value={form.name}
                onChange={set("name")}
                autoComplete="name"
                required
              />
              <Field
                label="Sıfat / Rol*"
                placeholder="yazılımcı"
                value={form.title}
                onChange={set("title")}
                required
              />
              <Field
                className="sm:col-span-2"
                label="Yetenekler"
                placeholder="react, ui, pazarlama (virgülle ayır)"
                value={form.skills}
                onChange={set("skills")}
              />
              <Field
                label="E-posta*"
                type="email"
                placeholder="isim@eposta.com"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
                required
              />
              <Field
                label="Instagram (opsiyonel)"
                placeholder="@kullaniciadi"
                value={form.instagram}
                onChange={set("instagram")}
                autoComplete="off"
              />
              <Field
                className="sm:col-span-2"
                label="LinkedIn (opsiyonel)"
                placeholder="linkedin.com/in/kullaniciadi"
                value={form.linkedin}
                onChange={set("linkedin")}
                autoComplete="url"
              />
              <TextArea
                className="sm:col-span-2"
                label="Neden bu toplulukta olmak istiyorsunuz? Topluluğa ne katabilirsiniz?*"
                placeholder="Kısaca kendini, motivasyonunu ve topluluğa sunabileceğin katkıyı anlat."
                value={form.about}
                onChange={set("about")}
                maxLength={140}
                required
              />
              <div className="sm:col-span-2 -mt-2 text-right text-[11px] text-foreground/45">
                {form.about.length}/140
              </div>
              <p className="sm:col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-foreground/60">
                Formu göndermeden önce{" "}
                <a
                  href="/kvkk"
                  target="_blank"
                  className="font-semibold text-primary-deep underline"
                >
                  KVKK Aydınlatma Metni
                </a>
                ’ni inceleyebilirsin. Aydınlatma metni bilgi amaçlıdır; aşağıdaki açık rıza
                tercihinden ayrıdır.
              </p>
              <label className="sm:col-span-2 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/70">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, consent: event.target.checked }))
                  }
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                  Profil bilgilerimin notwork networking ağında görünmesine ve bağlantı önerilerinde
                  kullanılmasına açık rıza veriyorum.{" "}
                  <a
                    href="/acik-riza"
                    target="_blank"
                    className="font-semibold text-primary-deep underline"
                  >
                    Açık Rıza Metni
                  </a>
                </span>
              </label>
              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-foreground/50">
                  {config.formNote}
                  <span className="mt-1 block font-semibold text-foreground/65">
                    Etkinliklere ve organizasyonlara düzenli katılım sağlamanız çok önemlidir.
                  </span>
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting
                    ? "kaydediliyor…"
                    : editingUsername
                      ? "bilgilerimi güncelle"
                      : "ağa ekle"}
                </button>
              </div>
              {notice && (
                <p
                  role="status"
                  className="sm:col-span-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary-deep"
                >
                  {notice}
                </p>
              )}
              {error && (
                <p role="alert" className="sm:col-span-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </form>
          </section>
        ) : null}

        <section className="mx-auto max-w-6xl px-5 pb-10">
          <div
            className={
              config.eventSource
                ? "relative overflow-hidden rounded-[2rem] border border-primary/30 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_34%),var(--card)] p-4 shadow-[var(--shadow-soft)] before:absolute before:inset-x-6 before:top-0 before:h-px before:animate-pulse before:bg-primary/70 sm:p-6"
                : ""
            }
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm sm:text-lg font-semibold text-foreground/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary blink" />
                {config.countLabel} — {scopedMembers.length} kişi
              </h2>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {config.eventSource && (
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("notwork-community-map")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    className="rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary-deep transition hover:bg-primary hover:text-primary-foreground"
                  >
                    var olan topluluğu görmek için tıkla
                  </button>
                )}
                <input
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="ara: isim, sıfat, yetenek"
                  className="px-3 py-2 rounded-full bg-card border border-border text-sm w-44 sm:w-64"
                />
              </div>
            </div>
            <NetworkGraph
              members={filtered}
              loading={loading}
              hint={config.graphHint}
              emptyText={config.graphEmpty}
              onSelectMember={setSelectedMember}
            />
            <RecommendationFinder
              members={scopedMembers}
              loading={loading}
              onOpenMember={setSelectedMember}
              canViewContacts={canViewContacts}
            />
          </div>
        </section>

        {config.eventSource && (
          <section id="notwork-community-map" className="scroll-mt-24 mx-auto max-w-6xl px-5 pb-10">
            <div className="rounded-[2rem] border border-primary/25 bg-card p-4 shadow-[var(--shadow-soft)] sm:p-6">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-primary-deep">
                    notwork community
                  </div>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                    Var olan topluluk haritası
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/60">
                    Bu çerçeve genel notwork community ağını gösterir. 14 Temmuz’da kayıt olanlar bu
                    büyük topluluğun içinde de yer alır.
                  </p>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/60">
                  {members.length} kişi
                </div>
              </div>
              <NetworkGraph
                members={members}
                loading={loading}
                hint="notwork community ağını gez"
                emptyText="community ağı henüz yüklenmedi."
                onSelectMember={setSelectedMember}
              />
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="text-sm sm:text-lg font-semibold text-foreground/80 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {config.membersTitle}
          </h2>
          <div
            role="tablist"
            aria-label="Üye kategorileri"
            className="mb-5 flex gap-2 overflow-x-auto pb-2"
          >
            {memberTabs.map((tab) => {
              const active = activeGroupId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveGroupId(tab.id)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground/65 hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {tab.label} · {tab.count}
                </button>
              );
            })}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMembers.map((member) => {
              const contact = getMemberContact(member);
              const badges = getMemberEventBadges(member);
              return (
                <div key={member.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <MemberAvatar member={member} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMember(member)}
                          className="truncate text-left text-lg font-bold transition hover:text-primary-deep"
                        >
                          {member.name}
                        </button>
                        <div className="text-right text-xs text-foreground/60">{member.title}</div>
                      </div>
                      {member.username && (
                        <div className="mt-1 text-[11px] font-semibold text-foreground/45">
                          kullanıcı adı: {member.username}
                        </div>
                      )}
                    </div>
                  </div>
                  {badges.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {badges.map((badge) => (
                        <span
                          key={badge.source}
                          className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary-deep"
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {member.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {canViewContacts ? (
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 pt-3 text-xs">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="font-semibold text-primary-deep transition hover:text-primary"
                        >
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-foreground/40">e-posta eklenmedi</span>
                      )}
                      {contact.instagram && (
                        <a
                          href={`https://instagram.com/${contact.instagram}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-primary-deep transition hover:text-primary"
                        >
                          @{contact.instagram} →
                        </a>
                      )}
                      {contact.linkedin && (
                        <a
                          href={contact.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-primary-deep transition hover:text-primary"
                        >
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  ) : (
                    <ContactGate compact />
                  )}
                  {contact.about && (
                    <p className="mt-3 border-t border-border/70 pt-3 text-sm leading-relaxed text-foreground/65">
                      {contact.about}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className="mt-3 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary-deep transition hover:bg-primary hover:text-primary-foreground"
                  >
                    bağlantılarını gör
                  </button>
                </div>
              );
            })}
            {visibleMembers.length === 0 && !loading && (
              <div className="text-sm text-foreground/50">{config.membersEmpty}</div>
            )}
          </div>
        </section>
      </main>
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          members={scopedMembers.length > 0 ? scopedMembers : members}
          onClose={() => setSelectedMember(null)}
          onEdit={startEditingMember}
          onOpenMember={setSelectedMember}
          canViewContacts={canViewContacts}
          hasMemberSession={Boolean(memberProfile)}
        />
      )}
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  className = "",
  ...props
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs text-foreground/60">{label}</span>
      <input
        {...props}
        className="px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
      />
    </label>
  );
}

function TextArea({
  label,
  className = "",
  ...props
}: {
  label: string;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs text-foreground/60">{label}</span>
      <textarea
        {...props}
        rows={4}
        className="resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function MemberAvatar({
  member,
  size = "medium",
}: {
  member: Member;
  size?: "small" | "medium" | "large";
}) {
  const [failed, setFailed] = useState(false);
  const initials = member.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
  const sizeClass = {
    small: "h-9 w-9 text-[10px]",
    medium: "h-12 w-12 text-sm",
    large: "h-20 w-20 text-xl sm:h-24 sm:w-24",
  }[size];

  return (
    <div
      className={`${sizeClass} grid shrink-0 place-items-center overflow-hidden rounded-full border border-primary/35 bg-primary/10 font-black text-primary-deep shadow-sm`}
      aria-label={`${member.name} profil fotoğrafı`}
    >
      {member.photoUrl && !failed ? (
        <img
          src={member.photoUrl}
          alt={`${member.name} profil fotoğrafı`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials || "ntw"}</span>
      )}
    </div>
  );
}

function ContactGate({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 text-foreground/65 ${
        compact ? "mt-3 px-3 py-2 text-[11px]" : "mt-5 p-4 text-sm"
      }`}
    >
      <LockKeyhole className={compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0"} />
      <span className="min-w-0 flex-1">
        İletişim bilgileri yalnızca giriş yapan doğrulanmış ntw üyelerine açık.
      </span>
      <Link
        to="/profil"
        className="shrink-0 font-black text-primary-deep underline decoration-primary/40 underline-offset-2"
      >
        giriş yap
      </Link>
    </div>
  );
}

function svgSafeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function NtwMascot() {
  return (
    <div
      aria-label="notwork community maskotu"
      className="relative mx-auto h-32 w-32 shrink-0 sm:mx-0 sm:h-40 sm:w-40"
    >
      <div className="absolute inset-2 rounded-[36%_45%_38%_42%] bg-primary/20 blur-xl" />
      <svg viewBox="0 0 160 160" role="img" className="relative h-full w-full drop-shadow-xl">
        <defs>
          <linearGradient id="ntwBody" x1="26" x2="130" y1="24" y2="145">
            <stop offset="0" stopColor="#bfeff1" />
            <stop offset="0.52" stopColor="#8fcbd0" />
            <stop offset="1" stopColor="#5aa7ba" />
          </linearGradient>
          <linearGradient id="ntwScreen" x1="46" x2="120" y1="48" y2="94">
            <stop offset="0" stopColor="#142643" />
            <stop offset="1" stopColor="#1d315a" />
          </linearGradient>
        </defs>
        <path
          d="M46 35c5-17 24-22 37-12 11-13 36-4 37 15 17 2 24 18 15 32 9 12 2 31-13 34-1 20-24 29-39 17-15 12-38 2-40-17-17-4-23-24-12-36-9-11-2-29 15-33Z"
          fill="url(#ntwBody)"
          stroke="#173f68"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect
          x="39"
          y="48"
          width="83"
          height="51"
          rx="15"
          fill="url(#ntwScreen)"
          stroke="#0d203a"
          strokeWidth="5"
        />
        <path
          d="M59 64l13 12-13 12"
          fill="none"
          stroke="#b8fff5"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M91 80h17" stroke="#b8fff5" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M51 104c-10 5-15 14-11 23 4 10 18 11 25 3"
          fill="#74b7cf"
          stroke="#173f68"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M111 104c11 5 16 14 12 23-4 10-18 11-25 3"
          fill="#74b7cf"
          stroke="#173f68"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M61 121c-5 11-1 21 11 21s17-10 13-21"
          fill="#6eadc8"
          stroke="#173f68"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M91 121c-4 11 1 21 13 21s16-10 11-21"
          fill="#6eadc8"
          stroke="#173f68"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect
          x="59"
          y="103"
          width="45"
          height="20"
          rx="10"
          fill="#7fd3df"
          stroke="#173f68"
          strokeWidth="4"
        />
        <text
          x="81"
          y="117"
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          fill="#12324f"
          letterSpacing="1.5"
        >
          ntw
        </text>
      </svg>
    </div>
  );
}

function RecommendationFinder({
  members,
  loading,
  onOpenMember,
  canViewContacts,
}: {
  members: Member[];
  loading: boolean;
  onOpenMember: (member: Member) => void;
  canViewContacts: boolean;
}) {
  const [username, setUsername] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [message, setMessage] = useState("");
  const recommendations = useMemo(
    () => (selectedMember ? getRecommendations(selectedMember, members) : []),
    [members, selectedMember],
  );

  const findMatches = () => {
    const normalized = normalizeLookup(username.trim().replace(/^@/, ""));
    const member =
      members.find((item) => normalizeLookup(item.username) === normalized) ||
      members.find((item) => normalizeLookup(item.name) === normalized);
    if (!member) {
      setSelectedMember(null);
      setMessage("Bu kullanıcı adı veya ad soyad ile eşleşen bir kayıt bulunamadı.");
      return;
    }
    setSelectedMember(member);
    setMessage("");
    onOpenMember(member);
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-primary/25 bg-primary/5 transition-all">
      <div className="flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center">
        <div className="px-2 text-xs font-bold text-primary-deep sm:whitespace-nowrap">
          Beni bul · bağlantılarımı göster
        </div>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") findMatches();
          }}
          placeholder="username veya ad soyad"
          disabled={loading}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={findMatches}
          disabled={loading}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          beni bul
        </button>
      </div>
      {message && (
        <p className="border-t border-border px-4 py-2 text-sm text-destructive">{message}</p>
      )}
      {selectedMember && (
        <div className="border-t border-primary/20 p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-black">{selectedMember.name} için önerilen bağlantılar</h3>
            <span className="text-[11px] text-foreground/45">
              ortak yetenek + tamamlayıcı rol + ortak hedef
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {recommendations.map((recommendation, index) => {
              const contact = getMemberContact(recommendation.member);
              return (
                <article
                  key={recommendation.member.id}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="text-[10px] font-black text-primary-deep">#{index + 1}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <MemberAvatar member={recommendation.member} size="small" />
                    <div className="min-w-0">
                      <div className="truncate font-bold leading-tight">
                        {recommendation.member.name}
                      </div>
                      <div className="mt-1 text-[11px] text-foreground/50">
                        {recommendation.member.title}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-foreground/60">
                    {recommendation.reasons.join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-primary-deep">
                    <button
                      type="button"
                      onClick={() => onOpenMember(recommendation.member)}
                      className="hover:underline"
                    >
                      Detay
                    </button>
                    {canViewContacts && contact.email && (
                      <a href={`mailto:${contact.email}`}>E-posta</a>
                    )}
                    {canViewContacts && contact.linkedin && (
                      <a href={contact.linkedin} target="_blank" rel="noreferrer">
                        LinkedIn
                      </a>
                    )}
                    {canViewContacts && contact.instagram && (
                      <a
                        href={`https://instagram.com/${contact.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] text-foreground/40">
            Öneriler profilindeki yetenekler, rolün, motivasyon metnin ve tamamlayıcı iş alanları
            puanlanarak oluşturulur.
          </p>
        </div>
      )}
    </div>
  );
}

function NetworkGraph({
  members,
  loading,
  hint = "kaydırarak ağı gez",
  emptyText = "henüz kimse yok — formdan ekle.",
  onSelectMember,
}: {
  members: Member[];
  loading: boolean;
  hint?: string;
  emptyText?: string;
  onSelectMember?: (member: Member) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState<string | null>(null);
  const [overview, setOverview] = useState(false);

  useEffect(() => {
    if (!wrapRef.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(320, entry.contentRect.width)),
    );
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [loading]);

  const groupedMembers = useMemo(
    () =>
      roleGroups.flatMap((group) => {
        const groupMembers = members.filter((member) => getRoleGroup(member).id === group.id);
        if (groupMembers.length === 0) return [];
        if (groupMembers.length <= maxMembersPerVisualCluster) {
          return [
            {
              group,
              label: group.label,
              members: groupMembers,
              visualId: group.id,
            },
          ];
        }

        const subgroupMap = new Map<string, { label: string; members: Member[] }>();
        for (const member of groupMembers) {
          const subgroup = getRoleSubgroup(member, group.id);
          const current = subgroupMap.get(subgroup.id) || { label: subgroup.label, members: [] };
          current.members.push(member);
          subgroupMap.set(subgroup.id, current);
        }

        return [...subgroupMap.entries()].flatMap(([subgroupId, subgroup]) =>
          chunkMembers(subgroup.members).map((chunk, chunkIndex, chunks) => ({
            group,
            label:
              subgroup.label === "Genel"
                ? group.label
                : `${group.label} / ${subgroup.label}${chunks.length > 1 ? ` ${chunkIndex + 1}` : ""}`,
            members: chunk,
            visualId: `${group.id}-${subgroupId}-${chunkIndex}`,
          })),
        );
      }),
    [members],
  );

  const layout = useMemo(() => {
    const cellWidth = width < 700 ? 340 : 330;
    const cellHeight = width < 700 ? 320 : 300;
    const maxColumns = width < 700 ? 2 : width < 980 ? 3 : 4;
    const columns = Math.max(1, Math.min(groupedMembers.length, maxColumns));
    const canvasWidth = Math.max(width, columns * cellWidth);
    const rows = Math.ceil(groupedMembers.length / columns);
    const height = Math.max(390, rows * cellHeight + 20);
    const clusters = groupedMembers.map((entry, groupIndex) => ({
      ...entry,
      centerX: (groupIndex % columns) * cellWidth + cellWidth / 2,
      centerY: Math.floor(groupIndex / columns) * cellHeight + cellHeight / 2 + 10,
      radius: 112,
    }));
    const nodes = clusters.flatMap((cluster) =>
      cluster.members.map((member, memberIndex) => {
        let ringIndex = memberIndex;
        let ringCount = Math.min(8, cluster.members.length);
        let orbit = 52;
        if (memberIndex >= 8) {
          ringIndex = memberIndex - 8;
          ringCount = Math.max(1, Math.min(12, cluster.members.length - 8));
          orbit = 88;
        }
        if (memberIndex >= 20) {
          ringIndex = memberIndex - 20;
          ringCount = Math.max(1, cluster.members.length - 20);
          orbit = 120;
        }
        const angle = (ringIndex / ringCount) * Math.PI * 2 - Math.PI / 2;
        return {
          ...member,
          groupId: cluster.group.id,
          visualId: cluster.visualId,
          x: cluster.centerX + Math.cos(angle) * orbit * (cluster.members.length > 1 ? 1 : 0),
          y: cluster.centerY + Math.sin(angle) * orbit * (cluster.members.length > 1 ? 1 : 0),
        };
      }),
    );
    return { canvasWidth, clusters, height, nodes };
  }, [groupedMembers, width]);

  const edges = useMemo(() => {
    const connections = new Map<string, { first: number; second: number; weight: number }>();
    layout.nodes.forEach((node, firstIndex) => {
      const matches = getRecommendations(node, layout.nodes)
        .filter((match) => match.member.id !== node.id)
        .slice(0, 1);
      for (const match of matches) {
        const secondIndex = layout.nodes.findIndex((candidate) => candidate.id === match.member.id);
        if (secondIndex < 0) continue;
        const [first, second] = [firstIndex, secondIndex].sort((a, b) => a - b);
        const key = `${first}-${second}`;
        const shared = layout.nodes[first].skills.filter((skill) =>
          layout.nodes[second].skills.includes(skill),
        ).length;
        connections.set(key, { first, second, weight: 1 + shared });
      }
    });
    return [...connections.values()];
  }, [layout.nodes]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card h-[420px] grid place-items-center text-foreground/50 text-sm">
        ağ yükleniyor…
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOverview((current) => !current)}
        className="absolute left-3 top-3 z-10 rounded-full border border-primary/30 bg-background/95 px-3 py-1.5 text-[11px] font-black text-primary-deep shadow-sm backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
      >
        {overview ? "Yakın görünüm" : "Büyüt"}
      </button>
      <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full border border-border bg-background/90 px-3 py-1.5 text-[11px] text-foreground/60 shadow-sm backdrop-blur">
        {overview ? "tüm daireler görünür" : hint}
      </div>
      <div
        ref={wrapRef}
        className={
          overview
            ? "h-[72vh] min-h-[520px] overflow-hidden p-3 pt-12"
            : "h-[540px] overflow-auto overscroll-contain sm:h-[650px]"
        }
      >
        <svg
          width={overview ? "100%" : layout.canvasWidth}
          height={overview ? "100%" : layout.height}
          viewBox={overview ? `0 0 ${layout.canvasWidth} ${layout.height}` : undefined}
          preserveAspectRatio="xMidYMid meet"
          className="block"
        >
          <defs>
            <marker
              id="network-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary/40" />
            </marker>
            {layout.nodes
              .filter((node) => Boolean(node.photoUrl))
              .map((node) => (
                <clipPath key={node.id} id={`network-avatar-${svgSafeId(node.id)}`}>
                  <circle r="20" />
                </clipPath>
              ))}
          </defs>
          {layout.clusters.map((cluster) => (
            <g key={cluster.visualId}>
              <circle
                cx={cluster.centerX}
                cy={cluster.centerY}
                r={cluster.radius}
                className="fill-primary/5 stroke-primary/30"
                strokeWidth={1.25}
                strokeDasharray="6 6"
              />
              <text
                x={cluster.centerX}
                y={cluster.centerY - cluster.radius - 14}
                textAnchor="middle"
                className="fill-foreground/70 text-[11px] font-bold uppercase tracking-wider"
              >
                {cluster.label} · {cluster.members.length}
              </text>
            </g>
          ))}
          {edges.map((edge) => {
            const first = layout.nodes[edge.first];
            const second = layout.nodes[edge.second];
            const active = hover === first.id || hover === second.id;
            const crossGroup = first.groupId !== second.groupId;
            return (
              <line
                key={`${first.id}-${second.id}`}
                x1={first.x}
                y1={first.y}
                x2={second.x}
                y2={second.y}
                markerEnd={crossGroup ? "url(#network-arrow)" : undefined}
                className={
                  active
                    ? "stroke-primary"
                    : crossGroup
                      ? "stroke-primary/20"
                      : "stroke-foreground/15"
                }
                strokeWidth={Math.min(2.5, 0.7 + edge.weight * 0.45)}
              />
            );
          })}
          {layout.nodes.map((node) => {
            const active = hover === node.id;
            const firstName = node.name.split(" ")[0].slice(0, 10);
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHover(node.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectMember?.(node)}
                className="cursor-pointer"
              >
                <circle
                  r={active ? 25 : 21}
                  className={
                    active
                      ? "fill-primary stroke-primary-deep"
                      : "fill-background stroke-primary/55"
                  }
                  strokeWidth={1.5}
                />
                {node.photoUrl ? (
                  <image
                    href={node.photoUrl}
                    x={-20}
                    y={-20}
                    width={40}
                    height={40}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#network-avatar-${svgSafeId(node.id)})`}
                    style={{ pointerEvents: "none" }}
                  />
                ) : (
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    className={`text-[8px] font-bold ${active ? "fill-primary-foreground" : "fill-foreground"}`}
                    style={{ pointerEvents: "none" }}
                  >
                    {firstName}
                  </text>
                )}
                <circle
                  r={active ? 25 : 21}
                  className={
                    active ? "fill-none stroke-primary-deep" : "fill-none stroke-primary/55"
                  }
                  strokeWidth={active ? 2.5 : 1.5}
                  style={{ pointerEvents: "none" }}
                />
                {active && (
                  <g style={{ pointerEvents: "none" }}>
                    <rect
                      x={-72}
                      y={31}
                      width={144}
                      height={38}
                      rx={8}
                      className="fill-background stroke-border"
                    />
                    <text
                      textAnchor="middle"
                      y={46}
                      className="fill-foreground text-[10px] font-bold"
                    >
                      {node.name.slice(0, 22)}
                    </text>
                    <text textAnchor="middle" y={60} className="fill-foreground/60 text-[8px]">
                      {node.title.slice(0, 28)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {layout.nodes.length === 0 && (
        <div className="absolute inset-0 grid place-items-center text-sm text-foreground/50">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function MemberDetailModal({
  member,
  members,
  onClose,
  onEdit,
  onOpenMember,
  canViewContacts,
  hasMemberSession,
}: {
  member: Member;
  members: Member[];
  onClose: () => void;
  onEdit: (member: Member) => void;
  onOpenMember: (member: Member) => void;
  canViewContacts: boolean;
  hasMemberSession: boolean;
}) {
  const contact = getMemberContact(member);
  const recommendations = getRecommendations(member, members);
  const badges = getMemberEventBadges(member);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} bağlantı detayları`}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/45 p-3 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[2rem] border border-border bg-background shadow-[0_30px_120px_-40px_rgba(10,25,35,0.55)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_36%),var(--card)] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <MemberAvatar member={member} size="large" />
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-primary-deep">
                    kişi kartı
                  </div>
                  <h2 className="mt-3 break-words text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                    {member.name}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-foreground/60">{member.title}</p>
                  {member.username && (
                    <p className="mt-1 text-xs font-bold text-primary-deep">@{member.username}</p>
                  )}
                  {badges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {badges.map((badge) => (
                        <span
                          key={badge.source}
                          className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary-deep"
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-lg font-black transition hover:bg-muted"
                aria-label="Popup kapat"
              >
                ×
              </button>
            </div>

            {member.skills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary-deep"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {contact.about && (
              <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-relaxed text-foreground/70">
                {contact.about}
              </p>
            )}

            {canViewContacts ? (
              <div className="mt-5 grid gap-2 text-sm">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-semibold text-primary-deep transition hover:border-primary/60"
                  >
                    E-posta gönder · {contact.email}
                  </a>
                )}
                {contact.instagram && (
                  <a
                    href={`https://instagram.com/${contact.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-border bg-background px-4 py-3 font-semibold text-primary-deep transition hover:border-primary/60"
                  >
                    Instagram · @{contact.instagram}
                  </a>
                )}
                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-border bg-background px-4 py-3 font-semibold text-primary-deep transition hover:border-primary/60"
                  >
                    LinkedIn profiline git
                  </a>
                )}
              </div>
            ) : (
              <ContactGate />
            )}

            {hasMemberSession ? (
              <Link
                to="/profil"
                className="mt-5 block w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-black text-primary-foreground transition hover:opacity-90"
              >
                profilimi düzenle
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onEdit(member)}
                className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
              >
                bilgilerimi güncellemek istiyorum
              </button>
            )}
          </section>

          <section className="p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-primary-deep">
                  potansiyel bağlantılar
                </div>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.03em]">
                  Bu kişi kimlerle eşleşebilir?
                </h3>
              </div>
              <span className="text-xs text-foreground/45">algoritmik öneri · 5 kişi</span>
            </div>
            {!canViewContacts && <ContactGate compact />}
            <div className="mt-5 grid gap-3">
              {recommendations.map((recommendation, index) => {
                const recommendationContact = getMemberContact(recommendation.member);
                return (
                  <article
                    key={recommendation.member.id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 items-start gap-3">
                        <MemberAvatar member={recommendation.member} size="small" />
                        <div className="min-w-0">
                          <div className="text-[10px] font-black text-primary-deep">
                            #{index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenMember(recommendation.member)}
                            className="mt-1 text-left text-lg font-black transition hover:text-primary-deep"
                          >
                            {recommendation.member.name}
                          </button>
                          <div className="text-xs text-foreground/50">
                            {recommendation.member.title}
                          </div>
                        </div>
                      </div>
                      {canViewContacts && (
                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-primary-deep">
                          {recommendationContact.email && (
                            <a href={`mailto:${recommendationContact.email}`}>E-posta</a>
                          )}
                          {recommendationContact.instagram && (
                            <a
                              href={`https://instagram.com/${recommendationContact.instagram}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Instagram
                            </a>
                          )}
                          {recommendationContact.linkedin && (
                            <a
                              href={recommendationContact.linkedin}
                              target="_blank"
                              rel="noreferrer"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                      {recommendation.reasons.join(" · ")}
                    </p>
                  </article>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-foreground/45">
              Eşleşmeler; ortak yetenekler, tamamlayıcı rol grupları, benzer hedef kelimeleri ve
              profil doluluğu üzerinden puanlanır.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
