import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { addMember, listMembers, parseSkills, type Member } from "@/lib/networking-api";

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

function NetworkingPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    title: "",
    skills: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("");
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
    if (!form.name.trim() || !form.title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await addMember({
        name: form.name.trim().slice(0, 40),
        title: form.title.trim().slice(0, 40),
        skills: parseSkills(form.skills),
        contact: form.contact.trim().slice(0, 80) || undefined,
      });
      setMembers(await listMembers());
      setForm({ name: "", title: "", skills: "", contact: "" });
    } catch {
      setError("Kayıt eklenemedi. Lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return members;
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.title.toLowerCase().includes(query) ||
        member.skills.some((skill) => skill.includes(query)),
    );
  }, [members, filter]);

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
            <div className="sm:col-span-2 text-sm font-semibold text-foreground/80">
              Kendini ekle
            </div>
            <Field label="İsim*" placeholder="Berk" value={form.name} onChange={set("name")} />
            <Field
              label="Sıfat / Rol*"
              placeholder="yazılımcı"
              value={form.title}
              onChange={set("title")}
            />
            <Field
              className="sm:col-span-2"
              label="Yetenekler"
              placeholder="react, ui, pazarlama (virgülle ayır)"
              value={form.skills}
              onChange={set("skills")}
            />
            <Field
              className="sm:col-span-2"
              label="İletişim (opsiyonel)"
              placeholder="@instagram / linkedin / mail"
              value={form.contact}
              onChange={set("contact")}
            />
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-foreground/50">
                Bilgilerin ortak networking veritabanına eklenir ve ağda görünür.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? "ekleniyor…" : "ağa ekle"}
              </button>
            </div>
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((member) => (
              <div key={member.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-bold text-lg">{member.name}</div>
                  <div className="text-xs text-foreground/60">{member.title}</div>
                </div>
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
                {member.contact && (
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs">
                    <span className="text-foreground/60 truncate">{member.contact}</span>
                    {isEmail(member.contact) && (
                      <a
                        href={`mailto:${member.contact}`}
                        className="shrink-0 font-semibold text-primary-deep hover:text-primary transition"
                      >
                        mail gönder →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && !loading && (
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

function NetworkGraph({ members, loading }: { members: Member[]; loading: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);

  useEffect(() => {
    if (!wrapRef.current) return;
    const measure = () => {
      if (wrapRef.current) {
        setWidth(Math.max(320, wrapRef.current.getBoundingClientRect().width));
      }
    };
    measure();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.max(320, entry.contentRect.width));
      }
    });
    observer.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
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
    const columns = width < 560 ? 1 : width < 900 ? 2 : 3;
    const cellHeight = width < 560 ? 230 : 250;
    const cellWidth = width / columns;
    const rows = Math.ceil(groupedMembers.length / columns);
    const height = Math.max(360, rows * cellHeight + 20);
    const clusters = groupedMembers.map((entry, groupIndex) => {
      const centerX = (groupIndex % columns) * cellWidth + cellWidth / 2;
      const centerY = Math.floor(groupIndex / columns) * cellHeight + cellHeight / 2 + 10;
      const radius = Math.min(82, cellWidth * 0.33, cellHeight * 0.33);
      return { ...entry, centerX, centerY, radius };
    });
    const nodes = clusters.flatMap((cluster) => {
      const count = cluster.members.length;
      const orbit = cluster.radius * 0.63;
      return cluster.members.map((member, memberIndex) => {
        const angle = (memberIndex / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2;
        return {
          ...member,
          groupId: cluster.group.id,
          x: cluster.centerX + Math.cos(angle) * orbit * (count > 1 ? 1 : 0),
          y: cluster.centerY + Math.sin(angle) * orbit * (count > 1 ? 1 : 0),
        };
      });
    });
    return { clusters, height, nodes };
  }, [groupedMembers, width]);

  const edges = useMemo(() => {
    const connections: { a: number; b: number; weight: number }[] = [];
    for (let first = 0; first < layout.nodes.length; first += 1) {
      for (let second = first + 1; second < layout.nodes.length; second += 1) {
        const shared = layout.nodes[first].skills.filter((skill) =>
          layout.nodes[second].skills.includes(skill),
        );
        const sameGroup = layout.nodes[first].groupId === layout.nodes[second].groupId;
        if (shared.length > 0 && (sameGroup || shared.length > 1)) {
          connections.push({ a: first, b: second, weight: shared.length });
        }
      }
    }
    return connections;
  }, [layout.nodes]);

  const [hover, setHover] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card h-[420px] grid place-items-center text-foreground/50 text-sm">
        ağ yükleniyor…
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="rounded-2xl border border-border bg-card overflow-hidden relative"
      style={{ height: layout.height }}
    >
      <svg
        width="100%"
        height={layout.height}
        viewBox={`0 0 ${width} ${layout.height}`}
        className="block"
      >
        {layout.clusters.map((cluster) => (
          <g key={cluster.group.id}>
            <circle
              cx={cluster.centerX}
              cy={cluster.centerY}
              r={cluster.radius}
              className="fill-primary/5 stroke-primary/30"
              strokeWidth={1.25}
              strokeDasharray="5 5"
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
        {edges.map((edge, index) => {
          const first = layout.nodes[edge.a];
          const second = layout.nodes[edge.b];
          const active = hover && (hover === first.id || hover === second.id);
          const sameGroup = first.groupId === second.groupId;
          return (
            <line
              key={index}
              x1={first.x}
              y1={first.y}
              x2={second.x}
              y2={second.y}
              stroke="currentColor"
              className={
                active ? "text-primary" : sameGroup ? "text-foreground/20" : "text-primary/15"
              }
              strokeWidth={Math.min(3, 0.5 + edge.weight * 0.55)}
            />
          );
        })}
        {layout.nodes.map((node) => {
          const active = hover === node.id;
          const radius = 16 + Math.min(4, node.skills.length);
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHover(node.id)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            >
              <circle
                r={radius}
                className={active ? "fill-primary" : "fill-primary/15"}
                stroke="currentColor"
                strokeWidth={1.5}
              />
              <text
                textAnchor="middle"
                dy="0.35em"
                className={`text-[9px] font-bold ${active ? "fill-primary-foreground" : "fill-foreground"}`}
                style={{ pointerEvents: "none" }}
              >
                {node.name}
              </text>
              {active && (
                <text
                  textAnchor="middle"
                  y={radius + 13}
                  className="text-[9px] fill-foreground/70"
                  style={{ pointerEvents: "none" }}
                >
                  {node.title}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {layout.nodes.length === 0 && (
        <div className="absolute inset-0 grid place-items-center text-foreground/50 text-sm">
          henüz kimse yok — formdan ekle.
        </div>
      )}
    </div>
  );
}
