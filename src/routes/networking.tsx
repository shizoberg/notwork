import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import {
  addMember,
  createUsername,
  listMembers,
  parseSkills,
  type Member,
  updateMember,
} from "@/lib/networking-api";

export const Route = createFileRoute("/networking")({
  head: () => ({
    meta: [
      { title: "Networking · notwork — kim ne yapıyor?" },
      {
        name: "description",
        content:
          "notwork topluluğunun yetenek ağı. Kendi sıfatını ve yapabildiklerini ekle, ortak yeteneklere sahip insanlarla bağlan.",
      },
    ],
  }),
  component: NetworkingPage,
});

const roleGroups = [
  {
    id: "technology",
    label: "Teknoloji & Veri",
    keywords: ["yazılım", "developer", "veri", "react", "typescript", "python", "api", "excel"],
  },
  {
    id: "design",
    label: "Tasarım & Ürün",
    keywords: ["tasarım", "mimar", "ux", "ui", "figma", "illüstr", "moda", "ürün"],
  },
  {
    id: "content",
    label: "İçerik & Sahne",
    keywords: ["içerik", "fotoğraf", "video", "müzik", "sahne", "kurgu", "prodüksiyon"],
  },
  {
    id: "marketing",
    label: "Pazarlama & Satış",
    keywords: ["pazarlama", "satış", "marka", "sosyal medya"],
  },
  {
    id: "community",
    label: "Topluluk & Etkinlik",
    keywords: ["topluluk", "etkinlik", "organizasyon", "turizm", "seyahat"],
  },
  {
    id: "business",
    label: "Girişim & Strateji",
    keywords: ["girişim", "finans", "strateji", "bütçe", "proje"],
  },
  {
    id: "people",
    label: "İnsan & Gelişim",
    keywords: ["psikolog", "insan kaynakları", "eğitim", "kariyer", "işe alım", "empati"],
  },
  {
    id: "other",
    label: "Diğer Bağlamlar",
    keywords: [],
  },
] as const;

function getRoleGroup(member: Member) {
  const title = member.title.toLocaleLowerCase("tr-TR");
  const skills = member.skills.join(" ").toLocaleLowerCase("tr-TR");
  return (
    roleGroups.find(
      (group) => group.id !== "other" && group.keywords.some((keyword) => title.includes(keyword)),
    ) ||
    roleGroups.find(
      (group) => group.id !== "other" && group.keywords.some((keyword) => skills.includes(keyword)),
    ) ||
    roleGroups[roleGroups.length - 1]
  );
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
  technology: ["design", "marketing", "business"],
  design: ["technology", "marketing", "content"],
  content: ["marketing", "community", "design"],
  marketing: ["content", "business", "technology", "design"],
  community: ["content", "people", "business"],
  business: ["technology", "marketing", "people", "community"],
  people: ["business", "community", "technology"],
  other: ["business", "community", "marketing"],
};

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

  return members
    .filter((candidate) => candidate.id !== member.id)
    .map((candidate) => {
      const candidateGroup = getRoleGroup(candidate);
      const sharedSkills = member.skills.filter((skill) => candidate.skills.includes(skill));
      const sharedThemes = [...new Set(profileWords(candidate).filter((word) => memberWords.has(word)))]
        .filter((word) => !sharedSkills.some((skill) => skill.includes(word)))
        .slice(0, 2);
      const complementary = complementaryGroups[memberGroup.id]?.includes(candidateGroup.id);
      const sameGroup = memberGroup.id === candidateGroup.id;
      let score = sharedSkills.length * 6 + sharedThemes.length * 2;
      if (complementary) score += 8;
      if (sameGroup) score += 4;
      if (candidate.linkedin) score += 1;
      if (candidate.motivation) score += 1;

      const reasons: string[] = [];
      if (complementary) {
        reasons.push(`${memberGroup.label} ile ${candidateGroup.label} birbirini tamamlıyor`);
      }
      if (sharedSkills.length > 0) {
        reasons.push(`Ortak alan: ${sharedSkills.slice(0, 2).join(", ")}`);
      } else if (sharedThemes.length > 0) {
        reasons.push(`Benzer hedefler: ${sharedThemes.join(", ")}`);
      }
      if (sameGroup && reasons.length < 2) reasons.push(`Aynı uzmanlık çevresinde çalışıyorsunuz`);
      if (reasons.length === 0) reasons.push(`Farklı uzmanlıklar yeni bir iş birliği yaratabilir`);

      return { member: candidate, reasons: reasons.slice(0, 2), score };
    })
    .sort((first, second) => second.score - first.score || first.member.name.localeCompare(second.member.name, "tr"))
    .slice(0, 5);
}

function NetworkingPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    title: "",
    skills: "",
    email: "",
    instagram: "",
    linkedin: "",
    about: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [updateMode, setUpdateMode] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [editingUsername, setEditingUsername] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const [activeGroupId, setActiveGroupId] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    listMembers()
      .then(setMembers)
      .catch(() => setError("Networking kayıtları şu anda yüklenemiyor."))
      .finally(() => setLoading(false));
  }, []);

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
      };
      if (editingUsername) {
        await updateMember(editingUsername, memberData);
        setNotice(`Bilgilerin güncellendi. Kullanıcı adın: ${editingUsername}`);
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
    });
    setNotice(`${member.username} kaydı açıldı. Alanları değiştirip güncelleyebilirsin.`);
  };

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return members;
    return members.filter(
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
  }, [members, filter]);

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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteNav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16 pb-6">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-foreground/70 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary blink" />
            <span>canlı yetenek ağı</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-[-0.04em] leading-[0.95]">
            kim, ne <span className="text-primary">yapabiliyor?</span>
          </h1>
          <p className="mt-4 text-foreground/70 max-w-2xl text-base sm:text-lg">
            notwork topluluğunun yetenek haritası. Kendini ekle, ortak yeteneklere sahip insanlarla
            bağlan. Aynı yeteneği paylaşanlar ağda birbirine bağlanır.
          </p>
        </section>

        <RecommendationFinder members={members} loading={loading} />

        <section className="mx-auto max-w-6xl px-5 pb-10">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 grid gap-4 sm:grid-cols-2"
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
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-foreground/50">
                Bilgilerin ortak networking veritabanına eklenir ve ağda görünür.
                <span className="mt-1 block font-semibold text-foreground/65">
                  Etkinliklere ve organizasyonlara düzenli katılım sağlamanız çok önemlidir.
                </span>
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? "kaydediliyor…" : editingUsername ? "bilgilerimi güncelle" : "ağa ekle"}
              </button>
            </div>
            {notice && (
              <p role="status" className="sm:col-span-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary-deep">
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

        <section className="mx-auto max-w-6xl px-5 pb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm sm:text-lg font-semibold text-foreground/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              ağ — {members.length} kişi
            </h2>
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="ara: isim, sıfat, yetenek"
              className="px-3 py-2 rounded-full bg-card border border-border text-sm w-44 sm:w-64"
            />
          </div>
          <NetworkGraph members={filtered} loading={loading} />
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="text-sm sm:text-lg font-semibold text-foreground/80 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            üyeler
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
              return (
                <div key={member.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-bold text-lg">{member.name}</div>
                    <div className="text-xs text-foreground/60">{member.title}</div>
                  </div>
                  {member.username && (
                    <div className="mt-1 text-[11px] font-semibold text-foreground/45">
                      kullanıcı adı: {member.username}
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
                  {contact.about && (
                    <p className="mt-3 border-t border-border/70 pt-3 text-sm leading-relaxed text-foreground/65">
                      {contact.about}
                    </p>
                  )}
                </div>
              );
            })}
            {visibleMembers.length === 0 && !loading && (
              <div className="text-sm text-foreground/50">henüz kimse yok — ilk sen ekle.</div>
            )}
          </div>
        </section>
      </main>
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

function RecommendationFinder({ members, loading }: { members: Member[]; loading: boolean }) {
  const [username, setUsername] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [message, setMessage] = useState("");
  const recommendations = useMemo(
    () => (selectedMember ? getRecommendations(selectedMember, members) : []),
    [members, selectedMember],
  );

  const findMatches = () => {
    const normalized = username.trim().toLowerCase().replace(/^@/, "");
    const member = members.find((item) => item.username === normalized);
    if (!member) {
      setSelectedMember(null);
      setMessage("Bu kullanıcı adıyla eşleşen bir kayıt bulunamadı.");
      return;
    }
    setSelectedMember(member);
    setMessage("");
  };

  return (
    <section className="mx-auto max-w-6xl px-5 pb-10">
      <div className="overflow-hidden rounded-2xl border border-primary/30 bg-primary/5">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary-deep">
              Akıllı eşleşme
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              Mutlaka tanışman gerekenler
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/60">
              Kullanıcı adını yaz; yetenek, rol ve tamamlayıcı iş alanlarına göre sana en uygun 5
              kişiyi bulalım.
            </p>
            <div className="mt-5 flex gap-2">
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") findMatches();
                }}
                placeholder="kullanıcı adın"
                disabled={loading}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={findMatches}
                disabled={loading}
                className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                eşleşmelerimi bul
              </button>
            </div>
            {message && <p className="mt-3 text-sm text-destructive">{message}</p>}
            <p className="mt-4 text-[11px] leading-relaxed text-foreground/45">
              Öneri modeli; ortak yetenekleri, tamamlayıcı meslek gruplarını, profil metinlerindeki
              ortak temaları ve iletişim kurulabilirliğini puanlar.
            </p>
          </div>

          <div className="grid gap-2.5">
            {selectedMember ? (
              recommendations.map((recommendation, index) => {
                const contact = getMemberContact(recommendation.member);
                return (
                  <article
                    key={recommendation.member.id}
                    className="rounded-xl border border-border bg-card p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-black text-primary-deep">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <h3 className="font-bold">{recommendation.member.name}</h3>
                          <span className="text-xs text-foreground/50">
                            {recommendation.member.title}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-foreground/60">
                          {recommendation.reasons.join(" · ")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-primary-deep">
                          {contact.email && <a href={`mailto:${contact.email}`}>E-posta gönder</a>}
                          {contact.linkedin && (
                            <a href={contact.linkedin} target="_blank" rel="noreferrer">
                              LinkedIn →
                            </a>
                          )}
                          {contact.instagram && (
                            <a
                              href={`https://instagram.com/${contact.instagram}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Instagram →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="grid min-h-52 place-items-center rounded-xl border border-dashed border-primary/30 bg-background/45 p-6 text-center text-sm text-foreground/45">
                Kullanıcı adını yazdığında kişisel eşleşmelerin burada görünecek.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkGraph({ members, loading }: { members: Member[]; loading: boolean }) {
  const groupedMembers = useMemo(
    () =>
      roleGroups
        .map((group) => ({
          group,
          members: members.filter((member) => getRoleGroup(member).id === group.id),
        }))
        .filter((entry) => entry.members.length > 0),
    [members],
  );

  const edges = useMemo(() => {
    const connections: { first: string; second: string; weight: number }[] = [];
    for (let first = 0; first < groupedMembers.length; first += 1) {
      for (let second = first + 1; second < groupedMembers.length; second += 1) {
        const firstGroup = groupedMembers[first];
        const secondGroup = groupedMembers[second];
        const complementary = complementaryGroups[firstGroup.group.id]?.includes(
          secondGroup.group.id,
        );
        let sharedConnections = 0;
        for (const member of firstGroup.members) {
          sharedConnections += secondGroup.members.filter((candidate) =>
            member.skills.some((skill) => candidate.skills.includes(skill)),
          ).length;
        }
        if (complementary || sharedConnections > 0) {
          connections.push({
            first: firstGroup.group.id,
            second: secondGroup.group.id,
            weight: Math.max(complementary ? 3 : 0, sharedConnections),
          });
        }
      }
    }
    return connections;
  }, [groupedMembers]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card h-[420px] grid place-items-center text-foreground/50 text-sm">
        ağ yükleniyor…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/50">
        <span>Kategori büyüklüğü üye yoğunluğunu gösterir.</span>
        <span>{edges.length} potansiyel kategori bağlantısı</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {groupedMembers.map((entry) => (
          <article
            key={entry.group.id}
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background p-4"
          >
            <div
              className="absolute -right-5 -top-5 rounded-full bg-primary/10"
              style={{
                width: `${72 + Math.min(52, entry.members.length * 4)}px`,
                height: `${72 + Math.min(52, entry.members.length * 4)}px`,
              }}
            />
            <div className="relative">
              <div className="text-[11px] font-bold uppercase tracking-wider text-primary-deep">
                {entry.group.label}
              </div>
              <div className="mt-1 text-3xl font-black">{entry.members.length}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {entry.members.slice(0, 4).map((member) => (
                  <span
                    key={member.id}
                    className="max-w-full truncate rounded-full bg-primary/10 px-2 py-1 text-[11px] text-foreground/70"
                  >
                    {member.name}
                  </span>
                ))}
                {entry.members.length > 4 && (
                  <span className="rounded-full border border-border px-2 py-1 text-[11px] text-foreground/45">
                    +{entry.members.length - 4} kişi
                  </span>
                )}
              </div>
              <div className="mt-4 border-t border-border pt-3 text-[11px] text-foreground/45">
                {edges.filter(
                  (edge) => edge.first === entry.group.id || edge.second === entry.group.id,
                ).length}{" "}
                bağlantılı alan
              </div>
            </div>
          </article>
        ))}
      </div>
      {groupedMembers.length === 0 && (
        <div className="grid min-h-48 place-items-center text-sm text-foreground/50">
          henüz kimse yok — formdan ekle.
        </div>
      )}
      <p className="mt-4 text-center text-[11px] text-foreground/40">
        Tüm kişileri görmek ve kategoriye göre filtrelemek için aşağıdaki üye listesini kullan.
      </p>
    </div>
  );
}
