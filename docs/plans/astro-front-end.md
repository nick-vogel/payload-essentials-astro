# Plan: move the public site to Astro (Payload stays in Next.js)

Status: draft, waiting for approval. Written 2026-10-04.

## Goal

The Payload Essentials project becomes a pnpm monorepo with two apps on one Cloudways Velocity plan:

- `apps/cms`: Payload in Next.js. It keeps the admin panel and the REST API, and serves nothing public.
- `apps/web`: Astro with the Node adapter. It renders the public site from the CMS REST API.

This is the code for the second Cloudways video (Astro x Payload as a monorepo). Payload's admin panel is a Next.js app, so the CMS cannot move to Astro. Only the front end moves.

## Starting point

This repo, `nick-vogel/payload-essentials-postgres`, at `8a9fa68`: Payload 3.90.1 on Postgres with `idType: 'uuid'`, media on the server disk (`staticDir` = `./media`, or `MEDIA_DIR`), five passing int tests, deployed on Velocity. Its front end, measured on 2026-10-04:

- Routes in `src/app/(frontend)`: home (`page.tsx`), `[slug]`, `blog` (pagination and a category filter through search params), `blog/[slug]` (related posts, previous and next post). Plus `src/app/sitemap.ts` and `src/app/robots.ts`. About 1,100 lines with CSS.
- About 20 components in `src/components` and four blocks in `src/blocks` (Text, Hero, TextAndImage, Cards). About 2,000 lines, half of it CSS modules.
- Next.js dependencies in that code: `next/link` (9), `next/navigation` (5, mostly `notFound`), `next/image` (4), `next/cache` (4, `unstable_cache`), `@next/third-parties` (Google Tag Manager in the layout), `generateMetadata` on every route.
- Two client components: `Navigation` (mobile menu) and `CategoryFilter`.
- Rich text uses `@payloadcms/richtext-lexical/react` with custom converters for internal links, uploads, and the Cards and TextAndImage blocks inside rich text.
- `revalidatePath` hooks on Pages, Posts, and the globals.
- No drafts or live preview on the front end.

## Decisions to approve before step 1

- **D1. Where the work happens.** Recommended: a new public repo, `nick-vogel/payload-essentials-astro`, started from this repo's history. This repo stays as the code for video 1. Alternative: a branch here.
- **D2. How Astro renders the existing components.** Recommended: `@astrojs/react`, rendering the existing React components on the server with no client JavaScript, and the two client components as islands (`client:load`). This keeps the blocks and the rich text converters almost unchanged, and only the Next.js imports change. Alternative: rewrite every component as `.astro` and render rich text with Payload's HTML converter (`convertLexicalToHTML`), which needs HTML versions of the three custom converters. That is about twice the work and drops React from `apps/web`.
- **D3. How Astro reads data.** Recommended: the CMS REST API over HTTP, with `qs-esm` for `where` queries, and the types imported from `apps/cms/src/payload-types.ts`. The Local API is not an option, because it needs the Payload config and its Next.js runtime inside the Astro app.
- **D4. What we drop.** `unstable_cache` and on-demand revalidation (Astro renders on each request; Cloudflare still caches images and static files), `next/image` optimization and the blur placeholders (plain `<img>` with the Payload image sizes and `width`/`height`), the `revalidatePath` hooks, and `generateStaticParams`.
- **D5. Analytics.** The layout loads Google Tag Manager from `settings.gtmCode`. The port keeps it as a plain script tag. Question for Nick: track web interactions in OpenPanel as well?

## Steps

Each step ends with a check. Each step's output is the input to the next one.

1. **New repo.** Create `payload-essentials-astro` from this repo (D1).
   Check: `pnpm install`, `pnpm test:int` (5 passing), and `pnpm build` all pass in the new clone.

2. **Monorepo layout.** Move the app into `apps/cms`. Add a root `package.json` with workspace scripts, and set `packages: ['apps/*']` in `pnpm-workspace.yaml` next to the existing `allowBuilds`. One lockfile at the root.
   Check: from the root, `pnpm --filter cms build` and `pnpm --filter cms test:int` pass, and `pnpm --filter cms payload migrate` runs against a fresh local database.

