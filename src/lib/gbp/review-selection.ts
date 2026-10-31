import type { GbpReview } from "./types";

export function cleanGoogleReview(text: string): string {
  const translated = "(Translated by Google)";
  const original = "(Original)";
  const trimmed = text.trim();
  const marker = trimmed.indexOf(translated);
  let result = trimmed;
  if (marker === 0) {
    const start = trimmed.indexOf(original, translated.length);
    result = start < 0 ? "" : trimmed.slice(start + original.length);
  } else if (marker > 0) {
    result = trimmed.slice(0, marker);
  }
  return result.replace(/\s+/gu, " ").trim();
}

export function selectReviews(reviews: GbpReview[], minimumStars = 4): GbpReview[] {
  return reviews.filter((review) => review.rating === 5 && review.rating >= minimumStars && review.text.trim())
    .sort((a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0)).slice(0, 12);
}
