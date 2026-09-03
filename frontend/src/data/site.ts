export const siteConfig = {
  name: "NazarovGroup",
  description:
    "Профессиональный уход, восстановление и защита вашего автомобиля.",
  phone: "+7 (987) 243-09-93",
  phoneHref: "tel:+79872430993",
  address: "г. Уфа, ул. Ульяновых, 59а",
  schedule: "Ежедневно, 10:00–20:00",
  telegram: "https://t.me/",
  vk: "https://vk.com/",
  email: "idrisov.777@mail.ru",
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
