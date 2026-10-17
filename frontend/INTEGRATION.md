# HealthTrac landing hero

This is a fresh, hero-only React 19 / Vite 8 frontend, as requested after the
existing frontend could not be accessed. It does not implement authentication,
protected application screens, or backend changes.

## Review locally

Use Node 20.19+ or 22.12+ (validated with Node 24). From this directory:

```sh
npm ci
npm run dev
```

Open `/` on the Vite server. Build with `npm run build`, lint with
`npm run lint`, and serve the production output with `npm run preview`.

`npm test` builds and exercises the production output in Chromium. It uses system
Chromium when available (`CHROMIUM_PATH` can override it); otherwise install the
Playwright browser with `npx playwright install chromium`. Desktop, tablet and
mobile screenshots are written to the ignored `artifacts/` directory.

## Authentication integration

No registration/login destinations were supplied or available to verify. Account
buttons are intentionally disabled until `VITE_REGISTER_URL` and `VITE_LOGIN_URL`
are set to confirmed destinations in a local `.env.local` before starting/building.
Do not use API endpoints as account-page links. The reusable `LandingHero`
component also accepts `registerHref` and `loginHref` props for later integration.

The CSS is scoped to `ht-hero`; `index.css` provides the page background and margin.
The serif is Georgia with system fallbacks; the sans-serif is a system stack.
No third-party fonts, photographs, video, or other external assets are downloaded.

`heroMedia.js` imports the original four assets from `../../../assets/hero/`.
Vite transforms these imports to served development URLs and hashed build URLs.
If the real frontend uses another root, adjust those imports or copy the original
files into its supported public directory without modifying the originals.

Photographs rotate every six seconds. Video loads on first selection, plays muted
and inline once, then returns to photograph 1. Pausing preserves the photograph's
remaining duration and the video's playback position. Keyboard focus/interactions
pause playback; only explicit play resumes it. Hidden tabs suspend playback.
Reduced motion disables automatic rotation and fades; manual navigation remains
available and the video can be explicitly played without automatic advancement.

## GitHub Pages preview

The production build uses relative asset URLs, so it also works under `/Nira/`.
The `gh-pages` branch contains the built site. In repository **Settings → Pages**,
choose **Deploy from a branch**, select **gh-pages** and **/ (root)**, then save.
GitHub supplies the live URL after deployment completes. Enabling Pages requires
repository settings access; pushing the branch alone does not enable it.

Source changes live on `main`. A later source change needs a new `npm run build`
and a refresh of the `gh-pages` branch; automatic deployments are not configured.
