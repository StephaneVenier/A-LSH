"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { Slice, Fragment } from "@tiptap/pm/model";
import { noteEditorExtensions } from "@/lib/notes/editor-extensions";
import {
  fontSizes, textColors, highlightColors, plainTextToRichContent,
  validateRichContent, type RichNode,
} from "@/lib/notes/rich-content";

type Props = { content: string; json: unknown; version: number; onReadyChange: (ready: boolean) => void };

export function NoteEditor(props: Props) {
  const [initial] = useState(() => {
    try {
      return { document: props.json == null ? plainTextToRichContent(props.content) : validateRichContent(props.json, props.version) };
    } catch {
      return { document: null };
    }
  });
  if (!initial.document) {
    return <p role="alert" className="form-error">Ce contenu ne peut pas être ouvert dans cet éditeur. La note reste conservée ; aucun remplacement automatique ne sera effectué.</p>;
  }
  return <ReadyEditor initial={initial.document} onReadyChange={props.onReadyChange} />;
}

function ReadyEditor({ initial, onReadyChange }: { initial: RichNode; onReadyChange: Props["onReadyChange"] }) {
  const { pending } = useFormStatus();
  const [json, setJson] = useState(JSON.stringify(initial));
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: noteEditorExtensions,
    content: initial,
    immediatelyRender: false,
    enableInputRules: false,
    enablePasteRules: false,
    editorProps: {
      attributes: { id: "note-content", role: "textbox", "aria-multiline": "true", "aria-labelledby": "note-content-label", "aria-describedby": "note-editor-help", class: "note-rich-content note-editor-area" },
      // Pasted content is plain text only; external HTML never enters the editor.
      handlePaste(view, event) {
        event.preventDefault();
        try {
          const document = plainTextToRichContent(event.clipboardData?.getData("text/plain") ?? "");
          const nodes = document.content!.map((node) => view.state.schema.nodeFromJSON(node));
          view.dispatch(view.state.tr.replaceSelection(new Slice(Fragment.fromArray(nodes), 1, 1)).scrollIntoView());
        } catch {
          setError("Ce collage est trop volumineux ou non pris en charge. Collez un texte plus court.");
        }
        return true;
      },
      handleDrop: (_view, _event, _slice, moved) => !moved,
    },
    onUpdate({ editor }) {
      try {
        const document = validateRichContent(editor.getJSON());
        setJson(JSON.stringify(document));
        setError("");
      } catch {
        setJson("");
        setError("La note dépasse les limites autorisées. Réduisez le texte, la mise en forme ou l’imbrication des listes.");
      }
    },
  });
  const selection = useEditorState({
    editor,
    selector: ({ editor }) => editor ? {
      bold: editor.isActive("bold"), italic: editor.isActive("italic"), underline: editor.isActive("underline"),
      bulletList: editor.isActive("bulletList"), orderedList: editor.isActive("orderedList"),
      size: editor.getAttributes("textStyle").fontSize ?? "",
      color: editor.getAttributes("textStyle").color ?? "",
      highlight: editor.isActive("highlight") ? editor.getAttributes("highlight").color ?? highlightColors[0].value : "",
    } : null,
  });
  useEffect(() => { onReadyChange(Boolean(editor && json)); }, [editor, json, onReadyChange]);
  useEffect(() => { editor?.setEditable(!pending); }, [editor, pending]);

  const controls = [
    { label: "Gras", active: selection?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { label: "Italique", active: selection?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Souligné", active: selection?.underline, run: () => editor?.chain().focus().toggleUnderline().run() },
    { label: "Liste à puces", active: selection?.bulletList, run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: "Liste numérotée", active: selection?.orderedList, run: () => editor?.chain().focus().toggleOrderedList().run() },
  ];
  return <div className="note-editor">
    <input type="hidden" name="contentJson" value={json} />
    <fieldset disabled={!editor || pending} className="note-toolbar">
      <legend className="sr-only">Mise en forme du contenu</legend>
      <div className="note-toolbar-buttons">{controls.map((control) => <button key={control.label} type="button" aria-pressed={Boolean(control.active)} onMouseDown={(event) => event.preventDefault()} onClick={control.run}>{control.label}</button>)}</div>
      <div className="note-toolbar-selects">
        <label>Taille<select value={selection?.size ?? ""} onChange={(event) => event.target.value ? editor?.chain().focus().setFontSize(event.target.value).run() : editor?.chain().focus().unsetFontSize().run()}><option value="">Normale</option>{fontSizes.map((size) => <option key={size} value={size}>{size.replace("px", " px")}</option>)}</select></label>
        <label>Couleur<select value={selection?.color ?? ""} onChange={(event) => event.target.value ? editor?.chain().focus().setColor(event.target.value).run() : editor?.chain().focus().unsetColor().run()}><option value="">Par défaut</option>{textColors.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Surlignage<select value={selection?.highlight ?? ""} onChange={(event) => event.target.value ? editor?.chain().focus().setHighlight({ color: event.target.value }).run() : editor?.chain().focus().unsetHighlight().run()}><option value="">Aucun</option>{highlightColors.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
    </fieldset>
    {!editor ? <p className="p-4 text-sm" role="status">Chargement de l’éditeur…</p> : null}
    <EditorContent editor={editor} />
    <p id="note-editor-help" className="note-editor-help">Sélectionnez du texte pour le mettre en forme. Les collages externes sont insérés en texte brut. Annuler : Ctrl+Z (⌘Z sur Mac).</p>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
  </div>;
}
