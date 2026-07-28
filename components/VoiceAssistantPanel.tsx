"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Cafe Niloufer – Voice Assistant Panel (API-Powered)
 *
 * Provides seamless voice ordering experience with:
 *  - Advanced speech-to-text via Google Cloud API
 *  - Natural text-to-speech voices via Google Cloud TTS
 *  - MediaRecorder for high-quality audio capture
 *  - Live listening state / status indicator
 *  - Transcript display
 *  - Assistant responses in warm Niloufer tone
 *  - Add-to-cart / remove / checkout actions driven by parsed assistant results
 *  - Fallback to browser APIs if cloud services unavailable
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { menuItems } from "@/data/menu";
import type { AssistantResponse, Language, MenuItem } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VoiceAssistantPanelProps {
  language: Language;
  onAddItem: (item: MenuItem, qty: number) => void;
  onRemoveItemByName: (name: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
}

type PanelStatus =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

// ─── Browser speech helpers (fallback) ────────────────────────────────────────

// MediaRecorder for API-powered speech capture
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

async function startRecording(): Promise<boolean> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start(1000); // Collect data every second
    return true;
  } catch (error) {
    console.error("Failed to access microphone:", error);
    return false;
  }
}

function stopRecording(): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      resolve(null);
      return;
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      resolve(audioBlob);
      // Stop all tracks to release microphone
      mediaRecorder?.stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.stop();
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// SpeechRecognition isn't always in TypeScript's dom lib – declare a minimal interface
interface SpeechRecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// API-powered text-to-speech
async function speakWithAPI(text: string, language: string): Promise<void> {
  try {
    const res = await fetch("/api/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    
    if (!res.ok) throw new Error("TTS API error");
    
    const data = await res.json();
    
    if (data.audioContent) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      await audio.play();
    } else {
      // Fallback to browser TTS
      speakBrowser(text);
    }
  } catch (error) {
    console.error("TTS failed, using browser fallback:", error);
    speakBrowser(text);
  }
}

function speakBrowser(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a natural-sounding English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Google') || 
    voice.name.includes('Natural') ||
    voice.name.includes('Premium') ||
    (voice.lang.startsWith('en') && voice.name.includes('Female')) ||
    (voice.lang.startsWith('en') && voice.name.includes('India'))
  ) || voices.find(voice => voice.lang.startsWith('en')) || null;
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  utterance.lang = "en-IN";
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

// ─── Status label map ─────────────────────────────────────────────────────────

