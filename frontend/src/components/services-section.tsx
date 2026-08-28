import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { Service } from "@/data/services";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex min-h-[340px] flex-col justify-between border border-white/10 bg-[#111] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/25 sm:min-h-96 sm:p-8">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#d71920]">
            {service.marker}
          </span>
          <ArrowUpRight
            className="text-zinc-600 transition group-hover:text-white"
            size={20}
          />
        </div>
        <h3 className="mt-8 text-xl leading-tight font-semibold sm:mt-10 sm:text-2xl">
          {service.title}
        </h3>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          {service.description}
        </p>
      </div>
      <div className="mt-10 border-t border-white/10 pt-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-lg font-semibold">{service.priceFrom}</span>
          <span className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock3 size={14} /> {service.duration}
          </span>
        </div>
        <Link
          className="mt-6 inline-flex text-sm font-semibold underline decoration-zinc-700 underline-offset-8 transition hover:decoration-[#d71920]"
          href="/#booking"
        >
          Выбрать услугу
        </Link>
      </div>
    </article>
  );
}

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="services" className="scroll-mt-20 py-20 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Услуги"
          title="Уход, который сохраняет ценность автомобиля"
          description="Подберём состав работ после осмотра. Финальная стоимость зависит от класса, состояния и задач автомобиля."
        />
        <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={(index % 3) * 0.06}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold transition hover:border-white/50"
            href="/services"
          >
            Все услуги
          </Link>
        </div>
      </Container>
    </section>
  );
}
