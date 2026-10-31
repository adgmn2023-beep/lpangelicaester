import Image from "next/image";
import { PhotoSlot } from "@/components/photo-slot";
import { brand } from "@/config/brand";
import { BusinessJsonLd } from "@/components/business-json-ld";
import { FaqJsonLd, FaqSection } from "@/components/faq-section";
import { InstagramIcon, PinIcon, ServiceIcon } from "@/components/icons";
import { Carousel } from "@/components/carousel";
import { OpeningStatus } from "@/components/opening-status";
import { PostsSection } from "@/components/posts-section";
import { ResponsiveMap } from "@/components/responsive-map";
import { ReviewsSection } from "@/components/reviews-section";
import { SectionHeading } from "@/components/section-heading";
import { TrackedLink } from "@/components/tracked-links";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { site, confirmedHours } from "@/config/site";
import { gbpProvider, isMockGbpProvider } from "@/lib/gbp";
import { groupOpeningHours } from "@/lib/group-opening-hours";

// Next requires a statically analyzable literal here. Match the provider's default;
// GBP_REVALIDATE_SECONDS controls Google fetches and the server's snapshot cache.
export const revalidate = 1800;

function RatingBadge({ averageRating, totalReviews }: { averageRating: number; totalReviews: number }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1 text-[13px] font-semibold text-body">
      <span aria-hidden="true" className="text-bronze-dark">★</span>
      <span>{averageRating.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} · {totalReviews} avaliações no Google</span>
      {isMockGbpProvider && <span className="rounded-full bg-bg-soft px-2 text-[13px] text-muted">exemplo</span>}
    </span>
  );
}

