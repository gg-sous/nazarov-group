import { ArrowDownRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import type { HeroContent } from "@/types/content";

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section
      id="top"
      className="relative flex min-h-[680px] items-end overflow-hidden pt-24 sm:min-h-[760px] sm:pt-28 lg:min-h-screen"
    >
      <MediaImage
        src={content.image_url}
        alt="Тёмный автомобиль с глубоким глянцем после детейлинга"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center] opacity-55 sm:object-[62%_center] sm:opacity-60"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#090909_5%,rgba(9,9,9,.9)_35%,rgba(9,9,9,.2)_74%),linear-gradient(0deg,#090909_0%,transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(255,255,255,0.08),transparent_30%)]" />
      <Container className="relative grid gap-12 pb-12 sm:pb-20 lg:grid-cols-[1.25fr_0.75fr] lg:pb-20">
        <div className="max-w-4xl">
          <p className="mb-5 flex items-center gap-3 text-[10px] leading-4 font-semibold tracking-[0.24em] text-zinc-300 uppercase sm:mb-6 sm:text-xs sm:tracking-[0.28em]">
            <span className="h-px w-8 bg-[#d71920]" /> {content.eyebrow}
          </p>
          <h1 className="max-w-full text-[clamp(2.65rem,14vw,8.2rem)] leading-[0.86] font-semibold tracking-[-0.025em] break-words uppercase sm:leading-[0.82] sm:tracking-[-0.03em]">
            {content.title}
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-6 text-zinc-300 sm:mt-8 sm:text-lg sm:leading-7">
            {content.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
            <a
              className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#d71920] px-7 py-4 font-semibold transition hover:-translate-y-0.5 hover:bg-[#bd141b] sm:w-auto"
              href="#booking"
            >
              {content.primary_button} <ArrowDownRight size={18} />
            </a>
            <a
              className="inline-flex min-h-14 w-full items-center justify-center rounded-full border border-white/25 px-7 py-4 font-semibold transition hover:border-white/60 hover:bg-white/5 sm:w-auto"
              href="#works"
            >
              {content.secondary_button}
            </a>
          </div>
        </div>
        <div className="hidden items-end justify-end lg:flex">
          <p className="w-64 border-l border-white/20 pl-6 text-sm leading-6 text-zinc-400">
            <span className="mb-2 block text-xs tracking-[0.22em] text-white uppercase">
              {content.accent}
            </span>
            Чистая эстетика. Понятный процесс. Результат, который хочется
            сохранить.
          </p>
        </div>
      </Container>
    </section>
  );
}
