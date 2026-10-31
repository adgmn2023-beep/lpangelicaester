export type GbpSummary = {
  averageRating: number;
  totalReviews: number;
  asOf?: string;
};

export type GbpReview = {
  id: string;
  authorName: string;
  rating: number;
  relativeDate: string;
  text: string;
  ownerReply?: string;
  date?: string;
  dateApproximate?: boolean;
};

export type GbpPost = {
  id: string;
  image: string;
  imageAlt: string;
  text: string;
  relativeDate: string;
  ctaLabel: string;
  ctaUrl: string;
  searchUrl?: string;
  date?: string;
};

export type GbpSnapshot = {
  summary: GbpSummary;
  reviews: GbpReview[];
  posts: GbpPost[];
  source: "google" | "manual-fallback";
};
