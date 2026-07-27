"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/** Decorative steam wisps rising from a cup – used in WelcomeScreen and loading states. */
export default function SteamAnimation({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const wisps = [
    { x: 0, delay: 0 },
    { x: 14, delay: 0.4 },
    { x: -12, delay: 0.8 },
  ];

  return (
    <div className={`relative flex items-end justify-center ${className}`}>
      {/* Cup silhouette */}
      <div className="relative z-10">
        <svg
          viewBox="0 0 80 60"
          width="80"
          height="60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Saucer */}
          <ellipse cx="40" cy="56" rx="32" ry="5" fill="#8B5C2A" opacity="0.35" />
          {/* Cup body */}
          <path
            d="M14 24 Q16 52 40 52 Q64 52 66 24 Z"
            fill="#7C2D12"
          />
          {/* Cup rim */}
          <ellipse cx="40" cy="24" rx="26" ry="6" fill="#9A3412" />
          {/* Chai surface */}
          <ellipse cx="40" cy="24" rx="22" ry="4.5" fill="#92400E" />
          {/* Handle */}
          <path
            d="M66 30 Q80 30 80 40 Q80 50 66 50"
            stroke="#7C2D12"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Gold rim accent */}
          <ellipse cx="40" cy="24" rx="26" ry="6" fill="none" stroke="#D97706" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>

      {/* Steam wisps */}
      {wisps.map((w, i) => (
        <motion.div
          key={i}
          className="absolute bottom-[48px] w-1 rounded-full bg-gradient-to-t from-amber-200/60 to-transparent"
          style={{ left: `calc(50% + ${w.x}px)`, height: 36 }}
          initial={{ opacity: 0, y: 0, scaleX: 1 }}
          animate={{
            opacity: [0, 0.7, 0],
            y: [-4, -28],
            scaleX: [1, 1.6, 0.8],
          }}
          transition={{
            duration: 2.2,
            delay: w.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
