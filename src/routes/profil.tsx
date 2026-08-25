import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  IdCard,
  Instagram,
  Link2,
  LoaderCircle,
  Mail,
  LogOut,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import QRCode from "react-qr-code";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import {
  MemberProfileApiError,
  changeMemberPassword,
  getMyMemberConnections,
  getMyMemberProfile,
  loginMember,
  logoutMember,
  registerMember,
  updateMyMemberProfile,
  uploadMemberPhoto,
  type EditableMemberProfile,
} from "@/lib/member-profile-api";
import type { NotworkMemberConnection, NotworkMemberProfile } from "@/lib/member-profile";
import { createNoIndexSeo } from "@/lib/seo";

export const Route = createFileRoute("/profil")({
  head: () =>
    createNoIndexSeo({
      title: "Notwork Üye Profili",
      description: "Doğrulanmış Notwork üye profilini düzenle.",
      path: "/profil",
    }),
  component: MemberProfilePage,
});

const emptyExperience = { company: "", role: "" };

const eventDetails: Record<string, { title: string; venue: string; href: string }> = {
  "21-agustos-2026": {
    title: "21 Ağustos 2026",
    venue: "Rene Lokal · Bornova",
    href: "/21agustos",
  },
  "14-temmuz-2026": {
    title: "14 Temmuz 2026",
    venue: "Mahall Bomonti · İzmir",
    href: "/14temmuz",
  },
  "22-mayis-2026": {
    title: "22 Mayıs 2026",
    venue: "İstinye Art · İzmir",
    href: "/etkinlikler",
  },
  "10-nisan-2026": {
    title: "10 Nisan 2026",
    venue: "İstinye Art · İzmir",
    href: "/etkinlikler",
  },
  "8-mart-2026": {
    title: "8 Mart 2026",
    venue: "İstinye Art · İzmir",
    href: "/etkinlikler",
  },
  "10-subat-2026": {
    title: "10 Şubat 2026",
    venue: "İstinye Art · İzmir",
    href: "/etkinlikler",
  },
  "16-ocak-2026": {
    title: "16 Ocak 2026",
    venue: "İstinye Art · İzmir",
    href: "/etkinlikler",
  },
  "8-aralik-2025": {
    title: "8 Aralık 2025",
    venue: "İstinye Art · İzmir",
    href: "/etkinlikler",
  },
};

const registrationEventOptions = [
  { value: "21-agustos-2026", label: "21 Ağustos 2026 · Rene Lokal" },
  { value: "14-temmuz-2026", label: "14 Temmuz 2026 · Mahall Bomonti" },
  { value: "22-mayis-2026", label: "22 Mayıs 2026 · İstinye Art" },
  { value: "10-nisan-2026", label: "10 Nisan 2026 · İstinye Art" },
  { value: "8-mart-2026", label: "8 Mart 2026 · İstinye Art" },
  { value: "10-subat-2026", label: "10 Şubat 2026 · İstinye Art" },
  { value: "16-ocak-2026", label: "16 Ocak 2026 · İstinye Art" },
  { value: "8-aralik-2025", label: "8 Aralık 2025 · İstinye Art" },
  { value: "none", label: "Henüz bir Notwork etkinliğine katılmadım" },
];

function getEventDetails(eventId: string) {
  return (
    eventDetails[eventId] || {
      title: eventId.replaceAll("-", " "),
      venue: "Notwork etkinliği",
      href: "/etkinlikler",
    }
  );
}

function externalUrl(value: string, prefix = "") {
  if (!value) return "";
  const candidate = /^https?:\/\//i.test(value) ? value : `${prefix}${value}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function profileDraft(profile: NotworkMemberProfile): EditableMemberProfile {
  return {
    headline: profile.headline || "",
    bio: profile.bio || "",
    skills: [...profile.skills.slice(0, 5)],
    experiences: profile.experiences.slice(0, 3).map((item) => ({ ...item })),
    links: { ...profile.links },
    publicProfileEnabled: Boolean(profile.publicProfileEnabled),
    phone: profile.phone || "",
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "İşlem tamamlanamadı. Tekrar dene.";
}

async function compressProfilePhoto(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Lütfen bir fotoğraf seç.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Fotoğraf en fazla 12 MB olabilir.");

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    const objectUrl = URL.createObjectURL(file);
    element.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(element);
    };
    element.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Fotoğraf okunamadı."));
    };
    element.src = objectUrl;
  });

  const size = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - size) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - size) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Fotoğraf işlenemedi.");
  context.drawImage(image, sourceX, sourceY, size, size, 0, 0, 720, 720);

  for (const quality of [0.84, 0.74, 0.64]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length < 900_000) return dataUrl;
  }
  throw new Error("Fotoğraf küçültülemedi. Başka bir fotoğraf dene.");
}

