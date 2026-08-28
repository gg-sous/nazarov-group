import type { Metadata, Viewport } from "next";
import { Providers } from "@/app/providers";
import { siteConfig } from "@/data/site";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NazarovGroup — профессиональный детейлинг",
    template: "%s — NazarovGroup",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: siteConfig.name,
    title: "NazarovGroup — характер в деталях",
    description: siteConfig.description,
    images: [
      {
        url: "/og.png",
        width: 1732,
        height: 908,
        alt: "NazarovGroup — профессиональный детейлинг",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NazarovGroup — характер в деталях",
    description: siteConfig.description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090909",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
