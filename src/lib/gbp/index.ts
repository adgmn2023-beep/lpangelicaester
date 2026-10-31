import type { GbpProvider } from "./provider";
import { mockGbpProvider } from "./providers/mock";
import { manualGbpProvider } from "./providers/manual";
import { getGoogleSnapshot, googleGbpProvider } from "./providers/google";
import type { GbpSnapshot } from "./types";

const providers: Record<string, GbpProvider> = {
  manual: manualGbpProvider,
  mock: mockGbpProvider,
  google: googleGbpProvider,
};

const providerName = process.env.GBP_PROVIDER || "manual";
const provider = providers[providerName];

if (!provider) {
  throw new Error(
    `GBP_PROVIDER "${providerName}" is not supported. Available providers: ${Object.keys(providers).join(", ")}.`,
  );
}

export const gbpProvider = provider;
export const isMockGbpProvider = providerName === "mock";
export const gbpProviderName = providerName;

export async function getGbpSnapshot(): Promise<GbpSnapshot> {
  if (providerName === "google") return getGoogleSnapshot();
  const [summary, reviews, posts] = await Promise.all([provider.getSummary(), provider.getReviews(), provider.getPosts()]);
  return { summary, reviews, posts, source: "manual-fallback" };
}

export type { GbpProvider } from "./provider";
export type { GbpPost, GbpReview, GbpSummary } from "./types";
