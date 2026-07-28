"use client";

import type { ActiveFilters, DietaryTag, TasteMood } from "@/types";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface SuggestionPanelProps {
  filters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
}

const DIETARY_OPTIONS: { id: DietaryTag; label: string; emoji: string }[] = [
  { id: "veg", label: "Vegetarian", emoji: "🌿" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
  { id: "jain", label: "Jain", emoji: "🕉️" },
  { id: "nuts", label: "No Nuts", emoji: "🥜" },
];

const MOOD_OPTIONS: { id: TasteMood; label: string; emoji: string }[] = [
  { id: "sweet", label: "Sweet", emoji: "🍬" },
  { id: "spicy", label: "Spicy", emoji: "🌶️" },
  { id: "savoury", label: "Savoury", emoji: "🧂" },
  { id: "light", label: "Light", emoji: "🌸" },
  { id: "indulgent", label: "Indulgent", emoji: "✨" },
];

export default function SuggestionPanel({ filters, onChange }: SuggestionPanelProps) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    filters.dietary.length > 0 ||
    filters.moods.length > 0 ||
    filters.budgetFriendly;

  function toggleDietary(tag: DietaryTag) {
    // "nuts" in dietary means "no nuts" – we filter OUT items with nuts tag
    const next = filters.dietary.includes(tag)
      ? filters.dietary.filter((t) => t !== tag)
      : [...filters.dietary, tag];
    onChange({ ...filters, dietary: next });
  }

  function toggleMood(mood: TasteMood) {
    const next = filters.moods.includes(mood)
      ? filters.moods.filter((m) => m !== mood)
      : [...filters.moods, mood];
    onChange({ ...filters, moods: next });
  }

  function clearAll() {
    onChange({ dietary: [], moods: [], budgetFriendly: false });
  }

  return (
    <div className="border-b border-niloufer-gold/15 bg-niloufer-cream">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 text-left hover:bg-niloufer-gold/5 transition-colors"
        aria-expanded={open}
        aria-controls="filter-panel"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-niloufer-walnut">
          <SlidersHorizontal size={16} aria-hidden="true" />
          Preferences &amp; Filters
          {hasActiveFilters && (
            <span className="bg-niloufer-burgundy text-niloufer-cream text-xs rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-niloufer-walnut" aria-hidden="true" />
        ) : (
          <ChevronDown size={16} className="text-niloufer-walnut" aria-hidden="true" />
        )}
      </button>

      {/* Expandable panel */}
      {open && (
        <div
          id="filter-panel"
          className="px-4 sm:px-6 pb-4 space-y-4"
        >
          {/* Dietary */}
          <fieldset>
            <legend className="text-xs uppercase tracking-widest text-niloufer-walnut/60 mb-2 font-medium">
              Dietary
            </legend>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => {
                const active = filters.dietary.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleDietary(opt.id)}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                      active
                        ? "bg-niloufer-burgundy/10 border-niloufer-burgundy text-niloufer-burgundy font-medium"
                        : "border-niloufer-gold/30 text-niloufer-walnut hover:bg-niloufer-gold/10"
                    }`}
                  >
                    <span aria-hidden="true">{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Mood */}
          <fieldset>
            <legend className="text-xs uppercase tracking-widest text-niloufer-walnut/60 mb-2 font-medium">
              I&apos;m in the mood for
            </legend>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((opt) => {
                const active = filters.moods.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleMood(opt.id)}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                      active
                        ? "bg-niloufer-gold/20 border-niloufer-gold text-niloufer-walnut font-medium"
                        : "border-niloufer-gold/30 text-niloufer-walnut hover:bg-niloufer-gold/10"
                    }`}
                  >
                    <span aria-hidden="true">{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Budget */}
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="budget-toggle"
                className="text-sm font-medium text-niloufer-walnut cursor-pointer"
              >
                💰 Budget-Friendly (under ₹150)
              </label>
              <p className="text-xs text-niloufer-walnut/60">Show only great value picks</p>
            </div>
            <button
              id="budget-toggle"
              role="switch"
              aria-checked={filters.budgetFriendly}
              onClick={() => onChange({ ...filters, budgetFriendly: !filters.budgetFriendly })}
              className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niloufer-burgundy ${
                filters.budgetFriendly ? "bg-niloufer-burgundy" : "bg-niloufer-walnut/25"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  filters.budgetFriendly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-sm text-niloufer-burgundy underline underline-offset-2 hover:text-niloufer-maroon"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
