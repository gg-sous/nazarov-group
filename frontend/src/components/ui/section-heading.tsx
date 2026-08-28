type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 grid gap-4 sm:mb-12 lg:mb-16 lg:grid-cols-[0.65fr_1.35fr] lg:gap-5">
      <p className="flex items-start gap-3 pt-2 text-xs font-semibold tracking-[0.25em] text-zinc-500 uppercase">
        <span className="mt-1.5 h-px w-7 shrink-0 bg-[#d71920]" /> {eyebrow}
      </p>
      <div>
        <h2 className="max-w-4xl text-[2rem] leading-[1] font-semibold tracking-[-0.035em] break-words uppercase sm:text-5xl lg:text-7xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-5 max-w-2xl text-[15px] leading-6 text-zinc-400 sm:mt-6 sm:text-lg sm:leading-7">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
