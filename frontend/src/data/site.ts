export const siteConfig = {
  name: "NazarovGroup",
  description:
    "Профессиональный уход, восстановление и защита вашего автомобиля.",
  phone: "+7 (000) 000-00-00",
  phoneHref: "tel:+70000000000",
  address: "Адрес будет указан перед открытием записи",
  schedule: "Ежедневно, по предварительной записи",
  telegram: "https://t.me/",
  vk: "https://vk.com/",
  email: "hello@nazarovgroup.ru",
} as const;

export const navigation = [
  { label: "Услуги", href: "#services" },
  { label: "О нас", href: "#about" },
  { label: "Работы", href: "#works" },
  { label: "Контакты", href: "#contacts" },
] as const;

export const legalLinks = [
  { label: "Политика обработки персональных данных", href: "/legal/privacy" },
  {
    label: "Согласие на обработку персональных данных",
    href: "/legal/personal-data-consent",
  },
  { label: "Публичная оферта", href: "/legal/offer" },
  { label: "Реквизиты", href: "/legal/requisites" },
] as const;

export type LocalBusinessConfig = {
  url: string;
  telephone: string;
  streetAddress: string;
  addressLocality: string;
  postalCode?: string;
};

// Set only after the factual address, city and phone are confirmed.
export const localBusinessConfig: LocalBusinessConfig | null = null;
