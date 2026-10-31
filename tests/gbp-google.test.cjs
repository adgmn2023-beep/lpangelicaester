const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.resolve(__dirname, "..");
const initialTime = Date.parse("2026-10-24T15:00:00Z");
const defaults = {
  GBP_PROVIDER: "google", GBP_CLIENT_ID: "test-client", GBP_CLIENT_SECRET: "test-secret",
  GBP_REFRESH_TOKEN: "test-refresh", GBP_ACCOUNT_ID: "123456", GBP_LOCATION_ID: "987654",
  GBP_MIN_STARS: "4", GBP_POSTS_MAX_AGE_DAYS: "7",
};

function harness(overrides = {}) {
  let now = initialTime;
  class Clock extends Date {
    constructor(value) { super(arguments.length ? value : now); }
    static now() { return now; }
  }
  const env = { ...defaults, ...overrides };
  const calls = [], warnings = [], modules = new Map();
  const state = { failure: undefined, failPath: undefined, malformed: undefined, expires: 3600, mismatchedHours: false };
  const review = (id, extra = {}) => ({
    reviewId: id, reviewer: { displayName: "Ursula Maria Silva", profilePhotoUrl: "https://example.test/private-photo" },
    starRating: "FIVE", comment: "Excelente atendimento.", createTime: "2026-10-23T15:00:00Z", ...extra,
  });
  const reviews = [review("first", { reviewReply: { comment: "Obrigada!" } }), review("anonymous", { reviewer: { isAnonymous: true, displayName: "Hidden Person" } }), review("low", { starRating: "THREE" }), review("no-comment", { comment: "  " }), review("single", { reviewer: { displayName: "Ana" }, starRating: "FOUR" })];
  const post = (id, days, extra = {}) => ({
    state: "LIVE", summary: `Post ${id}`, createTime: new Date(initialTime - days * 86_400_000).toISOString(),
    media: [{ googleUrl: `https://example.test/${id}.jpg` }], searchUrl: `https://www.google.com/search?q=post-${id}`,
    callToAction: { url: `https://example.test/${id}` }, ...extra,
  });
  const posts = [post("old", 8), post("third", 3), post("draft", 0, { state: "PROCESSING" }), post("first", 1), post("fourth", 4), post("second", 2, { media: [] }), post("future", -1)];

  function load(file) {
    const absolute = path.resolve(root, file);
    if (modules.has(absolute)) return modules.get(absolute).exports;
    const module = { exports: {} };
    modules.set(absolute, module);
    const source = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    function localRequire(name) {
      // The Next production build separately verifies the real server-only boundary.
      if (name === "server-only") return {};
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? path.join(root, "src", name.slice(2)) : path.resolve(path.dirname(absolute), name);
        const resolved = [base + ".ts", base + ".tsx", path.join(base, "index.ts")].find(fs.existsSync);
        if (!resolved) throw new Error("Missing test module");
        return load(resolved);
      }
      return require(name);
    }
    vm.runInNewContext(source, {
      module, exports: module.exports, require: localRequire, process: { env, cwd: () => root }, Date: Clock,
      Intl, URL, URLSearchParams, Response, AbortSignal,
      console: { warn: (...args) => warnings.push(args.join(" ")) },
      fetch: async (url, options) => {
        calls.push({ url, options });
        if (state.failure === "network") throw new Error("Sensitive upstream error must never be logged");
        if (url === "https://oauth2.googleapis.com/token") {
          if (state.failure === "token") return Response.json({ error: "secret error" }, { status: 400 });
          return Response.json({ access_token: "test-access", expires_in: state.expires });
        }
        if (typeof state.failure === "number" && (!state.failPath || url.includes(state.failPath))) return Response.json({ error: "private error" }, { status: state.failure });
        if (state.failure === "json") return new Response("invalid json");
        if (url.includes("/reviews?")) return Response.json(state.malformed ?? { averageRating: 4.9, totalReviewCount: 161, reviews });
        if (url.includes("/localPosts?")) return Response.json({ localPosts: posts });
        if (url.includes("readMask=regularHours")) {
          const site = load("src/config/site.ts").site;
          return Response.json({ regularHours: { periods: site.openingHours.filter(h => h.confirmed && !h.closed).map((h) => {
            const [openH, openM] = h.opens.split(":").map(Number), [closeH, closeM] = h.closes.split(":").map(Number);
            return { openDay: h.dayOfWeek.toUpperCase(), closeDay: h.dayOfWeek.toUpperCase(), openTime: { hours: openH, minutes: openM }, closeTime: { hours: state.mismatchedHours ? closeH + 1 : closeH, minutes: closeM } };
          }) } });
        }
        throw new Error("Unexpected URL");
      },
    }, { filename: absolute });
    return module.exports;
  }
  return { env, calls, warnings, state, reviews, posts, load, advance: (ms) => { now += ms; } };
}

