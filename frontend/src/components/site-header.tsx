"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navigation } from "@/data/site";
import { Container } from "@/components/ui/container";
import Link from "next/link";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        isOpen
          ? "border-white/10 bg-[#090909]"
          : isScrolled
            ? "border-white/10 bg-[#090909]/95 backdrop-blur-xl"
            : "border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between sm:h-20 lg:h-24">
        <Link
          className="relative z-50 text-sm font-bold tracking-[0.14em] uppercase sm:text-lg sm:tracking-[0.16em]"
          href="/#top"
          onClick={() => setIsOpen(false)}
        >
          Nazarov<span className="text-[#d71920]">Group</span>
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm text-zinc-300 lg:flex"
          aria-label="Основная навигация"
        >
          {navigation.map((item) => (
            <Link
              className="transition hover:text-white"
              key={item.href}
              href={`/${item.href}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          className="hidden rounded-full bg-[#d71920] px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#bd141b] sm:inline-flex"
          href="/#booking"
        >
          Записаться на осмотр
        </Link>
        <button
          className="relative z-50 grid size-11 shrink-0 place-items-center rounded-full border border-white/15 lg:hidden"
          type="button"
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </Container>

      <div
        className={`fixed inset-0 overflow-y-auto bg-[#090909] px-4 pt-24 pb-8 transition duration-300 sm:px-8 sm:pt-28 lg:hidden ${isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-4 opacity-0"}`}
      >
        <nav
          className="flex flex-col border-t border-white/10"
          aria-label="Мобильная навигация"
        >
          {navigation.map((item, index) => (
            <Link
              className="flex items-center justify-between border-b border-white/10 py-5 text-2xl font-semibold sm:py-6 sm:text-3xl"
              key={item.href}
              href={`/${item.href}`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
              <span className="text-xs text-zinc-600">0{index + 1}</span>
            </Link>
          ))}
        </nav>
        <Link
          className="mt-8 flex w-full justify-center rounded-full bg-[#d71920] px-6 py-4 font-semibold"
          href="/#booking"
          onClick={() => setIsOpen(false)}
        >
          Записаться на осмотр
        </Link>
      </div>
    </header>
  );
}
