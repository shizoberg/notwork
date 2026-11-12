export const isEnglishPath = (path: string) => path === "/en" || path.startsWith("/en/");

export const englishPaths: Record<string, string> = {
  "/": "/en",
  "/notwork-nedir": "/en/about",
  "/etkinlikler": "/en/events",
  "/22-kasim": "/en/22-november",
  "/de/4-dezember": "/en/4-december",
  "/networking": "/en/networking",
  "/profil": "/en/profile",
  "/ntw": "/en/live",
  "/sunum-yukle": "/en/speak",
  "/sponsor": "/en/sponsor",
  "/merch": "/en/merch",
  "/duyurular": "/en/announcements",
  "/dokumantasyon": "/en/documentation",
  "/kvkk": "/en/privacy",
  "/acik-riza": "/en/consent",
  "/cerez-politikasi": "/en/cookies",
  "/11-ekim": "/en/archive/11-ekim-2026",
  "/17-eylul": "/en/archive/17-eylul-2026",
  "/21agustos": "/en/archive/21-agustos-2026",
  "/14temmuz": "/en/archive/14-temmuz-2026",
};

export function englishPath(path: string) {
  return englishPaths[path] ?? (path.startsWith("/u/") ? `/en${path}` : "/en");
}
