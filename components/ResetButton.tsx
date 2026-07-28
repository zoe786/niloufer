"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";

interface ResetButtonProps {
  onReset: () => void;
}

export default function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <motion.button
      onClick={onReset}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-niloufer-cream border border-niloufer-gold/40 text-niloufer-walnut px-4 py-2.5 rounded-full shadow-md hover:bg-niloufer-gold/10 active:scale-95 transition-all text-sm font-medium"
      whileTap={{ scale: 0.93 }}
      aria-label="Reset – start fresh for the next customer"
      title="Reset kiosk for next customer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <Home size={16} aria-hidden="true" />
      <span className="hidden sm:inline">Reset / Home</span>
    </motion.button>
  );
}
