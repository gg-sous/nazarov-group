"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 600);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.button
          type="button"
          aria-label="Вернуться наверх"
          className="fixed right-5 bottom-5 z-40 grid size-12 place-items-center rounded-full border border-white/15 bg-[#111]/95 text-white shadow-[0_12px_40px_rgba(0,0,0,.45)] backdrop-blur transition-colors hover:border-[#d71920] hover:bg-[#d71920] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d71920] sm:right-8 sm:bottom-8 sm:size-14"
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.94 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
        >
          <ArrowUp size={20} aria-hidden="true" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
