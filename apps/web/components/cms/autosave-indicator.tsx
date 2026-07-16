"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutosaveStatus } from "@/hooks/use-autosave";

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  lastSaved: Date | null;
  className?: string;
}

export function AutosaveIndicator({ status, lastSaved, className }: AutosaveIndicatorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const config = {
    saved: {
      icon: Cloud,
      text: "All changes saved",
      className: "text-emerald-500",
    },
    unsaved: {
      icon: CloudOff,
      text: "Unsaved changes",
      className: "text-amber-500",
    },
    saving: {
      icon: Loader2,
      text: "Saving...",
      className: "text-blue-500",
    },
    error: {
      icon: AlertCircle,
      text: "Save failed",
      className: "text-red-500",
    },
  };

  const { icon: Icon, text, className: colorClass } = config[status];

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      <Icon className={cn("h-3.5 w-3.5", status === "saving" && "animate-spin", colorClass)} />
      <span className={colorClass}>
        {text}
        {status === "saved" && lastSaved && (
          <span className="text-muted-foreground ml-1">
            {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </span>
    </div>
  );
}

export function RecoveryBanner({ visible, onDismiss, onSave }: { visible: boolean; onDismiss: () => void; onSave: () => void }) {
  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-amber-700 dark:text-amber-300">
            You have unsaved changes from your last session.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            Restore & Save
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
