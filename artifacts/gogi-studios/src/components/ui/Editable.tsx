import { useEdit } from "@/contexts/EditContext";
import { ElementType, useRef, useEffect } from "react";

interface EditableProps {
  /** Stable, unique ID — used as the localStorage key */
  id: string;
  /** The default text content (original source-of-truth value) */
  children: string;
  /** Extra className to apply to the wrapper element */
  className?: string;
  /** HTML tag to render (default: span) */
  as?: ElementType;
}

/**
 * Wrap any text node with <Editable id="unique-key">default text</Editable>.
 * In edit mode the element becomes contenteditable; changes auto-save to
 * localStorage on blur. Outside edit mode it renders the stored override (or
 * the original children) with zero extra DOM cost.
 */
export function Editable({ id, children, className = "", as: Tag = "span" }: EditableProps) {
  const { isEditing, getContent, setContent } = useEdit();
  const content = getContent(id, children);
  const ref = useRef<HTMLElement>(null);

  // Sync the DOM node whenever we enter/exit edit mode or the stored value changes.
  // We manage innerHTML manually to avoid React overwriting user keystrokes.
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = content;
    }
  }, [isEditing, content]);

  if (!isEditing) {
    // Plain render — no extra attributes, no overhead
    return (
      <Tag className={className || undefined}>
        {content}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      className={[
        className,
        "outline-dashed outline-2 outline-offset-1 outline-primary/60 rounded-[2px]",
        "focus-visible:outline-primary focus-visible:bg-primary/5",
        "cursor-text hover:bg-primary/5 transition-colors",
        "whitespace-pre-wrap",
      ]
        .filter(Boolean)
        .join(" ")}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const val = e.currentTarget.textContent ?? "";
        setContent(id, val, children);
      }}
      // Prevent Enter from inserting a <br> or <div> — keep text flat
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter") e.preventDefault();
      }}
    />
  );
}
