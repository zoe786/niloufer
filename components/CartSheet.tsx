"use client";

import { useCart } from "@/context/CartContext";
import { menuItems } from "@/data/menu";
import type { Language, MenuItem } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";

interface CartSheetProps {
  open: boolean;
  language: Language;
  onClose: () => void;
  onCheckout: () => void;
  onItemTap?: (item: MenuItem) => void;
}

export default function CartSheet({
  open,
  language,
  onClose,
  onCheckout,
  onItemTap,
}: CartSheetProps) {
  const { items, subtotal, totalItems, updateQuantity, removeItem } = useCart();

  // Compute pairing suggestions based on cart contents
  const pairingIds = new Set<string>();
  const cartIds = new Set(items.map((ci) => ci.menuItem.id));
  items.forEach((ci) => {
    ci.menuItem.pairings?.forEach((pid) => {
      if (!cartIds.has(pid)) pairingIds.add(pid);
    });
  });
  const pairingSuggestions = Array.from(pairingIds)
    .map((id) => menuItems.find((m) => m.id === id))
    .filter(Boolean) as MenuItem[];

  return (
    <AnimatePresence>
      {open && (
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

          {/* Sheet */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-niloufer-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-niloufer-gold/20">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-niloufer-burgundy" aria-hidden="true" />
                <h2 className="font-serif font-bold text-xl text-niloufer-charcoal">
                  Your Order
                </h2>
                {totalItems > 0 && (
                  <span className="text-xs bg-niloufer-burgundy text-white rounded-full px-2 py-0.5">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-niloufer-gold/10 transition-colors"
                aria-label="Close cart"
              >
                <X size={18} className="text-niloufer-charcoal" />
              </button>
            </div>

            {/* Empty state */}
            {items.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="text-6xl">🍵</span>
                <p className="text-niloufer-walnut font-medium">Your order is empty</p>
                <p className="text-niloufer-walnut/60 text-sm">
                  Explore our menu to start building your perfect Niloufer experience.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 bg-niloufer-burgundy text-white rounded-full text-sm font-medium"
                >
                  Browse Menu
                </button>
              </div>
            )}

            {/* Items list */}
            {items.length > 0 && (
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {items.map((ci) => {
                  const name =
                    (language !== "en" && ci.menuItem.name[language]) ||
                    ci.menuItem.name.en;
                  return (
                    <div
                      key={ci.cartItemId}
                      className="flex gap-3 bg-white rounded-xl p-3 shadow-sm border border-niloufer-gold/10"
                    >
                      {/* Image thumb */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-niloufer-cream flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ci.menuItem.image}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-niloufer-charcoal text-sm line-clamp-1">
                          {name}
                        </p>
                        {ci.selectedCustomizations.length > 0 && (
                          <p className="text-[11px] text-niloufer-walnut/60 line-clamp-1">
                            {ci.selectedCustomizations
                              .map((c) => c.choice)
                              .join(", ")}
                          </p>
                        )}
                        <p className="text-niloufer-burgundy font-bold text-sm mt-0.5">
                          ₹{ci.lineTotal}
                        </p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex flex-col items-end justify-between gap-1">
                        <button
                          onClick={() => removeItem(ci.cartItemId)}
                          className="text-niloufer-walnut/50 hover:text-red-500 p-1 transition-colors"
                          aria-label={`Remove ${name}`}
                        >
                          <X size={14} />
                        </button>
                        <div className="flex items-center gap-1 border border-niloufer-gold/25 rounded-full px-1">
                          <button
                            onClick={() =>
                              updateQuantity(ci.cartItemId, ci.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-niloufer-gold/15"
                            aria-label="Decrease"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-niloufer-charcoal" aria-live="polite">
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(ci.cartItemId, ci.quantity + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-niloufer-gold/15"
                            aria-label="Increase"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pairing suggestions */}
                {pairingSuggestions.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-niloufer-gold/10 border border-niloufer-gold/25">
                    <p className="text-xs font-semibold text-niloufer-walnut mb-2">
                      ✦ Perfect Pair – you might also love:
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {pairingSuggestions.slice(0, 4).map((sug) => {
                        const sugName =
                          (language !== "en" && sug.name[language]) || sug.name.en;
                        return (
                          <button
                            key={sug.id}
                            onClick={() => {
                              onClose();
                              onItemTap?.(sug);
                            }}
                            className="flex-shrink-0 flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 text-xs border border-niloufer-gold/25 hover:bg-niloufer-gold/10 transition-colors"
                          >
                            <span>{sugName}</span>
                            <span className="text-niloufer-burgundy font-bold">
                              ₹{sug.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-niloufer-gold/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-niloufer-walnut font-medium">Subtotal</span>
                  <span className="text-niloufer-charcoal font-bold text-xl">
                    ₹{subtotal}
                  </span>
                </div>
                <p className="text-xs text-niloufer-walnut/50 text-center">
                  Taxes included · Dine-in order
                </p>
                <motion.button
                  onClick={onCheckout}
                  className="w-full py-4 bg-niloufer-burgundy text-white rounded-full font-bold text-lg shadow-lg hover:bg-niloufer-maroon active:scale-95 transition-all"
                  whileTap={{ scale: 0.97 }}
                  aria-label={`Place order for ₹${subtotal}`}
                >
                  Place Order · ₹{subtotal}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
