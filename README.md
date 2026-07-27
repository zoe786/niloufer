# Cafe Niloufer – Smart Kiosk & Table Ordering App

> **A legacy of taste since 1978** · Banjara Hills Premium Lounge · Hyderabad

A production-ready **Next.js 14+ App Router** kiosk and smart-table ordering application for Cafe Niloufer, Banjara Hills, Hyderabad. Built with TypeScript, Tailwind CSS, and Framer Motion.

---

## ⚠️ Menu Data Notice

The menu dataset in `data/menu.ts` is **seeded demo data** — it is inspired by well-known Niloufer items and representative pricing, but it is **not the verified live menu** of the Banjara Hills branch. Before deploying to production, replace it with the actual current menu verified from the branch.

---

## 🎙️ Voice Assistant

The kiosk includes a **DeepSeek-backed voice ordering assistant** with graceful local fallback.

### How it works

1. Tap the **mic button** (bottom-right of the kiosk screen after the welcome screen).
2. Speak your order naturally — e.g. *"Add two Irani Chai"* or *"What do you recommend?"*.
3. The assistant parses your intent and adds items to your cart automatically.
4. Type in the text box below the mic if speech recognition isn't available.

### Architecture

```
Browser mic → SpeechRecognition API
         ↓
    POST /api/assistant   ← secure server-side route (never exposes API key)
         ↓
   DeepSeek Chat API  ──(if DEEPSEEK_API_KEY is set + reachable)──→ structured JSON
         ↓ (fallback if unavailable)
   Local command parser   ← deterministic, always works offline
         ↓
   AssistantResponse { reply, intent, items, fallbackUsed }
         ↓
   Cart actions + SpeechSynthesis read-aloud
```

Both the AI-backed route and the local parser return the same `AssistantResponse` shape, so the UI logic is unified regardless of which backend handled the request.

### DeepSeek Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Get a DeepSeek API key from [platform.deepseek.com](https://platform.deepseek.com/).
3. Set the key in `.env.local`:
   ```env
   DEEPSEEK_API_KEY=sk-...your-key-here...
   ```
4. Restart the dev server.

If `DEEPSEEK_API_KEY` is not set, the app silently uses the local fallback — **no configuration is required for the kiosk to work out of the box**.

### Fallback Mode

The local assistant handles:
- Adding items by natural phrase matching (fuzzy name matching)
- Removing items by name
- Updating quantities
- Checkout / confirm
- Clear cart
- Basic recommendations (bestsellers)
- Upsell prompts

When the local fallback is active, a subtle `local` pill appears in the assistant panel header. The experience degrades gracefully — it never feels broken.

---

## 🚀 Deployment Modes

### Mode 1 – Static / Local (no AI backend)

Best for kiosk devices with no internet or a local Next.js server.

- Voice ordering uses the **local fallback parser only**.
- No API key required.
- Supports static export (see below).

```bash
# Static export: uncomment output: "export" in next.config.mjs first
npm run build
npx serve out
```

> **Note:** Static export disables `/api/assistant`. The `VoiceAssistantPanel` automatically falls back to the client-side local parser when the API route is unreachable.

### Mode 2 – Server-backed (DeepSeek AI assistant)

Requires a Node.js server environment (e.g. Vercel, Railway, a local Node server).

- Set `DEEPSEEK_API_KEY` in your deployment environment.
- Do **not** enable `output: "export"` in `next.config.mjs`.
- Voice ordering uses **DeepSeek** for natural language understanding.
- Falls back to local parser on timeout or error.

```bash
npm run build
npm run start
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Static Export (Kiosk Mode)

For fully static deployment (no Node.js server required):

1. Edit `next.config.mjs` and uncomment `output: "export"`
2. Run the build:

```bash
npm run build
# Output goes to the `out/` directory
```

3. Serve the `out/` folder with any static file server:

```bash
npx serve out
```

---

## 🖥️ Kiosk Deployment

### Fullscreen Browser (Chromium / Kiosk Mode)

```bash
# Linux / Raspberry Pi
chromium-browser --kiosk --no-sandbox --disable-infobars http://localhost:3000

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --app=http://localhost:3000 \
  --fullscreen \
  --no-default-browser-check