const STATUS_LABELS: Record<PanelStatus, string> = {
  idle: "Tap the mic to order by voice",
  listening: "Listening…",
  processing: "Just a moment…",
  speaking: "Assistant is speaking",
  error: "Something went wrong",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VoiceAssistantPanel({
  language,
  onAddItem,
  onRemoveItemByName,
  onCheckout,
  onClearCart,
}: VoiceAssistantPanelProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<PanelStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSpeechAvailable(getSpeechRecognition() !== null);
  }, []);

  // ── Stop recognition on panel close ──────────────────────────────────────
  useEffect(() => {
    if (!open && recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
      setStatus("idle");
    }
  }, [open]);

  // ── Process assistant response ────────────────────────────────────────────

  const processResponse = useCallback(
    async (res: AssistantResponse) => {
      setLastReply(res.reply);
      setFallbackUsed(res.fallbackUsed);
      setStatus("speaking");
      await speakWithAPI(res.reply, language);

      switch (res.intent) {
        case "add_item":
          res.items.forEach((ai) => {
            const found = menuItems.find((m) => m.id === ai.id);
            if (found) onAddItem(found, ai.quantity ?? 1);
          });
          break;
        case "remove_item":
          res.items.forEach((ai) => onRemoveItemByName(ai.name));
          break;
        case "checkout":
          setTimeout(onCheckout, 1200);
          break;
        case "clear_cart":
          onClearCart();
          break;
        default:
          break;
      }

      setTimeout(() => setStatus("idle"), 3000);
    },
    [onAddItem, onRemoveItemByName, onCheckout, onClearCart, language]
  );

  // ── Send transcript to API ────────────────────────────────────────────────

  const sendTranscript = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setTranscript(text);
      setStatus("processing");

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: text, language }),
        });
        if (!res.ok) throw new Error("API error " + res.status);
        const data: AssistantResponse = await res.json();
        processResponse(data);
      } catch {
        // Network completely unavailable – run client-side fallback
        import("@/lib/assistant/fallbackParser").then(({ parseFallback }) => {
          processResponse(parseFallback(text));
        });
      }
    },
    [language, processResponse]
  );

  // ── API-powered voice recording ────────────────────────────────────────────

  const startListening = useCallback(async () => {
    // Try MediaRecorder API first for high-quality audio
    const canRecord = await startRecording();
    
    if (!canRecord) {
      // Fallback to Web Speech API
      const SR = getSpeechRecognition();
      if (!SR) {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
        return;
      }

      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SR();
      recognition.lang =
        language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setTranscript("");
        setStatus("listening");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) {
            final += r[0].transcript;
          } else {
            interim += r[0].transcript;
          }
        }
        setTranscript(final || interim);
        if (final) {
          recognition.stop();
          sendTranscript(final);
        }
      };

      recognition.onerror = () => {
        console.error("Speech recognition error");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
      };

      recognition.onend = () => {
        if (status === "listening") setStatus("idle");
      };

      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
      }
      return;
    }

    // MediaRecorder started successfully
    setStatus("listening");
    setTranscript("");
  }, [language, sendTranscript, status]);

  const stopListening = useCallback(async () => {
    // Stop MediaRecorder if active
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      const audioBlob = await stopRecording();
      
      if (audioBlob) {
        setStatus("processing");
        const base64Audio = await blobToBase64(audioBlob);
        
        try {
          const res = await fetch("/api/speech-to-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: base64Audio, language }),
          });
          
          if (!res.ok) throw new Error("STT API error");
          
          const data = await res.json();
          
          if (data.transcript) {
            sendTranscript(data.transcript);
          } else {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 2000);
          }
        } catch (error) {
          console.error("Speech-to-text failed:", error);
          setStatus("error");
          setTimeout(() => setStatus("idle"), 2000);
        }
      }
      return;
    }
    
    // Fallback: stop Web Speech API recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStatus("idle");
  }, [language, sendTranscript]);

  // ── Text input submit ─────────────────────────────────────────────────────

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendTranscript(inputText.trim());
    setInputText("");
  }

  // ── Mic button colours ────────────────────────────────────────────────────

  const micActive = status === "listening";
  const micBusy = status === "processing" || status === "speaking";

  return (
    <>
      {/* ── Floating mic button ── */}
      <motion.button
        onClick={() => {
          if (!open) {
            setOpen(true);
            setTimeout(() => {
              if (speechAvailable) startListening();
            }, 300);
          } else if (micActive) {
            stopListening();
          } else if (!micBusy) {
            startListening();
          }
        }}
        aria-label={open ? "Voice assistant – tap to speak" : "Open voice assistant"}
        title="Voice ordering assistant"
        className={[
          "fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-lg",
          "flex items-center justify-center transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-niloufer-gold",
          micActive
            ? "bg-niloufer-burgundy scale-110 ring-4 ring-niloufer-burgundy/30"
            : "bg-niloufer-burgundy hover:bg-niloufer-maroon active:scale-95",
        ].join(" ")}
        initial={false}
        animate={micActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={micActive ? { repeat: Infinity, duration: 1.2 } : {}}
      >
        {micBusy ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : micActive ? (
          <Mic size={22} className="text-white" aria-hidden="true" />
        ) : (
          <Mic size={22} className="text-white/90" aria-hidden="true" />
        )}
      </motion.button>

      {/* ── Assistant panel drawer ── */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="voice-panel"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-niloufer-cream border-t border-niloufer-gold/20 shadow-2xl rounded-t-2xl max-h-[70vh] flex flex-col"
            role="dialog"
            aria-label="Voice ordering assistant"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-niloufer-gold/15">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "w-2.5 h-2.5 rounded-full",
                    status === "listening"
                      ? "bg-red-500 animate-pulse"
                      : status === "processing" || status === "speaking"
                      ? "bg-niloufer-gold animate-pulse"
                      : status === "error"
                      ? "bg-orange-500"
                      : "bg-niloufer-walnut/30",
                  ].join(" ")}
                  aria-hidden="true"
                />
                <h2 className="font-serif font-semibold text-niloufer-charcoal text-sm">
                  Voice Assistant
                </h2>
                {fallbackUsed && (
                  <span className="text-[10px] bg-niloufer-walnut/10 text-niloufer-walnut/70 rounded-full px-2 py-0.5 font-medium">
                    local
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close voice assistant"
                className="p-1.5 rounded-full hover:bg-niloufer-gold/15 text-niloufer-walnut/60 transition-colors"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
              {/* Status */}
              <p className="text-xs text-niloufer-walnut/60 text-center">
                {STATUS_LABELS[status]}
              </p>

              {/* Transcript */}
              {transcript && (
                <div className="bg-niloufer-ivory rounded-xl px-4 py-3">
                  <p className="text-xs text-niloufer-walnut/50 mb-1 font-medium uppercase tracking-widest">
                    You said
                  </p>
                  <p className="text-sm text-niloufer-charcoal leading-relaxed">
                    &ldquo;{transcript}&rdquo;
                  </p>
                </div>
              )}

              {/* Assistant reply */}
              {lastReply && (
                <div className="bg-niloufer-burgundy/8 border border-niloufer-burgundy/20 rounded-xl px-4 py-3">
                  <p className="text-xs text-niloufer-burgundy/60 mb-1 font-medium uppercase tracking-widest">
                    Niloufer
                  </p>
                  <p className="text-sm text-niloufer-charcoal leading-relaxed">{lastReply}</p>
                </div>
              )}

              {/* Empty state hint */}
              {!transcript && !lastReply && (
                <div className="text-center text-niloufer-walnut/50 py-6 space-y-2">
                  <p className="text-3xl">🎤</p>
                  <p className="text-sm">
                    Try saying something like:
                  </p>
                  <ul className="text-xs space-y-1 mt-2">
                    <li>&ldquo;Add two Irani Chai&rdquo;</li>
                    <li>&ldquo;I want a Bun Maska&rdquo;</li>
                    <li>&ldquo;What do you recommend?&rdquo;</li>
                    <li>&ldquo;Remove the coffee&rdquo;</li>
                    <li>&ldquo;I&apos;m done, checkout&rdquo;</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Footer – mic + text input */}
            <div className="px-5 py-4 border-t border-niloufer-gold/15 space-y-3">
              {/* Mic control */}
              {speechAvailable && (
                <div className="flex justify-center">
                  <button
                    onPointerDown={startListening}
                    onPointerUp={micActive ? stopListening : undefined}
                    onClick={micActive ? stopListening : startListening}
                    disabled={micBusy}
                    aria-label={micActive ? "Stop listening" : "Start listening"}
                    className={[
                      "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all",
                      micActive
                        ? "bg-red-500 text-white shadow-md shadow-red-300/50"
                        : micBusy
                        ? "bg-niloufer-walnut/20 text-niloufer-walnut/40 cursor-not-allowed"
                        : "bg-niloufer-burgundy text-white hover:bg-niloufer-maroon active:scale-95",
                    ].join(" ")}
                  >
                    {micActive ? (
                      <>
                        <MicOff size={16} aria-hidden="true" />
                        Tap to stop
                      </>
                    ) : (
                      <>
                        <Mic size={16} aria-hidden="true" />
                        {micBusy ? "Processing…" : "Tap to speak"}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Text input fallback */}
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    speechAvailable
                      ? "Or type your order here…"
                      : "Type your order (e.g. 2 Irani Chai)…"
                  }
                  aria-label="Type your order"
                  disabled={micBusy}
                  className="flex-1 text-sm px-4 py-2.5 rounded-full border border-niloufer-gold/30 bg-white text-niloufer-charcoal placeholder:text-niloufer-walnut/40 focus:outline-none focus:ring-2 focus:ring-niloufer-burgundy/30 disabled:opacity-40"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || micBusy}
                  className="px-4 py-2.5 rounded-full bg-niloufer-gold/80 text-niloufer-charcoal font-medium text-sm hover:bg-niloufer-gold active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>

              {/* Fallback notice */}
              {fallbackUsed && (
                <p className="text-center text-[11px] text-niloufer-walnut/40">
                  Using local assistant · some complex requests may need rephrasing
                </p>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
