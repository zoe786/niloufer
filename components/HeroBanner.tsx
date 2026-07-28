"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActiveFilters } from "@/types";

interface HeroBannerProps {
  activeFilters: ActiveFilters;
}

function getTimeMessage(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Rise & Shine with Irani Chai & Osmania Biscuit ☀️";
  if (hour < 15) return "Beat the heat with our special coolers 🥤";
  if (hour < 19) return "Unwind with a cutting chai and keema pav 🍵";
  return "Evening warmth – a cup of chai awaits you ✨";
}

function getFilterMessage(filters: ActiveFilters): string | null {
  if (filters.dietary.includes("jain")) return "Showing Jain-friendly delights for you 🌿";
  if (filters.dietary.includes("vegan")) return "Exploring our vegan treasures 🌱";
  if (filters.dietary.includes("gluten-free")) return "Gluten-free goodness, curated for you 💛";
  if (filters.budgetFriendly) return "Great flavours under ₹150 – Value Picks 💰";
  if (filters.moods.length > 0)
    return `Curated for your ${filters.moods[0]} mood today ✦`;
  return null;
}

export default function HeroBanner({ activeFilters }: HeroBannerProps) {
  const [timeMsg, setTimeMsg] = useState("");

  useEffect(() => {
    setTimeMsg(getTimeMessage());
    const interval = setInterval(() => setTimeMsg(getTimeMessage()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const filterMsg = getFilterMessage(activeFilters);
  const displayMsg = filterMsg ?? timeMsg;

  return (
    <div className="relative overflow-hidden bg-niloufer-burgundy/5 border-b border-niloufer-gold/15">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #92400E 0px, #92400E 1px, transparent 1px, transparent 12px)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={displayMsg}
          className="relative z-10 flex items-center justify-center py-3 px-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-niloufer-burgundy text-sm sm:text-base font-medium text-center">
            {displayMsg}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
