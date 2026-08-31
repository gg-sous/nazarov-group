import { portfolioItems } from "@/data/portfolio";
import { services } from "@/data/services";
import { legalLinks, siteConfig } from "@/data/site";
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
    map_url:
      "https://makemap.2gis.ru/widget?data=eJw1js1OxDAMhN_FXKuqaZs22wdYBKc9IH61h7IxEJHWUeoFStV3x5sKn6yZ8fhbgKLFiPYaaUCODifoXhbgOSB0sMeezxEhgxApYOTki-3YX_y7Yd88Pd5-2U87v1b33xK0OJ2iC-xolIAIJ_IUZb0qSqPeSlF-b0aLP9Cp4n_WDN43gDnVb98P5EZODQLpxp4TnG7ywujS1Jmuc1O2eneUc2eh041ZjxkMfTjQ5DaCBXzPYtV5W2lVtRn4i6x1vtOmbZTQEA3CoqREyMn7hw9E_5xUjmdc_wDRWVty",
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
