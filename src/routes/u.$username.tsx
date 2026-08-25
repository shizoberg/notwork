import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ExternalLink,
  Globe2,
  Instagram,
  Linkedin,
  LogIn,
  LoaderCircle,
  MessageSquareQuote,
  Send,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import QRCode from "react-qr-code";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import {
  getMyMemberProfile,
  getPublicMemberProfile,
  submitMemberReference,
} from "@/lib/member-profile-api";
import type { NotworkMemberProfile, PublicNotworkMemberProfile } from "@/lib/member-profile";
import { createNoIndexSeo } from "@/lib/seo";

export const Route = createFileRoute("/u/$username")({
  head: () =>
    createNoIndexSeo({
      title: "ntw.business | Notwork Üye Kartı",
      description: "Doğrulanmış Notwork üyesinin referanslı business kartı.",
      path: "/u",
    }),
  component: PublicMemberProfilePage,
});

function safeExternalUrl(value: string, fallbackPrefix = "") {
  const candidate = /^https?:\/\//i.test(value) ? value : `${fallbackPrefix}${value}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function PublicMemberProfilePage() {
  const { username } = Route.useParams();
  const [profile, setProfile] = useState<PublicNotworkMemberProfile | null>(null);
  const [viewer, setViewer] = useState<NotworkMemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://notwork.me/u/${encodeURIComponent(username)}`;

  useEffect(() => {
    let active = true;
    getPublicMemberProfile(username)
      .then((memberProfile) => {
        if (active) setProfile(memberProfile);
      })
      .catch(() => {
        if (active) setProfile(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [username]);

  useEffect(() => {
    let active = true;
    getMyMemberProfile()
      .then((memberProfile) => {
        if (active) setViewer(memberProfile);
      })
      .catch(() => {
        if (active) setViewer(null);
      });
    return () => {
      active = false;
    };
  }, []);

  async function shareProfile() {
    if (!profile) return;
    if (navigator.share) {
      await navigator.share({
        title: `${profile.name} · ntw.business`,
        text: profile.headline || "Doğrulanmış Notwork üye profili",
        url: shareUrl,
      });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_30%),var(--background)] text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
        {loading ? (
          <div className="flex min-h-[55vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary-deep" />
          </div>
        ) : !profile ? (
          <section className="mx-auto max-w-xl rounded-[2rem] border border-border bg-card p-7 text-center shadow-[var(--shadow-card)] sm:p-10">
            <UserRound className="mx-auto h-12 w-12 text-primary-deep" />
            <h1 className="mt-5 text-3xl font-black tracking-[-0.05em]">Bu kart yayında değil.</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Üye kartı henüz paylaşılmamış veya bağlantı artık kullanılamıyor.
            </p>
            <Link to="/community" className="profile-primary-button mx-auto mt-6 w-fit">
              Notwork community’yi gör
            </Link>
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <article className="overflow-hidden rounded-[2.2rem] border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="bg-foreground px-5 py-4 text-background sm:px-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    ntw.business
                  </span>
                  <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black text-primary-foreground">
                    share profile
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-8">
                <div className="flex items-start gap-4 sm:items-center sm:gap-6">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.7rem] border border-primary/25 bg-primary/10 sm:h-32 sm:w-32">
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-10 w-10 text-primary-deep" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {profile.verifiedMember ? (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-black text-primary-deep sm:text-xs">
                        <BadgeCheck className="h-4 w-4" />
                        {profile.badge?.label || "Doğrulanmış Notwork Üyesi"}
                      </div>
                    ) : null}
                    <h1 className="mt-2 font-display text-3xl font-black tracking-[-0.05em] sm:text-5xl">
                      {profile.name}
                    </h1>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">
                      @{profile.username}
                    </p>
                  </div>
                </div>

                <div className="mt-7 border-t border-border pt-6">
                  <p className="text-xl font-black tracking-[-0.03em] sm:text-2xl">
                    {profile.headline || "Notwork community üyesi"}
                  </p>
                  {profile.bio ? (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                      {profile.bio}
                    </p>
                  ) : null}
                </div>

                {profile.skills.length ? (
                  <section className="mt-7">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
                      <Sparkles className="h-4 w-4 text-primary-deep" /> Yapabildikleri
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-primary/25 bg-primary/8 px-3 py-2 text-sm font-black"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                {profile.experiences.length ? (
                  <section className="mt-7">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
                      <BriefcaseBusiness className="h-4 w-4 text-primary-deep" /> Deneyim
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {profile.experiences.map((experience) => (
                        <div
                          key={`${experience.company}-${experience.role}`}
                          className="rounded-2xl border border-border bg-background p-4"
                        >
                          <div className="font-black">{experience.company || "Deneyim"}</div>
                          <div className="mt-1 text-xs font-semibold text-muted-foreground">
                            {experience.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <ProfileLinks profile={profile} />
                <ReferenceSection profile={profile} viewer={viewer} />
              </div>
            </article>

            <aside className="h-fit rounded-[2rem] border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
              <div className="rounded-[1.5rem] bg-white p-4">
                <QRCode value={shareUrl} size={220} className="h-auto w-full" />
              </div>
              <p className="mt-4 text-center text-xs font-semibold leading-5 text-muted-foreground">
                Bu business kartı açmak için QR kodu okut.
              </p>
              <button
                type="button"
                onClick={() => void shareProfile()}
                className="profile-primary-button mt-4 w-full"
              >
                <Share2 className="h-4 w-4" /> {copied ? "Bağlantı kopyalandı" : "Kartı paylaş"}
              </button>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function ReferenceSection({
  profile,
  viewer,
}: {
  profile: PublicNotworkMemberProfile;
  viewer: NotworkMemberProfile | null;
}) {
  const [skill, setSkill] = useState(profile.skills[0] || "genel yetkinlik");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  async function submitReference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      await submitMemberReference(profile.username, skill, message);
      setMessage("");
      setStatus("Referansın admin onayına gönderildi.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Referans gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 border-t border-border pt-7">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
        <MessageSquareQuote className="h-4 w-4 text-primary-deep" /> Üye referansları
      </div>
      {profile.references.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {profile.references.map((reference) => (
            <article
              key={reference.id}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-black text-primary-deep">
                {reference.skill}
              </span>
              <p className="mt-3 text-sm font-semibold leading-6">“{reference.message}”</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-muted-foreground">
                <BadgeCheck className="h-4 w-4" /> {reference.authorName} · @
                {reference.authorUsername}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Bu profil için henüz yayınlanmış üye referansı yok.
        </p>
      )}

      {viewer?.username === profile.username ? (
        <p className="mt-5 rounded-2xl bg-muted p-4 text-sm font-semibold text-muted-foreground">
          Kendi profiline referans yazamazsın. Başka bir Notwork üyesinin kartından ona referans
          olabilirsin.
        </p>
      ) : viewer?.verifiedMember && !viewer.mustChangePassword ? (
        <form
          onSubmit={submitReference}
          className="mt-5 rounded-[1.6rem] border border-primary/25 bg-primary/8 p-4 sm:p-5"
        >
          <div className="font-black">Bu üyeye referans ol</div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Yalnızca doğrulanmış Notwork üyeleri yazabilir. Adın ve kullanıcı adın, admin onayından
            sonra referansla birlikte görünür.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]">
            {profile.skills.length ? (
              <select
                value={skill}
                onChange={(event) => setSkill(event.target.value)}
                className="profile-input"
                aria-label="Referans verilen yetenek"
              >
                {profile.skills.map((profileSkill) => (
                  <option key={profileSkill} value={profileSkill}>
                    {profileSkill}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={skill}
                onChange={(event) => setSkill(event.target.value)}
                maxLength={40}
                className="profile-input"
                placeholder="hangi konuda iyi?"
              />
            )}
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              minLength={20}
              maxLength={240}
              required
              rows={3}
              className="profile-input min-h-24 resize-none"
              placeholder="Bu kişinin bu konuda neden iyi olduğunu birlikte çalışma deneyiminle anlat."
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              {message.length}/240
            </span>
            <button type="submit" disabled={submitting} className="profile-primary-button">
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Referansı gönder
            </button>
          </div>
          {status ? <p className="mt-3 text-xs font-bold text-primary-deep">{status}</p> : null}
        </form>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-muted-foreground">
            Referans yazmak için doğrulanmış üye hesabınla giriş yap.
          </p>
          <Link to="/profil" className="profile-primary-button">
            <LogIn className="h-4 w-4" /> Üye girişi
          </Link>
        </div>
      )}
    </section>
  );
}

function ProfileLinks({ profile }: { profile: PublicNotworkMemberProfile }) {
  const links = [
    {
      label: "LinkedIn",
      href: safeExternalUrl(profile.links.linkedin, "https://linkedin.com/in/"),
      icon: Linkedin,
    },
    {
      label: "Instagram",
      href: safeExternalUrl(profile.links.instagram, "https://instagram.com/"),
      icon: Instagram,
    },
    { label: "Web sitesi", href: safeExternalUrl(profile.links.website, "https://"), icon: Globe2 },
  ].filter((item) => item.href);

  if (!links.length) return null;
  return (
    <section className="mt-7 flex flex-wrap gap-2 border-t border-border pt-6">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-black transition hover:border-primary hover:bg-primary/8"
          >
            <Icon className="h-4 w-4 text-primary-deep" /> {item.label}
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        );
      })}
    </section>
  );
}