test("maps Google data, anonymizes names, filters reviews/posts and reads only the configured location", async () => {
  const h = harness();
  const provider = h.load("src/lib/gbp/providers/google.ts");
  const [summary, reviews, posts] = await Promise.all([provider.googleGbpProvider.getSummary(), provider.googleGbpProvider.getReviews(), provider.googleGbpProvider.getPosts()]);
  assert.equal(summary.averageRating, 4.9); assert.equal(summary.totalReviews, 161);
  assert.deepEqual(Array.from(reviews, (r) => r.authorName), ["Ursula S.", "Cliente do Google"]);
  assert.equal(reviews[0].ownerReply, "Obrigada!"); assert.equal(reviews[0].relativeDate, "há 1 dia");
  assert(!JSON.stringify(reviews).includes("profilePhoto")); assert(!JSON.stringify(reviews).includes("Hidden Person"));
  assert.deepEqual(Array.from(posts, (p) => p.text), ["Post first", "Post second", "Post third", "Post fourth"]);
  assert.equal(posts[1].image, ""); assert.equal(posts[0].searchUrl, "https://www.google.com/search?q=post-first");
  assert.equal(posts[0].ctaUrl, "https://example.test/first");
  assert.equal(h.calls.length, 4); assert.equal(h.warnings.length, 0);
  const token = h.calls[0]; assert.equal(token.options.method, "POST"); assert.equal(token.options.cache, "no-store");
  assert.equal(token.options.body.get("grant_type"), "refresh_token"); assert.equal(token.options.body.get("client_id"), "test-client");
  assert.equal(token.options.body.get("client_secret"), "test-secret"); assert.equal(token.options.body.get("refresh_token"), "test-refresh");
  for (const call of h.calls.slice(1)) {
    assert.equal(call.options.next.revalidate, 1800); assert.equal(call.options.headers.Authorization, "Bearer test-access");
    assert(call.url.startsWith("https://mybusiness.googleapis.com/v4/accounts/123456/locations/987654/") || call.url === "https://mybusinessbusinessinformation.googleapis.com/v1/locations/987654?readMask=regularHours");
  }
  assert(h.calls.some((c) => new URL(c.url).searchParams.get("orderBy") === "updateTime desc"));
  await provider.getGoogleSnapshot(); assert.equal(h.calls.length, 4);
});

test("honors minimum stars and post age, and handles zero reviews and empty posts", async () => {
  const h = harness({ GBP_MIN_STARS: "5", GBP_POSTS_MAX_AGE_DAYS: "1" });
  const data = await h.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot();
  assert.equal(data.reviews.length, 2); assert.equal(data.posts.length, 1);
  const empty = harness(); empty.state.malformed = { totalReviewCount: 0 }; empty.posts.length = 0;
  const snapshot = await empty.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot();
  assert.equal(snapshot.source, "google"); assert.equal(snapshot.summary.averageRating, 0); assert.equal(snapshot.reviews.length, 0); assert.equal(snapshot.posts.length, 0);
});

