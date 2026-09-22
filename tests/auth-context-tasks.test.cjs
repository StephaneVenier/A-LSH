/* eslint-disable @typescript-eslint/no-require-imports -- In-memory loader for focused server tests without new dependencies. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

function load(file, mocks = {}) {
  const filename = path.resolve(file);
  const compiled = new Module(filename, module);
  compiled.require = (id) => Object.hasOwn(mocks, id) ? mocks[id] : require(id);
  compiled._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText, filename);
  return compiled.exports;
}

const origin = "https://app.example";
function callback(exchangeError = null) {
  return load("app/auth/callback/route.ts", {
    "@/lib/supabase/server": { createClient: async () => ({
      auth: { exchangeCodeForSession: async () => ({ error: exchangeError }) },
    }) },
  });
}

for (const [next, expected] of [
  ["/", "/"], ["/cahier", "/cahier"], ["/suivi-enfants", "/suivi-enfants"],
  ["/a/../cahier", "/cahier"], ["/cahier?q=test#note", "/cahier?q=test#note"],
  ["//evil.example", "/"], ["/a/..//evil.example", "/"],
  ["/a/%2e%2e//evil.example", "/"], ["/%2e//evil.example", "/"],
  ["/\\evil.example", "/"], ["/cahier\\test", "/"],
  ["https://evil.example", "/"], ["javascript:alert(1)", "/"],
  ["/\nevil.example", "/"], ["/\revil.example", "/"],
  ["/\tevil.example", "/"], ["/\u0000evil.example", "/"], ["/\u007fevil.example", "/"],
  ["", "/"],
]) {
  test(`callback Location is safe for ${JSON.stringify(next)}`, async () => {
    const url = new URL("/auth/callback?code=test-code", origin);
    url.searchParams.set("next", next);
    const response = await callback().GET(new Request(url));
    const location = response.headers.get("location");
    assert.equal(response.status, 307);
    assert.equal(location, new URL(expected, origin).href);
    assert.equal(new URL(location).origin, origin);
  });
}
test("callback defaults to root and preserves confirmation failure redirects", async () => {
  const root = await callback().GET(new Request(`${origin}/auth/callback?code=test-code`));
  assert.equal(root.headers.get("location"), `${origin}/`);
  for (const [url, error] of [[`${origin}/auth/callback`, null], [`${origin}/auth/callback?code=invalid`, { code: "invalid" }]]) {
    const response = await callback(error).GET(new Request(url));
    assert.equal(response.headers.get("location"), `${origin}/connexion?error=confirmation`);
  }
});

function authContext(userId, rows) {
  const filters = [];
  return { filters, context: load("lib/auth/context.ts", {
    react: { cache: (fn) => fn },
    "next/navigation": { redirect: (url) => { throw new Error(`redirect:${url}`); } },
    "@/lib/supabase/server": { createClient: async () => ({
      auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null }, error: null }) },
      from(table) {
        let data = rows;
        return {
          select() { return this; },
          eq(column, value) { filters.push([table, column, value]); data = data.filter((row) => row[column] === value); return this; },
          order() { return this; },
          limit(amount) { data = data.slice(0, amount); return this; },
          maybeSingle: async () => ({ data: table === "profiles" ? { display_name: "Test" } : data[0] ?? null, error: null }),
        };
      },
    }) },
  }) };
}
const memberships = [
  { user_id: "A", role: "admin", workspace_id: "shared", workspaces: { id: "shared", name: "Shared" } },
  { user_id: "B", role: "viewer", workspace_id: "shared", workspaces: { id: "shared", name: "Shared" } },
];
test("B loads their viewer role even when A's admin membership is visible first", async () => {
  const { context, filters } = authContext("B", memberships);
  const result = await context.getAuthContext();
  assert.equal(result.role, "viewer");
  assert.equal(result.workspace.id, "shared");
  assert.ok(filters.some((filter) => filter.join() === "workspace_members,user_id,B"));
  assert.equal((await authContext("A", memberships).context.getAuthContext()).role, "admin");
});
test("workspace is the one belonging to the selected user's membership", async () => {
  const rows = [memberships[0], { ...memberships[1], workspace_id: "own", workspaces: [{ id: "own", name: "Own" }] }];
  const result = await authContext("B", rows).context.requireWorkspaceContext();
  assert.equal(result.workspace.id, "own");
  assert.equal(result.role, "viewer");
});
test("missing or inconsistent memberships never provide another member's context", async () => {
  for (const rows of [[memberships[0]], [{ ...memberships[1], workspaces: null }], [{ ...memberships[1], workspaces: { id: "wrong" } }]]) {
    const { context } = authContext("B", rows);
    const result = await context.getAuthContext();
    assert.equal(result.workspace, null);
    assert.equal(result.role, null);
    await assert.rejects(context.requireWorkspaceContext(), /redirect:\/bienvenue/);
  }
  await assert.rejects(authContext(null, memberships).context.requireWorkspaceContext(), /redirect:\/connexion/);
});

function tasks() {
  const writes = [];
  const filters = [];
  const query = {
    insert(payload) { writes.push(payload); return Promise.resolve({ error: null }); },
    update(payload) { writes.push(payload); return this; },
    eq(...filter) { filters.push(filter); return this; },
    select() { return this; },
    maybeSingle: async () => ({ data: { id: "task" }, error: null }),
  };
  const actions = load("app/actions/tasks.ts", {
    "next/cache": { revalidatePath() {} },
    "next/navigation": { redirect: (url) => { throw new Error(`redirect:${url}`); } },
    "@/lib/auth/context": { requireWorkspaceContext: async () => ({ user: { id: "B" }, workspace: { id: "shared" } }) },
    "@/lib/supabase/server": { createClient: async () => ({ from: () => query }) },
    "@/lib/tasks/constants": load("lib/tasks/constants.ts"),
  });
  return { actions, writes, filters };
}
for (const action of ["createTask", "updateTask"]) {
  for (const description of [undefined, "", "Texte normal\nDeuxième ligne"]) {
    test(`${action} preserves description ${JSON.stringify(description)}`, async () => {
      const form = new FormData();
      form.set("id", "9af029bf-aab4-4be7-9aad-23c001abc456");
      form.set("title", "Test");
      form.set("priority", "normal");
      form.set("status", "todo");
      if (description !== undefined) form.set("description", description);
      const { actions, writes, filters } = tasks();
      await assert.rejects(actions[action]({}, form), /redirect:\/taches\?/);
      assert.equal(writes.length, 1);
      assert.equal(writes[0].description, description ?? "");
      assert.equal(writes[0].visibility, "private");
      if (action === "createTask") {
        assert.equal(writes[0].workspace_id, "shared");
        assert.equal(writes[0].created_by, "B");
      } else {
        assert.equal(writes[0].created_by, undefined);
        assert.ok(filters.some((filter) => filter.join() === "workspace_id,shared"));
      }
    });
  }
}