3. **Deploy spike, before any port work.** Add a minimal `apps/web` (Astro, `@astrojs/node` in standalone mode, one page that fetches `/api/posts` from the CMS). Deploy both apps to one Velocity plan with the root directory set per app.
   Check: both apps build and serve on Velocity, and the Astro page lists posts from the CMS. This step answers the open questions below before we invest in the port. If Velocity cannot install a pnpm workspace from a subfolder, stop and rethink the layout.

4. **Strip the CMS.** Delete `src/app/(frontend)`, `sitemap.ts`, `robots.ts`, the front-end components and blocks components (keep the block configs and `src/custom` admin components), the `revalidatePath` hooks, and `@next/third-parties`.
   Check: CMS build and tests pass, `/admin` loads, `/api/posts`, `/api/pages`, `/api/globals/settings`, and `/api/globals/nav` return data.

5. **Astro foundation.** In `apps/web`: `@astrojs/react` (D2), a typed REST client (`find`, `findBySlug`, `findGlobal`) that reads `PAYLOAD_URL`, a helper that turns relative media URLs (`/api/media/file/...`) into absolute CMS URLs, and the base layout with Navigation, Footer, the `<head>` metadata from the Settings global, the icons, and GTM (D5).
   Check: `astro check` passes, and the home route renders the navigation and footer from the local CMS.

6. **Port the routes.** Home and `[slug]` with the Blocks renderer; `blog` with pagination and the category filter; `blog/[slug]` with the post body, related posts, and previous and next links. Replace `next/link` with `<a>`, `next/image` with `<img>`, `notFound()` with a 404 response, and `generateMetadata` with props to the layout.
   Check: with the seeded data from the smoke script, every route returns 200, an unknown slug returns 404, the post page shows its related posts and its previous and next links, and the category filter and pagination change the list.

7. **Rich text and images.** Keep the React rich text converters (D2) and point their image and link URLs at the CMS.
   Check: a post whose body has an upload, an internal link, a Cards block, and a TextAndImage block renders all four, and every image URL returns 200.

8. **SEO endpoints.** `sitemap.xml` and `robots.txt` as Astro endpoints, plus canonical, Open Graph, and Twitter tags with parity to the Next.js version.
   Check: both endpoints return valid output that lists the seeded pages and posts, and a post page's `<head>` has the same tags as the Next.js version for the same post.

9. **Tests.** Keep the CMS int tests. Add a smoke test for `apps/web` that loads every route against a seeded CMS.
   Check: `pnpm test` from the root is green.

10. **Production deploy.** Both apps on one Velocity plan.
    - CMS: root directory `apps/cms`, build `pnpm payload migrate && pnpm build`, env `DATABASE_URL`, `PAYLOAD_SECRET`, `RESEND_API_KEY`, optional `MEDIA_DIR`.
    - Web: root directory `apps/web`, build `pnpm build`, start `node ./dist/server/entry.mjs` with `HOST=0.0.0.0` and the port Velocity assigns, env `PAYLOAD_URL`.
    Check: the Astro site serves pages and media from the CMS, a new upload in the admin shows on the site, and memory during both builds stays within the plan (watch the Velocity monitoring graphs; Starter has 2 GB).

## Open questions for step 3

- Does Velocity install a pnpm workspace when the root directory is a subfolder? The lockfile and `pnpm-workspace.yaml` live at the repo root.
- Can the Astro app reach the CMS over `localhost` on the same server, or only through its public URL and Cloudflare?
- Which port does Velocity give each app, and in which env var?
- Do two Next.js and Astro builds fit in 2 GB on Starter, or does the demo need Professional ($30)?

## Known facts from the video 1 deploy (2026-10-03)

- Velocity installs with pnpm 11 or later (the log showed 12.8.1). Build-script approvals live in `allowBuilds` in `pnpm-workspace.yaml`.
- Uploads in `./media` survive a deploy of a new commit.
- The PostgreSQL install does not show its env vars in the app. Set `DATABASE_URL` by hand with host `127.0.0.1`.
- Cloudflare Enterprise sits in front of every app. Images from `/api/media/file/` cache at the edge for 4 hours, `/_next/static/` for a year, and pages are `DYNAMIC`.
