import { Fragment, type ReactNode } from "react";
import { validateRichContent, type RichNode } from "../../lib/notes/rich-content";

function renderNode(node: RichNode): ReactNode {
  if (node.type === "text") {
    let result: ReactNode = node.text;
    for (const mark of node.marks ?? []) {
      switch (mark.type) {
        case "bold": result = <strong>{result}</strong>; break;
        case "italic": result = <em>{result}</em>; break;
        case "underline": result = <u>{result}</u>; break;
        case "textStyle": result = <span style={{ color: mark.attrs?.color ?? undefined, fontSize: mark.attrs?.fontSize ?? undefined }}>{result}</span>; break;
        case "highlight": result = <mark style={{ backgroundColor: mark.attrs?.color ?? undefined, color: "inherit" }}>{result}</mark>; break;
      }
    }
    return result;
  }
  const children = node.content?.map((child, index) => <Fragment key={index}>{renderNode(child)}</Fragment>);
  switch (node.type) {
    case "paragraph": return <p>{children?.length ? children : <br />}</p>;
    case "bulletList": return <ul>{children}</ul>;
    case "orderedList": return <ol start={node.attrs?.start}>{children}</ol>;
    case "listItem": return <li>{children}</li>;
    case "doc": return children;
  }
}

export function NoteRichContent({ content, json, version }: { content: string; json: unknown; version: number }) {
  let document: RichNode | null = null;
  if (json != null) {
    try { document = validateRichContent(json, version); } catch { /* Untrusted/unsupported JSON falls back to escaped plain text. */ }
  }
  return <div className="note-rich-content">{document ? renderNode(document) : <p>{content || "Aucun contenu dans cette note."}</p>}</div>;
}
