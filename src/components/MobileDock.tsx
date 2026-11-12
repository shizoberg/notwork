import { Link, useLocation } from "@tanstack/react-router";
import { CalendarDays, Network, Radio } from "lucide-react";

export function MobileDock() {
  const { pathname } = useLocation();
  const german = pathname === "/de" || pathname.startsWith("/de/");
  const items = german
    ? ([
        {
          to: "/de/events",
          label: "Events",
          icon: CalendarDays,
          active: pathname === "/de" || pathname === "/de/events",
        },
        {
          to: "/de/networking",
          label: "Networking",
          icon: Network,
          active: pathname === "/de/networking" || pathname.startsWith("/de/u/"),
        },
        { to: "/de/live", label: "Event live", icon: Radio, active: pathname === "/de/live" },
      ] as const)
    : ([
        {
          to: "/etkinlikler",
          label: "Etkinlikler",
          icon: CalendarDays,
          active:
            pathname === "/" || /etkinlikler|eylul|ekim|kasim|aralik|agustos|temmuz/.test(pathname),
        },
        {
          to: "/networking",
          label: "Networking",
          icon: Network,
          active: pathname === "/networking",
        },
        {
          to: "/ntw",
          label: "Etkinlik anı",
          icon: null,
          active: pathname === "/ntw" || pathname === "/linkler",
        },
      ] as const);
  const selected = items.findIndex((item) => item.active);
  return (
    <nav className="mobile-glass-dock" aria-label={german ? "Hauptmenü" : "Ana menü"}>
      {selected >= 0 && (
        <span
          className="mobile-glass-selection"
          aria-hidden="true"
          style={{ transform: `translateX(${selected * 100}%)` }}
        />
      )}
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.to} to={item.to} aria-current={item.active ? "page" : undefined}>
            {Icon ? (
              <Icon size={18} strokeWidth={1.65} aria-hidden="true" />
            ) : (
              <span className="dock-ntw">ntw</span>
            )}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
