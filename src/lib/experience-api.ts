// API helpers execute in the browser; event remains explicit in every server request.
export function experienceEvent() { return typeof window !== "undefined" && /^(\/notwork-etkinlik|\/adminnotwork|\/notwork-sahne)/.test(window.location.pathname) ? "22-kasim-2026" : "14-kasim-2026"; }
export function experienceAdminUrl(suffix = "") { return `/api/launch-admin?event=${experienceEvent()}${suffix ? "&" + suffix : ""}`; }
