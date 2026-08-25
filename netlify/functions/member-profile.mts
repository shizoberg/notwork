import { createHash } from "node:crypto";
import type { Config, Context } from "@netlify/functions";
import {
  changeMemberPassword,
  getPublicMemberProfile,
  getMemberProfileBySession,
  getMemberConnections,
  getMemberProfilePhoto,
  getMemberProfileStore,
  getNetworkingMemberPhoto,
  loginMemberProfile,
  logoutMemberProfile,
  registerMemberProfile,
  safeMemberProfile,
  saveMemberProfilePhoto,
  submitMemberReference,
  updateMemberProfile,
} from "./_member-profile-store.mjs";

type ProfileInput = {
  action?:
    | "login"
    | "register"
    | "me"
    | "connections"
    | "changePassword"
    | "update"
    | "photo"
    | "reference"
    | "logout";
  identity?: string;
  password?: string;
  newPassword?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  experiences?: Array<{ company: string; role: string }>;
  links?: { linkedin?: string; instagram?: string; website?: string };
  publicProfileEnabled?: boolean;
  photoDataUrl?: string;
  targetUsername?: string;
  skill?: string;
  message?: string;
  name?: string;
  email?: string;
  attendedEventClaim?: string;
  introduction?: string;
  lookingFor?: string;
  canHelpWith?: string;
  linkedin?: string;
  instagram?: string;
  phone?: string;
  referrer?: string;
  consent?: boolean;
};

const cookieName = "notwork_profile_session";

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: { "cache-control": "no-store, private", ...(init?.headers || {}) },
  });
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readCookie(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const row = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  return row ? decodeURIComponent(row.slice(cookieName.length + 1)) : "";
}

function sessionCookie(request: Request, token: string, maxAge: number) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function validOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function validNewPassword(password: string) {
  return (
    password.length >= 10 &&
    password.length <= 72 &&
    /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(password) &&
    /\d/.test(password)
  );
}

function attemptKey(request: Request, identity: string) {
  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "local";
  const hash = createHash("sha256").update(`${ip}:${identity}`).digest("hex");
  return `login-attempts/${hash}.json`;
}

async function checkLoginLimit(request: Request, identity: string) {
  const store = getMemberProfileStore();
  const key = attemptKey(request, identity);
  const attempt = (await store.get(key, {
    type: "json",
    consistency: "strong",
  })) as { count: number; resetAt: string } | null;
  if (!attempt || Date.parse(attempt.resetAt) <= Date.now()) return { allowed: true, key };
  return { allowed: attempt.count < 5, key };
}

