import { useRef, ImgHTMLAttributes } from "react";
import { useEdit } from "@/contexts/EditContext";
import { Camera } from "lucide-react";

interface EditableImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Stable unique ID — used as the IndexedDB key */
  id: string;
  src: string;
  alt: string;
}

/**
 * Drop-in replacement for <img> that becomes click-to-replace in edit mode.
 * The parent element should already handle rounding / overflow-hidden / aspect ratio.
 */
export function EditableImage({ id, src, alt, className = "", ...rest }: EditableImageProps) {
  const { isEditing, getImageSrc, setImageSrc } = useEdit();
  const inputRef = useRef<HTMLInputElement>(null);
  const displaySrc = getImageSrc(id, src);
  const hasOverride = displaySrc !== src;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(id, reader.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  if (!isEditing) {
    return <img src={displaySrc} alt={alt} className={className} {...rest} />;
  }

  return (
    <div
      className="relative group cursor-pointer w-full h-full"
      onClick={() => inputRef.current?.click()}
      title="Click to replace image"
    >
      <img
        src={displaySrc}
        alt={alt}
        className={className || "w-full h-full object-cover"}
        {...rest}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <Camera className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold tracking-wide">Replace image</p>
        <p className="text-[10px] text-white/70">JPG, PNG, WEBP</p>
      </div>

      {/* "Changed" badge */}
      {hasOverride && (
        <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full opacity-80">
          ✓ Replaced
        </div>
      )}

      {/* Dashed outline indicator (same visual language as Editable text) */}
      <div className="absolute inset-0 ring-2 ring-dashed ring-primary/50 ring-offset-0 opacity-60 group-hover:opacity-0 transition-opacity pointer-events-none rounded-[inherit]" />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
