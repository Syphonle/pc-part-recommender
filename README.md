# PC Part Recommender

A web app that recommends a compatible PC build from a budget, a target resolution, and a
list of games with target FPS — matching GPU, CPU, motherboard, and PSU tiers to each other,
and linking each part to a real product listing.

Live at **https://syphonle.github.io/pc-part-recommender/**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- `lib/recommend.ts` — the recommendation engine (pure functions, no server/API calls).
- `lib/data/` — the part catalog, game list, and benchmark table (static data; see the
  comments at the top of `lib/data/parts.ts` and `scripts/generate-benchmarks.mjs` for how
  the prices and FPS estimates were derived, and their known limitations).
- The whole app runs client-side and builds to a static export (`next build` → `out/`), so
  it can be hosted anywhere that serves static files — no backend required.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the static export
and publishes it to GitHub Pages.
