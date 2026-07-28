"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "info" | "error";
}

interface FeedbackToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function FeedbackToast({ toasts, onDismiss }: FeedbackToastProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 items-center pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 2800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const colours = {
    success: "bg-green-600",
    info: "bg-niloufer-walnut",
    error: "bg-red-600",
  };
  const bg = colours[toast.type ?? "success"];

  return (
    <motion.div
      role="status"
      className={`${bg} text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg pointer-events-auto`}
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ duration: 0.25 }}
    >
      {toast.message}
    </motion.div>
  );
}
