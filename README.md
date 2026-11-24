# Rocketlane Jobs Directory

Independent, mobile-friendly directory by Productwithsasi, based on the UnitedHealth Group directory design. The initial snapshot is from the official Rocketlane Kula board on 24 November 2026: 44 roles, 29 including Chennai. Each card opens the exact official listing (with its application form), not the general careers page. Global roles are included; Chennai roles are shown first by default. The screenshot included one additional US-based Customer Engagement Manager opening not on the live board, so it is excluded.

## Local preview
Requires Node.js 20+ and Python 3 for the preview server.
```sh
npm test
npm run build
npm run dev
```
Open http://localhost:8080.

## Deploy on Vercel
Import this repository, select Other, leave the Root Directory at the repository root. The included vercel.json specifies the build and dist output. No API key, database, or environment variables required. No deployment has been performed by this repository itself.

## Refresh openings
```sh
npm install
npx playwright install chromium
npm run refresh
npm test
npm run build
```
The refresh script reads public card links, extracts their metadata, validates distinct exact role URLs, and checks the title and application controls on each official job page. A failure leaves the prior snapshot in place. This scraper is intentionally conservative: if Kula changes its card markup, inspect the page and adjust the parser. It has not yet been executed in a real browser in this environment. The initial data was collected by following all official Apply Now links individually. Review changes to jobs.json before publishing. There is no automatic refresh schedule or candidate data collection. Availability may change between updates.

## Source
https://careers.kula.ai/rocketlane

## Social link preview
The dedicated 1200 × 630 cover is generated from `social-cover.svg` as `dist/rocketlane-social-cover-v2.png`. Open Graph and Twitter metadata explicitly reference it, not the curator profile photo. The build uses `SITE_URL`, then `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL` for the public HTTPS origin. Set `SITE_URL` if using a custom domain. Run `npm install` before building locally. Social platforms may cache older previews; refresh or re-scrape after deploying.

The company name is shown as plain text for identification only. No employer logo or logo-like emblem is used in the directory or social cover.
