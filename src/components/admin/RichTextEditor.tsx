import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Unlink,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Undo2,
  Redo2,
  RemoveFormatting,
  Quote,
  Minus,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('أدخل الرابط:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const tools = [
    {
      icon: <Undo2 className="w-4 h-4" />,
      title: "تراجع",
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      icon: <Redo2 className="w-4 h-4" />,
      title: "إعادة",
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
      separator: true,
    },
    {
      icon: <Bold className="w-4 h-4" />,
      title: "عريض",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: <Italic className="w-4 h-4" />,
      title: "مائل",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      icon: <UnderlineIcon className="w-4 h-4" />,
      title: "تحته خط",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      separator: true,
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      title: "عنوان كبير",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      title: "عنوان فرعي",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
    },
    {
      icon: <Quote className="w-4 h-4" />,
      title: "اقتباس",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      separator: true,
    },
    {
      icon: <List className="w-4 h-4" />,
      title: "قائمة نقطية",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      title: "قائمة مرقمة",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      separator: true,
    },
    {
      icon: <AlignRight className="w-4 h-4" />,
      title: "محاذاة يمين",
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
    },
    {
      icon: <AlignCenter className="w-4 h-4" />,
      title: "محاذاة وسط",
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
    },
    {
      icon: <AlignLeft className="w-4 h-4" />,
      title: "محاذاة يسار",
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
      separator: true,
    },
    {
      icon: <LinkIcon className="w-4 h-4" />,
      title: "إدراج رابط",
      action: setLink,
      isActive: editor.isActive('link'),
    },
    {
      icon: <Unlink className="w-4 h-4" />,
      title: "إزالة رابط",
      action: () => editor.chain().focus().unsetLink().run(),
      disabled: !editor.isActive('link'),
    },
    {
      icon: <Minus className="w-4 h-4" />,
      title: "خط فاصل",
      action: () => editor.chain().focus().setHorizontalRule().run(),
      separator: true,
    },
    {
      icon: <RemoveFormatting className="w-4 h-4" />,
      title: "إزالة التنسيق",
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
      {tools.map((tool, i) => (
        <div key={i} className="contents">
          <button
            type="button"
            onClick={tool.action}
            disabled={tool.disabled}
            title={tool.title}
            className={`p-1.5 rounded-md transition-colors ${
              tool.isActive
                ? "bg-primary/10 text-primary"
                : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-800"
            } ${tool.disabled ? "opacity-30 cursor-not-allowed" : ""}`}
            onMouseDown={(e) => e.preventDefault()}
          >
            {tool.icon}
          </button>
          {tool.separator && <div className="w-px h-5 bg-slate-200 mx-1" />}
        </div>
      ))}
    </div>
  );
};

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
    ],
    content: value || "<p dir=\"rtl\"></p>",
    editorProps: {
      attributes: {
        class: "min-h-[280px] max-h-[500px] overflow-y-auto px-5 py-4 text-sm text-slate-800 leading-relaxed focus:outline-none prose prose-sm max-w-none prose-headings:font-bold prose-h2:text-lg prose-h3:text-base prose-a:text-primary prose-blockquote:border-r-primary prose-blockquote:border-r-2 prose-blockquote:pr-4 prose-blockquote:not-italic prose-blockquote:text-slate-600 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 text-right",
        dir: "rtl"
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep external updates synced if the form is reset from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Prevent cursor jumping by only updating if the content is completely different
      // e.g., when the modal opens with a new product/page
      if (document.activeElement !== editor.view.dom) {
        editor.commands.setContent(value || "<p dir=\"rtl\"></p>", { emitUpdate: false });
      }
    }
  }, [value, editor]);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white flex flex-col">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
};

export default RichTextEditor;
