import { Link, useLocation } from "@tanstack/react-router";
import { CalendarDays, Network, Palette, Rocket } from "lucide-react";

export function MobileDock() {
  const { pathname } = useLocation();
  const items = [
    {
      to: "/etkinlikler",
      label: "Etkinlikler",
      icon: CalendarDays,
      active: pathname === "/" || /etkinlikler|eylul|ekim|agustos|temmuz/.test(pathname),
    },
    {
      to: "/startup",
      label: "Startup",
      icon: Rocket,
      active: pathname === "/startup" || pathname === "/network-startup",
    },
    { to: "/creative", label: "Creative", icon: Palette, active: pathname === "/creative" },
    { to: "/networking", label: "Networking", icon: Network, active: pathname === "/networking" },
    {
      to: "/ntw",
      label: "Etkinlik anı",
      icon: null,
      active: pathname === "/ntw" || pathname === "/linkler",
    },
  ] as const;
  const selected = items.findIndex((item) => item.active);
  return (
    <nav className="mobile-glass-dock" aria-label="Ana menü">
      {selected >= 0 && (
        <span
          className="mobile-glass-selection"
          aria-hidden="true"
          style={{ transform: `translateX(${selected * 100}%)` }}
        />
      )}
      {items.map(({ to, label, icon: Icon, active }) => (
        <Link key={to} to={to} aria-current={active ? "page" : undefined}>
          {Icon ? (
            <Icon size={22} strokeWidth={1.65} aria-hidden="true" />
          ) : (
            <img
              src="/brand/notwork-logo.png"
              alt=""
              className="dock-notwork-logo"
              aria-hidden="true"
            />
          )}
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
