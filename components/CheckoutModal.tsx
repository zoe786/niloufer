"use client";

import { useCart } from "@/context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { useCallback, useState } from "react";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
}

function generateOrderNumber(): string {
  return `NLF-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function CheckoutModal({ open, onClose, onReset }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<"review" | "confirmed">("review");
  const [orderNumber] = useState(() => generateOrderNumber());

  const handleConfirm = useCallback(() => {
    setStep("confirmed");
    clearCart();
  }, [clearCart]);

  function handleDone() {
    onReset();
    setStep("review");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-niloufer-charcoal/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step === "review" ? onClose : undefined}
            aria-hidden="true"
          />

          <motion.div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-niloufer-cream rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
              initial={{ y: 60, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label={step === "review" ? "Review your order" : "Order confirmed"}
            >
              {step === "review" && (
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-niloufer-gold/20">
                    <h2 className="font-serif font-bold text-2xl text-niloufer-charcoal">
                      Review Order
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-niloufer-gold/10 transition-colors"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Items summary */}
                  <div className="px-6 py-4 max-h-64 overflow-y-auto space-y-2">
                    {items.map((ci) => (
                      <div key={ci.cartItemId} className="flex justify-between text-sm">
                        <span className="text-niloufer-charcoal">
                          {ci.quantity}× {ci.menuItem.name.en}
                          {ci.selectedCustomizations.length > 0 && (
                            <span className="text-niloufer-walnut/60 text-xs ml-1">
                              ({ci.selectedCustomizations.map((c) => c.choice).join(", ")})
                            </span>
                          )}
                        </span>
                        <span className="text-niloufer-burgundy font-medium">₹{ci.lineTotal}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="px-6 py-4 border-t border-niloufer-gold/20">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span className="text-niloufer-charcoal">Total</span>
                      <span className="text-niloufer-burgundy">₹{subtotal}</span>
                    </div>

                    <p className="text-xs text-niloufer-walnut/60 text-center mb-4">
                      Please confirm your order. Payment at the counter.
                    </p>

                    <motion.button
                      onClick={handleConfirm}
                      className="w-full py-4 bg-niloufer-burgundy text-white rounded-full font-bold text-lg shadow-lg hover:bg-niloufer-maroon"
                      whileTap={{ scale: 0.97 }}
                    >
                      Confirm Order · ₹{subtotal}
                    </motion.button>
                  </div>
                </div>
              )}

              {step === "confirmed" && (
                <div className="px-6 py-10 flex flex-col items-center gap-6 text-center">
                  {/* Success animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircle size={72} className="text-green-500" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="font-serif font-bold text-2xl text-niloufer-charcoal mb-2">
                      Order Placed! 🍵
                    </h2>
                    <p className="text-niloufer-walnut italic">
                      Your order is being brewed with love.
                      <br />
                      Please show this screen at the counter.
                    </p>
                  </motion.div>

                  {/* Order number */}
                  <motion.div
                    className="bg-niloufer-burgundy/5 border border-niloufer-gold/30 rounded-2xl px-8 py-4 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-xs text-niloufer-walnut/60 uppercase tracking-widest mb-1">
                      Order Number
                    </p>
                    <p className="font-mono font-bold text-3xl text-niloufer-burgundy">
                      {orderNumber}
                    </p>

                    {/* Barcode placeholder */}
                    <div className="mt-3 flex justify-center gap-px" aria-hidden="true">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-niloufer-charcoal"
                          style={{
                            width: i % 3 === 0 ? 3 : 1,
                            height: i % 5 === 0 ? 36 : 28,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* Footer note */}
                  <p className="text-xs text-niloufer-walnut/50 italic">
                    Crafted with love at Banjara Hills – Since 1978
                  </p>

                  <motion.button
                    onClick={handleDone}
                    className="w-full py-3.5 bg-niloufer-burgundy text-white rounded-full font-semibold text-base mt-2"
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Start New Order
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
