import { ArrowUpRight } from "lucide-react";
import type { PortfolioItem } from "@/data/portfolio";
import { Container } from "@/components/ui/container";
import { MediaImage } from "@/components/ui/media-image";
import { SectionHeading } from "@/components/ui/section-heading";

const toneClass: Record<PortfolioItem["tone"], string> = {
  black: "from-[#333] via-[#0c0c0c] to-[#161616]",
  silver: "from-[#737373] via-[#222] to-[#111]",
  graphite: "from-[#4c4c4c] via-[#171717] to-[#070707]",
};

function PortfolioCard({
  item,
  featured,
}: {
  item: PortfolioItem;
  featured?: boolean;
}) {
  return (
    <article
      className={`group relative min-h-[360px] overflow-hidden border border-white/10 sm:min-h-[440px] ${featured ? "lg:col-span-2 lg:min-h-[620px]" : "lg:min-h-[620px]"}`}
    >
      {item.image_url ? (
        <MediaImage
          src={item.image_url}
          alt={item.title}
          fill
          sizes={
            featured
              ? "(max-width: 1024px) 100vw, 66vw"
              : "(max-width: 1024px) 100vw, 33vw"
          }
          className="object-cover transition duration-700 group-hover:scale-[1.025]"
        />
      ) : (
        <>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${toneClass[item.tone]}`}
          />
          <div className="absolute top-[18%] -right-20 h-[52%] w-[88%] -skew-x-12 rounded-[50%] border border-white/15 bg-black/35 shadow-[-25px_35px_90px_rgba(0,0,0,.8)]" />
          <div className="absolute top-[38%] right-[8%] h-px w-[55%] -skew-x-12 bg-white/50" />
          <div className="absolute top-[41%] right-[14%] h-0.5 w-[38%] -skew-x-12 bg-[#d71920]/80" />
        </>
      )}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-24 sm:p-9 sm:pt-32">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="text-xs tracking-[0.22em] text-zinc-400 uppercase">
              {item.category}
            </span>
            <h3 className="mt-2 text-xl font-semibold sm:text-3xl">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">{item.treatment}</p>
          </div>
          <ArrowUpRight className="shrink-0 text-zinc-500 transition group-hover:text-white" />
        </div>
      </div>
    </article>
  );
}

export function PortfolioSection({
  portfolioItems,
}: {
  portfolioItems: PortfolioItem[];
}) {
  return (
    <section id="works" className="scroll-mt-20 py-20 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Работы"
          title="Результат виден в отражении"
          description="Галерея подготовлена как отдельный слой данных: позже работы можно будет загружать из административной панели и группировать по категориям."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {portfolioItems.map((item, index) => (
            <PortfolioCard key={item.id} item={item} featured={index === 0} />
          ))}
        </div>
      </Container>
    </section>
  );
}