```

### Electron Wrapper (recommended for production)

Wrap the Next.js app in an Electron shell for full OS-level kiosk control:

```js
// main.js (minimal Electron kiosk setup)
const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    fullscreen: true,
    kiosk: true,           // OS-level kiosk mode
    autoHideMenuBar: true,
  });
  win.loadURL('http://localhost:3000');
  win.setAlwaysOnTop(true);
});
```

### Orientation Lock

For portrait-oriented kiosks (1080×1920), add to `app/layout.tsx`'s `<head>`:
```html
<meta name="screen-orientation" content="portrait" />
```

For landscape smart tables, use `content="landscape"` or omit entirely.

CSS fallback (add to `globals.css`):
```css
@media (orientation: landscape) and (max-height: 600px) {
  body { transform: rotate(90deg); transform-origin: top left; }
}
```

---

## Project Structure

```
niloufer/
├── app/
│   ├── api/
│   │   └── assistant/
│   │       └── route.ts        # Secure DeepSeek proxy (POST /api/assistant)
│   ├── layout.tsx              # Root layout, CartProvider, metadata
│   ├── page.tsx                # Main kiosk page (all state lives here)
│   └── globals.css             # Global styles & Tailwind base
├── components/
│   ├── VoiceAssistantPanel.tsx # 🎤 Voice/text assistant UI
│   ├── WelcomeScreen.tsx       # Full-page branded welcome with steam animation
│   ├── Header.tsx              # Sticky header, logo, language toggle, cart button
│   ├── HeroBanner.tsx          # Time/filter-reactive banner message
│   ├── CategoryFilter.tsx      # Sticky horizontal category tab bar
│   ├── SuggestionPanel.tsx     # Dietary, mood, budget filters
│   ├── MenuItemCard.tsx        # Touch-friendly item card
│   ├── ItemDetailModal.tsx     # Item detail with customisation & add to cart
│   ├── CartSheet.tsx           # Slide-over cart panel with pairing suggestions
│   ├── CheckoutModal.tsx       # Order review → confirmation with order number
│   ├── FeedbackToast.tsx       # Animated toast notifications
│   ├── ResetButton.tsx         # Floating reset/home button
│   ├── SteamAnimation.tsx      # Chai steam Framer Motion animation
│   └── SecretMenuModal.tsx     # Easter egg secret menu reveal
├── context/
│   └── CartContext.tsx         # Cart state, sessionStorage persistence
├── data/
│   └── menu.ts                 # ⚠️ Seeded demo menu (40+ items, 9 categories)
├── lib/
│   └── assistant/
│       ├── promptBuilder.ts    # Menu-aware DeepSeek system prompt
│       └── fallbackParser.ts   # Local deterministic command parser
├── types/
│   └── index.ts                # All TypeScript types (incl. AssistantResponse)
├── public/
│   ├── logo.svg                # Cafe Niloufer SVG logo
│   └── images/                 # Food image placeholders (add real photos here)
├── tailwind.config.ts          # Niloufer brand palette
├── next.config.mjs             # Static export configuration
├── .env.example                # Environment variable template
└── README.md
```

---

## Brand Palette

| Token | Hex | Usage |
|---|---|---|
| `niloufer-burgundy` | `#7C1D33` | Primary anchor, buttons, headings |
| `niloufer-maroon` | `#6B1028` | Hover state |
| `niloufer-cream` | `#FDF6EC` | Main background, surfaces |
| `niloufer-ivory` | `#F9EED8` | Card backgrounds |
| `niloufer-walnut` | `#6B3A2A` | Body text, secondary |
| `niloufer-chai` | `#92400E` | Warm accents |
| `niloufer-gold` | `#B8860B` | Highlights, dividers |
| `niloufer-brass` | `#C8973A` | Subtle accents |
| `niloufer-charcoal` | `#2D2017` | Strong text |
| `niloufer-lotus` | `#4A6FA5` | Sparingly: lotus blue accent |

---

## Features

