import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  FileText,
  ImageIcon,
  LayoutDashboard,
  CalendarCheck2,
  MapPin,
  PanelTop,
  Wrench,
} from "lucide-react";

export type AdminNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavigation: AdminNavigationItem[] = [
  { label: "Обзор", href: "#overview", icon: LayoutDashboard },
  { label: "Записи", href: "#bookings", icon: CalendarCheck2 },
  { label: "Hero-блок", href: "#hero", icon: PanelTop },
  { label: "Услуги", href: "#services", icon: Wrench },
  { label: "Работы", href: "#portfolio", icon: ImageIcon },
  { label: "Контакты", href: "#contacts", icon: MapPin },
  { label: "Юридическое", href: "#legal", icon: FileText },
  { label: "Настройки", href: "#settings", icon: BriefcaseBusiness },
];
