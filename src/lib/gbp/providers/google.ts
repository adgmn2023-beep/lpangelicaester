import "server-only";

import { site } from "@/config/site";
import { formatReviewDate } from "@/lib/relative-date";
import type { GbpProvider } from "../provider";
import type { GbpPost, GbpReview, GbpSnapshot, GbpSummary } from "../types";
import { cleanGoogleReview, selectReviews } from "../review-selection";
import { manualGbpProvider } from "./manual";

const configuredRevalidateSeconds = Number(process.env.GBP_REVALIDATE_SECONDS);
const REVALIDATE = Number.isInteger(configuredRevalidateSeconds) && configuredRevalidateSeconds >= 300 && configuredRevalidateSeconds <= 86_400
  ? configuredRevalidateSeconds
  : 1_800;
const stars: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
let token: { value: string; expiresAt: number } | undefined;
let pendingToken: Promise<string> | undefined;
let snapshot: { data: GbpSnapshot; expiresAt: number } | undefined;
let pendingSnapshot: Promise<GbpSnapshot> | undefined;

function invalid(): never {
  // Never include a response, request, credential or identifier in an error.
  throw new Error("GBP unavailable");
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const result = value as Record<string, unknown>;
  if ("error" in result) invalid();
  return result;
}

function string(value: unknown): string {
  if (typeof value !== "string") invalid();
  return value;
}

function optionalString(value: unknown): string {
  return value === undefined ? "" : string(value);
}

function list(value: unknown): unknown[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) invalid();
  return value;
}

function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) invalid();
  return value;
}

function timestamp(value: unknown): number {
  const result = Date.parse(string(value));
  if (!Number.isFinite(result)) invalid();
  return result;
}

function dateLabel(time: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(time));
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
}

function safeUrl(value: unknown): string {
  const input = optionalString(value);
  if (!input) return "";
  try {
    const url = new URL(input);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.toString() : "";
  } catch {
    return "";
  }
}

function minStars(): number {
  const value = Number.parseInt(process.env.GBP_MIN_STARS || "4", 10);
  return Number.isFinite(value) ? Math.min(5, Math.max(1, value)) : 4;
}

function maxPostAge(): number {
  const value = Number(process.env.GBP_POSTS_MAX_AGE_DAYS || "365");
  return Number.isFinite(value) && value >= 0 ? value : 365;
}

function configuration() {
  const clientId = process.env.GBP_CLIENT_ID;
  const clientSecret = process.env.GBP_CLIENT_SECRET;
  const refreshToken = process.env.GBP_REFRESH_TOKEN;
  const account = process.env.GBP_ACCOUNT_ID;
  const location = process.env.GBP_LOCATION_ID;
  if (!clientId || !clientSecret || !refreshToken || !account || !location || !/^\d+$/.test(account) || !/^\d+$/.test(location)) invalid();
  return { clientId, clientSecret, refreshToken, account, location };
}

async function accessToken(config: ReturnType<typeof configuration>): Promise<string> {
  if (token && Date.now() < token.expiresAt) return token.value;
  if (pendingToken) return pendingToken;
  pendingToken = (async () => {
    const started = Date.now();
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, refresh_token: config.refreshToken, grant_type: "refresh_token" }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) invalid();
    const payload = record(await response.json());
    const value = string(payload.access_token);
    const lifetime = number(payload.expires_in);
    if (!value || lifetime <= 0) invalid();
    token = { value, expiresAt: started + lifetime * 1000 - 60_000 };
    return value;
  })();
  try {
    return await pendingToken;
  } finally {
    pendingToken = undefined;
  }
}

