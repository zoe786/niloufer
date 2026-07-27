// ─────────────────────────────────────────────────────────────────────────────
// Cafe Niloufer Kiosk – TypeScript type definitions
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "chai"
  | "coffee"
  | "coolers"
  | "snacks"
  | "bites"
  | "sandwiches"
  | "bakery"
  | "desserts"
  | "combos";

export type DietaryTag =
  | "veg"
  | "non-veg"
  | "gluten-free"
  | "vegan"
  | "dairy-free"
  | "nuts"
  | "jain";

export type SpiceLevel = "none" | "mild" | "medium" | "high";

export type TasteMood = "sweet" | "spicy" | "savoury" | "light" | "indulgent";

export type Language = "en" | "hi" | "te";

/** Localised string – start English-first; Telugu / Hindi prepared for future expansion. */
export interface LocalisedString {
  en: string;
  hi?: string;
  te?: string;
}

export interface CustomizationChoice {
  label: string;
  priceAdjust: number; // 0 means no extra charge
}

export interface CustomizationOption {
  name: LocalisedString;
  choices: CustomizationChoice[];
}

/** Core menu item model – future-proof for real branch menu swap-in. */
export interface MenuItem {
  id: string;
  name: LocalisedString;
  description: LocalisedString;
  price: number; // in ₹
  category: Category;
  dietary: DietaryTag[];
  spiceLevel: SpiceLevel;
  isBestseller: boolean;
  isNew: boolean;
  isSeasonal: boolean;
  image: string; // path under /images/ or external URL placeholder
  customizationOptions: CustomizationOption[];
  tasteMoods: TasteMood[];
  /** Suggested pairing item IDs shown when this item is in the cart */
  pairings?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart types
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectedCustomization {
  optionName: string;
  choice: string;
  priceAdjust: number;
}

export interface CartItem {
  cartItemId: string; // unique per cart entry (uuid-like)
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  lineTotal: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context / store types
// ─────────────────────────────────────────────────────────────────────────────

export interface ActiveFilters {
  dietary: DietaryTag[];
  moods: TasteMood[];
  budgetFriendly: boolean;
}

export interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: MenuItem, qty: number, customizations: SelectedCustomization[]) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
}
