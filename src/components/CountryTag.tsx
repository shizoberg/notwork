import type { MemberCountry } from "@/lib/member-country";

export function CountryTag({
  country,
  german = false,
}: {
  country?: MemberCountry;
  german?: boolean;
}) {
  if (!country) return null;
  const label =
    country === "DE" ? (german ? "Deutschland" : "Almanya") : german ? "Türkei" : "Türkiye";
  return (
    <span className="member-country-tag" title={label}>
      <span aria-hidden="true">{country === "DE" ? "🇩🇪" : "🇹🇷"}</span>
      <span className="sr-only">{label}</span>
      {country}
    </span>
  );
}
