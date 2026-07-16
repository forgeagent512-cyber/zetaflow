"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

export type AutosaveStatus = "saved" | "unsaved" | "saving" | "error";

const AUTOSAVE_INTERVAL = 30000;
const RECOVERY_KEY = "cms-autosave-pending";

export function useAutosave(
  saveFn: () => Promise<void>,
  dirty: boolean,
  options?: { interval?: number; onRecovery?: () => void }
) {
  const [status, setStatus] = useState<AutosaveStatus>(dirty ? "unsaved" : "saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  const save = useCallback(async () => {
    if (!dirty) return;
    setStatus("saving");
    try {
      await saveFnRef.current();
      setStatus("saved");
      setLastSaved(new Date());
      localStorage.removeItem(RECOVERY_KEY);
      toast.success("Changes auto-saved");
    } catch {
      setStatus("error");
      toast.error("Autosave failed. Your changes are preserved locally.");
    }
  }, [dirty]);

  useEffect(() => {
    setStatus(dirty ? "unsaved" : status === "saving" ? "saving" : "saved");
    if (dirty) {
      localStorage.setItem(RECOVERY_KEY, "true");
    }
  }, [dirty]);

  useEffect(() => {
    intervalRef.current = setInterval(save, options?.interval ?? AUTOSAVE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [save, options?.interval]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    const hasPending = localStorage.getItem(RECOVERY_KEY) === "true";
    if (hasPending && options?.onRecovery) {
      options.onRecovery();
    }
  }, []);

  return { status, lastSaved, saveNow: save };
}