function MemberProfilePage() {
  const [profile, setProfile] = useState<NotworkMemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyMemberProfile()
      .then((memberProfile) => {
        if (active) setProfile(memberProfile);
      })
      .catch((error) => {
        if (active && !(error instanceof MemberProfileApiError && error.status === 401)) {
          console.error(error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_30%),var(--background)] text-foreground">
      <SiteNav />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary-deep" />
          </div>
        ) : !profile ? (
          <LoginPanel onLoggedIn={setProfile} />
        ) : profile.mustChangePassword ? (
          <PasswordPanel profile={profile} onChanged={setProfile} />
        ) : (
          <ProfileEditor profile={profile} onProfileChange={setProfile} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function LoginPanel({ onLoggedIn }: { onLoggedIn: (profile: NotworkMemberProfile) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      onLoggedIn(await loginMember(identity, password));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "register") {
    return <RegisterPanel onRegistered={onLoggedIn} onBack={() => setMode("login")} />;
  }

  return (
    <section className="mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="bg-primary/15 p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <UserRound className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">
          notwork profilin
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Etkinlik katılımcısı olarak sana iletilen kullanıcı adı ve geçici şifreyle giriş yap.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4 p-6 sm:p-8">
        <Field label="Kullanıcı adı veya e-posta">
          <input
            required
            autoCapitalize="none"
            autoComplete="username"
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
            className="profile-input"
            placeholder="kullaniciadi veya e-posta"
          />
        </Field>
        <Field label="Şifre">
          <div className="relative">
            <input
              required
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="profile-input pr-12"
              placeholder="Geçici şifren"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted-foreground hover:bg-primary/10"
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </Field>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <button disabled={submitting} className="profile-primary-button w-full" type="submit">
          {submitting ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <ShieldCheck className="h-5 w-5" />
          )}
          Güvenli giriş
        </button>
        <div className="flex items-center gap-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> veya <span className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          onClick={() => setMode("register")}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/5 px-5 py-3 text-sm font-black text-primary-deep hover:bg-primary/10"
        >
          <Plus className="h-5 w-5" /> Yeni profil oluştur
        </button>
        <Link
          to="/community"
          className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Community sayfasına dön
        </Link>
      </form>
    </section>
  );
}

function RegisterPanel({
  onRegistered,
  onBack,
}: {
  onRegistered: (profile: NotworkMemberProfile) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [attendedEventClaim, setAttendedEventClaim] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [canHelpWith, setCanHelpWith] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [phone, setPhone] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [compressingPhoto, setCompressingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);

  async function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setCompressingPhoto(true);
    setError("");
    try {
      setPhotoDataUrl(await compressProfilePhoto(file));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setCompressingPhoto(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!photoDataUrl) {
      setError("Kayıt için profil fotoğrafı yüklemelisin.");
      return;
    }
    if (password !== confirmation) {
      setError("Şifreler aynı olmalı.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      onRegistered(
        await registerMember({
          name,
          email,
          password,
          attendedEventClaim,
          introduction,
          lookingFor,
          canHelpWith,
          linkedin,
          instagram,
          phone,
          photoDataUrl,
          consent,
        }),
      );
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="bg-primary/15 p-5 sm:p-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Giriş ekranına dön
        </button>
        <h1 className="mt-5 font-display text-4xl font-black tracking-[-0.05em] sm:text-5xl">
          notwork profilini oluştur
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Profil fotoğrafın zorunlu. Kendini, aradığın bağlantıyı ve topluluğa neler katabileceğini
          detaylı anlatarak network ağına katıl.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6 p-5 sm:p-8">
        <div className="rounded-[1.5rem] border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-dashed border-primary bg-background text-primary-deep"
              aria-label="Zorunlu profil fotoğrafını seç"
            >
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="Profil önizlemesi"
                  className="h-full w-full object-cover"
                />
              ) : compressingPhoto ? (
                <LoaderCircle className="h-6 w-6 animate-spin" />
              ) : (
                <Camera className="h-7 w-7" />
              )}
            </button>
            <div>
              <div className="text-sm font-black">Profil fotoğrafı *</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Zorunlu · yüzünün net göründüğü JPG, PNG veya WebP fotoğraf yükle.
              </p>
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                className="mt-3 text-xs font-black text-primary-deep underline underline-offset-4"
              >
                {photoDataUrl ? "fotoğrafı değiştir" : "fotoğraf seç"}
              </button>
            </div>
          </div>
          <input
            ref={photoInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={selectPhoto}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ad soyad *">
            <input
              required
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="profile-input"
              placeholder="Adın ve soyadın"
            />
          </Field>
          <Field label="E-posta *">
            <input
              required
              type="email"
              autoComplete="email"
              maxLength={120}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="profile-input"
              placeholder="ornek@eposta.com"
            />
          </Field>
        </div>

        <Field label="Hangi Notwork etkinliğine katıldın? *" hint="Doğrulama için">
          <select
            required
            value={attendedEventClaim}
            onChange={(event) => setAttendedEventClaim(event.target.value)}
            className="profile-input"
          >
            <option value="">Etkinliği seç</option>
            {registrationEventOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Etkinlik katılımı e-posta kayıtlarımızla kontrol edilir. Doğrulandıktan sonra üye rozeti
            eklenir.
          </p>
        </Field>

        <RegistrationQuestion
          label="Kendini tanıt *"
          value={introduction}
          onChange={setIntroduction}
          placeholder="Neler yaptığını, deneyimini ve seni tanımamız gereken detayları anlat."
        />
        <RegistrationQuestion
          label="Ne istiyorsun? *"
          value={lookingFor}
          onChange={setLookingFor}
          placeholder="Aradığın bağlantıları, fırsatları, insanları veya projeleri detaylı anlat."
        />
        <RegistrationQuestion
          label="Neler yapabilirsin? *"
          value={canHelpWith}
          onChange={setCanHelpWith}
          placeholder="Topluluğa katabileceğin yetenekleri, deneyimleri ve desteği detaylı anlat."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="LinkedIn" hint="opsiyonel">
            <input
              inputMode="url"
              maxLength={240}
              value={linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
              className="profile-input"
              placeholder="linkedin.com/in/..."
            />
          </Field>
          <Field label="Instagram" hint="opsiyonel">
            <input
              maxLength={100}
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
              className="profile-input"
              placeholder="kullaniciadi"
            />
          </Field>
          <Field label="Telefon" hint="opsiyonel">
            <input
              type="tel"
              autoComplete="tel"
              maxLength={80}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="profile-input"
              placeholder="05xx xxx xx xx"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Şifre *" hint="10+ karakter, harf ve rakam">
            <div className="relative">
              <input
                required
                minLength={10}
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="profile-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted-foreground hover:bg-primary/10"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </Field>
          <Field label="Şifre tekrar *">
            <input
              required
              minLength={10}
              autoComplete="new-password"
              type={showPassword ? "text" : "password"}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="profile-input"
            />
          </Field>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-4">
          <input
            required
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--primary)]"
          />
          <span className="text-xs font-semibold leading-5 text-muted-foreground">
            Bilgilerimin Notwork topluluk ve networking sisteminde işlenmesini, üyelerle
            paylaşılmasını ve topluluk iletişimleri için kullanılmasını onaylıyorum.{" "}
            <Link to="/kvkk" className="font-black text-foreground underline underline-offset-2">
              KVKK metnini oku
            </Link>
          </span>
        </label>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <button
          disabled={submitting || compressingPhoto}
          className="profile-primary-button w-full"
          type="submit"
        >
          {submitting ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <UserRound className="h-5 w-5" />
          )}
          Profilimi oluştur
        </button>
      </form>
    </section>
  );
}

function RegistrationQuestion({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Field label={label} hint={`${value.length}/500 · en az 140`}>
      <textarea
        required
        minLength={140}
        maxLength={500}
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="profile-input min-h-32 resize-y"
        placeholder={placeholder}
      />
    </Field>
  );
}

function PasswordPanel({
  profile,
  onChanged,
}: {
  profile: NotworkMemberProfile;
  onChanged: (profile: NotworkMemberProfile) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmation) {
      setError("Şifreler aynı olmalı.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      onChanged(await changeMemberPassword(password));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary-deep">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-deep">
            ilk giriş
          </p>
          <h1 className="text-2xl font-black tracking-[-0.04em]">Merhaba {profile.name}</h1>
        </div>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Profilini düzenlemeden önce yalnızca senin bildiğin yeni bir şifre oluştur.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Yeni şifre" hint="En az 10 karakter, bir harf ve bir rakam">
          <input
            required
            minLength={10}
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="profile-input"
          />
        </Field>
        <Field label="Yeni şifre tekrar">
          <input
            required
            minLength={10}
            autoComplete="new-password"
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="profile-input"
          />
        </Field>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <button disabled={submitting} className="profile-primary-button w-full" type="submit">
          {submitting ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <Check className="h-5 w-5" />
          )}
          Şifremi oluştur
        </button>
      </form>
    </section>
  );
}

function ProfileEditor({
  profile,
  onProfileChange,
}: {
  profile: NotworkMemberProfile;
  onProfileChange: (profile: NotworkMemberProfile | null) => void;
}) {
  const [draft, setDraft] = useState(() => profileDraft(profile));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [connections, setConnections] = useState<NotworkMemberConnection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const photoInput = useRef<HTMLInputElement>(null);
  const publicCardUrl = `https://notwork.me/u/${encodeURIComponent(profile.username)}`;

  useEffect(() => {
    let active = true;
    setConnectionsLoading(true);
    getMyMemberConnections()
      .then((rows) => {
        if (active) setConnections(rows);
      })
      .catch((caught) => {
        if (active) console.error(caught);
      })
      .finally(() => {
        if (active) setConnectionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profile.username]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const nextProfile = await updateMyMemberProfile(draft);
      onProfileChange(nextProfile);
      setDraft(profileDraft(nextProfile));
      setMessage("Profilin kaydedildi.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setMessage("");
    setError("");
    try {
      const photoDataUrl = await compressProfilePhoto(file);
      onProfileChange(await uploadMemberPhoto(photoDataUrl));
      setMessage("Profil fotoğrafın güncellendi.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setUploading(false);
    }
  }

  async function signOut() {
    try {
      await logoutMember();
      onProfileChange(null);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  function addSkill() {
    if (draft.skills.length < 5) setDraft({ ...draft, skills: [...draft.skills, ""] });
  }

  function addExperience() {
    if (draft.experiences.length < 3) {
      setDraft({ ...draft, experiences: [...draft.experiences, { ...emptyExperience }] });
    }
  }

  async function copyPublicCardUrl() {
    await navigator.clipboard.writeText(publicCardUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
        <div className="flex items-start gap-4 sm:items-center">
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.6rem] border border-primary/30 bg-primary/10 sm:h-28 sm:w-28"
            aria-label="Profil fotoğrafını değiştir"
          >
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="m-auto h-full w-10 text-primary-deep" />
            )}
            <span className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[10px] font-black backdrop-blur">
              {uploading ? (
                <LoaderCircle className="h-3 w-3 animate-spin" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
              fotoğraf
            </span>
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={changePhoto}
          />
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-black text-primary-deep sm:text-xs">
              <BadgeCheck className="h-4 w-4" />
              {profile.badge?.label || "Notwork Üyesi"}
            </div>
            <h1 className="mt-2 truncate font-display text-3xl font-black tracking-[-0.05em] sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-xs font-bold text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-3 px-5 pb-3 pt-5 sm:px-7 sm:pt-7">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-deep">
            <CalendarDays className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-[-0.04em]">Katıldığım etkinlikler</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
              Notwork yolculuğunda bulunduğun geceler.
            </p>
          </div>
        </div>
        {profile.attendedEvents.length ? (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-5 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-7 sm:pb-7">
            {profile.attendedEvents.map((eventId) => {
              const event = getEventDetails(eventId);
              return (
                <a
                  key={eventId}
                  href={event.href}
                  className="group min-w-[76vw] max-w-[290px] snap-start rounded-[1.4rem] border border-border bg-background p-4 transition hover:border-primary sm:min-w-[250px]"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-deep">
                    katıldın
                  </div>
                  <div className="mt-2 text-lg font-black tracking-[-0.03em]">{event.title}</div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">
                    {event.venue}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-black text-foreground">
                    Etkinliği gör <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <p className="px-5 pb-6 text-sm text-muted-foreground sm:px-7">
            Katıldığın etkinlikler hesabınla eşleştirildiğinde burada görünecek.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-3 px-5 pb-3 pt-5 sm:px-7 sm:pt-7">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
            <UsersRound className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-[-0.04em]">
              Edindiğim bağlantılar ve arkadaşlar
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
              Match Lab’de aynı gruba geldiğin üyeler ve iletişim bilgileri.
            </p>
          </div>
        </div>
        {connectionsLoading ? (
          <div className="flex items-center gap-2 px-5 pb-6 text-sm font-semibold text-muted-foreground sm:px-7">
            <LoaderCircle className="h-4 w-4 animate-spin text-primary-deep" />
            Bağlantıların yükleniyor
          </div>
        ) : connections.length ? (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-5 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-7 sm:pb-7">
            {connections.map((connection) => {
              const event = getEventDetails(connection.eventId);
              const instagramUrl = externalUrl(connection.instagram, "https://instagram.com/");
              const linkedinUrl = externalUrl(connection.linkedin, "https://linkedin.com/in/");
              return (
                <article
                  key={connection.id}
                  className="min-w-[82vw] max-w-[310px] snap-start rounded-[1.5rem] border border-border bg-background p-4 sm:min-w-[280px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/12 text-primary-deep">
                      {connection.photoUrl ? (
                        <img
                          src={connection.photoUrl}
                          alt={connection.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <UserRound className="h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black">{connection.name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-5 text-muted-foreground">
                        {connection.headline || "Notwork community üyesi"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-primary/10 px-3 py-2.5">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-primary-deep">
                      {event.title}
                    </div>
                    <div className="mt-1 text-xs font-bold text-foreground">
                      {connection.sharedGroupCount > 1
                        ? `${connection.sharedGroupCount} Match Lab grubunda eşleştiniz`
                        : "Match Lab’de eşleştiniz"}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${connection.email}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-black hover:border-primary"
                    >
                      <Mail className="h-3.5 w-3.5" /> e-posta
                    </a>
                    {connection.phone ? (
                      <a
                        href={`tel:${connection.phone.replace(/\s+/g, "")}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-black hover:border-primary"
                      >
                        <Phone className="h-3.5 w-3.5" /> telefon
                      </a>
                    ) : null}
                    {instagramUrl ? (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-black hover:border-primary"
                      >
                        <Instagram className="h-3.5 w-3.5" /> instagram
                      </a>
                    ) : null}
                    {linkedinUrl ? (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-black hover:border-primary"
                      >
                        <Link2 className="h-3.5 w-3.5" /> linkedin
                      </a>
                    ) : null}
                    {connection.publicProfileEnabled && connection.username ? (
                      <Link
                        to="/u/$username"
                        params={{ username: connection.username }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-black text-background"
                      >
                        profili gör <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="px-5 pb-6 text-sm leading-6 text-muted-foreground sm:px-7">
            Tamamladığın Match Lab buluşmalarındaki kişiler burada birikecek.
          </p>
        )}
      </section>

      {profile.eventCodes.length ? (
        <section className="overflow-hidden rounded-[2rem] border border-primary/30 bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3 bg-primary/15 p-5 sm:p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-foreground text-background shadow-sm">
              <IdCard className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-[-0.03em]">ntw kodun</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                E-posta adresinle oluşturulan bu kod hesabına sabittir.
              </p>
            </div>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            {profile.eventCodes.map((eventCode) => (
              <div
                key={`${eventCode.eventId}-${eventCode.code}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3"
              >
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                    ntw kodun
                  </div>
                </div>
                <div className="font-display text-4xl font-black tracking-[-0.05em]">
                  {eventCode.code}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border px-5 py-3 text-xs font-bold text-muted-foreground sm:px-6">
            <EyeOff className="h-4 w-4 text-primary-deep" /> Bu kodlar yalnızca sana görünür;
            ntw.business kartında paylaşılmaz.
          </div>
        </section>
      ) : null}

      <form onSubmit={save} className="space-y-5">
        <EditorSection
          icon={<FileText className="h-5 w-5" strokeWidth={1.8} />}
          title="Kendini anlat"
        >
          <Field label="Profil başlığı" hint={`${draft.headline.length}/120`}>
            <input
              maxLength={120}
              value={draft.headline}
              onChange={(event) => setDraft({ ...draft, headline: event.target.value })}
              className="profile-input"
              placeholder="Örn. Ürün tasarımcısı ve topluluk kurucusu"
            />
          </Field>
          <Field label="Kısa biyografi" hint={`${draft.bio.length}/320`}>
            <textarea
              maxLength={320}
              rows={4}
              value={draft.bio}
              onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
              className="profile-input resize-none"
              placeholder="Neler yaptığını ve neye açık olduğunu kısa anlat."
            />
          </Field>
        </EditorSection>

        <EditorSection
          icon={<Award className="h-5 w-5" strokeWidth={1.8} />}
          title="En güçlü 5 yeteneğin"
          action={
            draft.skills.length < 5 ? (
              <SmallButton type="button" onClick={addSkill}>
                <Plus className="h-4 w-4" /> Ekle
              </SmallButton>
            ) : null
          }
        >
          <p className="-mt-1 text-xs leading-relaxed text-muted-foreground">
            Ünvanından çok gerçekten yapabildiklerini yaz. En fazla 5 yetenek.
          </p>
          {draft.skills.length ? (
            <div className="space-y-2">
              {draft.skills.map((skill, index) => (
                <div key={`skill-${index}`} className="flex gap-2">
                  <input
                    maxLength={40}
                    value={skill}
                    onChange={(event) => {
                      const skills = [...draft.skills];
                      skills[index] = event.target.value;
                      setDraft({ ...draft, skills });
                    }}
                    className="profile-input"
                    placeholder={`Yetenek ${index + 1}`}
                  />
                  <IconButton
                    label="Yeteneği sil"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        skills: draft.skills.filter((_, itemIndex) => itemIndex !== index),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <button type="button" onClick={addSkill} className="profile-empty-button">
              <Plus className="h-5 w-5" /> İlk yeteneğini ekle
            </button>
          )}
        </EditorSection>

        <EditorSection
          icon={<BriefcaseBusiness className="h-5 w-5" strokeWidth={1.8} />}
          title="Deneyimlerin"
          action={
            draft.experiences.length < 3 ? (
              <SmallButton type="button" onClick={addExperience}>
                <Plus className="h-4 w-4" /> Ekle
              </SmallButton>
            ) : null
          }
        >
          <p className="-mt-1 text-xs leading-relaxed text-muted-foreground">
            Çalıştığın veya staj yaptığın en fazla 3 yeri ekle.
          </p>
          {draft.experiences.length ? (
            <div className="space-y-3">
              {draft.experiences.map((experience, index) => (
                <div
                  key={`experience-${index}`}
                  className="rounded-2xl border border-border bg-background p-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Firma">
                      <input
                        maxLength={80}
                        value={experience.company}
                        onChange={(event) => {
                          const experiences = draft.experiences.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, company: event.target.value } : item,
                          );
                          setDraft({ ...draft, experiences });
                        }}
                        className="profile-input bg-card"
                      />
                    </Field>
                    <Field label="Rol / staj">
                      <input
                        maxLength={80}
                        value={experience.role}
                        onChange={(event) => {
                          const experiences = draft.experiences.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, role: event.target.value } : item,
                          );
                          setDraft({ ...draft, experiences });
                        }}
                        className="profile-input bg-card"
                      />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        experiences: draft.experiences.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      })
                    }
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Deneyimi kaldır
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button type="button" onClick={addExperience} className="profile-empty-button">
              <Plus className="h-5 w-5" /> İlk deneyimini ekle
            </button>
          )}
        </EditorSection>

        <EditorSection icon={<Link2 className="h-5 w-5" strokeWidth={1.8} />} title="Bağlantıların">
          <Field label="Telefon" hint="Yalnızca giriş yapmış üyeler görür">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                autoComplete="tel"
                maxLength={80}
                value={draft.phone}
                onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                className="profile-input pl-11"
                placeholder="05xx xxx xx xx"
              />
            </div>
          </Field>
          <Field label="LinkedIn">
            <input
              inputMode="url"
              value={draft.links.linkedin}
              onChange={(event) =>
                setDraft({ ...draft, links: { ...draft.links, linkedin: event.target.value } })
              }
              className="profile-input"
              placeholder="https://linkedin.com/in/..."
            />
          </Field>
          <Field label="Instagram kullanıcı adı">
            <div className="relative">
              <Instagram className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={draft.links.instagram}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    links: { ...draft.links, instagram: event.target.value },
                  })
                }
                className="profile-input pl-11"
                placeholder="kullaniciadi"
              />
            </div>
          </Field>
          <Field label="Web sitesi">
            <input
              inputMode="url"
              value={draft.links.website}
              onChange={(event) =>
                setDraft({ ...draft, links: { ...draft.links, website: event.target.value } })
              }
              className="profile-input"
              placeholder="https://..."
            />
          </Field>
        </EditorSection>

        <EditorSection
          icon={<IdCard className="h-5 w-5" strokeWidth={1.8} />}
          title="ntw.business share"
        >
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4">
            <div>
              <div className="font-black">Business kartını dışarıya aç</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                E-posta adresin paylaşılmaz. Yalnızca profilinde yazdığın bilgiler görünür.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.publicProfileEnabled}
              onClick={() =>
                setDraft({ ...draft, publicProfileEnabled: !draft.publicProfileEnabled })
              }
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                draft.publicProfileEnabled ? "bg-primary" : "bg-muted-foreground/25"
              }`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                  draft.publicProfileEnabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] bg-foreground p-4 text-background sm:grid-cols-[150px_1fr] sm:p-5">
            <div className="mx-auto w-full max-w-[150px] rounded-2xl bg-white p-3">
              <QRCode value={publicCardUrl} size={126} className="h-auto w-full" />
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-background/55">
                senin business linkin
              </div>
              <div className="mt-2 truncate text-sm font-black sm:text-base">
                notwork.me/u/{profile.username}
              </div>
              <p className="mt-2 text-xs leading-5 text-background/60">
                QR ve bağlantı, profilini kaydedip görünür yaptığında çalışır.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyPublicCardUrl()}
                  disabled={!profile.publicProfileEnabled}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-black text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Copy className="h-4 w-4" /> {copied ? "kopyalandı" : "linki kopyala"}
                </button>
                <a
                  href={`/u/${encodeURIComponent(profile.username)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!profile.publicProfileEnabled}
                  onClick={(event) => {
                    if (!profile.publicProfileEnabled) event.preventDefault();
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border border-background/25 px-3 py-2 text-xs font-black ${
                    profile.publicProfileEnabled
                      ? "hover:bg-background/10"
                      : "cursor-not-allowed opacity-40"
                  }`}
                >
                  <ExternalLink className="h-4 w-4" /> kartı gör
                </a>
              </div>
            </div>
          </div>
        </EditorSection>

        {message ? <StatusMessage tone="success">{message}</StatusMessage> : null}
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <div className="sticky bottom-3 z-20 grid grid-cols-[1fr_auto] gap-2 rounded-2xl border border-border bg-background/90 p-2 shadow-xl backdrop-blur-xl">
          <button disabled={saving} className="profile-primary-button" type="submit">
            {saving ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Profili kaydet
          </button>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center justify-center rounded-xl border border-border px-4 text-sm font-black hover:bg-card"
            aria-label="Çıkış yap"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-3 text-xs font-black">
        {label}
        {hint ? <span className="font-bold text-muted-foreground">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function EditorSection({
  icon,
  title,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.7rem] border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-foreground text-background shadow-sm">
            {icon}
          </span>
          <h2 className="text-xl font-black tracking-[-0.04em] sm:text-2xl">{title}</h2>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SmallButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-3 py-2 text-xs font-black hover:bg-primary/10"
    />
  );
}

function IconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      aria-label={label}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function StatusMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        tone === "success"
          ? "border-primary/30 bg-primary/10 text-primary-deep"
          : "border-destructive/25 bg-destructive/10 text-destructive"
      }`}
    >
      {children}
    </div>
  );
}
