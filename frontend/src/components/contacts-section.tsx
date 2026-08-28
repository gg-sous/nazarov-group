import { Clock3, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ContactsContent } from "@/types/content";

export function ContactsSection({ contacts }: { contacts: ContactsContent }) {
  const contactItems = [
    {
      label: "Телефон",
      value: contacts.phone,
      href: contacts.phone_href,
      icon: Phone,
    },
    { label: "Адрес", value: contacts.address, icon: MapPin },
    { label: "График", value: contacts.schedule, icon: Clock3 },
  ] as const;
  return (
    <section id="contacts" className="scroll-mt-20 py-20 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Контакты"
          title="Свяжитесь удобным способом"
          description="Фактические адрес, телефон и ссылки на социальные сети вынесены в единый конфигурационный файл и будут заменены перед запуском."
        />
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border border-white/10 bg-[#111] p-5 sm:p-9">
            {contactItems.map(({ label, value, icon: Icon, ...item }) => (
              <div
                className="flex gap-4 border-b border-white/10 py-6 first:pt-0 last:border-0 last:pb-0"
                key={label}
              >
                <Icon className="mt-0.5 shrink-0 text-[#d71920]" size={20} />
                <div>
                  <p className="text-xs tracking-[0.18em] text-zinc-600 uppercase">
                    {label}
                  </p>
                  {"href" in item ? (
                    <a
                      className="mt-2 block text-sm leading-6 text-zinc-200 hover:text-white"
                      href={item.href}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-zinc-200">
                      {value}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm transition hover:border-white/40"
                href={contacts.telegram}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} /> Telegram
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm transition hover:border-white/40"
                href={contacts.vk}
                target="_blank"
                rel="noreferrer"
              >
                VK
              </a>
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden border border-white/10 bg-[#141414] sm:min-h-96">
            <div className="map-grid absolute inset-0 opacity-40" />
            <div className="absolute top-[46%] left-[58%] size-5 rounded-full bg-[#d71920] shadow-[0_0_0_10px_rgba(215,25,32,.14)]" />
            <div className="absolute right-6 bottom-6 left-6 border border-white/10 bg-[#090909]/90 p-5 backdrop-blur">
              <p className="text-xs tracking-[0.2em] text-zinc-600 uppercase">
                Карта
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                Интерактивная карта будет подключена после подтверждения адреса.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
