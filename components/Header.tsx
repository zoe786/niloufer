"use client";

import { useCart } from "@/context/CartContext";
import type { Language } from "@/types";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  language: Language;
  setLanguage: (l: Language) => void;
  onCartOpen: () => void;
  onLogoClick: () => void;
  logoTapCount: number;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हि" },
  { code: "te", label: "తె" },
];

export default function Header({
  language,
  setLanguage,
  onCartOpen,
  onLogoClick,
  logoTapCount,
}: HeaderProps) {
  const { totalItems } = useCart();
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-niloufer-cream/95 backdrop-blur-sm border-b border-niloufer-gold/20 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 group select-none focus-visible:outline-none"
          aria-label={`Cafe Niloufer logo – tap ${5 - logoTapCount} more times to reveal a secret`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt=""
            aria-hidden="true"
            className="h-10 w-auto transition-transform group-active:scale-95"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="hidden sm:block">
            <p className="text-niloufer-burgundy font-serif font-bold text-lg leading-tight">
              Cafe Niloufer
            </p>
            <p className="text-niloufer-walnut/70 text-xs tracking-wide">
              A legacy of taste since 1978
            </p>
          </div>
          {logoTapCount > 0 && logoTapCount < 5 && (
            <span className="text-[10px] text-niloufer-lotus/60 ml-1">
              ✦ {logoTapCount}/5
            </span>
          )}
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language toggle */}
          <div
            className="flex rounded-full border border-niloufer-gold/30 overflow-hidden"
            role="group"
            aria-label="Language selector"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  language === lang.code
                    ? "bg-niloufer-burgundy text-niloufer-cream"
                    : "text-niloufer-walnut hover:bg-niloufer-gold/10"
                }`}
                aria-pressed={language === lang.code}
                aria-label={`Switch to ${lang.code === "en" ? "English" : lang.code === "hi" ? "Hindi" : "Telugu"}`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className="p-2 rounded-full border border-niloufer-gold/30 text-niloufer-walnut hover:bg-niloufer-gold/10 transition-colors text-sm"
            aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
            title={soundEnabled ? "Sound: On" : "Sound: Off"}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>

          {/* Cart button */}
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-2 bg-niloufer-burgundy text-niloufer-cream px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-niloufer-maroon active:scale-95 transition-all"
            aria-label={`Open cart – ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          >
            <ShoppingCart size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-niloufer-gold text-niloufer-charcoal text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                aria-hidden="true"
              >
                {totalItems}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
