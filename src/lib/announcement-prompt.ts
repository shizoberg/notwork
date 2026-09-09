const version = "2026-09-09";
const pendingKey = "notwork-announcement-prompt";
export function promptForAnnouncements(
  person: { name: string; email: string },
  returnTo = "/networking",
) {
  if (typeof window === "undefined" || !person.email) return false;
  try {
    if (localStorage.getItem(`notwork-announcement-seen:${person.email.toLowerCase()}`) === version)
      return false;
    sessionStorage.setItem(pendingKey, JSON.stringify({ ...person, returnTo }));
    window.location.assign("/duyurular");
    return true;
  } catch {
    return false;
  }
}
export function pendingAnnouncementPrompt(): {
  name: string;
  email: string;
  returnTo: string;
} | null {
  try {
    return JSON.parse(sessionStorage.getItem(pendingKey) || "null");
  } catch {
    return null;
  }
}
export function finishAnnouncementPrompt(email: string) {
  try {
    const pending = pendingAnnouncementPrompt();
    if (email) localStorage.setItem(`notwork-announcement-seen:${email.toLowerCase()}`, version);
    if (pending?.email)
      localStorage.setItem(`notwork-announcement-seen:${pending.email.toLowerCase()}`, version);
    sessionStorage.removeItem(pendingKey);
    const target = pending?.returnTo || "/networking";
    return /^\/(profil|networking|linkler)(\?|$)/.test(target) ? target : "/networking";
  } catch {
    return "/networking";
  }
}
