import type { GbpPost, GbpReview, GbpSummary } from "./types";

export interface GbpProvider {
  getSummary(): Promise<GbpSummary>;
  getReviews(): Promise<GbpReview[]>;
  getPosts(): Promise<GbpPost[]>;
}
