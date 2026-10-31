import { gbpProviderName, getGbpSnapshot } from "@/lib/gbp";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getGbpSnapshot();
  return Response.json({
    provider: gbpProviderName,
    source: data.source,
    reviews: data.reviews.length,
    posts: data.posts.length,
    rating: data.summary.totalReviews > 0 ? data.summary.averageRating : null,
    total: data.summary.totalReviews,
    ok: gbpProviderName !== "google" || data.source === "google",
  }, { headers: { "Cache-Control": "no-store" } });
}