test("reuses valid tokens and refreshes 60 seconds before expiry; concurrent reads share one snapshot", async () => {
  for (const expires of [86400, 1860]) {
    const h = harness(); h.state.expires = expires;
    const google = h.load("src/lib/gbp/providers/google.ts");
    await Promise.all(Array.from({ length: 8 }, () => google.getGoogleSnapshot()));
    assert.equal(h.calls.length, 4);
    h.advance(1_800_000);
    await google.getGoogleSnapshot();
    assert.equal(h.calls.filter((c) => c.url.endsWith("/token")).length, expires === 86400 ? 1 : 2);
  }
});

test("uses the configured Google cache interval for all data fetches and the snapshot, with validated bounds", async () => {
  const cases = [
    [undefined, 1800], ["", 1800], [" ", 1800], ["invalid", 1800],
    ["299", 1800], ["86401", 1800], ["-300", 1800], ["300.5", 1800],
    ["NaN", 1800], ["Infinity", 1800], ["1800seconds", 1800],
    ["300", 300], ["1800", 1800], ["7200", 7200], ["86400", 86400],
  ];
  for (const [configured, expected] of cases) {
    const h = harness({ GBP_REVALIDATE_SECONDS: configured });
    const google = h.load("src/lib/gbp/providers/google.ts");
    await google.getGoogleSnapshot();
    h.advance(expected * 1000 - 1);
    await google.getGoogleSnapshot();
    assert.equal(h.calls.filter((call) => call.url.includes("/reviews?")).length, 1, `cached until ${expected}s`);
    h.advance(1);
    await google.getGoogleSnapshot();
    assert.equal(h.calls.filter((call) => call.url.includes("/reviews?")).length, 2, `expires at ${expected}s`);
    for (const call of h.calls) {
      if (call.url.endsWith("/token")) {
        assert.equal(call.options.cache, "no-store");
        assert.equal(call.options.next, undefined);
      } else assert.equal(call.options.next.revalidate, expected, `configuration: ${configured}`);
    }
  }
});

for (const failure of ["network", "token", "json", 401, 403, 429, 500]) {
  test(`atomic manual fallback on ${failure}, without logging errors or credentials`, async () => {
    const h = harness(); h.state.failure = failure;
    const google = h.load("src/lib/gbp/providers/google.ts");
    const result = await google.getGoogleSnapshot();
    assert.equal(result.source, "manual-fallback"); assert.equal(result.summary.averageRating, 0); assert.equal(result.reviews.length, 0); assert.equal(result.posts.length, 0);
    assert.equal(h.warnings.length, 0);
    const count = h.calls.length; h.state.failure = undefined;
    await google.getGoogleSnapshot(); assert.equal(h.calls.length, count);
    h.advance(60_001); assert.equal((await google.getGoogleSnapshot()).source, "google");
  });
}

test("rejects malformed payloads and invalid location IDs without reading other locations", async () => {
  for (const value of [{}, { averageRating: 6, totalReviewCount: 161 }, { averageRating: 5, totalReviewCount: 161, reviews: "wrong" }, { averageRating: 5, totalReviewCount: 161, reviews: [{ comment: "Text", starRating: "toString" }] }]) {
    const h = harness(); h.state.malformed = value;
    assert.equal((await h.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot()).source, "manual-fallback");
  }
  for (const env of [{ GBP_LOCATION_ID: "locations/other" }, { GBP_ACCOUNT_ID: "accounts/other" }, { GBP_REFRESH_TOKEN: "" }]) {
    const h = harness(env); const result = await h.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot();
    assert.equal(result.source, "manual-fallback"); assert.equal(h.calls.length, 0);
  }
});

test("a failure confined to posts or hours still switches the entire snapshot to manual", async () => {
  for (const failPath of ["/reviews?", "/localPosts?", "readMask=regularHours"]) {
    const h = harness(); h.state.failure = 403; h.state.failPath = failPath;
    const data = await h.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot();
    assert.equal(data.source, "manual-fallback"); assert.equal(data.summary.averageRating, 0);
    assert.equal(data.reviews.length, 0); assert.equal(data.posts.length, 0);
  }
});

