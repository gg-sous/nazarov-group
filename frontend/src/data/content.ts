import { portfolioItems } from "@/data/portfolio";
import { services } from "@/data/services";
import { legalLinks, siteConfig } from "@/data/site";
import type { SiteContentBundle } from "@/types/content";

const bookingDurationMinutes: Record<string, number> = {
  "complex-detailing": 600,
  "body-polishing": 600,
  "ceramic-coating": 480,
  "interior-cleaning": 480,
  "detail-wash": 120,
  "protective-coatings": 180,
};

export const defaultSiteContent: SiteContentBundle = {
  hero: {
    eyebrow: "Профессиональный детейлинг",
    accent: "NazarovGroup",
    title: "Характер в деталях",
    description:
      "Возвращаем автомобилю выразительность и защищаем результат — аккуратно, технологично, с вниманием к каждой поверхности.",
    primary_button: "Записаться",
    secondary_button: "Наши работы",
    image_url: "/og.png",
  },
  services: services.map((service) => ({
    id: service.id,
    marker: service.marker,
    title: service.title,
    description: service.description,
    price_from: service.priceFrom,
    duration: service.duration,
    duration_minutes: bookingDurationMinutes[service.id] ?? 120,
    is_active: true,
    is_featured: true,
    sort_order: Number(service.marker) * 10,
  })),
  portfolio: portfolioItems.map((item) => ({ ...item, image_url: null })),
  contacts: {
    phone: siteConfig.phone,
    phone_href: siteConfig.phoneHref,
    address: siteConfig.address,
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
