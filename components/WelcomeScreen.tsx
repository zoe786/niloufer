"use client";

import { motion } from "framer-motion";
import SteamAnimation from "./SteamAnimation";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-niloufer-cream overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
    >
      {/* Warm radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(146,64,14,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Gold corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-niloufer-gold/40 rounded-tl-lg" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-niloufer-gold/40 rounded-tr-lg" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-niloufer-gold/40 rounded-bl-lg" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-niloufer-gold/40 rounded-br-lg" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center max-w-lg">
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Cafe Niloufer"
            className="h-20 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </motion.div>

        {/* Steam */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <SteamAnimation />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-2"
        >
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-niloufer-burgundy leading-tight">
            Cafe Niloufer
          </h1>
          <p className="text-niloufer-walnut text-lg font-medium tracking-wide">
            A legacy of taste since 1978
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="flex items-center gap-3 w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex-1 h-px bg-niloufer-gold/40" />
          <span className="text-niloufer-gold/70 text-xl">✦</span>
          <div className="flex-1 h-px bg-niloufer-gold/40" />
        </motion.div>

        {/* Sub-tagline */}
        <motion.p
          className="text-niloufer-charcoal/70 text-base max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          The Home of Chai that is Truly Hyderabadi.
          <br />
          <span className="italic">Banjara Hills Premium Lounge.</span>
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={onStart}
          className="mt-4 px-12 py-4 bg-niloufer-burgundy text-niloufer-cream rounded-full text-xl font-semibold tracking-wide shadow-lg hover:bg-niloufer-maroon active:scale-95 transition-all duration-200 border border-niloufer-gold/30"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Tap to start ordering"
        >
          Tap to Start
        </motion.button>

        {/* Lotus accent */}
        <motion.p
          className="text-niloufer-lotus/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          🪷 Banjara Hills, Hyderabad
        </motion.p>
      </div>
    </motion.div>
  );
}
