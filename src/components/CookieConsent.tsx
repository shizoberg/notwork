import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_OPEN_EVENT,
  getCookieConsent,
  setCookieConsent,
  type CookieConsentStatus,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const [status, setStatus] = useState<CookieConsentStatus | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const initialStatus = getCookieConsent();
    setStatus(initialStatus);
    setIsOpen(initialStatus === null);

    const onChanged = () => {
      setStatus(getCookieConsent());
      setIsOpen(false);
    };
    const onOpen = () => setIsOpen(true);

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChanged);
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChanged);
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-5xl rounded-[1.75rem] border border-border bg-card/95 p-4 text-foreground shadow-[0_24px_80px_-32px_rgba(12,35,45,0.45)] backdrop-blur sm:bottom-5 sm:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-deep">
            <span className="h-2 w-2 rounded-full bg-primary" />
            KVKK ve çerez tercihleri
          </div>
          <h2 className="mt-3 text-lg font-black tracking-tight sm:text-xl">
            Deneyimi iyileştirmek için çerez kullanıyoruz.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Zorunlu çerezler siteyi çalıştırır. Onay verirseniz analiz ve pazarlama çerezleriyle
            ziyaret, buton tıklaması ve etkinlik ilgisi gibi verileri ölçeriz. Tercihinizi her
            zaman footer’dan değiştirebilirsiniz.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-primary-deep">
            <Link to="/cerez-politikasi" className="hover:underline">
              Çerez Politikası
            </Link>
            <Link to="/kvkk" className="hover:underline">
              KVKK Aydınlatma Metni
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          <button
            type="button"
            onClick={() => setCookieConsent("accepted")}
            className="rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
          >
            Kabul et
          </button>
          <button
            type="button"
            onClick={() => setCookieConsent("necessary")}
            className="rounded-full border border-border bg-background px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
          >
            Sadece zorunlu
          </button>
        </div>
      </div>
      {status ? (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Mevcut tercih: {status === "accepted" ? "Tüm çerezler kabul edildi" : "Sadece zorunlu"}
        </p>
      ) : null}
    </div>
  );
}
