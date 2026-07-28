"use client";

import CartSheet from "@/components/CartSheet";
import CategoryFilter from "@/components/CategoryFilter";
import CheckoutModal from "@/components/CheckoutModal";
import FeedbackToast, { type Toast } from "@/components/FeedbackToast";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import ItemDetailModal from "@/components/ItemDetailModal";
import MenuItemCard from "@/components/MenuItemCard";
import ResetButton from "@/components/ResetButton";
import SecretMenuModal from "@/components/SecretMenuModal";
import SuggestionPanel from "@/components/SuggestionPanel";
import VoiceAssistantPanel from "@/components/VoiceAssistantPanel";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useCart } from "@/context/CartContext";
import { menuItems, secretMenuItem } from "@/data/menu";
import type { ActiveFilters, Category, Language, MenuItem } from "@/types";
import { AnimatePresence } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function KioskPage() {
  const [started, setStarted] = useState(false);
  const [category, setCategory] = useState<Category | "all">("all");
  const [language, setLanguage] = useState<Language>("en");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filters, setFilters] = useState<ActiveFilters>({
    dietary: [],
    moods: [],
    budgetFriendly: false,
  });
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [secretOpen, setSecretOpen] = useState(false);
  const logoTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { addItem, clearCart, removeItem, items: cartItems } = useCart();

  function handleLogoClick() {
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    setLogoTapCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setSecretOpen(true);
        return 0;
      }
      logoTapTimer.current = setTimeout(() => setLogoTapCount(0), 3000);
      return next;
    });
  }

  const pushToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = uid();
    setToasts((ts) => [...ts, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (category !== "all") {
      items = items.filter((m) => m.category === category);
    }
    filters.dietary.forEach((tag) => {
      if (tag === "nuts") {
        items = items.filter((m) => !m.dietary.includes("nuts"));
      } else {
        items = items.filter((m) => m.dietary.includes(tag));
      }
    });
    if (filters.budgetFriendly) {
      items = items.filter((m) => m.price < 150);
    }
    if (filters.moods.length > 0) {
      items = items.filter((m) =>
        filters.moods.some((mood) => m.tasteMoods.includes(mood))
      );
    }
    return items;
  }, [category, filters]);

  const groupedItems = useMemo(() => {
    if (category !== "all") return null;
    const map = new Map<Category, MenuItem[]>();
    filteredItems.forEach((item) => {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    });
    return map;
  }, [category, filteredItems]);

  function handleReset() {
    clearCart();
    setStarted(false);
    setCategory("all");
    setSelectedItem(null);
    setCartOpen(false);
    setCheckoutOpen(false);
    setFilters({ dietary: [], moods: [], budgetFriendly: false });
    setLogoTapCount(0);
  }

  // ── Voice assistant handlers ────────────────────────────────────────────────

  const handleVoiceAddItem = useCallback(
    (item: MenuItem, qty: number) => {
      addItem(item, qty, []);
      const name = (language !== "en" && item.name[language]) || item.name.en;
      pushToast(`${qty > 1 ? `${qty} × ` : ""}${name} added via voice 🎤`);
    },
    [addItem, language, pushToast]
  );

  const handleVoiceRemoveByName = useCallback(
    (name: string) => {
      const lower = name.toLowerCase();
      const cartItem = cartItems.find((ci) =>
        ci.menuItem.name.en.toLowerCase().includes(lower)
      );
      if (cartItem) {
        removeItem(cartItem.cartItemId);
        pushToast(`${cartItem.menuItem.name.en} removed ✓`);
      }
    },
    [cartItems, removeItem, pushToast]
  );

  const handleVoiceCheckout = useCallback(() => {
    setCartOpen(false);
    setCheckoutOpen(true);
  }, []);

  function handleSecretAdd(item: typeof secretMenuItem) {
    addItem(item, 1, []);
    pushToast(`${item.name.en} added to order 🪷`);
  }

  function handleAddedToCart() {
    if (selectedItem) {
      const name =
        (language !== "en" && selectedItem.name[language]) || selectedItem.name.en;
      pushToast(`${name} added to your order ✓`);
    }
  }

  const categoryLabelMap: Record<string, string> = {
    chai: "Chai 🍵",
    coffee: "Coffee ☕",
    coolers: "Coolers 🥤",
    snacks: "Snacks 🥐",
    bites: "Bites 🍪",
    sandwiches: "Sandwiches 🥪",
    bakery: "Bakery 🍞",
    desserts: "Desserts 🍮",
    combos: "Combos ✨",
  };

  return (
    <div className="min-h-screen bg-niloufer-cream">
      <AnimatePresence>
        {!started && (
          <WelcomeScreen onStart={() => setStarted(true)} />
        )}
      </AnimatePresence>

      {started && (
        <>
          <Header
            language={language}
            setLanguage={setLanguage}
            onCartOpen={() => setCartOpen(true)}
            onLogoClick={handleLogoClick}
            logoTapCount={logoTapCount}
          />
          <HeroBanner activeFilters={filters} />
          <SuggestionPanel filters={filters} onChange={setFilters} />
          <CategoryFilter active={category} onChange={setCategory} />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24" id="menu-grid">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <span className="text-5xl">🔍</span>
                <p className="text-niloufer-walnut font-medium text-lg">
                  No items match your current filters
                </p>
                <button
                  onClick={() =>
                    setFilters({ dietary: [], moods: [], budgetFriendly: false })
                  }
                  className="px-6 py-2.5 bg-niloufer-burgundy text-white rounded-full text-sm font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : category !== "all" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    language={language}
                    onTap={setSelectedItem}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                {Array.from(groupedItems ?? []).map(([cat, catItems]) => (
                  <section key={cat} aria-labelledby={`section-${cat}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2
                        id={`section-${cat}`}
                        className="font-serif font-bold text-xl text-niloufer-charcoal"
                      >
                        {categoryLabelMap[cat] ?? cat}
                      </h2>
                      <div className="flex-1 h-px bg-niloufer-gold/20" />
                      <button
                        onClick={() => setCategory(cat)}
                        className="text-xs text-niloufer-burgundy hover:underline underline-offset-2"
                        aria-label={`See all ${cat}`}
                      >
                        See all →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {catItems.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          language={language}
                          onTap={setSelectedItem}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </main>

          <footer className="text-center py-6 text-xs text-niloufer-walnut/50 border-t border-niloufer-gold/15 px-4">
            <p>Crafted with love at Banjara Hills – Since 1978</p>
            <p className="mt-1 text-[10px] opacity-60">
              ⚠️ Menu shown is seeded demo data. Replace with verified branch menu before production launch.
            </p>
          </footer>

          <ItemDetailModal
            item={selectedItem}
            language={language}
            onClose={() => setSelectedItem(null)}
            onAddedToCart={handleAddedToCart}
          />

          <CartSheet
            open={cartOpen}
            language={language}
            onClose={() => setCartOpen(false)}
            onCheckout={() => {
              setCartOpen(false);
              setCheckoutOpen(true);
            }}
            onItemTap={setSelectedItem}
          />

          <CheckoutModal
            open={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            onReset={handleReset}
          />

          <SecretMenuModal
            open={secretOpen}
            onClose={() => setSecretOpen(false)}
            onAdd={handleSecretAdd}
          />

          <ResetButton onReset={handleReset} />
          <FeedbackToast toasts={toasts} onDismiss={dismissToast} />
          <VoiceAssistantPanel
            language={language}
            onAddItem={handleVoiceAddItem}
            onRemoveItemByName={handleVoiceRemoveByName}
            onCheckout={handleVoiceCheckout}
            onClearCart={clearCart}
          />
        </>
      )}
    </div>
  );
}
