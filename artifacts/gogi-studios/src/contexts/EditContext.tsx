import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { imageStoreGetAll, imageStoreSet, imageStoreClear } from "@/lib/imageStore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// ── Text overrides ────────────────────────────────────────────────────────────
const TEXT_KEY = "gogi-studios-content-overrides";
const MIGRATED_KEY = "gogi-studios-overrides-migrated";
const PENDING_KEY = "gogi-studios-overrides-pending-migration";

function loadPending(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function savePending(pending: Record<string, string>) {
  try {
    if (Object.keys(pending).length === 0) localStorage.removeItem(PENDING_KEY);
    else localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {}
}
const API = "/api";

function loadTextOverrides(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TEXT_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveLocal(next: Record<string, string>) {
  try {
    localStorage.setItem(TEXT_KEY, JSON.stringify(next));
  } catch {}
}

/** Returns true when the server confirmed the save. */
async function saveRemote(payload: { set?: Record<string, string>; remove?: string[]; clear?: boolean }): Promise<boolean> {
  try {
    const r = await fetch(`${API}/content-overrides`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return r.ok;
  } catch {
    return false;
  }
}

function notifySaveFailed() {
  toast({
    title: "Couldn't save for everyone",
    description:
      "This edit is only saved in your browser for now. Check your connection and try editing again.",
    variant: "destructive",
  });
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
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>(loadTextOverrides);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const serverLoadedRef = useRef(false);
  const pendingLocalOnlyRef = useRef<Record<string, string>>({});

  // Load image overrides from IndexedDB on mount
  useEffect(() => {
    imageStoreGetAll().then((all) => {
      if (Object.keys(all).length > 0) setImageOverrides(all);
    });
  }, []);

  // Load text overrides from the server on mount (source of truth for everyone)
  useEffect(() => {
    fetch(`${API}/content-overrides`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.overrides === "object" && data.overrides !== null) {
          const server = data.overrides as Record<string, string>;
          // Keep any never-migrated local-only keys aside for the one-time
          // admin migration below; the server is authoritative for rendering.
          let alreadyMigrated = false;
          try { alreadyMigrated = localStorage.getItem(MIGRATED_KEY) === "1"; } catch {}
          if (!alreadyMigrated) {
            // Combine previously stashed pending edits with any local-only
            // edits from before the database feature. Persist them under a
            // separate key so they survive reloads until an admin migrates.
            const localOnly: Record<string, string> = { ...loadPending() };
            for (const [k, v] of Object.entries(loadTextOverrides())) {
              if (!(k in server) && !(k in localOnly)) localOnly[k] = v;
            }
            savePending(localOnly);
            pendingLocalOnlyRef.current = localOnly;
          }
          serverLoadedRef.current = true;
          setOverrides(server);
          saveLocal(server);
        }
      })
      .catch(() => {});
  }, []);

  // One-time migration: push the admin's pre-database local-only edits up to
  // the server. Only keys the server does not already have are pushed, so
  // stale browser storage can never overwrite newer shared edits.
  useEffect(() => {
    if (authLoading || !isAdmin || !serverLoadedRef.current) return;
    const localOnly = pendingLocalOnlyRef.current;
    pendingLocalOnlyRef.current = {};
    if (Object.keys(localOnly).length === 0) {
      try { localStorage.setItem(MIGRATED_KEY, "1"); } catch {}
      savePending({});
      return;
    }
    saveRemote({ set: localOnly }).then((ok) => {
      if (ok) {
        // Only mark migrated once the server confirmed it has the edits.
        try { localStorage.setItem(MIGRATED_KEY, "1"); } catch {}
        savePending({});
        setOverrides((prev) => {
          const next = { ...localOnly, ...prev };
          saveLocal(next);
          return next;
        });
      } else {
        // Keep the keys pending (in memory and on disk) so a future load
        // retries the migration.
        pendingLocalOnlyRef.current = localOnly;
        savePending(localOnly);
        notifySaveFailed();
      }
    });
  }, [authLoading, isAdmin, overrides]);

  const toggleEditing = useCallback(() => setIsEditing((v) => !v), []);

  // ── Text ──────────────────────────────────────────────────────────────────
  const getContent = useCallback(
    (id: string, fallback: string) => overrides[id] ?? fallback,
    [overrides],
  );

  const setContent = useCallback(
    (id: string, value: string, fallback: string) => {
      setOverrides((prev) => {
        const next = { ...prev };
        const isReset = value.trim() === fallback.trim();
        if (isReset) {
          delete next[id];
        } else {
          next[id] = value;
        }
        saveLocal(next);
        if (isAdmin) {
          saveRemote(isReset ? { remove: [id] } : { set: { [id]: value } }).then((ok) => {
            if (!ok) notifySaveFailed();
          });
        }
        return next;
      });
    },
    [isAdmin],
  );

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
    if (isAdmin) {
      saveRemote({ clear: true }).then((ok) => {
        if (!ok) notifySaveFailed();
      });
    }
    // Reset images
    setImageOverrides({});
    imageStoreClear();
  }, [isAdmin]);

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
