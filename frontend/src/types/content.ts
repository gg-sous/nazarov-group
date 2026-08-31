export type HeroContent = {
  eyebrow: string;
  accent: string;
  title: string;
  description: string;
  primary_button: string;
  secondary_button: string;
  image_url: string;
};
export type ServiceContent = {
  id: string;
  marker: string;
  title: string;
  description: string;
  price_from: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  image_url: string | null;
};
export type PortfolioContent = {
  id: string;
  title: string;
  category: string;
  treatment: string;
  tone: "graphite" | "silver" | "black";
  image_url: string | null;
};
export type ContactsContent = {
  phone: string;
  phone_href: string;
  address: string;
  map_url: string;
  schedule: string;
  telegram: string;
  vk: string;
  email: string;
};
export type LegalContent = {
  slug: "privacy" | "personal-data-consent" | "offer" | "requisites";
  title: string;
  body: string;
};
export type SiteContentBundle = {
  hero: HeroContent;
  services: ServiceContent[];
  portfolio: PortfolioContent[];
  contacts: ContactsContent;
  legal: LegalContent[];
};

export type BookingStatus =
  "waiting_payment" | "confirmed" | "cancelled" | "completed" | "no_show";
export type AdminBooking = {
  id: string;
  status: BookingStatus;
  service_names: string[];
  service_slugs: string[];
  date: string;
  start_time: string;
  client_name: string;
  client_phone: string;
  vehicle_model: string;
  vehicle_color: string;
  created_at: string;
};
