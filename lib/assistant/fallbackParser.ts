/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Cafe Niloufer – Local Fallback Command Parser
 *
 * A deterministic, rules-based assistant that runs entirely on the client/server
 * without any network call to DeepSeek.  It produces the same AssistantResponse
 * shape as the AI-backed route so the UI logic stays unified.
 *
 * Activated when:
 *  - DEEPSEEK_API_KEY env var is missing, or
 *  - The DeepSeek API call times out or errors.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { menuItems } from "@/data/menu";
import type { AssistantItem, AssistantResponse } from "@/types";

// ─── Normalisation helpers ────────────────────────────────────────────────────

/** Lowercase + remove common filler words to improve fuzzy matching. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(
      /\b(please|can you|could you|i want|i'd like|i would like|give me|get me|add|remove|delete|one|two|three|four|five|a|an|the)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns the best matching menu item for a search token, or null. */
function findItem(token: string): (typeof menuItems)[0] | null {
  const normalToken = normalise(token);
  if (!normalToken) return null;

  // 1. Exact match on normalised name
  const exact = menuItems.find(
    (m) => normalise(m.name.en) === normalToken
  );
  if (exact) return exact;

  // 2. Contains match (token inside name or name inside token)
  const contains = menuItems.find(
    (m) =>
      normalise(m.name.en).includes(normalToken) ||
      normalToken.includes(normalise(m.name.en))
  );
  if (contains) return contains;

  // 3. Word-overlap scoring
  const tokenWords = new Set(normalToken.split(" ").filter(Boolean));
  let best: (typeof menuItems)[0] | null = null;
  let bestScore = 0;
  for (const m of menuItems) {
    const nameWords = normalise(m.name.en).split(" ").filter(Boolean);
    const overlap = nameWords.filter((w) => tokenWords.has(w)).length;
    if (overlap > bestScore) {
      bestScore = overlap;
      best = m;
    }
  }
  return bestScore >= 1 ? best : null;
}

/** Parses a number word or digit from a string fragment. */
function parseQty(text: string): number {
  const wordMap: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
    "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
  };
  const lower = text.toLowerCase();
  for (const [word, num] of Object.entries(wordMap)) {
    if (lower.includes(word)) return num;
  }
  const match = text.match(/\b(\d+)\b/);
  if (match) return Math.min(parseInt(match[1], 10), 20);
  return 1;
}

// ─── Upsell prompts ───────────────────────────────────────────────────────────

const UPSELL_PROMPTS = [
  "Would you like to pair that with an Osmania Biscuit? They are a Niloufer classic.",
  "Our Bun Maska is fresh out of the oven – shall I add one?",
  "A slice of Niloufer's famous Plum Cake would go wonderfully with that!",
  "Can I suggest a refreshing Lemon Soda to go with your order?",
];

function randomUpsell(): string {
  return UPSELL_PROMPTS[Math.floor(Math.random() * UPSELL_PROMPTS.length)];
}

// ─── Intent patterns ──────────────────────────────────────────────────────────

const REMOVE_PATTERNS = /\b(remove|delete|cancel|take off|drop|no more|don't want)\b/i;
const CHECKOUT_PATTERNS = /\b(checkout|check out|pay|done|finish|place order|that('?s| is) all|confirm)\b/i;
const CLEAR_PATTERNS = /\b(clear|empty|start over|reset|cancel (all|everything|order))\b/i;
const RECOMMEND_PATTERNS = /\b(recommend|suggest|what(('?s| is) good| should i| do you have)|best|popular|favourite|special)\b/i;
const QTY_UPDATE_PATTERNS = /\b(change|update|make (it|that)|set)\b.*\b(\d+|one|two|three|four|five)\b/i;

// ─── Main parser ──────────────────────────────────────────────────────────────

/**
 * Parses a natural-language transcript into a structured AssistantResponse.
 * This is the fallback used when DeepSeek is unavailable.
 */
export function parseFallback(transcript: string): AssistantResponse {
  const lower = transcript.toLowerCase().trim();

  // ── Checkout intent ──
  if (CHECKOUT_PATTERNS.test(lower)) {
    return {
      reply: "Of course! Heading to checkout. Please review your order.",
      intent: "checkout",
      items: [],
      fallbackUsed: true,
    };
  }

  // ── Clear cart ──
  if (CLEAR_PATTERNS.test(lower)) {
    return {
      reply: "No problem at all – I've cleared your order. Let's start fresh!",
      intent: "clear_cart",
      items: [],
      fallbackUsed: true,
    };
  }

  // ── Remove item ──
  if (REMOVE_PATTERNS.test(lower)) {
    // Strip remove-intent words and try to find the item
    const stripped = lower
      .replace(REMOVE_PATTERNS, " ")
      .replace(/\s+/g, " ")
      .trim();
    const match = findItem(stripped);
    if (match) {
      return {
        reply: `Done – I've removed the ${match.name.en} from your order.`,
        intent: "remove_item",
        items: [{ id: match.id, name: match.name.en, quantity: 1 }],
        fallbackUsed: true,
      };
    }
    return {
      reply: "I didn't catch which item you'd like to remove. Could you say the name again?",
      intent: "remove_item",
      items: [],
      fallbackUsed: true,
    };
  }

  // ── Recommendations ──
  if (RECOMMEND_PATTERNS.test(lower)) {
    const bestsellers = menuItems.filter((m) => m.isBestseller).slice(0, 3);
    const names = bestsellers.map((m) => m.name.en).join(", ");
    return {
      reply: `Our most loved choices right now are ${names}. Shall I add any of those?`,
      intent: "ask_recommendation",
      items: bestsellers.map((m) => ({ id: m.id, name: m.name.en, quantity: 1 })),
      fallbackUsed: true,
    };
  }

  // ── Quantity update ──
  if (QTY_UPDATE_PATTERNS.test(lower)) {
    const qty = parseQty(lower);
    const stripped = lower
      .replace(/\b(change|update|make (it|that)|set)\b/gi, " ")
      .replace(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, " ")
      .trim();
    const match = findItem(stripped);
    if (match) {
      return {
        reply: `Got it – updating ${match.name.en} to ${qty}.`,
        intent: "update_quantity",
        items: [{ id: match.id, name: match.name.en, quantity: qty }],
        fallbackUsed: true,
      };
    }
  }

  // ── Add item (default intent) ──
  const qty = parseQty(lower);
  const match = findItem(lower);
  if (match) {
    const items: AssistantItem[] = [{ id: match.id, name: match.name.en, quantity: qty }];
    const upsell = randomUpsell();
    return {
      reply: `Lovely choice! Adding ${qty > 1 ? `${qty} × ` : ""}${match.name.en} to your order. ${upsell}`,
      intent: "add_item",
      items,
      fallbackUsed: true,
    };
  }

  // ── Unknown ──
  return {
    reply:
      "I didn't quite catch that \u2013 could you try saying the item name? For example, 'Irani Chai' or 'Bun Maska'.",
    intent: "unknown",
    items: [],
    fallbackUsed: true,
  };
}
