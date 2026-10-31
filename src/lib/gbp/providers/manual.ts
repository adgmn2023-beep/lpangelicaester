import { gbpManual } from "@/config/gbp-manual";
import { formatReviewDate } from "@/lib/relative-date";
import type { GbpProvider } from "../provider";

export const manualGbpProvider: GbpProvider = {
  async getSummary() {
    return {
      averageRating: gbpManual.summary.ratingAvg,
      totalReviews: gbpManual.summary.ratingCount,
      asOf: gbpManual.summary.asOf,
    };
  },
  async getReviews() {
    return gbpManual.reviews.map(({ date, ...review }) => ({
      ...review,
      relativeDate: formatReviewDate(date),
      date,
      dateApproximate: true,
    }));
  },
  async getPosts() {
    return gbpManual.posts;
  },
};
