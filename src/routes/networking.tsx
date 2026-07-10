import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
    .sort(
      (first, second) =>
        second.score - first.score || first.member.name.localeCompare(second.member.name, "tr"),
    )
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
          <RecommendationFinder members={members} loading={loading} />
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
    <div className="mt-3 overflow-hidden rounded-xl border border-primary/25 bg-primary/5 transition-all">
      <div className="flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center">
        <div className="px-2 text-xs font-bold text-primary-deep sm:whitespace-nowrap">
          Mutlaka tanışman gereken 5 kişiyi bul
        </div>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") findMatches();
          }}
          placeholder="kullanıcı adın"
          disabled={loading}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={findMatches}
          disabled={loading}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          eşleşmelerimi bul
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
                  <div className="mt-1 font-bold leading-tight">{recommendation.member.name}</div>
                  <div className="mt-1 text-[11px] text-foreground/50">
                    {recommendation.member.title}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-foreground/60">
                    {recommendation.reasons.join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-primary-deep">
                    {contact.email && <a href={`mailto:${contact.email}`}>E-posta</a>}
                    {contact.linkedin && (
                      <a href={contact.linkedin} target="_blank" rel="noreferrer">
                        LinkedIn
                      </a>
                    )}
                    {contact.instagram && (
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

function NetworkGraph({ members, loading }: { members: Member[]; loading: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState<string | null>(null);

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
      roleGroups
        .map((group) => ({
          group,
          members: members.filter((member) => getRoleGroup(member).id === group.id),
        }))
        .filter((entry) => entry.members.length > 0),
    [members],
  );

  const layout = useMemo(() => {
    const cellWidth = 360;
    const cellHeight = 330;
    const maxColumns = width < 700 ? 2 : 3;
    const columns = Math.max(1, Math.min(groupedMembers.length, maxColumns));
    const canvasWidth = Math.max(width, columns * cellWidth);
    const rows = Math.ceil(groupedMembers.length / columns);
    const height = Math.max(390, rows * cellHeight + 20);
    const clusters = groupedMembers.map((entry, groupIndex) => ({
      ...entry,
      centerX: (groupIndex % columns) * cellWidth + cellWidth / 2,
      centerY: Math.floor(groupIndex / columns) * cellHeight + cellHeight / 2 + 10,
      radius: 128,
    }));
    const nodes = clusters.flatMap((cluster) =>
      cluster.members.map((member, memberIndex) => {
        let ringIndex = memberIndex;
        let ringCount = Math.min(6, cluster.members.length);
        let orbit = 56;
        if (memberIndex >= 6) {
          ringIndex = memberIndex - 6;
          ringCount = Math.max(1, cluster.members.length - 6);
          orbit = 96;
        }
        const angle = (ringIndex / ringCount) * Math.PI * 2 - Math.PI / 2;
        return {
          ...member,
          groupId: cluster.group.id,
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
      const matches = getRecommendations(node, layout.nodes).slice(0, 2);
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
      <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full border border-border bg-background/90 px-3 py-1.5 text-[11px] text-foreground/60 shadow-sm backdrop-blur">
        kaydırarak ağı gez
      </div>
      <div ref={wrapRef} className="h-[540px] overflow-auto overscroll-contain sm:h-[650px]">
        <svg width={layout.canvasWidth} height={layout.height} className="block">
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
          </defs>
          {layout.clusters.map((cluster) => (
            <g key={cluster.group.id}>
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
                {cluster.group.label} · {cluster.members.length}
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
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  className={`text-[8px] font-bold ${active ? "fill-primary-foreground" : "fill-foreground"}`}
                  style={{ pointerEvents: "none" }}
                >
                  {firstName}
                </text>
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
          henüz kimse yok — formdan ekle.
        </div>
      )}
    </div>
  );
}