test("invalid live-post timestamps fall back, and unsafe media/action URLs are never rendered", async () => {
  const bad = harness(); bad.posts[0] = { state: "LIVE", createTime: "invalid" };
  assert.equal((await bad.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot()).source, "manual-fallback");
  const safe = harness();
  safe.posts.splice(0, safe.posts.length, { state: "LIVE", summary: "Publicação", createTime: "2026-10-23T15:00:00Z", media: [{ googleUrl: "javascript:alert(1)" }], searchUrl: "data:text/html,unsafe", callToAction: { url: "https://user:password@example.test" } });
  const snapshot = await safe.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot();
  assert.equal(snapshot.source, "google"); assert.equal(snapshot.posts[0].image, "");
  assert.equal(snapshot.posts[0].searchUrl, ""); assert.equal(snapshot.posts[0].ctaUrl, "");
});

test("hours divergence only warns, preserves local hours and never logs sensitive fields", async () => {
  const h = harness(); h.state.mismatchedHours = true;
  h.load("src/config/site.ts").site.openingHours = [{ dayOfWeek: "Monday", dayIndex: 1, opens: "09:00", closes: "16:00", confirmed: true }];
  const result = await h.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot();
  assert.equal(result.source, "google"); assert.equal(h.warnings.length, 1);
  for (const value of Object.values(defaults)) assert(!h.warnings[0].includes(value));
  assert(!h.warnings[0].includes("17:30"));
  assert(h.load("src/config/site.ts").site.openingHours.every((h) => h.closes === "16:00"));
});

test("status returns only aggregate fields, distinguishes fallback and disables HTTP caching", async () => {
  for (const env of [{}, { GBP_REFRESH_TOKEN: "" }, { GBP_PROVIDER: "manual" }, { GBP_PROVIDER: undefined }]) {
    const h = harness(env); const response = await h.load("src/app/api/gbp/status/route.ts").GET();
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = await response.json();
    assert.deepEqual(Object.keys(body).sort(), ["provider", "source", "reviews", "posts", "rating", "total", "ok"].sort());
    const fallback = env.GBP_REFRESH_TOKEN === "";
    const expectedProvider = Object.hasOwn(env, "GBP_PROVIDER") ? env.GBP_PROVIDER || "manual" : "google";
    assert.equal(body.provider, expectedProvider);
    assert.equal(body.source, !fallback && body.provider === "google" ? "google" : "manual-fallback");
    assert.equal(body.ok, !fallback); assert.equal(body.total, !fallback && body.provider === "google" ? 161 : 0);
    for (const value of ["test-client", "test-secret", "test-refresh", "test-access", "123456", "987654", "Ursula"]) assert(!JSON.stringify(body).includes(value));
  }
  const empty = harness(); empty.state.malformed = { totalReviewCount: 0 }; empty.posts.length = 0;
  const body = await (await empty.load("src/app/api/gbp/status/route.ts").GET()).json();
  assert.equal(body.rating, null); assert.equal(body.total, 0); assert.equal(body.ok, true);
});

test("posts render at most eight server-rendered slides with lazy media, clamped text and no dates", () => {
  const h = harness(); const { PostsSection } = h.load("src/components/posts-section.tsx");
  assert.equal(renderToStaticMarkup(React.createElement(PostsSection, { posts: [], isMock: false })), "");
  const posts = Array.from({ length: 10 }, (_, i) => ({ id: String(i), text: "A".repeat(400), image: i === 0 ? "https://example.test/image.jpg" : "", imageAlt: "Consultório", relativeDate: "há 1 dia", date: "2026-10-23", ctaUrl: "", ctaLabel: "", searchUrl: i === 0 ? "https://www.google.com/search?q=post" : "" }));
  const html = renderToStaticMarkup(React.createElement(PostsSection, { posts, isMock: false }));
  assert.equal((html.match(/<article/g) || []).length, 8); assert.equal((html.match(/<img/g) || []).length, 1);
  assert(html.includes('loading="lazy"')); assert(html.includes('decoding="async"')); assert(html.includes("line-clamp-4"));
  assert(html.includes('aria-roledescription="carousel"')); assert(html.includes('aria-label="8 de 8"'));
  for (const value of ["há 1 dia", "2026-10-23", "<time"]) assert(!html.includes(value));
  assert.equal((html.match(/Ver no Google/g) || []).length, 1); assert(!html.includes('href=""')); assert(html.includes("Postagens recentes do Google"));
});

