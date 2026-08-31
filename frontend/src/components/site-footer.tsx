import Link from "next/link";
import { Container } from "@/components/ui/container";
import { legalLinks, navigation } from "@/data/site";
import type { ContactsContent } from "@/types/content";

export function SiteFooter({ contacts }: { contacts: ContactsContent }) {
  return (
    <footer className="border-t border-white/10 bg-[#070707] py-12 sm:py-14">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.6fr_1fr]">
          <div>
            <Link
              className="text-xl font-bold tracking-[0.16em] uppercase"
              href="/"
            >
              Nazarov<span className="text-[#d71920]">Group</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-500">
              Профессиональный уход, восстановление и защита автомобиля.
            </p>
            <a
              className="mt-5 block text-sm text-zinc-300"
              href={contacts.phone_href}
            >
              {contacts.phone}
            </a>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] text-zinc-600 uppercase">
              Навигация
            </p>
            <nav className="mt-5 flex flex-col gap-3 text-sm text-zinc-400">
              {navigation.map((item) => (
                <Link
                  className="hover:text-white"
                  key={item.href}
                  href={`/${item.href}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] text-zinc-600 uppercase">
              Юридическая информация
            </p>
            <nav className="mt-5 flex flex-col gap-3 text-sm leading-5 text-zinc-400">
              {legalLinks.map((item) => (
                <Link
                  className="hover:text-white"
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NazarovGroup</p>
          <p>Информация на сайте не является публичной офертой.</p>
          <p>
            Разработано командой{" "}
            <a
              className="!underline text-zinc-400 transition-colors hover:text-white "
              href="https://t.me/nexum_labs_channel"
              target="_blank"
              rel="noreferrer"
            >
              Nexum Labs
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