- **🎤 Voice ordering assistant** – DeepSeek-backed with local fallback, tap-to-talk, typed input fallback
- **Welcome screen** with steam animation and branded full-page introduction
- **9 menu categories** – Chai, Coffee, Coolers, Snacks, Bites, Sandwiches, Bakery, Desserts, Combos
- **40+ seeded items** including all iconic Niloufer items
- **Smart filters** – dietary (Veg, Vegan, Gluten-Free, Jain, No Nuts), mood (Sweet/Spicy/Savoury/Light/Indulgent), budget (under ₹150)
- **Time-aware hero banner** – different messages for morning, afternoon, evening
- **Item detail modal** – full description, dietary tags, customisation options, add to order
- **Pairing suggestions** in cart (e.g. chai → Osmania Biscuit)
- **Cart slide-over panel** with quantity controls and subtotal
- **Checkout flow** with animated confirmation, order number, and barcode placeholder
- **Session-persisted cart** (cleared on reset)
- **Language toggle** – English / Hindi / Telugu (English-first; other languages partially seeded, structured for full expansion)
- **Secret menu easter egg** – tap logo 5× to reveal Kunafa
- **Sound toggle** (UI ready; audio hook available for future audio assets)
- **Reset/Home** floating button for next-customer fresh start
- **Accessible** – ARIA roles, labels, keyboard navigation, high contrast
- **Static-export ready** for kiosk / Electron deployment (without AI backend)

---

## Customisation

### Replacing Menu Data

Edit `data/menu.ts`. The `MenuItem` type in `types/index.ts` documents all available fields. Ensure each item has at minimum: `id`, `name.en`, `description.en`, `price`, `category`, `dietary`, `spiceLevel`.

### Adding Real Food Photos

Place images in `public/images/` and update the `image` field in `data/menu.ts`. Recommended size: `800×600 px`, WebP format for optimal kiosk performance.

### Adding Translations

Each `MenuItem` has `name: { en, hi?, te? }` and `description: { en, hi?, te? }`. Add translated strings to each item to complete the language toggle experience.

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| Next.js | 14 | App Router, SSG/SSR, API routes |
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 12 | Animations |
| Lucide React | latest | Icons |
| DeepSeek API | — | AI-powered voice assistant (optional) |
| Web Speech API | browser-native | Speech recognition & synthesis |

---

## Footer

*Crafted with love at Banjara Hills – Since 1978*

---

> This application is an internal ordering tool. Menu data is seeded demo content; always verify with Cafe Niloufer before production use.


### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Static Export (Kiosk Mode)

For fully static deployment (no Node.js server required):

1. Edit `next.config.mjs` and uncomment `output: "export"`
2. Run the build:

```bash
npm run build
# Output goes to the `out/` directory
```

3. Serve the `out/` folder with any static file server:

```bash
npx serve out
```

---

## 🖥️ Kiosk Deployment

### Fullscreen Browser (Chromium / Kiosk Mode)

```bash
# Linux / Raspberry Pi
chromium-browser --kiosk --no-sandbox --disable-infobars http://localhost:3000

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --app=http://localhost:3000 \
  --fullscreen \
  --no-default-browser-check
```

### Electron Wrapper (recommended for production)

Wrap the Next.js app in an Electron shell for full OS-level kiosk control:

```js
// main.js (minimal Electron kiosk setup)
const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    fullscreen: true,
    kiosk: true,           // OS-level kiosk mode
    autoHideMenuBar: true,
  });
  win.loadURL('http://localhost:3000');
  win.setAlwaysOnTop(true);
});
```

### Orientation Lock

For portrait-oriented kiosks (1080×1920), add to `app/layout.tsx`'s `<head>`:
```html
<meta name="screen-orientation" content="portrait" />
```

For landscape smart tables, use `content="landscape"` or omit entirely.

CSS fallback (add to `globals.css`):
```css
@media (orientation: landscape) and (max-height: 600px) {
  body { transform: rotate(90deg); transform-origin: top left; }
}
```

---

## Project Structure

