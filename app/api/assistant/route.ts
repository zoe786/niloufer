/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Cafe Niloufer – AI Assistant API Route
 * POST /api/assistant
 *
 * Secure server-side proxy to the DeepSeek Chat API.
 * The API key NEVER leaves the server; the browser only calls this endpoint.
 *
 * Request body:
 *   { transcript: string; language?: "en" | "hi" | "te" }
 *
 * Response: AssistantResponse (see types/index.ts)
 *
 * Fallback behaviour:
 *   - If DEEPSEEK_API_KEY is not set → local fallback parser
 *   - If DeepSeek returns an error or times out → local fallback parser
 *   - fallbackUsed: true is set in both cases
 *
 * ⚠️  IMPORTANT: The menu injected into the prompt is SEEDED DEMO DATA.
 *     Replace data/menu.ts with the verified production menu before launch.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { parseFallback } from "@/lib/assistant/fallbackParser";
import { buildSystemPrompt } from "@/lib/assistant/promptBuilder";
import type { AssistantResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// ── Config ────────────────────────────────────────────────────────────────────

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ?? "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
/** Hard timeout in ms – prevents a slow upstream from hanging the kiosk. */
const REQUEST_TIMEOUT_MS = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 8000);
const MAX_TRANSCRIPT_CHARS = 500;

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Basic validation ──────────────────────────────────────────────────────
  let transcript: string;
  try {
    const body = await req.json();
    if (typeof body?.transcript !== "string" || !body.transcript.trim()) {
      return NextResponse.json(
        { error: "transcript is required" } satisfies Partial<AssistantResponse>,
        { status: 400 }
      );
    }
    // Truncate to avoid prompt injection via very long transcripts
    transcript = body.transcript.trim().slice(0, MAX_TRANSCRIPT_CHARS);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" } satisfies Partial<AssistantResponse>,
      { status: 400 }
    );
  }

  // ── Fallback: no API key configured ──────────────────────────────────────
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    const fallback = parseFallback(transcript);
    return NextResponse.json(fallback);
  }

  // ── Call DeepSeek ─────────────────────────────────────────────────────────
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const authHeader = "Bearer " + apiKey;

    const deepseekRes = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: transcript },
        ],
        temperature: 0.4,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!deepseekRes.ok) {
      // DeepSeek returned an HTTP error – fall back gracefully
      const errorText = await deepseekRes.text().catch(() => "unknown error");
      console.error("[assistant] DeepSeek HTTP error:", deepseekRes.status, errorText);
      const fallback = parseFallback(transcript);
      fallback.error = "upstream_error:" + deepseekRes.status;
      return NextResponse.json(fallback);
    }

    const data = await deepseekRes.json();
    const rawContent: string = data?.choices?.[0]?.message?.content ?? "";

    // Parse the JSON the model returned
    let parsed: AssistantResponse;
    try {
      parsed = JSON.parse(rawContent) as AssistantResponse;
    } catch {
      console.error("[assistant] Failed to parse DeepSeek JSON response:", rawContent);
      const fallback = parseFallback(transcript);
      fallback.error = "parse_error";
      return NextResponse.json(fallback);
    }

    // Ensure required fields are present
    if (!parsed.reply || !parsed.intent) {
      const fallback = parseFallback(transcript);
      fallback.error = "incomplete_response";
      return NextResponse.json(fallback);
    }

    // Normalise optional fields
    parsed.items = Array.isArray(parsed.items) ? parsed.items : [];
    parsed.fallbackUsed = false;

    return NextResponse.json(parsed);
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    console.error(isTimeout ? "[assistant] DeepSeek timeout" : "[assistant] DeepSeek error:", err);
    const fallback = parseFallback(transcript);
    fallback.error = isTimeout ? "timeout" : "network_error";
    return NextResponse.json(fallback);
  }
}
