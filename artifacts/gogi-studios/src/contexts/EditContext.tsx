import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { imageStoreGetAll, imageStoreSet, imageStoreClear } from "@/lib/imageStore";

// ── Text overrides ────────────────────────────────────────────────────────────
const TEXT_KEY = "gogi-studios-content-overrides";

function loadTextOverrides(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TEXT_KEY) ?? "{}");
  } catch {
    return {};
  }
}

// ── Context type ──────────────────────────────────────────────────────────────
interface EditContextType {
  isEditing: boolean;
  toggleEditing: () => void;
  // Text
  getContent: (id: string, fallback: string) => string;
  setContent: (id: string, value: string, fallback: string) => void;
  overrides: Record<string, string>;
  // Images
  imageOverrides: Record<string, string>;
  getImageSrc: (id: string, fallback: string) => string;
  setImageSrc: (id: string, dataURL: string) => void;
  // Combined
  changeCount: number;
  resetAll: () => void;
}

const EditContext = createContext<EditContextType | null>(null);

export function EditProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>(loadTextOverrides);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});

  // Load image overrides from IndexedDB on mount
  useEffect(() => {
    imageStoreGetAll().then((all) => {
      if (Object.keys(all).length > 0) setImageOverrides(all);
    });
  }, []);

  const toggleEditing = useCallback(() => setIsEditing((v) => !v), []);

  // ── Text ──────────────────────────────────────────────────────────────────
  const getContent = useCallback(
    (id: string, fallback: string) => overrides[id] ?? fallback,
    [overrides],
  );

  const setContent = useCallback((id: string, value: string, fallback: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (value.trim() === fallback.trim()) {
        delete next[id];
      } else {
        next[id] = value;
      }
      try {
        localStorage.setItem(TEXT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // ── Images ────────────────────────────────────────────────────────────────
  const getImageSrc = useCallback(
    (id: string, fallback: string) => imageOverrides[id] ?? fallback,
    [imageOverrides],
  );

  const setImageSrc = useCallback((id: string, dataURL: string) => {
    setImageOverrides((prev) => ({ ...prev, [id]: dataURL }));
    imageStoreSet(id, dataURL);
  }, []);

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    // Reset text
    setOverrides({});
    try { localStorage.removeItem(TEXT_KEY); } catch {}
    // Reset images
    setImageOverrides({});
    imageStoreClear();
  }, []);

  const changeCount =
    Object.keys(overrides).length + Object.keys(imageOverrides).length;

  return (
    <EditContext.Provider
      value={{
        isEditing,
        toggleEditing,
        getContent,
        setContent,
        overrides,
        imageOverrides,
        getImageSrc,
        setImageSrc,
        changeCount,
        resetAll,
      }}
    >
      {children}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const ctx = useContext(EditContext);
  if (!ctx) throw new Error("useEdit must be used inside EditProvider");
  return ctx;
}
