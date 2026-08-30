import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/data/services";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { MediaImage } from "@/components/ui/media-image";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex min-h-[340px] flex-col justify-between overflow-hidden border border-white/10 bg-[#111] transition duration-300 hover:-translate-y-1 hover:border-white/25 sm:min-h-96">
      <div>
        {service.image_url ? (
          <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-black">
            <MediaImage
              src={service.image_url}
              alt={service.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : null}
        <div className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-8">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#d71920]">
            {service.marker}
          </span>
          <ArrowUpRight
            className="text-zinc-600 transition group-hover:text-white"
            size={20}
          />
        </div>
        <h3 className="mt-8 px-5 text-xl leading-tight font-semibold sm:mt-10 sm:px-8 sm:text-2xl">
          {service.title}
        </h3>
        <p className="mt-4 px-5 text-sm leading-6 text-zinc-400 sm:px-8">
          {service.description}
        </p>
      </div>
      <div className="mt-10 border-t border-white/10 px-5 pt-5 pb-5 sm:px-8 sm:pb-8">
        <p className="text-lg font-semibold">{service.priceFrom}</p>
        <Link
          className="mt-6 inline-flex text-sm font-semibold underline decoration-zinc-700 underline-offset-8 transition hover:decoration-[#d71920]"
          href="/#booking"
        >
          Выбрать для осмотра
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