async function recordLoginFailure(key: string) {
  const store = getMemberProfileStore();
  const current = (await store.get(key, {
    type: "json",
    consistency: "strong",
  })) as { count: number; resetAt: string } | null;
  const active = current && Date.parse(current.resetAt) > Date.now();
  await store.setJSON(key, {
    count: active ? current.count + 1 : 1,
    resetAt: active ? current.resetAt : new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });
}

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url);

  if (request.method === "GET" && url.searchParams.has("public")) {
    const result = await getPublicMemberProfile(url.searchParams.get("public") || "");
    if (!result) return new Response("Profil bulunamadı", { status: 404 });
    return Response.json(
      { profile: result.profile },
      { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } },
    );
  }

  if (request.method === "GET" && url.searchParams.has("publicPhoto")) {
    const result = await getPublicMemberProfile(url.searchParams.get("publicPhoto") || "");
    if (!result) return new Response("Fotoğraf bulunamadı", { status: 404 });
    const photo = await getMemberProfilePhoto(result.storedProfile.id);
    if (!photo) return new Response("Fotoğraf bulunamadı", { status: 404 });
    return new Response(photo.image, {
      headers: {
        "content-type": photo.contentType,
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  if (request.method === "GET" && url.searchParams.has("photo")) {
    const session = await getMemberProfileBySession(readCookie(request));
    const profileId = url.searchParams.get("photo") || "";
    if (!session || session.profile.id !== profileId) {
      return new Response("Oturum bulunamadı", { status: 401 });
    }
    const photo = await getMemberProfilePhoto(profileId);
    if (!photo) return new Response("Fotoğraf bulunamadı", { status: 404 });
    return new Response(photo.image, {
      headers: {
        "content-type": photo.contentType,
        "cache-control": "private, max-age=86400",
      },
    });
  }

  if (request.method === "GET" && url.searchParams.has("networkPhoto")) {
    const photo = await getNetworkingMemberPhoto(url.searchParams.get("networkPhoto") || "");
    if (!photo) return new Response("Fotoğraf bulunamadı", { status: 404 });
    return new Response(photo.image, {
      headers: {
        "content-type": photo.contentType,
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!validOrigin(request)) return new Response("Geçersiz istek kaynağı", { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 1_100_000) {
    return new Response("Payload too large", { status: 413 });
  }

  try {
    const input = (await request.json()) as ProfileInput;
    const action = clean(input.action, 30);
    const token = readCookie(request);

    if (action === "register") {
      const password = clean(input.password, 120);
      if (!validNewPassword(password)) {
        return new Response("Şifre en az 10 karakter, bir harf ve bir rakam içermeli", {
          status: 400,
        });
      }
      const result = await registerMemberProfile({ ...input, password });
      return json(result, { status: 201 });
    }

    if (action === "login") {
      const identity = clean(input.identity, 120).toLocaleLowerCase("tr-TR");
      const password = clean(input.password, 120);
      const limit = await checkLoginLimit(request, identity);
      if (!limit.allowed)
        return new Response("Çok fazla deneme. 15 dakika sonra tekrar dene.", { status: 429 });
      const result = await loginMemberProfile(identity, password);
      if (!result) {
        await recordLoginFailure(limit.key);
        return new Response("Kullanıcı adı/e-posta veya şifre hatalı", { status: 401 });
      }
      await getMemberProfileStore().delete(limit.key);
      return json(
        { profile: result.profile },
        { headers: { "set-cookie": sessionCookie(request, result.token, 7 * 24 * 60 * 60) } },
      );
    }

    if (action === "logout") {
      await logoutMemberProfile(token);
      return json({ ok: true }, { headers: { "set-cookie": sessionCookie(request, "", 0) } });
    }

    const session = await getMemberProfileBySession(token);
    if (!session) return new Response("Oturum bulunamadı", { status: 401 });

    if (action === "me") return json({ profile: safeMemberProfile(session.profile) });

    if (action === "changePassword") {
      const newPassword = clean(input.newPassword, 120);
      if (!validNewPassword(newPassword)) {
        return new Response("Şifre en az 10 karakter, bir harf ve bir rakam içermeli", {
          status: 400,
        });
      }
      const profile = await changeMemberPassword(token, newPassword);
      return profile ? json({ profile }) : new Response("Şifre değiştirilemedi", { status: 400 });
    }

    if (session.profile.mustChangePassword) {
      return new Response("Önce geçici şifreni değiştirmelisin", { status: 403 });
    }

    if (action === "connections") {
      return json({ connections: await getMemberConnections(session.profile) });
    }

    if (action === "update") {
      const profile = await updateMemberProfile(token, input);
      return profile ? json({ profile }) : new Response("Profil güncellenemedi", { status: 400 });
    }

    if (action === "photo") {
      const profile = await saveMemberProfilePhoto(token, clean(input.photoDataUrl, 1_000_000));
      return profile ? json({ profile }) : new Response("Fotoğraf yüklenemedi", { status: 400 });
    }

    if (action === "reference") {
      await submitMemberReference(
        token,
        clean(input.targetUsername, 80),
        clean(input.skill, 40),
        clean(input.message, 240),
      );
      return json({ ok: true, status: "pending" });
    }

    return new Response("Geçersiz işlem", { status: 400 });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Profil işlemi tamamlanamadı", {
      status: 400,
    });
  }
};

export const config: Config = { path: "/api/member-profile" };
