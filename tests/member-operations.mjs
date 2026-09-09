import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const temp = await fs.mkdtemp(path.join(os.tmpdir(), "notwork-member-test-"));
try {
  await fs.mkdir(path.join(temp, "functions"));
  await fs.mkdir(path.join(temp, "data"));
  await fs.writeFile(path.join(temp, "data/networking-seed.json"), "[]");
  await fs.writeFile(
    path.join(temp, "functions/mock.mjs"),
    `
    const stores = new Map();
    export function getStore({ name }) {
      if (!stores.has(name)) {
        const data = new Map();
        stores.set(name, {
          get: async (key) => structuredClone(data.get(key) ?? null),
          setJSON: async (key, value) => { data.set(key, structuredClone(value)); },
          set: async (key, value) => { data.set(key, value); },
          delete: async (key) => { data.delete(key); },
          list: async ({ prefix = '' }) => ({ blobs: [...data.keys()].filter(key => key.startsWith(prefix)).map(key => ({ key })) }),
        });
      }
      return stores.get(name);
    }
  `,
  );
  for (const file of [
    "_test-members",
    "_member-profile-store",
    "contacts-admin",
    "member-profiles-admin",
  ]) {
    const source = (
      await fs.readFile(new URL(`../netlify/functions/${file}.mts`, import.meta.url), "utf8")
    ).replaceAll('"@netlify/blobs"', '"./mock.mjs"');
    const compiled = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    });
    await fs.writeFile(path.join(temp, `functions/${file}.mjs`), compiled.outputText);
  }
  const load = (name) => import(pathToFileURL(path.join(temp, `functions/${name}.mjs`)));
  const { getStore } = await load("mock");
  const members = await load("_member-profile-store");
  const contacts = await load("contacts-admin");
  const profileStore = getStore({ name: "notwork-member-profiles" });
  const sourceStore = getStore({ name: "networking-members" });
  const input = {
    name: "Example Member",
    email: "Member@real-domain.org",
    headline: "Diplomat",
    bio: "Biography",
    website: "https://real-domain.org",
  };
  const created = await members.createAdminMemberProfile(input);
  assert.equal(created.created, true);
  assert.equal(created.profile.mustChangePassword, true);
  assert.equal(created.profile.verifiedMember, false);
  assert.equal("credential" in created.profile, false);
  const before = await profileStore.get("profiles/example-member.json");
  const duplicate = await members.createAdminMemberProfile({
    ...input,
    email: "member@real-domain.org",
  });
  assert.equal(duplicate.created, false);
  assert.deepEqual(duplicate.credentials, []);
  assert.deepEqual(await profileStore.get("profiles/example-member.json"), before);
  assert.equal(await members.loginMemberProfile(input.email, "wrong"), null);
  const login = await members.loginMemberProfile(
    input.email,
    created.credentials[0].temporaryPassword,
  );
  assert.ok(login.token);
  assert.equal(
    await members.updateMemberProfile(login.token, { bio: "Blocked before password change" }),
    null,
  );
  await members.changeMemberPassword(login.token, "Replacement-password-123!");
  const updated = await members.updateMemberProfile(login.token, {
    headline: "New headline",
    bio: "Updated biography",
    links: { website: "https://updated.org" },
    publicProfileEnabled: true,
  });
  assert.equal(updated.bio, "Updated biography");
  assert.equal((await sourceStore.get("members/example-member.json")).title, "New headline");
  assert.equal(updated.links.website, "https://updated.org");
  await sourceStore.setJSON("members/real-tester.json", {
    username: "real-tester",
    name: "Real Tester",
    email: "tester@real-domain.org",
    title: "Manual test engineer",
  });
  await sourceStore.setJSON("members/fake.json", {
    username: "fake",
    email: "fake@test.notwork.local",
  });
  await profileStore.setJSON("profiles/fake.json", {
    username: "fake",
    email: "fake@test.notwork.local",
  });
  await profileStore.setJSON("sessions/fake.json", { username: "fake" });
  assert.equal((await contacts.testMembers()).members.length, 2);
  assert.ok(await profileStore.get("profiles/fake.json"));
  const eventStore = getStore({ name: "event-network" });
  await eventStore.setJSON("events/real/live/matchlab/profiles/member.json", {
    profile: { email: "MEMBER@real-domain.org", firstName: "Example", lastName: "Member" },
  });
  await eventStore.setJSON("events/real/demo/matchlab/profiles/other.json", {
    profile: { email: "other@real-domain.org" },
  });
  const exported = await contacts.collectContacts();
  assert.equal(exported.contacts.length, 2);
  const merged = exported.contacts.find((row) => row.email === "member@real-domain.org");
  assert.equal(merged.sources.length, 3);
  assert.equal(merged.announcementConsent, "unknown");
  assert.deepEqual(merged.groups, ["real"]);
  await contacts.testMembers(true);
  assert.equal(await profileStore.get("profiles/fake.json"), null);
  assert.equal(await profileStore.get("sessions/fake.json"), null);
  assert.ok(await sourceStore.get("members/real-tester.json"));
  assert.ok((await profileStore.list({ prefix: "test-cleanup-backups/" })).blobs.length);
  assert.equal((await contacts.testMembers(true)).members.length, 0);
  const author = await profileStore.get("profiles/example-member.json");
  await profileStore.setJSON("profiles/example-member.json", { ...author, verifiedMember: true });
  const invited = await members.createAdminMemberProfile({
    name: "Directory Target",
    email: "target@real-domain.org",
    headline: "Public headline",
    bio: "Directory introduction",
    website: "https://private-link.org",
  });
  const targetKey = "profiles/directory-target.json";
  const target = await profileStore.get(targetKey);
  await profileStore.setJSON(targetKey, {
    ...target,
    bio: "Unpublished private biography",
    publicProfileEnabled: false,
    experiences: [{ company: "Private company", role: "Private role" }],
  });
  const directory = await members.getPublicMemberProfile(invited.profile.username);
  assert.equal(directory.profile.bio, "Directory introduction");
  assert.equal(directory.profile.links.website, "");
  assert.deepEqual(directory.profile.experiences, []);
  assert.equal(directory.profile.photoUrl, "");
  assert.equal("email" in directory.profile, false);
  await members.submitMemberReference(
    login.token,
    invited.profile.username,
    "Collaboration",
    "We worked together and delivered a successful project.",
  );
  assert.equal(
    (await members.getPublicMemberProfile(invited.profile.username)).profile.references.length,
    0,
  );
  await members.moderateMemberReference(invited.profile.username, author.username, "approved");
  assert.equal(
    (await members.getPublicMemberProfile(invited.profile.username)).profile.references.length,
    1,
  );
  await assert.rejects(() =>
    members.submitMemberReference(
      login.token,
      author.username,
      "Collaboration",
      "This must not create a reference for myself.",
    ),
  );
  await profileStore.setJSON(targetKey, { ...target, status: "suspended" });
  assert.equal(await members.getPublicMemberProfile(invited.profile.username), null);
  await assert.rejects(() =>
    members.submitMemberReference(
      login.token,
      invited.profile.username,
      "Collaboration",
      "This suspended member must not receive a reference.",
    ),
  );
  const endpoint = (await load("member-profiles-admin")).default;
  const unauthorized = await endpoint(
    new Request("https://notwork.me/api/admin/member-profiles", {
      method: "POST",
      body: JSON.stringify({ action: "create", member: input, password: "wrong" }),
    }),
  );
  assert.equal(unauthorized.status, 401);
  const exportUnauthorized = await contacts.default(
    new Request("https://notwork.me/api/admin/contacts", { method: "POST", body: "{}" }),
  );
  assert.equal(exportUnauthorized.status, 401);
  console.log(
    "PASS: account creation, duplicate safety, password/login/edit flow, contact deduplication, demo exclusion, test cleanup, and authorization.",
  );
} finally {
  await fs.rm(temp, { recursive: true, force: true });
}
