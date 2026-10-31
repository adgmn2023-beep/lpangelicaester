import { site } from "@/config/site";
import { SectionHeading } from "./section-heading";

export function FaqSection() {
  return (
    <section className="bg-bg px-5 py-14 sm:px-8 md:py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Dúvidas frequentes"
          title="Respostas para você chegar com tranquilidade"
          centered
        />
        <div className="divide-y divide-line border-y border-line">
          {site.faq.map((item, index) => (
            <details key={item.question} open={index === 0} className="group py-1 open:bg-bg">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 py-5 text-left text-base font-semibold text-heading marker:hidden">
                <span>{item.question}</span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 shrink-0 text-bronze-dark transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </summary>
              <p className="max-w-2xl pb-5 text-base leading-7 text-muted">{item.answer}</p>
              <span className="sr-only">Pergunta {index + 1}</span>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
