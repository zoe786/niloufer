"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type {
  CartContextValue,
  CartItem,
  MenuItem,
  SelectedCustomization,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function linePrice(item: MenuItem, customizations: SelectedCustomization[]): number {
  const extras = customizations.reduce((sum, c) => sum + c.priceAdjust, 0);
  return item.price + extras;
}

const STORAGE_KEY = "niloufer_cart";

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────

type CartAction =
  | { type: "ADD"; item: MenuItem; qty: number; customizations: SelectedCustomization[] }
  | { type: "REMOVE"; cartItemId: string }
  | { type: "UPDATE_QTY"; cartItemId: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const price = linePrice(action.item, action.customizations);
      const newEntry: CartItem = {
        cartItemId: uid(),
        menuItem: action.item,
        quantity: action.qty,
        selectedCustomizations: action.customizations,
        lineTotal: price * action.qty,
      };
      return [...state, newEntry];
    }
    case "REMOVE":
      return state.filter((ci) => ci.cartItemId !== action.cartItemId);
    case "UPDATE_QTY": {
      if (action.qty <= 0) {
        return state.filter((ci) => ci.cartItemId !== action.cartItemId);
      }
      return state.map((ci) =>
        ci.cartItemId === action.cartItemId
          ? {
              ...ci,
              quantity: action.qty,
              lineTotal: linePrice(ci.menuItem, ci.selectedCustomizations) * action.qty,
            }
          : ci
      );
    }
    case "CLEAR":
      return [];
    case "HYDRATE":
      return action.items;
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw);
        dispatch({ type: "HYDRATE", items: parsed });
      }
    } catch {
      // silently ignore – fresh cart if storage is unavailable
    }
  }, []);

  // Persist to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // silently ignore
    }
  }, [items]);

  const addItem = useCallback(
    (item: MenuItem, qty: number, customizations: SelectedCustomization[]) => {
      dispatch({ type: "ADD", item, qty, customizations });
    },
    []
  );

  const removeItem = useCallback((cartItemId: string) => {
    dispatch({ type: "REMOVE", cartItemId });
  }, []);

  const updateQuantity = useCallback((cartItemId: string, qty: number) => {
    dispatch({ type: "UPDATE_QTY", cartItemId, qty });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const subtotal = items.reduce((sum, ci) => sum + ci.lineTotal, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
