# HealthTrac public-site design prototype

This standalone React 19 / Vite 8 UX/UI repository is separate from the production
application. Home retains the extended introduction: opening photograph, records
and insights, everyday life, and a closing video chapter. A separate consultation
page explores appointment preparation and a fictional sharing demo. Neither page
connects to a backend, dashboard, authentication system, or production route guards.
The record preview is static semantic HTML/CSS, labeled with fictional data.

## Run and review

Use Node 20.19+ or 22.12+ (validated with Node 24). From `frontend/`:

```sh
npm ci
npm run dev
npm run lint
npm test
```

`npm run build` creates the production site in `dist/`; `npm run preview` serves it.
`npm test` builds and tests the production output in Chromium. System Chromium is
used when available (`CHROMIUM_PATH` can override it); otherwise install it with
`npx playwright install chromium`. Screenshots are saved under ignored `artifacts/`.

## Composition and media

- `hero_01_image.jpg`: near-viewport-height opening and an in-page Explore link.
- `hero_02_image.jpg`: two-column records section with a fictional record preview.
- `hero_03_image.jpg`: alternate editorial composition about personal/family records.
- `hero_video.mp4`: its own wide closing chapter, with visible play/pause control.

`heroMedia.js` imports the originals directly from `assets/hero/`. Vite resolves
valid development and hashed production URLs; no original files are modified.
`src/assets/hero_video_poster.jpg` is a still extracted from the supplied video
at 00:05, scaled to 1600px wide. No external media is downloaded.

There is no carousel, collage, rotation timer, or slide navigation. The video
source is deferred until within 300px of the viewport and plays muted/inline
only while its section is visible. It pauses outside the viewport and in hidden
tabs, respects a manual pause, and stops at the end. Its poster appears before
loading. Reduced motion shows the poster without fetching/autoplaying the video;
the visitor can explicitly play it. The Explore link moves focus to the records
section and scrolls smoothly unless reduced motion is enabled.

The established Georgia serif, system sans-serif, ivory/plum/lavender palette,
rounded photographic surfaces, and deliberate mobile art direction are retained.

## Consultation page and shared navigation

Open `/consultation.html` on the development or production preview server. The
multi-page build emits both `index.html` and `consultation.html`, allowing direct
GitHub Pages links and reloads without SPA fallback or production route changes.
Shared header links use `./` and `./consultation.html`; they retain a deployment
prefix such as `/Nira/`. The full footer receives page-specific existing anchors.
Home keeps its original content, media, styling, and video behavior; only the
wordmark/header is shared with the added primary navigation.

The new page imports `consultation_01_image.jpg`, `consultation_02_image.jpg`, and
`consultation_video.mp4` directly from `assets/consultation/`. The source files are
unchanged. Its poster is extracted at 00:03 from that video and scaled to 1600px.
The film loads within 300px of its player, pauses outside the viewport/in hidden
tabs, and shows a poster without video loading for reduced motion until explicit
play. No carousel is used.

The sharing preview supports the README's four scopes (full history, emergency
summary, medication history, pregnancy history) and durations (15 minutes, 1 hour,
24 hours). It snapshots selections only on Preview/Update, marks subsequent draft
changes, and clears the simulated view on Revoke. All state resets on reload.
Names and records are fictional; durations are illustrative. No tokens, grants,
QR codes, authentication, persistence, API requests, or actual sharing are created.
Doctor sign-in is explained as a product requirement, never simulated as real access.

## Future account-link integration

Account actions are absent from this design slice. When an account entry point
is designed, supply registration/login destinations from the actual production
application and verify their behavior there. Do not create placeholder routes,
send visitors to API endpoints, or infer account URLs from this prototype.
No production authentication or service behavior is represented by the record mockup.

## GitHub Pages

Relative build URLs support the `/Nira/` project path. The `gh-pages` branch is
updated manually with the reviewed production build. No automatic deployment is
configured. To publish a reviewed build, refresh that branch with `dist/` and use repository Settings → Pages →
Deploy from a branch → gh-pages → / (root). A branch push alone does not enable Pages.
