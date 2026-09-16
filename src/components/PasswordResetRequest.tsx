import { ArrowLeft, Check, LoaderCircle, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { requestMemberPasswordReset } from "@/lib/member-profile-api";

export function PasswordResetRequest({
  onBack,
  variant = "profile",
}: {
  onBack: () => void;
  variant?: "profile" | "event";
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const primaryButtonClass =
    variant === "profile"
      ? "profile-primary-button flex w-full items-center justify-center gap-2"
      : "flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-black text-primary-foreground";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await requestMemberPasswordReset(email.trim());
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Talep alınamadı");
    } finally {
      setSubmitting(false);
    }
  }

  const content = submitted ? (
    <div className="space-y-5 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary-deep">
        <Check className="h-7 w-7" />
      </span>
      <div>
        <h1 className="text-3xl font-black tracking-[-0.04em]">Talebini aldık</h1>
        <p className="mt-3 text-sm leading-6 text-foreground/60">
          Bu e-postaya bağlı bir profil varsa ekip güvenli yenileme adımını kayıtlı adresin
          üzerinden paylaşacak.
        </p>
      </div>
      <button type="button" onClick={onBack} className={primaryButtonClass}>
        <ArrowLeft className="h-4 w-4" /> Girişe dön
      </button>
    </div>
  ) : (
    <>
      <button type="button" onClick={onBack} className="text-xs font-black text-primary-deep">
        ← girişe dön
      </button>
      <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary-deep">
        <Mail className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-3xl font-black tracking-[-0.04em]">Şifreni yenile</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/60">
        Profilinde kayıtlı e-posta adresini yaz. Hesabın doğrulandıktan sonra yenileme adımı bu
        adres üzerinden paylaşılır.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-bold">
          E-posta
          <input
            required
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={
              variant === "profile"
                ? "profile-input mt-2"
                : "mt-2 w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-base outline-none focus:border-primary"
            }
            placeholder="ornek@eposta.com"
          />
        </label>
        {error ? (
          <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
            {error}
          </p>
        ) : null}
        <button
          disabled={submitting || !email.trim()}
          className={`${primaryButtonClass} disabled:opacity-50`}
          type="submit"
        >
          {submitting ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <Mail className="h-5 w-5" />
          )}
          {submitting ? "Talep gönderiliyor…" : "Şifre yenileme talebi gönder"}
        </button>
      </form>
    </>
  );

  if (variant === "event") {
    return <section className="entry-registration-card">{content}</section>;
  }
  return (
    <section className="profile-auth-shell mx-auto max-w-lg rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      {content}
    </section>
  );
}
