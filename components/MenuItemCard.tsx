"use client";

import type { Language, MenuItem } from "@/types";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
  language: Language;
  onTap: (item: MenuItem) => void;
}

const SPICE_MAP: Record<string, string> = {
  mild: "🌶️",
  medium: "🌶️🌶️",
  high: "🌶️🌶️🌶️",
};

const DIETARY_ICON: Record<string, string> = {
  veg: "🟢",
  "non-veg": "🔴",
  vegan: "🌱",
  "gluten-free": "🌾",
  jain: "🕉️",
  nuts: "🥜",
  "dairy-free": "🥛",
};

export default function MenuItemCard({ item, language, onTap }: MenuItemCardProps) {
  const name =
    (language !== "en" && item.name[language]) || item.name.en;
  const description =
    (language !== "en" && item.description[language]) || item.description.en;

  const primaryDietary = item.dietary.includes("non-veg") ? "non-veg" : "veg";

  return (
    <motion.button
      onClick={() => onTap(item)}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-niloufer-gold/15 overflow-hidden hover:shadow-md active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niloufer-burgundy"
      whileTap={{ scale: 0.98 }}
      aria-label={`${name} – ₹${item.price}. Tap for details.`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-niloufer-cream/60 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            const parent = el.parentElement;
            if (parent && !parent.querySelector(".img-fallback")) {
              const fb = document.createElement("div");
              fb.className =
                "img-fallback absolute inset-0 flex items-center justify-center text-5xl bg-gradient-to-br from-niloufer-cream to-niloufer-gold/10";
              fb.textContent = categoryEmoji(item.category);
              parent.appendChild(fb);
            }
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isBestseller && (
            <span className="bg-niloufer-burgundy text-niloufer-cream text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              ★ Bestseller
            </span>
          )}
          {item.isNew && (
            <span className="bg-niloufer-gold text-niloufer-charcoal text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              ✦ New
            </span>
          )}
          {item.isSeasonal && (
            <span className="bg-niloufer-lotus/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              🍂 Seasonal
            </span>
          )}
        </div>

        {/* Veg/Non-veg indicator */}
        <div className="absolute top-2 right-2">
          <span
            className="text-lg"
            aria-label={primaryDietary === "veg" ? "Vegetarian" : "Non-vegetarian"}
            title={primaryDietary === "veg" ? "Vegetarian" : "Non-vegetarian"}
          >
            {DIETARY_ICON[primaryDietary]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-1.5">
        <h3 className="font-serif font-bold text-niloufer-charcoal text-base sm:text-lg leading-tight line-clamp-1">
          {name}
        </h3>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-niloufer-walnut/70 line-clamp-2 italic">
          {description}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-niloufer-burgundy font-bold text-base sm:text-lg">
              ₹{item.price}
            </span>
            {item.spiceLevel !== "none" && (
              <span className="text-sm" aria-label={`${item.spiceLevel} spice`}>
                {SPICE_MAP[item.spiceLevel]}
              </span>
            )}
          </div>

          <div
            className="flex items-center justify-center w-9 h-9 bg-niloufer-burgundy text-niloufer-cream rounded-full shadow"
            aria-hidden="true"
          >
            <Plus size={18} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function categoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    chai: "🍵",
    coffee: "☕",
    coolers: "🥤",
    snacks: "🥐",
    bites: "🍪",
    sandwiches: "🥪",
    bakery: "🍞",
    desserts: "🍮",
    combos: "✨",
  };
  return map[cat] ?? "🍽️";
}
