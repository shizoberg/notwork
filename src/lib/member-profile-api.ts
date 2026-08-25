import type {
  NotworkMemberConnection,
  NotworkMemberProfile,
  PublicNotworkMemberProfile,
} from "./member-profile";

type ProfileResponse = {
  profile: NotworkMemberProfile;
};

export type EditableMemberProfile = Pick<
  NotworkMemberProfile,
  "headline" | "bio" | "skills" | "experiences" | "links" | "publicProfileEnabled"
> & { phone: string };

export type MemberRegistrationInput = {
  name: string;
  email: string;
  password: string;
  attendedEventClaim: string;
  introduction: string;
  lookingFor: string;
  canHelpWith: string;
  linkedin: string;
  instagram: string;
  phone: string;
  referrer: string;
  photoDataUrl: string;
  consent: boolean;
};

export type MemberRegistrationResult = {
  status: "pending";
  username: string;
};

export class MemberProfileApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MemberProfileApiError";
    this.status = status;
  }
}

async function requestProfile(input: Record<string, unknown>) {
  const response = await fetch("/api/member-profile", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const message = (await response.text()).trim() || "Profil işlemi tamamlanamadı";
    throw new MemberProfileApiError(message, response.status);
  }
  return (await response.json()) as ProfileResponse;
}

export async function getMyMemberProfile() {
  return (await requestProfile({ action: "me" })).profile;
}

export async function getMyMemberConnections() {
  const response = await fetch("/api/member-profile", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "connections" }),
  });
  if (!response.ok) {
    const message = (await response.text()).trim() || "Bağlantılar yüklenemedi";
    throw new MemberProfileApiError(message, response.status);
  }
  return ((await response.json()) as { connections: NotworkMemberConnection[] }).connections;
}

export async function getPublicMemberProfile(username: string) {
  const response = await fetch(`/api/member-profile?public=${encodeURIComponent(username)}`);
  if (!response.ok) {
    const message = (await response.text()).trim() || "Profil bulunamadı";
    throw new MemberProfileApiError(message, response.status);
  }
  return ((await response.json()) as { profile: PublicNotworkMemberProfile }).profile;
}

export async function loginMember(identity: string, password: string) {
  return (await requestProfile({ action: "login", identity, password })).profile;
}

export async function registerMember(input: MemberRegistrationInput) {
  const response = await fetch("/api/member-profile", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "register", ...input }),
  });
  if (!response.ok) {
    const message = (await response.text()).trim() || "Profil başvurusu tamamlanamadı";
    throw new MemberProfileApiError(message, response.status);
  }
  return (await response.json()) as MemberRegistrationResult;
}

export async function changeMemberPassword(newPassword: string) {
  return (await requestProfile({ action: "changePassword", newPassword })).profile;
}

export async function updateMyMemberProfile(profile: EditableMemberProfile) {
  return (await requestProfile({ action: "update", ...profile })).profile;
}

export async function uploadMemberPhoto(photoDataUrl: string) {
  return (await requestProfile({ action: "photo", photoDataUrl })).profile;
}

export async function submitMemberReference(
  targetUsername: string,
  skill: string,
  message: string,
) {
  const response = await fetch("/api/member-profile", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "reference", targetUsername, skill, message }),
  });
  if (!response.ok) {
    const responseMessage = (await response.text()).trim() || "Referans gönderilemedi";
    throw new MemberProfileApiError(responseMessage, response.status);
  }
  return (await response.json()) as { ok: true; status: "pending" };
}

export async function logoutMember() {
  const response = await fetch("/api/member-profile", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "logout" }),
  });
  if (!response.ok) throw new MemberProfileApiError("Çıkış yapılamadı", response.status);
}
