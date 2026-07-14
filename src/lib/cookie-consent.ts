export type CookieConsentStatus = "accepted" | "necessary";

export const COOKIE_CONSENT_KEY = "notwork-cookie-consent-v1";
export const COOKIE_CONSENT_CHANGED_EVENT = "notwork-cookie-consent-changed";
export const COOKIE_CONSENT_OPEN_EVENT = "notwork-cookie-consent-open";

type StoredCookieConsent = {
  status: CookieConsentStatus;
  decidedAt: string;
};

export function getCookieConsent(): CookieConsentStatus | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<StoredCookieConsent>;
    return parsed.status === "accepted" || parsed.status === "necessary" ? parsed.status : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(status: CookieConsentStatus) {
  if (typeof window === "undefined") return;

  const payload: StoredCookieConsent = {
    status,
    decidedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: payload }));
}

export function hasAnalyticsConsent() {
  return getCookieConsent() === "accepted";
}
