import { Extension } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import { BulletList, OrderedList, ListItem, ListKeymap } from "@tiptap/extension-list";
import { TextStyle, Color, FontSize } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { history, undo, redo } from "@tiptap/pm/history";

const History = Extension.create({
  name: "noteHistory",
  addProseMirrorPlugins: () => [history()],
  addKeyboardShortcuts() {
    return {
      "Mod-z": () => undo(this.editor.state, this.editor.view.dispatch),
      "Mod-Shift-z": () => redo(this.editor.state, this.editor.view.dispatch),
      "Mod-y": () => redo(this.editor.state, this.editor.view.dispatch),
      "Shift-Enter": () => this.editor.commands.enter(),
    };
  },
});

export const noteEditorExtensions = [
  Document, Paragraph, Text, Bold, Italic, Underline,
  BulletList, OrderedList, ListItem, ListKeymap,
  TextStyle, Color, FontSize, Highlight.configure({ multicolor: true }), History,
];