async function get(url: string, bearer: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${bearer}` },
    next: { revalidate: REVALIDATE },
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    if (response.status === 401) token = undefined;
    invalid();
  }
  return record(await response.json());
}

function readReviews(payload: Record<string, unknown>): { summary: GbpSummary; reviews: GbpReview[] } {
  const total = number(payload.totalReviewCount);
  const average = payload.averageRating === undefined && total === 0 ? 0 : number(payload.averageRating);
  if (!Number.isInteger(total) || total < 0 || average < 0 || average > 5) invalid();
  if (total > 0 && payload.reviews === undefined) invalid();
  const reviews: GbpReview[] = [];
  for (const value of list(payload.reviews)) {
    const review = record(value);
    const text = cleanGoogleReview(optionalString(review.comment));
    if (!text.trim()) continue;
    const star = string(review.starRating);
    if (!Object.hasOwn(stars, star)) invalid();
    const rating = stars[star];
    const reviewer = record(review.reviewer);
    if (reviewer.isAnonymous !== undefined && typeof reviewer.isAnonymous !== "boolean") invalid();
    const names = optionalString(reviewer.displayName).trim().split(/\s+/u).filter(Boolean);
    const authorName = reviewer.isAnonymous || !names.length ? "Cliente do Google" : names.length === 1 ? names[0] : `${names[0]} ${Array.from(names[names.length - 1])[0]}.`;
    const created = timestamp(review.createTime);
    const date = new Date(created).toISOString();
    const reply = review.reviewReply === undefined ? undefined : optionalString(record(review.reviewReply).comment);
    const id = string(review.reviewId);
    if (!id) invalid();
    if (rating >= minStars()) reviews.push({ id, authorName, rating, text, date, relativeDate: formatReviewDate(dateLabel(created)), ...(reply ? { ownerReply: reply } : {}) });
  }
  return { summary: { averageRating: average, totalReviews: total }, reviews: selectReviews(reviews, minStars()) };
}

function readPosts(payload: Record<string, unknown>): GbpPost[] {
  const now = Date.now();
  const oldest = now - maxPostAge() * 86_400_000;
  return list(payload.localPosts).map(record).filter((post) => post.state === "LIVE").map((post) => ({ post, time: timestamp(post.createTime) }))
    .filter(({ time }) => time >= oldest && time <= now)
    .sort((a, b) => b.time - a.time).slice(0, 8).map(({ post, time }, index) => {
      const text = optionalString(post.summary);
      const media = list(post.media);
      const image = media.length ? safeUrl(record(media[0]).googleUrl) : "";
      const searchUrl = safeUrl(post.searchUrl);
      const ctaUrl = post.callToAction === undefined ? "" : safeUrl(record(post.callToAction).url);
      const date = dateLabel(time);
      return { id: `google-post-${time}-${index}`, text, image, imageAlt: "Publicação do consultório da Angélica Ester", relativeDate: formatReviewDate(date), date, searchUrl, ctaUrl, ctaLabel: "Saiba mais" };
    });
}

function timeOfDay(value: unknown): number {
  const time = record(value);
  const hours = number(time.hours ?? 0);
  const minutes = number(time.minutes ?? 0);
  const seconds = number(time.seconds ?? 0);
  const nanos = number(time.nanos ?? 0);
  if (!Number.isInteger(hours) || hours < 0 || hours > 24 || !Number.isInteger(minutes) || minutes < 0 || minutes > 59 || !Number.isInteger(seconds) || seconds < 0 || seconds >= 60 || !Number.isInteger(nanos) || nanos < 0 || nanos >= 1e9 || (hours === 24 && (minutes || seconds || nanos))) invalid();
  return hours * 60 + minutes + seconds / 60 + nanos / 60e9;
}

function compareHours(payload: Record<string, unknown>): void {
  if (!site.openingHours.some(hour => hour.confirmed)) return;
  const periods = payload.regularHours === undefined ? [] : list(record(payload.regularHours).periods);
  const actual = periods.map((value) => {
    const period = record(value);
    const openDay = days.indexOf(string(period.openDay));
    const closeDay = days.indexOf(string(period.closeDay));
    if (openDay < 0 || closeDay < 0) invalid();
    return `${openDay}:${timeOfDay(period.openTime)}:${closeDay}:${timeOfDay(period.closeTime)}`;
  }).sort();
  const expected = site.openingHours.filter(hour => hour.confirmed && !hour.closed).map((hour) => {
    const minutes = (value: string) => { const [h, m] = value.split(":").map(Number); return h * 60 + m; };
    return `${hour.dayIndex}:${minutes(hour.opens)}:${hour.dayIndex}:${minutes(hour.closes)}`;
  }).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.warn("GBP: horários divergentes; os horários configurados no site foram mantidos.");
  }
}

async function load(): Promise<GbpSnapshot> {
  try {
    const config = configuration();
    const bearer = await accessToken(config);
    // Only the configured account/location is ever read; no discovery/listing calls.
    const base = `https://mybusiness.googleapis.com/v4/accounts/${config.account}/locations/${config.location}`;
    const [reviews, posts, hours] = await Promise.all([
      get(`${base}/reviews?pageSize=50&orderBy=updateTime%20desc`, bearer),
      get(`${base}/localPosts?pageSize=20`, bearer),
      get(`https://mybusinessbusinessinformation.googleapis.com/v1/locations/${config.location}?readMask=regularHours`, bearer),
    ]);
    const data = readReviews(reviews);
    const mappedPosts = readPosts(posts);
    compareHours(hours);
    return { ...data, posts: mappedPosts, source: "google" };
  } catch {
    const [summary, reviews, posts] = await Promise.all([manualGbpProvider.getSummary(), manualGbpProvider.getReviews(), manualGbpProvider.getPosts()]);
    return { summary, reviews: selectReviews(reviews, minStars()), posts, source: "manual-fallback" };
  }
}

export async function getGoogleSnapshot(): Promise<GbpSnapshot> {
  if (snapshot && Date.now() < snapshot.expiresAt) return snapshot.data;
  if (pendingSnapshot) return pendingSnapshot;
  pendingSnapshot = load();
  try {
    const data = await pendingSnapshot;
    snapshot = { data, expiresAt: Date.now() + (data.source === "google" ? REVALIDATE : 60) * 1000 };
    return data;
  } finally {
    pendingSnapshot = undefined;
  }
}

export const googleGbpProvider: GbpProvider = {
  async getSummary() { return (await getGoogleSnapshot()).summary; },
  async getReviews() { return (await getGoogleSnapshot()).reviews; },
  async getPosts() { return (await getGoogleSnapshot()).posts; },
};
