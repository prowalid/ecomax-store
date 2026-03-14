import { useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link,
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

type ToolAction =
  | { type: "command"; command: string; value?: string }
  | { type: "custom"; handler: (editor: HTMLDivElement) => void };

interface Tool {
  icon: React.ReactNode;
  title: string;
  action: ToolAction;
  separator?: boolean;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleLink = useCallback(() => {
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString().trim().length > 0;

    if (!hasSelection) {
      return;
    }

    const url = prompt("أدخل الرابط:");
    if (url?.trim()) {
      exec("createLink", url.trim());
    }
  }, [exec]);

  const tools: Tool[] = [
    { icon: <Undo2 className="w-4 h-4" />, title: "تراجع", action: { type: "command", command: "undo" } },
    { icon: <Redo2 className="w-4 h-4" />, title: "إعادة", action: { type: "command", command: "redo" }, separator: true },

    { icon: <Bold className="w-4 h-4" />, title: "عريض", action: { type: "command", command: "bold" } },
    { icon: <Italic className="w-4 h-4" />, title: "مائل", action: { type: "command", command: "italic" } },
    { icon: <Underline className="w-4 h-4" />, title: "تحته خط", action: { type: "command", command: "underline" }, separator: true },

    { icon: <Heading2 className="w-4 h-4" />, title: "عنوان كبير", action: { type: "command", command: "formatBlock", value: "h2" } },
    { icon: <Heading3 className="w-4 h-4" />, title: "عنوان فرعي", action: { type: "command", command: "formatBlock", value: "h3" } },
    { icon: <Quote className="w-4 h-4" />, title: "اقتباس", action: { type: "command", command: "formatBlock", value: "blockquote" }, separator: true },

    { icon: <List className="w-4 h-4" />, title: "قائمة نقطية", action: { type: "command", command: "insertUnorderedList" } },
    { icon: <ListOrdered className="w-4 h-4" />, title: "قائمة مرقمة", action: { type: "command", command: "insertOrderedList" }, separator: true },

    { icon: <AlignRight className="w-4 h-4" />, title: "محاذاة يمين", action: { type: "command", command: "justifyRight" } },
    { icon: <AlignCenter className="w-4 h-4" />, title: "محاذاة وسط", action: { type: "command", command: "justifyCenter" } },
    { icon: <AlignLeft className="w-4 h-4" />, title: "محاذاة يسار", action: { type: "command", command: "justifyLeft" }, separator: true },

    { icon: <Link className="w-4 h-4" />, title: "إدراج رابط", action: { type: "custom", handler: () => handleLink() } },
    { icon: <Unlink className="w-4 h-4" />, title: "إزالة رابط", action: { type: "command", command: "unlink" } },
    { icon: <Minus className="w-4 h-4" />, title: "خط فاصل", action: { type: "command", command: "insertHorizontalRule" }, separator: true },

    { icon: <RemoveFormatting className="w-4 h-4" />, title: "إزالة التنسيق", action: { type: "command", command: "removeFormat" } },
  ];

  const handleToolClick = (tool: Tool) => {
    if (tool.action.type === "command") {
      exec(tool.action.command, tool.action.value);
    } else {
      tool.action.handler(editorRef.current!);
    }
    handleInput();
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        {tools.map((tool, i) => (
          <div key={i} className="contents">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleToolClick(tool)}
              title={tool.title}
              className="p-1.5 rounded-md text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              {tool.icon}
            </button>
            {tool.separator && (
              <div className="w-px h-5 bg-slate-200 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        dir="rtl"
        className="min-h-[280px] max-h-[500px] overflow-y-auto px-5 py-4 text-sm text-slate-800 leading-relaxed focus:outline-none prose prose-sm max-w-none prose-headings:font-bold prose-h2:text-lg prose-h3:text-base prose-a:text-primary prose-blockquote:border-r-primary prose-blockquote:border-r-2 prose-blockquote:pr-4 prose-blockquote:not-italic prose-blockquote:text-slate-600"
        onInput={handleInput}
        onBlur={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
