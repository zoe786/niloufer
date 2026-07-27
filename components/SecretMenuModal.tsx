"use client";

import { secretMenuItem } from "@/data/menu";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface SecretMenuModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: typeof secretMenuItem) => void;
}

export default function SecretMenuModal({ open, onClose, onAdd }: SecretMenuModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-niloufer-charcoal/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-gradient-to-br from-niloufer-charcoal to-niloufer-walnut text-niloufer-cream rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center overflow-hidden"
              initial={{ scale: 0.7, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              role="dialog"
              aria-modal="true"
              aria-label="Secret Menu revealed"
            >
              {/* Gold shimmer bg */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #D97706 0px, #D97706 1px, transparent 1px, transparent 12px)",
                }}
              />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close secret menu"
              >
                <X size={16} />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-5xl mb-3"
                aria-hidden="true"
              >
                🪷
              </motion.div>

              <h2 className="font-serif font-bold text-2xl mb-1 text-niloufer-gold">
                Secret Menu
              </h2>
              <p className="text-niloufer-cream/60 text-xs mb-5 italic">
                Only for those who know to look…
              </p>

              {/* Item card */}
              <div className="bg-white/10 rounded-2xl p-5 text-left space-y-3 mb-6 border border-niloufer-gold/30">
                <h3 className="font-serif font-bold text-xl text-niloufer-gold leading-tight">
                  {secretMenuItem.name.en}
                </h3>
                <p className="text-niloufer-cream/80 text-sm leading-relaxed">
                  {secretMenuItem.description.en}
                </p>
                <p className="text-niloufer-gold font-bold text-xl">
                  ₹{secretMenuItem.price}
                </p>
              </div>

              <motion.button
                onClick={() => {
                  onAdd(secretMenuItem);
                  onClose();
                }}
                className="w-full py-3.5 bg-niloufer-gold text-niloufer-charcoal font-bold rounded-full text-base shadow hover:brightness-95 active:scale-95 transition-all"
                whileTap={{ scale: 0.97 }}
              >
                Add to Order
              </motion.button>

              <p className="mt-4 text-[10px] text-niloufer-cream/40 italic">
                A whispered tradition of the Niloufer kitchen.
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
