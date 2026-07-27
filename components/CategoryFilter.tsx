"use client";

import { categories } from "@/data/menu";
import type { Category } from "@/types";
import { useRef, useEffect } from "react";

interface CategoryFilterProps {
  active: Category | "all";
  onChange: (cat: Category | "all") => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector(
      `[data-active="true"]`
    ) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [active]);

  return (
    <div className="sticky top-[61px] z-30 bg-niloufer-cream/95 backdrop-blur-sm border-b border-niloufer-gold/20 shadow-sm">
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-hide"
        role="tablist"
        aria-label="Menu categories"
      >
        {/* "All" tab */}
        <CategoryTab
          id="all"
          label="All"
          emoji="🍽️"
          isActive={active === "all"}
          onClick={() => onChange("all")}
        />

        {categories.map((cat) => (
          <CategoryTab
            key={cat.id}
            id={cat.id}
            label={cat.label}
            emoji={cat.emoji}
            isActive={active === cat.id}
            onClick={() => onChange(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryTabProps {
  id: string;
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: () => void;
}

function CategoryTab({ id, label, emoji, isActive, onClick }: CategoryTabProps) {
  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      data-active={isActive}
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
        ${
          isActive
            ? "bg-niloufer-burgundy text-niloufer-cream shadow-sm"
            : "bg-niloufer-cream text-niloufer-walnut border border-niloufer-gold/25 hover:bg-niloufer-gold/10"
        }`}
      aria-label={`Filter by ${label}`}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
    </button>
  );
}
