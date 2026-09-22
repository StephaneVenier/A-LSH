export const CONTENT_VERSION = 1;
export const MAX_JSON_BYTES = 512_000;
export const MAX_TEXT_LENGTH = 100_000;
export const MAX_NODES = 10_000;
export const MAX_DEPTH = 12;
export const fontSizes = ["14px", "16px", "18px", "24px", "32px"] as const;
export const textColors = [
  { value: "#173b33", label: "Vert sombre" },
  { value: "#a33c27", label: "Corail foncé" },
  { value: "#245b91", label: "Bleu" },
  { value: "#69418c", label: "Violet" },
  { value: "#765400", label: "Ocre" },
  { value: "#4b5563", label: "Gris" },
] as const;
export const highlightColors = [
  { value: "#fff0a6", label: "Jaune" },
  { value: "#dceee0", label: "Vert" },
  { value: "#ffe0d5", label: "Corail" },
] as const;

export type RichMark = {
  type: "bold" | "italic" | "underline" | "textStyle" | "highlight";
  attrs?: { color?: string | null; fontSize?: string | null };
};
export type RichNode = {
  type: "doc" | "paragraph" | "text" | "bulletList" | "orderedList" | "listItem";
  content?: RichNode[];
  text?: string;
  marks?: RichMark[];
  attrs?: { start?: number; type?: null };
};

function invalid(): never {
  throw new Error("Le contenu ou sa mise en forme n’est pas autorisé. Simplifiez la note et réessayez.");
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) invalid();
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) invalid();
}
function mark(value: unknown): RichMark {
  const input = object(value);
  keys(input, ["type", "attrs"]);
  const attrs = input.attrs === undefined ? {} : object(input.attrs);
  if (input.type === "bold" || input.type === "italic" || input.type === "underline") {
    keys(attrs, []);
    return { type: input.type };
  }
  if (input.type === "textStyle") {
    keys(attrs, ["color", "fontSize"]);
    if (attrs.color != null && !textColors.some(({ value }) => value === attrs.color)) invalid();
    if (attrs.fontSize != null && !fontSizes.some((size) => size === attrs.fontSize)) invalid();
    return { type: "textStyle", attrs: { color: (attrs.color ?? null) as string | null, fontSize: (attrs.fontSize ?? null) as string | null } };
  }
  if (input.type === "highlight") {
    keys(attrs, ["color"]);
    if (attrs.color != null && !highlightColors.some(({ value }) => value === attrs.color)) invalid();
    return { type: "highlight", attrs: { color: (attrs.color ?? highlightColors[0].value) as string } };
  }
  return invalid();
}

// Validate database values too: RLS does not validate the shape of a JSON document.
export function validateRichContent(value: unknown, version: unknown = CONTENT_VERSION): RichNode {
  if (version !== CONTENT_VERSION) invalid();
  const serialized = JSON.stringify(value);
  if (!serialized || new TextEncoder().encode(serialized).length > MAX_JSON_BYTES) invalid();
  let nodes = 0;
  let textLength = 0;
  function node(value: unknown, depth: number, allowed: string[]): RichNode {
    if (++nodes > MAX_NODES || depth > MAX_DEPTH) invalid();
    const input = object(value);
    if (typeof input.type !== "string" || !allowed.includes(input.type)) invalid();
    if (input.type === "text") {
      keys(input, ["type", "text", "marks"]);
      if (typeof input.text !== "string" || !input.text.length || input.text.includes("\u0000")) invalid();
      textLength += input.text.length;
      if (textLength > MAX_TEXT_LENGTH) invalid();
      if (input.marks !== undefined && (!Array.isArray(input.marks) || input.marks.length > 5)) invalid();
      const marks = ((input.marks ?? []) as unknown[]).map(mark);
      if (new Set(marks.map((item) => item.type)).size !== marks.length) invalid();
      const markOrder = ["textStyle", "bold", "italic", "underline", "highlight"];
      marks.sort((a, b) => markOrder.indexOf(a.type) - markOrder.indexOf(b.type));
      return { type: "text", text: input.text, ...(marks.length ? { marks } : {}) };
    }
    keys(input, input.type === "orderedList" ? ["type", "content", "attrs"] : ["type", "content"]);
    const content = input.content === undefined ? [] : input.content;
    if (!Array.isArray(content) || content.length > MAX_NODES) invalid();
    const children = input.type === "paragraph" ? ["text"] :
      input.type === "bulletList" || input.type === "orderedList" ? ["listItem"] : ["paragraph", "bulletList", "orderedList"];
    if (input.type !== "paragraph" && !content.length) invalid();
    const result: RichNode = { type: input.type as RichNode["type"], content: content.map((child) => node(child, depth + 1, children)) };
    if (input.type === "listItem" && result.content?.[0]?.type !== "paragraph") invalid();
    if (input.type === "orderedList") {
      const attrs = input.attrs === undefined ? {} : object(input.attrs);
      keys(attrs, ["start", "type"]);
      const start = attrs.start === undefined ? 1 : attrs.start;
      if (!Number.isInteger(start) || Number(start) < 1 || Number(start) > 9999 || (attrs.type !== undefined && attrs.type !== null)) invalid();
      result.attrs = { start: Number(start), type: null };
    }
    return result;
  }
  const result = node(value, 1, ["doc"]);
  if (richContentToText(result).length > MAX_TEXT_LENGTH) invalid();
  if (new TextEncoder().encode(JSON.stringify(result)).length > MAX_JSON_BYTES) invalid();
  return result;
}

export function parseRichContent(raw: unknown): RichNode {
  if (typeof raw !== "string" || raw.length > MAX_JSON_BYTES || new TextEncoder().encode(raw).length > MAX_JSON_BYTES) invalid();
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return invalid(); }
  return validateRichContent(value);
}

export function richContentToText(node: RichNode): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(richContentToText).join(node.type === "paragraph" ? "" : "\n");
}

export function plainTextToRichContent(text: string): RichNode {
  // Text is never passed to an HTML parser, even if it contains markup.
  return validateRichContent({
    type: "doc",
    content: text.replace(/\r\n?/g, "\n").split("\n").map((line) => ({
      type: "paragraph", ...(line ? { content: [{ type: "text", text: line }] } : {}),
    })),
  });
}
