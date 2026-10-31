import { site, siteUrl, confirmedHours } from "@/config/site";
export function BusinessJsonLd() {
 const business = {
 "@context": "https://schema.org", "@type": "HealthAndBeautyBusiness",
 name: site.confirmed.name ? site.name : undefined, description: site.description, url: siteUrl,
 telephone: site.confirmed.phone ? site.phone : undefined,
 contactPoint: site.whatsapp.confirmed && site.whatsapp.phone ? { "@type": "ContactPoint", contactType: "Agendamento pelo WhatsApp", telephone: site.phone, url: `https://wa.me/${site.whatsapp.phone}` } : undefined,
 hasMap: site.map.confirmed ? site.google.placeUrl : undefined,
 address: site.address.confirmed ? { "@type": "PostalAddress", streetAddress: site.address.streetAddress, addressLocality: site.address.addressLocality, addressRegion: site.address.addressRegion, postalCode: site.address.postalCode, addressCountry: site.address.country } : undefined,
 areaServed: site.region.confirmed ? site.region.description : undefined,
 openingHoursSpecification: confirmedHours.length ? confirmedHours.map(hour => ({ "@type": "OpeningHoursSpecification", dayOfWeek: hour.dayOfWeek, opens: hour.opens, closes: hour.closes })) : undefined,
 sameAs: site.instagram.confirmed && site.instagram.url ? [site.instagram.url] : undefined,
 };
 return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business).replace(/</g, "\\u003c") }} />;
}