test("cleans both Google translation formats and drops empty originals", async () => {
  const h = harness();
  const { cleanGoogleReview } = h.load("src/lib/gbp/review-selection.ts");
  assert.equal(cleanGoogleReview("  Ótimo   cuidado! \n (Translated by Google) Great care!"), "Ótimo cuidado!");
  assert.equal(cleanGoogleReview(" (Translated by Google) Great care! (Original)  Ótimo \n cuidado! "), "Ótimo cuidado!");
  assert.equal(cleanGoogleReview("(Translated by Google) Translation without original"), "");
  assert.equal(cleanGoogleReview("(Translated by Google) Translation (Original)  "), "");
  assert.equal(cleanGoogleReview("  Texto \n original  "), "Texto original");
  h.reviews[0].comment = "(Translated by Google) Great (Original) Excelente cuidado";
  h.reviews[1].comment = "(Translated by Google) Empty (Original) ";
  const data = await h.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot();
  assert.equal(data.reviews.length, 1); assert.equal(data.reviews[0].text, "Excelente cuidado");
});

test("Google selects the latest twelve five-star reviews and eight LIVE posts; default age is 365 days", async () => {
  const h = harness({ GBP_POSTS_MAX_AGE_DAYS: undefined });
  const base = h.reviews[0];
  h.reviews.splice(0, h.reviews.length, ...Array.from({ length: 16 }, (_, i) => ({ ...base, reviewId: `review-${i}`, createTime: new Date(initialTime - i * 86400000).toISOString(), starRating: i === 0 ? "FOUR" : "FIVE" })).reverse());
  const post = h.posts[0];
  h.posts.splice(0, h.posts.length, ...Array.from({ length: 12 }, (_, i) => ({ ...post, summary: `post-${i}`, createTime: new Date(initialTime - i * 20 * 86400000).toISOString(), state: i === 0 ? "PROCESSING" : "LIVE" })).reverse());
  const data = await h.load("src/lib/gbp/providers/google.ts").getGoogleSnapshot();
  assert.equal(data.reviews.length, 12); assert.equal(data.reviews[0].id, "review-1"); assert.equal(data.reviews[11].id, "review-12");
  assert(data.reviews.every((r) => r.rating === 5));
  assert.equal(data.posts.length, 8); assert.equal(data.posts[0].text, "post-1"); assert.equal(data.posts[7].text, "post-8");
  assert(h.calls.some((c) => c.url.includes("localPosts?pageSize=20")));
});

test("manual and Google review HTML contains at most twelve slides and never renders review dates", async () => {
  const h = harness();
  const { ReviewsSection } = h.load("src/components/reviews-section.tsx");
  const manual = await h.load("src/lib/gbp/providers/manual.ts").manualGbpProvider.getReviews();
  const fixtures = Array.from({ length: 15 }, (_, i) => ({ rating: 5, authorName: "Cliente de teste", text: "Atendimento de teste.", id: String(i), relativeDate: "há 2 anos", date: "2026-10-23", ownerReply: "Resposta longa ".repeat(40) }));
  for (const reviews of [manual, fixtures]) {
    const html = renderToStaticMarkup(React.createElement(ReviewsSection, { reviews, isMock: false }));
    assert.equal((html.match(/<article/g) || []).length, Math.min(reviews.length, 12));
    if (!reviews.length) { assert.equal(html, ""); continue; }
    assert(html.includes('aria-roledescription="carousel"')); assert(html.includes("line-clamp-5"));
    for (const value of ["há 2 anos", "2026-10-23", "<time", "Datas aproximadas"]) assert(!html.includes(value));
  }
  const html = renderToStaticMarkup(React.createElement(ReviewsSection, { reviews: fixtures, isMock: false }));
  assert(html.includes("line-clamp-3"));
});

