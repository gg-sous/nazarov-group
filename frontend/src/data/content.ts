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
      "https://makemap.2gis.ru/widget?data=eJw1j81ugzAQhN9le0WRMTZgHiBVesqh6q9yoPGmsWpYZJy2BPHu3Rh1T9bM7OznGShYDGjvkTqMweEIzfsMcRoQGthiGy8BIYMh0IAhJp9tF_3Nf-y25evLw7f9stNH8fTDQYvjMbghOuo5wMKRPAV-3glZ5yfJynXXW_yFJhf_s2TwuQJMqX69vifXx9TAkK5vY4LT5UbUWhiTabWpZaVrdeB9Z6EplVgOGXTtsKfRrQgz-DZCk7JlrkWujDamrsoM_M1PdYUshKmkNEIoNq5EHeNVXMufIe-fz4j-LakxXHD5A1QQX1A",
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