function LocationSection({ hasPosts }: { hasPosts: boolean }) {
  return (
    <section id="localizacao" className={`${hasPosts ? "bg-bg-soft" : "bg-bg"} px-5 py-14 sm:px-8 md:py-24`}>
      <div className={`mx-auto grid max-w-6xl gap-8 ${site.map.confirmed ? "lg:grid-cols-2 lg:gap-16" : ""}`}>
        <div>
          <SectionHeading eyebrow="Onde me encontrar" title="Meu consultório em Campo Grande" description="Atendimento individual e personalizado." />
          <p className="mb-4 text-base leading-7 text-muted">{site.region.description}</p>
          <div className="space-y-6 text-base leading-7 text-muted">
            <div className="flex gap-3">
              <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-soft"><PinIcon className="h-6 w-6 text-bronze-dark" /></span>
              <div>
                <p className="font-semibold text-heading">{site.address.full}</p>
                {site.address.reference.confirmed && <p>{site.address.reference.value}</p>}
                {site.parking.confirmed && <p>{site.parking.value}</p>}
              </div>
            </div>
            {confirmedHours.length > 0 && <div><p className="font-semibold text-heading">Meus horários</p><ul className="mt-2 space-y-1">{confirmedHours.map(hour => <li key={hour.dayIndex} className="flex max-w-xs justify-between gap-6"><span>{hour.label}</span><span>{hour.closed ? "Fechado" : `${hour.opens} às ${hour.closes}`}</span></li>)}</ul></div>}
            {site.payment.confirmed && <p>{site.payment.value}</p>}{site.accessibility.confirmed && <p>{site.accessibility.value}</p>}
            {site.instagram.confirmed && <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-2 text-bronze-dark"><InstagramIcon className="h-5 w-5" />{site.instagram.handle}</a>}
          </div>
        </div>
        {site.map.confirmed && site.map.embedSrc && <ResponsiveMap embedUrl={site.map.embedSrc} mapsUrl={site.google.directionsUrl} placeUrl={site.google.placeUrl} />}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="theme-dark bg-ink px-5 py-14 sm:px-8 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.2em] text-bronze-light">Fale comigo</p>
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">Seu próximo passo pode começar com uma conversa.</h2>
          <p className="mt-4 text-lg leading-7 text-on-ink">Me chame no WhatsApp para conversar comigo sobre o atendimento.</p>
        </div>
        <WhatsAppCta className="inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-3 rounded-full bg-primary px-7 font-semibold text-ink transition hover:bg-rose md:w-auto" />
      </div>
    </section>
  );
}

function Footer() {
  const hours = groupOpeningHours(site.openingHours);
  return (
    <footer className="theme-dark border-t border-primary/25 bg-ink px-5 py-10 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-6 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-2xl md:col-start-1 md:row-start-1">
          <p className="font-display text-2xl text-muted-on-ink">{site.name}</p>
          <p className="mt-2 text-base text-muted-on-ink">{site.address.full}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-muted-on-ink">
            {site.instagram.confirmed && site.instagram.url && <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 hover:text-on-ink"><InstagramIcon className="h-5 w-5" />{site.instagram.handle}</a>}
            <a href={site.privacyPath} className="inline-flex min-h-12 items-center hover:text-on-ink">Privacidade</a>
          </div>
        </div>
        <div className="text-base text-muted-on-ink md:col-start-2 md:row-span-2 md:row-start-1">
          {hours.length > 0 && <div><p className="text-sm font-semibold text-on-ink">Horário de atendimento</p><ul className="mt-2 space-y-1 leading-7">{hours.map(hour => <li key={hour}>{hour}</li>)}</ul></div>}
        </div>
        <p className="text-[13px] leading-6 text-muted-on-ink md:col-start-1 md:row-start-2">© {new Date().getFullYear()} {site.name}. Conteúdo informativo.</p>
      </div>
    </footer>
  );
}

export default async function HomePage() {
  const [summary, allReviews, posts] = await Promise.all([
    gbpProvider.getSummary(), gbpProvider.getReviews(), gbpProvider.getPosts(),
  ]);
  const configuredMinStars = Number.parseInt(process.env.GBP_MIN_STARS || "4", 10);
  const minStars = Number.isFinite(configuredMinStars) ? Math.min(5, Math.max(1, configuredMinStars)) : 4;
  const reviews = allReviews.filter((review) => review.rating >= minStars);

  const heroSizes = "(min-width: 1280px) 480px, (min-width: 1024px) calc(46vw - 55.2px), (min-width: 640px) min(calc(100vw - 64px), 48svh), min(calc(100vw - 40px), 48svh)";

  return (
    <>
      <BusinessJsonLd />
      <FaqJsonLd />
      <header className="sticky top-0 z-40 border-b border-bronze bg-bg px-5 sm:px-8">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-2 md:min-h-28">
          <a href="#inicio" className="flex min-h-12 items-center gap-2" aria-label={`${site.brand}, início`}>
            {brand.logo ? <Image src={brand.logo} width={brand.width} height={brand.height} alt={site.brand} priority className="h-16 w-auto object-contain md:h-[88px]" /> : <span className="font-display text-xl">{site.brand}</span>}
          </a>
          <WhatsAppCta className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-ink transition hover:bg-rose sm:px-5 sm:text-base" />
        </div>
      </header>
      <main>
        <section id="inicio" className="overflow-hidden bg-bg px-5 pb-14 pt-5 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-bronze-dark bg-transparent px-3 py-1 text-[13px] font-semibold text-bronze-dark">Campo Grande, Rio de Janeiro</p>
              <h1 className="max-w-2xl font-display text-[2rem] font-semibold leading-[1.12] tracking-tight text-heading sm:text-5xl lg:text-[3.25rem]">
                Esteticista em Campo Grande, RJ
              </h1>
              <p className="mt-3 max-w-xl text-lg leading-[1.5] text-body lg:mt-5 lg:leading-8">
                Eu atendo em estética facial e corporal, com atendimento individual e personalizado.
              </p>
              <WhatsAppCta className="mt-5 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-ink/10 bg-primary px-5 text-base font-semibold text-ink transition hover:bg-rose lg:w-auto lg:px-7" />
              <div className="mt-3" data-hero-address>
                <p className="flex items-start gap-2 text-base leading-6 text-muted"><PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-bronze-dark" /><span>{site.address.streetAddress} · Campo Grande, RJ</span></p>
                {confirmedHours.length > 0 && <OpeningStatus hours={confirmedHours} />}
              </div>
              <div className="mt-2 flex flex-wrap gap-2" aria-label="Sobre meu atendimento">
                {summary && summary.totalReviews > 0 && <RatingBadge averageRating={summary.averageRating} totalReviews={summary.totalReviews} />}
                <span className="inline-flex min-h-9 items-center rounded-full border border-line bg-bg px-3 py-1 text-[13px] text-body">Atendimento com hora marcada</span>
              </div>
            </div>
            <PhotoSlot photo={site.photos.hero} sizes={heroSizes} priority shape="rounded" aspectRatio="0.72" className="mx-auto w-full max-w-[min(100%,48svh)] lg:max-w-[480px]" />
          </div>
        </section>

        <section id="servicos" className="bg-bg px-5 py-14 sm:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Como posso ajudar" title="Estética facial e corporal" description="Eu avalio cada situação com atenção e explico as possibilidades de cuidado de forma clara." />
            <Carousel label="Serviços de estética facial e corporal">
              {site.services.filter(service => service.confirmed).map((service) => (
                <article key={service.title} className="rounded-3xl border border-line bg-bg transition hover:shadow-card sm:h-full">
                  <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-3xl p-4 focus-visible:outline-2 focus-visible:outline-bronze-dark sm:flex sm:h-full sm:flex-col sm:items-start sm:gap-3 sm:p-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-soft text-bronze-dark"><ServiceIcon kind={service.icon} className="h-6 w-6" /></span>
                    <h3 className="font-display text-xl font-semibold text-heading md:text-2xl">{service.title}</h3>
                    <p className="col-span-2 text-base leading-6 text-muted">{service.description}</p>
                    <div className="col-span-2 pt-2 sm:mt-auto"><WhatsAppCta label="Quero saber mais" message={`Olá, vim do site e gostaria de mais informações sobre ${service.title}.`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-ink transition hover:bg-rose" /></div>
                  </div>
                </article>
              ))}
            </Carousel>
            <p className="mt-6 text-[13px] leading-6 text-muted">{site.baseText}</p>
            <div className="mt-7 text-center"><WhatsAppCta className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-ink transition hover:bg-rose sm:w-auto" /></div>
          </div>
        </section>

        <section id="sobre" className="bg-bg-soft px-5 py-14 sm:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-16">
            <figure className="mx-auto w-full max-w-md"><PhotoSlot photo={site.photos.about} sizes="(min-width: 1280px) 448px, (min-width: 768px) 40vw, 90vw" /></figure>
            <div>
              <SectionHeading eyebrow={`Prazer, eu sou ${site.professionalName}`} title="Cuidado que começa pela escuta" />
              <div className="space-y-4 text-lg leading-8 text-muted">{site.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              <WhatsAppCta className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-bronze-dark px-6 font-semibold text-bronze-dark transition hover:bg-bg" />
            </div>
          </div>
        </section>

        <section className="bg-bg px-5 py-14 sm:px-8 md:py-24">
          <div className="mx-auto max-w-6xl"><SectionHeading eyebrow="Sem complicação" title="Como funciona o atendimento" centered /><ol className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{site.process.map((step, index) => <li key={step.title}><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-soft font-display text-xl text-bronze-dark">{index + 1}</span><h3 className="font-display text-xl text-heading">{step.title}</h3><p className="mt-2 text-base leading-7 text-muted">{step.description}</p></li>)}</ol></div>
        </section>
        <ReviewsSection reviews={reviews} isMock={isMockGbpProvider} />
        <PostsSection posts={posts} isMock={isMockGbpProvider} />
        <LocationSection hasPosts={posts.length > 0} />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
      <WhatsAppCta className="fixed bottom-6 right-6 z-50 hidden min-h-14 items-center justify-center gap-2 rounded-full border border-bronze-dark bg-primary px-5 font-semibold text-ink shadow-card transition hover:bg-rose md:inline-flex" />

      <nav aria-label="Contato rápido" className="mobile-contact fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg md:hidden">
        <div className="mx-auto grid min-h-[55px] max-w-lg grid-cols-[minmax(0,1fr)_100px] items-center gap-2 px-2">
          <WhatsAppCta showIcon={false} className="flex min-h-12 items-center justify-center rounded-full bg-primary px-2 text-[13px] font-semibold text-ink" />
          <TrackedLink href={site.google.directionsUrl} action="directions" external className="flex min-h-12 items-center justify-center rounded-full border border-bronze-dark text-[13px] font-semibold text-bronze-dark">Como chegar</TrackedLink>
        </div>
      </nav>
    </>
  );
}
