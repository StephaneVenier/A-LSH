/* eslint-disable @typescript-eslint/no-require-imports -- In-memory CommonJS loader for TS/TSX tests without new dependencies. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

// Compile only local test imports in memory; no generated files or test dependency.
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const source = fs.readFileSync(filename, "utf8");
    module._compile(ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
      fileName: filename,
    }).outputText, filename);
  };
}
const rich = require("../lib/notes/rich-content.ts");
const { getSchema } = require("@tiptap/core");
const { noteEditorExtensions } = require("../lib/notes/editor-extensions.ts");
const { NoteRichContent } = require("../app/components/note-rich-content.tsx");
const { createElement } = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const text = (value, marks) => ({ type: "text", text: value, ...(marks ? { marks } : {}) });
const paragraph = (...content) => ({ type: "paragraph", content });
const doc = (...content) => ({ type: "doc", content });
const sample = doc(
  paragraph(text("Réunion équipe", [
    { type: "bold" }, { type: "italic" }, { type: "underline" },
    { type: "textStyle", attrs: { color: "#245b91", fontSize: "24px" } },
    { type: "highlight", attrs: { color: "#fff0a6" } },
  ])),
  { type: "bulletList", content: [{ type: "listItem", content: [paragraph(text("Préparer le matériel"))] }] },
  { type: "orderedList", attrs: { start: 2, type: null }, content: [{ type: "listItem", content: [paragraph(text("Appeler les familles"))] }] },
);

test("legacy text and blank lines remain text, never HTML", () => {
  const original = '<script>alert("x")</script>\n\n<strong>Bonjour</strong>\n';
  assert.equal(rich.richContentToText(rich.plainTextToRichContent(original)), original);
  assert.equal(rich.richContentToText(rich.plainTextToRichContent("")), "");
});
test("all V1 marks and lists survive Tiptap schema load/save/reopen", () => {
  const schema = getSchema(noteEditorExtensions);
  const canonical = rich.validateRichContent(sample);
  const loaded = schema.nodeFromJSON(canonical);
  loaded.check();
  const saved = rich.parseRichContent(JSON.stringify(loaded.toJSON()));
  assert.deepEqual(saved, canonical);
  const reopened = schema.nodeFromJSON(saved);
  reopened.check();
  assert.deepEqual(rich.validateRichContent(reopened.toJSON()), canonical);
  assert.equal(rich.richContentToText(saved), "Réunion équipe\nPréparer le matériel\nAppeler les familles");
});
test("editing an old note preserves its text and accepts formatting", () => {
  const document = rich.plainTextToRichContent("Ancienne note\nSuite");
  document.content[0].content[0].marks = [{ type: "bold" }];
  assert.equal(rich.richContentToText(rich.parseRichContent(JSON.stringify(document))), "Ancienne note\nSuite");
});
test("malformed JSON, unsupported version and invalid trees are refused", () => {
  for (const input of [null, "{", "[]", '"html"', "null"]) assert.throws(() => rich.parseRichContent(input));
  for (const value of [doc(), doc(text("wrong parent")), doc({ type: "listItem", content: [paragraph()] }), doc({ type: "paragraph", content: null })]) assert.throws(() => rich.validateRichContent(value));
  assert.throws(() => rich.validateRichContent(sample, 2));
});
test("unknown attrs, nodes, marks, raw HTML/CSS, links and embeds are refused", () => {
  for (const type of ["image", "iframe", "script", "object", "embed", "html", "heading"]) assert.throws(() => rich.validateRichContent(doc({ type })));
  for (const mark of [
    { type: "link", attrs: { href: "javascript:alert(1)" } },
    { type: "bold", attrs: { onclick: "alert(1)" } },
    { type: "textStyle", attrs: { style: "color:red", fontFamily: "evil" } },
    { type: "textStyle", attrs: { color: "red" } },
    { type: "textStyle", attrs: { color: "url(https://invalid.test)" } },
    { type: "textStyle", attrs: { fontSize: "999px" } },
    { type: "highlight", attrs: { color: "#ffffff" } },
  ]) assert.throws(() => rich.validateRichContent(doc(paragraph(text("x", [mark])))));
  assert.throws(() => rich.validateRichContent({ ...sample, html: "<script/>" }));
  assert.throws(() => rich.parseRichContent('{"type":"doc","__proto__":{},"content":[{"type":"paragraph"}]}'));
  assert.throws(() => rich.validateRichContent(doc({ type: "orderedList", attrs: { start: 0 }, content: [] })));
});
test("text, total bytes, depth, node and mark count limits are enforced", () => {
  assert.throws(() => rich.plainTextToRichContent("x".repeat(rich.MAX_TEXT_LENGTH + 1)));
  assert.throws(() => rich.parseRichContent(" ".repeat(rich.MAX_JSON_BYTES + 1)));
  assert.throws(() => rich.validateRichContent(doc(...Array.from({ length: rich.MAX_NODES }, () => paragraph()))));
  assert.throws(() => rich.validateRichContent(doc(paragraph(text("x", Array(6).fill({ type: "bold" }))))));
  let nested = paragraph(text("deep"));
  for (let index = 0; index < 6; index++) nested = { type: "bulletList", content: [{ type: "listItem", content: [paragraph(), nested] }] };
  assert.throws(() => rich.validateRichContent(doc(nested)));
});
test("React output escapes text, whitelists styles, and falls back for hostile JSON", () => {
  const html = renderToStaticMarkup(createElement(NoteRichContent, { json: sample, content: "", version: 1 }));
  assert.match(html, /<strong>/);
  assert.match(html, /font-size:24px/);
  assert.match(html, /<ol start="2">/);
  for (const json of [null, doc({ type: "script" }), doc(paragraph(text('<img src=x onerror="alert(1)">')))]) {
    const output = renderToStaticMarkup(createElement(NoteRichContent, { json, content: "<script>alert(1)</script>", version: 1 }));
    assert.doesNotMatch(output, /<script|<img/);
    assert.match(output, /&lt;/);
  }
});
test("search and section moves keep their scope and never write rich content", () => {
  const actions = fs.readFileSync("app/actions/notes.ts", "utf8");
  const move = actions.slice(actions.indexOf("export async function moveNote"));
  assert.match(move, /\.update\(\{ section: destination \}\)/);
  assert.match(move, /\.eq\("workspace_id", context.workspace.id\)/);
  assert.match(move, /\.eq\("created_by", context.user.id\)/);
  assert.doesNotMatch(move, /content_json|content_version/);
  assert.match(actions, /content = richContentToText\(contentJson\)/);
  const listing = fs.readFileSync("app/components/notes-section-page.tsx", "utf8");
  assert.match(listing, /\.eq\("section", section\)/);
  assert.match(listing, /textSearch\("search_vector", search, \{ config: "french"/);
});

function actionHarness({ authenticated = true, section = "training" } = {}) {
  const Module = require("node:module");
  const path = require("node:path");
  const filename = path.resolve("app/actions/notes.ts");
  const compiled = new Module(filename, module);
  const calls = [];
  const query = {
    insert(value) { calls.push(["insert", value]); return Promise.resolve({ error: null }); },
    update(value) { calls.push(["update", value]); return this; },
    eq(...args) { calls.push(["eq", ...args]); return this; },
    select(...args) { calls.push(["select", ...args]); return this; },
    maybeSingle() { return Promise.resolve({ data: { id: "note-id", section }, error: null }); },
  };
  compiled.require = (id) => {
    if (id === "next/cache") return { revalidatePath: (path) => calls.push(["revalidate", path]) };
    if (id === "next/navigation") return { redirect: (path) => { throw new Error(`redirect:${path}`); } };
    if (id === "@/lib/supabase/server") return { createClient: async () => ({ from: () => query }) };
    if (id === "@/lib/auth/context") return { requireWorkspaceContext: async () => {
      calls.push(["auth"]);
      if (!authenticated) throw new Error("unauthenticated");
      return { user: { id: "server-user" }, workspace: { id: "server-workspace" } };
    } };
    if (id.startsWith("@/")) return require(path.resolve(id.slice(2)));
    throw new Error(`Unexpected import: ${id}`);
  };
  compiled._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return { actions: compiled.exports, calls };
}
function form() {
  const form = new FormData();
  form.set("title", "Note enrichie");
  form.set("contentJson", JSON.stringify(sample));
  form.set("content", "Texte falsifié");
  form.set("workspace_id", "browser-workspace");
  form.set("created_by", "browser-user");
  form.set("category", "Général");
  form.set("occurredAt", "2026-09-22T10:30");
  form.set("timezoneOffset", "-120");
  form.set("id", "9af029bf-aab4-4be7-9aad-23c001abc456");
  return form;
}
test("creation action writes derived plain text and JSON atomically with server ownership", async () => {
  const { actions, calls } = actionHarness();
  await assert.rejects(actions.createNote({}, form()), /redirect:\/cahier\?created=1/);
  const payload = calls.find(([method]) => method === "insert")[1];
  assert.equal(payload.content, rich.richContentToText(rich.validateRichContent(sample)));
  assert.deepEqual(payload.content_json, rich.validateRichContent(sample));
  assert.equal(payload.content_version, 1);
  assert.equal(payload.workspace_id, "server-workspace");
  assert.equal(payload.created_by, "server-user");
  assert.equal(payload.visibility, "private");
  assert.equal(calls[0][0], "auth");
});
test("invalid JSON and unauthenticated actions never write to Supabase", async () => {
  for (const action of ["createNote", "updateNote"]) {
    const { actions, calls } = actionHarness();
    const input = form();
    input.set("contentJson", '{"type":"script"}');
    assert.ok((await actions[action]({}, input)).error);
    assert.equal(calls.length, 1);
    const denied = actionHarness({ authenticated: false });
    await assert.rejects(denied.actions[action]({}, form()), /unauthenticated/);
    assert.equal(denied.calls.length, 1);
  }
});
test("editing returns to each section without changing author, workspace or section", async () => {
  for (const [section, route] of [["notebook", "cahier"], ["training", "formations"], ["project", "projets"]]) {
    const { actions, calls } = actionHarness({ section });
    await assert.rejects(actions.updateNote({}, form()), new RegExp(`redirect:/${route}\\?updated=1`));
    const payload = calls.find(([method]) => method === "update")[1];
    assert.equal(payload.content, rich.richContentToText(rich.validateRichContent(sample)));
    assert.equal(payload.created_by, undefined);
    assert.equal(payload.workspace_id, undefined);
    assert.equal(payload.section, undefined);
    assert.ok(calls.some((call) => call.join() === "eq,workspace_id,server-workspace"));
    assert.ok(calls.some((call) => call.join() === "eq,created_by,server-user"));
    for (const path of ["/cahier", "/formations", "/projets"]) assert.ok(calls.some((call) => call.join() === `revalidate,${path}`));
  }
});
test("moving between sections writes only section and keeps the rich document untouched", async () => {
  for (const [section, destination, route] of [["notebook", "training", "cahier"], ["training", "project", "formations"], ["project", "notebook", "projets"]]) {
    const { actions, calls } = actionHarness({ section });
    const input = form();
    input.set("destination", destination);
    await assert.rejects(actions.moveNote({}, input), new RegExp(`redirect:/${route}\\?moved=1`));
    assert.deepEqual(calls.find(([method]) => method === "update")[1], { section: destination });
  }
});