```
niloufer/
├── app/
│   ├── layout.tsx          # Root layout, CartProvider, metadata
│   ├── page.tsx            # Main kiosk page (all state lives here)
│   └── globals.css         # Global styles & Tailwind base
├── components/
│   ├── WelcomeScreen.tsx   # Full-page branded welcome with steam animation
│   ├── Header.tsx          # Sticky header, logo, language toggle, cart button
│   ├── HeroBanner.tsx      # Time/filter-reactive banner message
│   ├── CategoryFilter.tsx  # Sticky horizontal category tab bar
│   ├── SuggestionPanel.tsx # Dietary, mood, budget filters
│   ├── MenuItemCard.tsx    # Touch-friendly item card
│   ├── ItemDetailModal.tsx # Item detail with customisation & add to cart
│   ├── CartSheet.tsx       # Slide-over cart panel with pairing suggestions
│   ├── CheckoutModal.tsx   # Order review → confirmation with order number
│   ├── FeedbackToast.tsx   # Animated toast notifications
│   ├── ResetButton.tsx     # Floating reset/home button
│   ├── SteamAnimation.tsx  # Chai steam Framer Motion animation
│   └── SecretMenuModal.tsx # Easter egg secret menu reveal
├── context/
│   └── CartContext.tsx     # Cart state, sessionStorage persistence
├── data/
│   └── menu.ts             # ⚠️ Seeded demo menu (40+ items, 9 categories)
├── types/
│   └── index.ts            # All TypeScript types
├── public/
│   ├── logo.svg            # Cafe Niloufer SVG logo
│   └── images/             # Food image placeholders (add real photos here)
├── tailwind.config.ts      # Niloufer brand palette
├── next.config.mjs         # Static export configuration
└── README.md
```

---

## Brand Palette

| Token | Hex | Usage |
|---|---|---|
| `niloufer-burgundy` | `#7C1D33` | Primary anchor, buttons, headings |
| `niloufer-maroon` | `#6B1028` | Hover state |
| `niloufer-cream` | `#FDF6EC` | Main background, surfaces |
| `niloufer-ivory` | `#F9EED8` | Card backgrounds |
| `niloufer-walnut` | `#6B3A2A` | Body text, secondary |
| `niloufer-chai` | `#92400E` | Warm accents |
| `niloufer-gold` | `#B8860B` | Highlights, dividers |
| `niloufer-brass` | `#C8973A` | Subtle accents |
| `niloufer-charcoal` | `#2D2017` | Strong text |
| `niloufer-lotus` | `#4A6FA5` | Sparingly: lotus blue accent |

---

## Features

- **Welcome screen** with steam animation and branded full-page introduction
- **9 menu categories** – Chai, Coffee, Coolers, Snacks, Bites, Sandwiches, Bakery, Desserts, Combos
- **40+ seeded items** including all iconic Niloufer items
- **Smart filters** – dietary (Veg, Vegan, Gluten-Free, Jain, No Nuts), mood (Sweet/Spicy/Savoury/Light/Indulgent), budget (under ₹150)
- **Time-aware hero banner** – different messages for morning, afternoon, evening
- **Item detail modal** – full description, dietary tags, customisation options, add to order
- **Pairing suggestions** in cart (e.g. chai → Osmania Biscuit)
- **Cart slide-over panel** with quantity controls and subtotal
- **Checkout flow** with animated confirmation, order number, and barcode placeholder
- **Session-persisted cart** (cleared on reset)
- **Language toggle** – English / Hindi / Telugu (English-first; other languages partially seeded, structured for full expansion)
- **Secret menu easter egg** – tap logo 5× to reveal Kunafa
- **Sound toggle** (UI ready; audio hook available for future audio assets)
- **Reset/Home** floating button for next-customer fresh start
- **Accessible** – ARIA roles, labels, keyboard navigation, high contrast
- **Static-export ready** for kiosk / Electron deployment

---

## Customisation

### Replacing Menu Data

Edit `data/menu.ts`. The `MenuItem` type in `types/index.ts` documents all available fields. Ensure each item has at minimum: `id`, `name.en`, `description.en`, `price`, `category`, `dietary`, `spiceLevel`.

### Adding Real Food Photos

Place images in `public/images/` and update the `image` field in `data/menu.ts`. Recommended size: `800×600 px`, WebP format for optimal kiosk performance.

### Adding Translations

Each `MenuItem` has `name: { en, hi?, te? }` and `description: { en, hi?, te? }`. Add translated strings to each item to complete the language toggle experience.

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| Next.js | 14 | App Router, SSG/SSR |
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 12 | Animations |
| Lucide React | latest | Icons |

---

## Footer

*Crafted with love at Banjara Hills – Since 1978*

---

> This application is an internal ordering tool. Menu data is seeded demo content; always verify with Cafe Niloufer before production use.
