import { portfolioItems } from "@/data/portfolio";
import { services } from "@/data/services";
import { legalLinks, siteConfig } from "@/data/site";
import { NAZAROVGROUP_MAP_URL } from "@/data/map";
import type { SiteContentBundle } from "@/types/content";

export const defaultSiteContent: SiteContentBundle = {
  hero: {
    eyebrow: "Профессиональный детейлинг",
    accent: "NazarovGroup",
    title: "Характер в деталях",
    description:
      "Возвращаем автомобилю выразительность и защищаем результат — аккуратно, технологично, с вниманием к каждой поверхности.",
    primary_button: "Записаться на осмотр",
    secondary_button: "Наши работы",
    image_url: "/og.png",
  },
  services: services.map((service) => ({
    id: service.id,
    marker: service.marker,
    title: service.title,
    description: service.description,
    price_from: service.priceFrom,
    is_active: true,
    is_featured: true,
    sort_order: Number(service.marker) * 10,
    image_url: service.image_url ?? null,
  })),
  portfolio: portfolioItems.map((item) => ({ ...item, image_url: null })),
  contacts: {
    phone: siteConfig.phone,
    phone_href: siteConfig.phoneHref,
    address: siteConfig.address,
    map_url: NAZAROVGROUP_MAP_URL,
    schedule: siteConfig.schedule,
    telegram: siteConfig.telegram,
    vk: siteConfig.vk,
    email: siteConfig.email,
  },
  legal: legalLinks.map((item) => ({
    slug: item.href
      .split("/")
      .at(-1) as SiteContentBundle["legal"][number]["slug"],
    title: item.label,
    body: "Юридический текст будет добавлен и проверен специалистом перед production-запуском сайта.",
  })),
};
