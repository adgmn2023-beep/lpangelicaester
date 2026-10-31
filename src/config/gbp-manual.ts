import type { GbpPost, GbpReview } from "@/lib/gbp/types";
// Zero representa ausência de nota e total no contrato do provider.
export const gbpManual = { summary: { ratingAvg: 0, ratingCount: 0, asOf: "" }, reviews: [] as (GbpReview & { date: string })[], posts: [] as GbpPost[] };
