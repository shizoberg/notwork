import { createHash, timingSafeEqual } from "node:crypto";
import type { Config, Context } from "@netlify/functions";
import {
  getMemberProfileStore,
  importTemporaryCredentials,
  issueTemporaryCredentials,
  listMemberReferences,
  listMemberProfiles,
  moderateMemberProfile,
  moderateMemberReference,
  syncVerifiedEventMembers,
  type ImportedMemberCredential,
} from "./_member-profile-store.mjs";

type AdminInput = {
  password?: string;
  action?:
    | "list"
    | "syncMembers"
    | "issueCredentials"
    | "importCredentials"
    | "moderateProfile"
    | "moderateReference";
  credentials?: ImportedMemberCredential[];
  targetUsername?: string;
  authorUsername?: string;
  referenceStatus?: "approved" | "rejected";
  profileStatus?: "approved" | "rejected";
};

const fallbackPasswordHash = "bffc46786cfaa3b08499a75d77b037dff9a14f362ab183f72e2ea7bcce0454ee";

function validPassword(password: unknown) {
  if (typeof password !== "string") return false;
  const actual = Buffer.from(createHash("sha256").update(password).digest("hex"));
  const expected = Buffer.from(process.env.ADMIN_PASSWORD_HASH || fallbackPasswordHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const input = (await request.json()) as AdminInput;
    if (!validPassword(input.password)) return new Response("Yetkisiz erişim", { status: 401 });
    const store = getMemberProfileStore();
    const action = input.action || "list";

    if (action === "syncMembers") {
      const syncResult = await syncVerifiedEventMembers(store);
      return Response.json(
        {
          profiles: await listMemberProfiles(store),
          references: await listMemberReferences(store),
          ...syncResult,
        },
        { headers: { "cache-control": "no-store, private" } },
      );
    }

    if (action === "issueCredentials") {
      const credentials = await issueTemporaryCredentials(store);
      return Response.json(
        {
          profiles: await listMemberProfiles(store),
          references: await listMemberReferences(store),
          credentials,
        },
        { headers: { "cache-control": "no-store, private" } },
      );
    }

    if (action === "importCredentials") {
      if (!Array.isArray(input.credentials)) {
        return new Response("Geçici şifre paketi gerekli", { status: 400 });
      }
      const result = await importTemporaryCredentials(input.credentials, store);
      return Response.json(
        {
          profiles: await listMemberProfiles(store),
          references: await listMemberReferences(store),
          ...result,
        },
        { headers: { "cache-control": "no-store, private" } },
      );
    }

    if (action === "moderateReference") {
      if (input.referenceStatus !== "approved" && input.referenceStatus !== "rejected") {
        return new Response("Geçersiz referans durumu", { status: 400 });
      }
      await moderateMemberReference(
        input.targetUsername || "",
        input.authorUsername || "",
        input.referenceStatus,
        store,
      );
      return Response.json(
        {
          profiles: await listMemberProfiles(store),
          references: await listMemberReferences(store),
        },
        { headers: { "cache-control": "no-store, private" } },
      );
    }

    if (action === "moderateProfile") {
      if (input.profileStatus !== "approved" && input.profileStatus !== "rejected") {
        return new Response("Geçersiz profil durumu", { status: 400 });
      }
      await moderateMemberProfile(input.targetUsername || "", input.profileStatus, store);
      return Response.json(
        {
          profiles: await listMemberProfiles(store),
          references: await listMemberReferences(store),
        },
        { headers: { "cache-control": "no-store, private" } },
      );
    }

    return Response.json(
      {
        profiles: await listMemberProfiles(store),
        references: await listMemberReferences(store),
      },
      { headers: { "cache-control": "no-store, private" } },
    );
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Profil kayıtları alınamadı", {
      status: 500,
    });
  }
};

export const config: Config = { path: "/api/admin/member-profiles" };
