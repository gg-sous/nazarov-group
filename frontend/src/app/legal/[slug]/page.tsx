import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SiteFooter } from "@/components/site-footer";
import { defaultSiteContent } from "@/data/content";
import { getPublicContent } from "@/lib/server-api";

const legalPages = {
  privacy: {
    title: "Политика обработки персональных данных",
    note: "Полный текст политики будет подготовлен и опубликован до production-запуска сайта.",
  },
  "personal-data-consent": {
    title: "Согласие на обработку персональных данных",
    note: "Юридически проверенный текст согласия будет добавлен до включения реальной отправки формы.",
  },
  offer: {
    title: "Публичная оферта",
    note: "Условия оказания услуг и оплаты будут опубликованы после согласования бизнес-процессов.",
  },
  requisites: {
    title: "Реквизиты",
    note: "Фактические реквизиты владельца бизнеса будут размещены перед production-запуском.",
  },
} as const;

type LegalSlug = keyof typeof legalPages;

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages[slug as LegalSlug];
  return page
    ? { title: page.title, description: `${page.title}. NazarovGroup.` }
    : {};
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fallbackPage = legalPages[slug as LegalSlug];
  if (!fallbackPage) notFound();
  const content = (await getPublicContent()) ?? defaultSiteContent;
  const savedPage = content.legal.find((item) => item.slug === slug);
  const page = savedPage ?? {
    title: fallbackPage.title,
    body: fallbackPage.note,
  };

  return (
    <>
      <main className="min-h-[75vh] py-16 sm:py-24">
        <Container>
          <Link
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            href="/"
          >
            <ArrowLeft size={16} /> На главную
          </Link>
          <div className="mt-16 max-w-4xl border-t border-white/10 pt-10">
            <p className="text-xs font-semibold tracking-[0.25em] text-[#d71920] uppercase">
              Юридическая информация
            </p>
            <h1 className="mt-6 text-4xl leading-tight font-semibold tracking-[-0.04em] uppercase sm:text-6xl">
              {page.title}
            </h1>
            <div className="mt-12 border border-white/10 bg-[#111] p-7 sm:p-10">
              <div className="max-w-3xl leading-7 whitespace-pre-wrap text-zinc-400">
                {page.body}
              </div>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter contacts={content.contacts} />
    </>
  );
}
