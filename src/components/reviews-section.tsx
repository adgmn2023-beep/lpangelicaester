import type { GbpReview } from "@/lib/gbp";
import { site } from "@/config/site";
import { SectionHeading } from "./section-heading";
import { ArrowUpRightIcon } from "./icons";
import { Carousel } from "./carousel";
import { selectReviews } from "@/lib/gbp/review-selection";
import { ReviewText } from "./review-content";

type ReviewsSectionProps = {
  reviews: GbpReview[];
  isMock: boolean;
};

export function ReviewsSection({ reviews, isMock }: ReviewsSectionProps) {
  reviews = selectReviews(reviews);
  if (!reviews.length) return null;

  return (
    <section id="avaliacoes" className="min-w-0 overflow-hidden bg-bg-soft px-5 py-14 sm:px-8 md:py-24">
      <div className="mx-auto min-w-0 max-w-6xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Quem já veio"
            title="Palavras de quem confia no meu cuidado"
            description="Cada experiência é única. Veja alguns relatos compartilhados por quem já passou pelo meu consultório."
          />
          <div className="flex flex-wrap gap-2 md:mb-14">
            {site.google.reviewsUrl && (
              <a className="inline-flex min-h-12 items-center gap-2 text-base font-semibold text-heading underline decoration-line underline-offset-4 hover:text-accent" href={site.google.reviewsUrl} target="_blank" rel="noreferrer">
                Ver todas no Google <ArrowUpRightIcon className="h-4 w-4" />
              </a>
            )}
            {site.google.writeReviewUrl && (
              <a className="inline-flex min-h-12 items-center gap-2 text-base font-semibold text-heading underline decoration-line underline-offset-4 hover:text-accent" href={site.google.writeReviewUrl} target="_blank" rel="noreferrer">
                Deixar sua avaliação <ArrowUpRightIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        {isMock && <p className="mb-5 text-[13px] text-muted">Dados de exemplo — avaliações demonstrativas.</p>}
        <Carousel label="Avaliações de pacientes">
          {reviews.map((review) => (
            <article key={review.id} className="w-full min-w-0 rounded-3xl border border-line bg-bg p-4 shadow-card sm:p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-lg tracking-[0.12em] text-bronze-dark" aria-label={`${review.rating} de 5 estrelas`}>
                  {"★".repeat(review.rating)}
                </span>
              </div>
              <ReviewText text={review.text} />
              {review.ownerReply && (
                <div className="mt-4 rounded-2xl bg-bg-soft p-4">
                  <p className="mb-1 text-[13px] font-bold text-heading">Minha resposta</p>
                  <ReviewText text={review.ownerReply} lines={3} />
                </div>
              )}
              <p className="mt-4 border-t border-line pt-3 text-base font-semibold text-heading">{review.authorName}</p>
            </article>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
