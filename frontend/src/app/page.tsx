import { AdvantagesSection } from "@/components/advantages-section";
import { BackToTop } from "@/components/back-to-top";
import { BookingSection } from "@/components/booking-section";
import { ContactsSection } from "@/components/contacts-section";
import { Hero } from "@/components/hero";
import { LocalBusinessJsonLd } from "@/components/local-business-json-ld";
import { PortfolioSection } from "@/components/portfolio-section";
import { ServicesSection } from "@/components/services-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { defaultSiteContent } from "@/data/content";
import { getPublicContent } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = (await getPublicContent()) ?? defaultSiteContent;
  const publicServices = content.services
    .filter((service) => service.is_featured)
    .sort((left, right) => left.sort_order - right.sort_order)
    .slice(0, 6)
    .map((service) => ({ ...service, priceFrom: service.price_from }));
  const portfolio = content.portfolio.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    treatment: item.treatment,
    tone: item.tone,
    image_url: item.image_url,
  }));
  return (
    <>
      <LocalBusinessJsonLd />
      <SiteHeader />
      <BackToTop />
      <main className="overflow-x-clip">
        <Hero content={content.hero} />
        <ServicesSection services={publicServices} />
        <AdvantagesSection />
        <PortfolioSection portfolioItems={portfolio} />
        <BookingSection
          services={content.services.filter((service) => service.is_active)}
        />
        <ContactsSection contacts={content.contacts} />
      </main>
      <SiteFooter contacts={content.contacts} />
    </>
  );
}
