"use client";

import { useCart } from "@/context/CartContext";
import type { Language, MenuItem, SelectedCustomization } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";

interface ItemDetailModalProps {
  item: MenuItem | null;
  language: Language;
  onClose: () => void;
  onAddedToCart?: () => void;
}

const DIETARY_LABEL: Record<string, string> = {
  veg: "🟢 Veg",
  "non-veg": "🔴 Non-Veg",
  vegan: "🌱 Vegan",
  "gluten-free": "🌾 Gluten-Free",
  jain: "🕉️ Jain",
  nuts: "🥜 Contains Nuts",
  "dairy-free": "🥛 Dairy-Free",
};

export default function ItemDetailModal({
  item,
  language,
  onClose,
  onAddedToCart,
}: ItemDetailModalProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [customizations, setCustomizations] = useState<SelectedCustomization[]>([]);
  const [added, setAdded] = useState(false);

  if (!item) return null;

  const name = (language !== "en" && item.name[language]) || item.name.en;
  const description =
    (language !== "en" && item.description[language]) || item.description.en;

  function selectCustomization(optName: string, choice: string, priceAdjust: number) {
    setCustomizations((prev) => {
      const filtered = prev.filter((c) => c.optionName !== optName);
      return [...filtered, { optionName: optName, choice, priceAdjust }];
    });
  }

  function getSelectedChoice(optName: string): string | undefined {
    return customizations.find((c) => c.optionName === optName)?.choice;
  }

  const extraCost = customizations.reduce((s, c) => s + c.priceAdjust, 0);
  const lineTotal = (item.price + extraCost) * qty;

  function handleAdd() {
    if (!item) return;
    addItem(item, qty, customizations);
    setAdded(true);
    setTimeout(() => {
      onAddedToCart?.();
      onClose();
      setAdded(false);
      setQty(1);
      setCustomizations([]);
    }, 700);
  }

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-niloufer-charcoal/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-niloufer-cream rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto w-full sm:max-w-lg shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label={name}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full shadow text-niloufer-charcoal hover:bg-white transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Image */}
              <div className="relative aspect-[16/9] bg-niloufer-cream/60 rounded-t-3xl sm:rounded-t-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-niloufer-charcoal/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif font-bold text-2xl text-niloufer-charcoal leading-tight">
                      {name}
                    </h2>
                    {(item.isBestseller || item.isNew || item.isSeasonal) && (
                      <div className="flex gap-1.5 mt-1">
                        {item.isBestseller && (
                          <span className="text-[11px] bg-niloufer-burgundy text-white px-2 py-0.5 rounded-full">
                            ★ Bestseller
                          </span>
                        )}
                        {item.isNew && (
                          <span className="text-[11px] bg-niloufer-gold text-niloufer-charcoal px-2 py-0.5 rounded-full">
                            ✦ New
                          </span>
                        )}
                        {item.isSeasonal && (
                          <span className="text-[11px] bg-niloufer-lotus/80 text-white px-2 py-0.5 rounded-full">
                            🍂 Seasonal
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-niloufer-burgundy whitespace-nowrap">
                    ₹{item.price}
                  </span>
                </div>

                {/* Description */}
                <p className="text-niloufer-walnut text-sm leading-relaxed italic">
                  {description}
                </p>

                {/* Dietary tags */}
                <div className="flex flex-wrap gap-2">
                  {item.dietary.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-niloufer-gold/15 text-niloufer-walnut px-2.5 py-1 rounded-full border border-niloufer-gold/25"
                    >
                      {DIETARY_LABEL[tag] ?? tag}
                    </span>
                  ))}
                </div>

                {/* Customizations */}
                {item.customizationOptions.length > 0 && (
                  <div className="space-y-3">
                    {item.customizationOptions.map((opt) => {
                      const optName =
                        (language !== "en" && opt.name[language]) || opt.name.en;
                      return (
                        <div key={opt.name.en}>
                          <p className="text-sm font-medium text-niloufer-charcoal mb-2">
                            {optName}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {opt.choices.map((c) => {
                              const selected = getSelectedChoice(opt.name.en) === c.label;
                              return (
                                <button
                                  key={c.label}
                                  onClick={() =>
                                    selectCustomization(opt.name.en, c.label, c.priceAdjust)
                                  }
                                  aria-pressed={selected}
                                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                    selected
                                      ? "bg-niloufer-burgundy text-white border-niloufer-burgundy"
                                      : "border-niloufer-gold/30 text-niloufer-walnut hover:bg-niloufer-gold/10"
                                  }`}
                                >
                                  {c.label}
                                  {c.priceAdjust > 0 && (
                                    <span className="ml-1 text-xs opacity-70">
                                      +₹{c.priceAdjust}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quantity + Add */}
                <div className="flex items-center gap-4 pt-2">
                  {/* Qty stepper */}
                  <div className="flex items-center gap-2 border border-niloufer-gold/30 rounded-full px-2 py-1">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-niloufer-gold/15 transition-colors disabled:opacity-40"
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-bold text-niloufer-charcoal" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-niloufer-gold/15 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Add to order */}
                  <motion.button
                    onClick={handleAdd}
                    disabled={added}
                    className={`flex-1 py-3.5 rounded-full font-semibold text-base shadow transition-all ${
                      added
                        ? "bg-green-600 text-white"
                        : "bg-niloufer-burgundy text-niloufer-cream hover:bg-niloufer-maroon"
                    }`}
                    whileTap={{ scale: 0.97 }}
                    aria-label={`Add ${qty} × ${name} to order for ₹${lineTotal}`}
                  >
                    {added ? "✓ Added!" : `Add to Order — ₹${lineTotal}`}
                  </motion.button>
                </div>

                {/* Combo upsell nudge */}
                {item.pairings && item.pairings.length > 0 && (
                  <p className="text-xs text-niloufer-walnut/60 text-center italic">
                    ✦ Perfect with: open cart to see pairing suggestions
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
