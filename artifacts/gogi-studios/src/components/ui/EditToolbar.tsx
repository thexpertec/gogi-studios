import { useState } from "react";
import { useEdit } from "@/contexts/EditContext";
import { useAuth } from "@/contexts/AuthContext";
import { Pencil, Check, RotateCcw, X, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSettingsDialog } from "@/components/ui/AdminSettingsDialog";

export function EditToolbar() {
  const { isAdmin, logout } = useAuth();
  const { isEditing, toggleEditing, changeCount, resetAll } = useEdit();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Only visible to logged-in admins
  if (!isAdmin) return null;

  return (
    <>
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-background border border-border shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 text-sm"
          >
            {/* Status */}
            <span className="text-muted-foreground font-medium">
              {changeCount === 0 ? (
                "Click any text to edit"
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-semibold text-foreground">{changeCount}</span>{" "}
                  {changeCount === 1 ? "change" : "changes"} saved
                </span>
              )}
            </span>

            {/* Reset */}
            {changeCount > 0 && (
              <button
                onClick={() => {
                  if (confirm("Reset all edits and restore the original text?")) resetAll();
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
                title="Reset all edits"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}

            <div className="w-px h-4 bg-border" />

            {/* Done */}
            <Button
              size="sm"
              onClick={toggleEditing}
              className="rounded-full bg-primary text-white hover:bg-primary/90 px-4 h-8 text-xs font-semibold gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {/* Settings + Logout — only visible when not actively editing */}
        {!isEditing && (
          <>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSettingsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-3 rounded-full shadow-md font-medium text-xs bg-muted border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              title="Site settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-3 rounded-full shadow-md font-medium text-xs bg-muted border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
              title="Log out of admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </motion.button>
          </>
        )}

        {/* Main toggle */}
        <motion.button
          onClick={toggleEditing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={[
            "flex items-center gap-2 px-5 py-3 rounded-full shadow-xl font-semibold text-sm transition-colors",
            isEditing
              ? "bg-foreground text-background hover:bg-foreground/85"
              : "bg-primary text-white hover:bg-primary/90",
          ].join(" ")}
          title={isEditing ? "Exit edit mode" : "Enable edit mode"}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              Exit Editing
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" />
              Edit Page
            </>
          )}
        </motion.button>
      </div>
    </div>

    <AdminSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
