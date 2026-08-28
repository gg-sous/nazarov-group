import { localBusinessConfig, siteConfig } from "@/data/site";

export function LocalBusinessJsonLd() {
  if (!localBusinessConfig) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: siteConfig.name,
    description: siteConfig.description,
    url: localBusinessConfig.url,
    telephone: localBusinessConfig.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: localBusinessConfig.streetAddress,
      addressLocality: localBusinessConfig.addressLocality,
      postalCode: localBusinessConfig.postalCode,
      addressCountry: "RU",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