test("confirmed contact, Instagram and hours render without unconfirmed geo", () => {
  const h = harness();
  const { site, confirmedHours } = h.load("src/config/site.ts");
  assert.equal(confirmedHours.length, 7);
  assert(confirmedHours.some(hour => hour.dayIndex === 1 && hour.closed && hour.confirmed));
  assert.equal(site.whatsapp.phone, "5521981962851");
  assert.equal(site.whatsapp.confirmed, true);
  const Cta = h.load("src/components/whatsapp-cta.tsx").WhatsAppCta;
  const html = renderToStaticMarkup(React.createElement(Cta));
  assert(html.includes("https://wa.me/5521981962851?text=" + encodeURIComponent("Olá, vim do site e gostaria de agendar uma avaliação.")));
  assert(html.includes('target="_blank"'));
  assert(html.includes('rel="noopener noreferrer"'));
  assert(html.includes("Chamar no WhatsApp"));
  assert(!html.includes("tel:"));
  const business = renderToStaticMarkup(React.createElement(h.load("src/components/business-json-ld.tsx").BusinessJsonLd));
  for (const key of ["aggregateRating", '"geo"', '"Monday"']) assert(!business.includes(key));
  assert(business.includes('"openingHoursSpecification"'));
  assert(business.includes('"sameAs":["https://www.instagram.com/studioangelicaester"]'));
  const data = JSON.parse(business.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(data.openingHoursSpecification.length, 5);
  assert.deepEqual(Array.from(data.openingHoursSpecification, hour => hour.dayOfWeek), ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  assert(business.includes('"url":"https://wa.me/5521981962851"'));
});

test("confirmed map renders its exact iframe URL on all screen sizes", () => {
  const h = harness();
  const { site } = h.load("src/config/site.ts");
  const Map = h.load("src/components/responsive-map.tsx").ResponsiveMap;
  const html = renderToStaticMarkup(React.createElement(Map, { embedUrl: site.map.embedSrc, mapsUrl: site.google.directionsUrl, placeUrl: site.google.placeUrl }));
  assert(html.includes('src="' + site.map.embedSrc + '"'));
  assert(html.includes('title="Mapa do Studio Angélica Ester em Campo Grande, RJ"'));
  assert(html.includes('loading="lazy"'));
  assert(html.includes('referrerPolicy="strict-origin-when-cross-origin"'));
  assert(html.includes('h-[320px]'));
  assert(html.includes('md:h-[420px]'));
  assert(!html.includes('allowFullScreen'));
  assert(!/\s(?:width|height)="/.test(html));
  assert(html.indexOf("Como chegar") > html.indexOf("</iframe>"));
  assert(html.includes('href="https://maps.google.com/?cid=9461760723882507532"'));
  const directions = new URL(site.google.directionsUrl);
  assert.equal(directions.searchParams.get('destination'), 'Studio Angélica Ester, R. Augusto de Vasconcelos, 914 - Sala 302, Campo Grande, Rio de Janeiro - RJ, 23045-130');
  const place = html.match(/<a\b[^>]*href="https:\/\/maps.google.com\/[^"]*"[^>]*>/)[0];
  assert(place.includes('target="_blank"'));
  assert(place.includes('rel="noopener noreferrer"'));
});

test("every service WhatsApp action preserves the exact configured service name", () => {
  const h = harness();
  const { site } = h.load("src/config/site.ts");
  const Cta = h.load("src/components/whatsapp-cta.tsx").WhatsAppCta;
  assert.equal(site.services.length, 8);
  for (const service of site.services) {
    const message = `Olá, vim do site e gostaria de mais informações sobre ${service.title}.`;
    const html = renderToStaticMarkup(React.createElement(Cta, { label: "Quero saber mais", message }));
    assert(html.includes('href="https://wa.me/5521981962851?text=' + encodeURIComponent(message) + '"'));
    assert(html.includes("Quero saber mais"));
  }
});

test("home renders eight service slides, secure WhatsApp actions and the confirmed map", async () => {
  const h = harness({ GBP_PROVIDER: "manual" });
  const { site } = h.load("src/config/site.ts");
  const html = renderToStaticMarkup(await h.load("src/app/page.tsx").default());
  const services = html.slice(html.indexOf('id="servicos"'), html.indexOf('id="sobre"'));
  assert.equal((services.match(/<article/g) || []).length, 8);
  assert(services.includes('aria-roledescription="carousel"'));
  assert(services.indexOf(site.baseText) > services.lastIndexOf('</article>'));
  for (const service of site.services) {
    assert(services.includes(service.title));
    assert(services.includes(service.description));
    assert(services.includes(encodeURIComponent(`Olá, vim do site e gostaria de mais informações sobre ${service.title}.`)));
  }
  const links = html.match(/<a\b[^>]*href="https:\/\/wa\.me[^\"]*"[^>]*>/g) || [];
  assert.equal(links.length, 15);
  for (const link of links) {
    assert(link.includes('target="_blank"'));
    assert(link.includes('rel="noopener noreferrer"'));
  }
  assert.equal((html.match(/href="tel:/g) || []).length, 0);
  assert(!/\b(?:Ligar|Ligue|ligue)\b/.test(html));
  assert(html.includes('src="' + site.map.embedSrc + '"'));
  assert(!html.includes('bg-header'));
  assert(html.includes('md:h-[88px]'));
  const footer = html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
  assert(!footer.includes('wa.me'));
  assert(!footer.includes(site.phoneDisplay));
  const location = html.slice(html.indexOf('id="localizacao"'), html.indexOf('id="localizacao"') + html.slice(html.indexOf('id="localizacao"')).indexOf('</section>'));
  assert(!location.includes('tel:'));
  assert(!location.includes(site.phoneDisplay));
  assert(location.includes('Meus horários'));
  assert(location.includes('Domingo e segunda: fechado'));
  assert(location.includes(site.instagram.handle));
  assert(location.includes('Como chegar'));
  assert(location.includes('Ver no Google Maps'));
  assert.equal((footer.match(/class="font-display[^>]*>Studio Angélica Ester/g) || []).length, 1);
  assert(!html.includes('Ilustração neutra'));
  const instagramLinks = html.match(/<a\b[^>]*href="https:\/\/www.instagram.com\/studioangelicaester"[^>]*>/g) || [];
  assert.equal(instagramLinks.length, 2);
  for (const link of instagramLinks) assert(link.includes('target="_blank"') && link.includes('rel="noopener noreferrer"'));
  assert.equal((html.match(/href="https:\/\/www.google.com\/maps\/dir\//g) || []).length, 2);
  for (const photo of [site.photos.hero, site.photos.about]) assert(html.includes(photo.alt));
});

test("opening status respects confirmed days, boundaries and Sao Paulo timezone", () => {
  const h = harness();
  const { site } = h.load('src/config/site.ts');
  const { getOpeningStatus } = h.load('src/lib/opening-status.ts');
  const status = utc => getOpeningStatus(new Date(utc), site.openingHours);
  assert.equal(status('2026-11-02T15:00:00Z'), 'Fechado hoje · abre ter 9:00'); // Monday, local noon.
  assert.equal(status('2026-11-03T02:30:00Z'), 'Fechado hoje · abre ter 9:00'); // Still Monday in Sao Paulo.
  assert(status('2026-11-03T11:59:00Z').startsWith('Fechado agora'));
  assert.equal(status('2026-11-03T12:00:00Z'), 'Aberto agora · fecha às 19:00');
  assert(status('2026-11-03T22:00:00Z').startsWith('Fechado agora'));
  assert.equal(status('2026-11-07T15:59:00Z'), 'Aberto agora · fecha às 13:00');
  assert(status('2026-11-07T16:00:00Z').startsWith('Fechado agora'));
  assert.equal(status('2026-11-08T15:00:00Z'), 'Fechado hoje · abre ter 9:00');
  for (let day = 1; day <= 7; day++) assert.equal(typeof status(`2026-11-0${day}T15:00:00Z`), 'string');
});

test("each configured service renders a distinct decorative line icon", () => {
  const h = harness();
  const { site } = h.load('src/config/site.ts');
  const { ServiceIcon } = h.load('src/components/icons.tsx');
  const icons = site.services.map(service => renderToStaticMarkup(React.createElement(ServiceIcon, { kind: service.icon })));
  assert.equal(new Set(icons).size, 8);
  for (const icon of icons) {
    assert(icon.includes('aria-hidden="true"'));
    assert(icon.includes('stroke-width="1.5"'));
    assert(icon.includes('viewBox="0 0 24 24"'));
  }
});

test("footer follows mobile reading order with grouped confirmed hours", async () => {
  const h = harness({ GBP_PROVIDER: 'manual' });
  const { site } = h.load('src/config/site.ts');
  const page = await h.load('src/app/page.tsx').default();
  const html = renderToStaticMarkup(page);
  const footer = html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
  const orderedText = [site.name, site.address.full, site.instagram.handle, 'Privacidade', 'Horário de atendimento', 'Terça a sexta: 09:00–19:00', 'Sábado: 09:00–13:00', 'Domingo e segunda: fechado', '©'];
  let lastIndex = -1;
  for (const text of orderedText) {
    const index = footer.indexOf(text, lastIndex + 1);
    assert(index > lastIndex, text);
    lastIndex = index;
  }
  assert(footer.includes('Domingo e segunda: fechado'));
  assert(!footer.includes('Chamar no WhatsApp'));
  assert(!footer.includes(site.phoneDisplay));
  assert.equal((footer.match(/<li\b/g) || []).length, 3);
  for (const link of footer.matchAll(/<a\b[^>]*class="([^"]*)"/g)) assert(link[1].includes('min-h-12'));
  assert(footer.includes('md:col-start-2'));
  assert(footer.includes('md:row-span-2'));
});

test("grouped hours join Sunday and Monday closures and do not span unconfirmed gaps", () => {
  const h = harness();
  const { site } = h.load('src/config/site.ts');
  const { groupOpeningHours } = h.load('src/lib/group-opening-hours.ts');
  const lines = () => Array.from(groupOpeningHours(site.openingHours));
  assert.deepEqual(lines(), ['Terça a sexta: 09:00–19:00', 'Sábado: 09:00–13:00', 'Domingo e segunda: fechado']);
  site.openingHours.find(hour => hour.dayIndex === 1).confirmed = false;
  assert.deepEqual(lines(), ['Terça a sexta: 09:00–19:00', 'Sábado: 09:00–13:00', 'Domingo: fechado']);
  site.openingHours.find(hour => hour.dayIndex === 1).confirmed = true;
  site.openingHours.find(hour => hour.dayIndex === 3).confirmed = false;
  assert.deepEqual(lines(), ['Terça: 09:00–19:00', 'Quinta a sexta: 09:00–19:00', 'Sábado: 09:00–13:00', 'Domingo e segunda: fechado']);
});

test("photo frame is one clipped piece with stable ratio and no decorative top band", () => {
  const h = harness();
  const { site } = h.load('src/config/site.ts');
  const { PhotoSlot } = h.load('src/components/photo-slot.tsx');
  const html = renderToStaticMarkup(React.createElement(PhotoSlot, { photo: site.photos.hero, sizes: '480px', priority: true, shape: 'rounded', aspectRatio: '0.72' }));
  assert.equal((html.match(/<div\b/g) || []).length, 1);
  assert(html.includes('overflow-hidden'));
  assert(html.includes('rounded-[24px]'));
  assert(html.includes('aspect-ratio:0.72'));
  assert(html.includes('object-cover'));
  assert(!html.includes('loading="lazy"'));
  assert(!html.includes('bg-bg-soft'));
  assert(!html.includes('h-8'));
  const placeholder = renderToStaticMarkup(React.createElement(PhotoSlot, { photo: { src: '', alt: '' }, sizes: '480px', shape: 'rounded', aspectRatio: '0.72' }));
  assert(placeholder.includes('rounded-[24px]'));
  assert(placeholder.includes('aspect-ratio:0.72'));
});
