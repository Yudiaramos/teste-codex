"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

/* ─────────────────────────── toolbar button ────────────────────────── */
function Btn({
  active,
  disabled,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors ${
        active
          ? "bg-[var(--tenant-primary)] text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      } disabled:cursor-not-allowed disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="mx-1 h-6 w-px bg-slate-200" />;
}

/* ─────────────────────────── main component ────────────────────────── */
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[28rem] px-5 py-4 text-sm leading-7 focus:outline-none",
      },
    },
    onUpdate({ editor: ed }) {
      onChange(ed.getHTML());
    },
  });

  /* sync if content changes from outside */
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[var(--tenant-primary)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--tenant-primary)]/20 transition-all">
      {/* ── toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-white px-2 py-1.5">
        {/* undo / redo */}
        <Btn
          title="Desfazer"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↩
        </Btn>
        <Btn
          title="Refazer"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↪
        </Btn>

        <Separator />

        {/* text style */}
        <Btn
          title="Negrito"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </Btn>
        <Btn
          title="Itálico"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </Btn>
        <Btn
          title="Sublinhado"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </Btn>
        <Btn
          title="Riscado"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className="line-through">S</span>
        </Btn>

        <Separator />

        {/* headings */}
        <Btn
          title="Título 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </Btn>
        <Btn
          title="Título 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </Btn>
        <Btn
          title="Título 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </Btn>

        <Separator />

        {/* lists */}
        <Btn
          title="Lista com marcadores"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </Btn>
        <Btn
          title="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </Btn>

        <Separator />

        {/* blockquote */}
        <Btn
          title="Citação"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          "
        </Btn>

        {/* horizontal rule */}
        <Btn
          title="Linha horizontal"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          ―
        </Btn>
      </div>

      {/* ── editor area ── */}
      <EditorContent editor={editor} />
    </div>
  );
}
