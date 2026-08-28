import type { Metadata } from "next";
import Link from "next/link";

import { ServiceCard } from "@/components/services-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Container } from "@/components/ui/container";
import { defaultSiteContent } from "@/data/content";
import { getPublicContent } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Все услуги детейлинга — NazarovGroup",
  description:
    "Полный каталог услуг NazarovGroup с ориентировочными ценами и сроками.",
};

export const dynamic = "force-dynamic";
const PAGE_SIZE = 9;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const content = (await getPublicContent()) ?? defaultSiteContent;
  const query = ((await searchParams).q ?? "")
    .toString()
    .trim()
    .toLocaleLowerCase("ru");
  const requestedPage = Number((await searchParams).page ?? "1");
  const filtered = content.services
    .filter((service) => service.is_active)
    .filter(
      (service) =>
        !query ||
        `${service.title} ${service.description}`
          .toLocaleLowerCase("ru")
          .includes(query),
    )
    .sort((left, right) => left.sort_order - right.sort_order);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(Math.trunc(requestedPage), 1), totalPages)
    : 1;
  const services = filtered
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    .map((service) => ({ ...service, priceFrom: service.price_from }));

  return (
    <>
      <SiteHeader />
      <main id="top" className="min-h-screen pt-32 pb-24 sm:pt-40">
        <Container>
          <p className="text-xs font-semibold tracking-[0.25em] text-[#d71920] uppercase">
            Каталог
          </p>
          <div className="mt-5 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] uppercase sm:text-7xl">
                Все услуги
              </h1>
              <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
                Полный список направлений NazarovGroup. Финальная стоимость
                определяется после осмотра автомобиля.
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2" action="/services">
              <input
                name="q"
                defaultValue={query}
                placeholder="Найти услугу"
                className="min-h-12 min-w-0 flex-1 border border-white/15 bg-[#111] px-4 text-sm outline-none focus:border-[#d71920]"
              />
              <button className="min-h-12 bg-[#d71920] px-5 text-sm font-semibold">
                Найти
              </button>
            </form>
          </div>
          {services.length ? (
            <div className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="mt-14 border border-white/10 bg-[#111] p-10 text-center text-zinc-400">
              По этому запросу услуг не найдено.
            </div>
          )}
          {totalPages > 1 ? (
            <nav
              className="mt-10 flex flex-wrap justify-center gap-2"
              aria-label="Страницы каталога"
            >
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <Link
                    key={number}
                    href={`/services?page=${number}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                    className={`grid size-11 place-items-center border text-sm ${number === page ? "border-[#d71920] bg-[#d71920]" : "border-white/15 bg-[#111]"}`}
                  >
                    {number}
                  </Link>
                ),
              )}
            </nav>
          ) : null}
        </Container>
      </main>
      <SiteFooter contacts={content.contacts} />
    </>
  );
}
