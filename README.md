# Payload Essentials
Learn how to create a fully-functioning website using Next.js, Payload, CSS, and Railway.

Course: https://nlvcodes.com/courses/payload-essentials

One click-deploy to Railway template here: https://github.com/nlvcodes/payload-starter

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/payload-starter?referralCode=Xs8CZU)

## How the repo is laid out

This is a pnpm workspace with two apps:

- `apps/cms` is the Payload CMS. It serves the admin panel at `/admin` and the API, on Next.js.
- `apps/web` is the public site, built with Astro. It reads the CMS through Payload's Local API, so it connects to the same Postgres database as the CMS.

## Run it locally

You need Node 22.12 or later, pnpm, and a Postgres server.

1. Install the dependencies from the repo root. The lockfile is made with pnpm 12.9.1, the version Cloudways Velocity installs with:

   ```sh
   npx pnpm@12.9.1 install
   ```

2. Copy `apps/cms/.env.example` to `apps/cms/.env`. Set `DATABASE_URL` to a new, empty database, and set `PAYLOAD_SECRET` to a long random string.
3. Copy `apps/web/.env.example` to `apps/web/.env`. Use the same `DATABASE_URL` and `PAYLOAD_SECRET` as the CMS. Leave `PAYLOAD_URL` at `http://127.0.0.1:3000`, where the CMS runs in development.
4. Create the tables:

   ```sh
   pnpm payload migrate
   ```

5. Fill the database with the seed data. See "Seed a fresh database" below.
6. Start the CMS and the web app, each in its own terminal:

   ```sh
   pnpm dev:cms
   pnpm dev:web
   ```

The admin panel is at http://localhost:3000/admin, and the site is at http://localhost:4321.

## Run the tests

```sh
pnpm --filter web exec playwright install chromium
pnpm test
```

The first line installs the browser the end-to-end tests use, and you only need it once. `pnpm test` runs the CMS integration tests, then the end-to-end tests. The end-to-end tests start their own CMS and web app on ports 3100 and 4400, against your `DATABASE_URL` database with `-e2e` added to its name. Every run wipes that database and seeds it again, so never point `DATABASE_URL` at a database whose name ends in `-e2e`.

## Seed a fresh database

The seed fills an empty database with a working site: four pages that between them use every block, twelve posts across three categories, sample media, the Settings and Nav globals, and an admin user to log in with.

Run this from the repo root, after steps 1 to 4 above. The root `payload` script runs inside `apps/cms`, so the script path is relative to that folder:

```sh
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=choose-a-password pnpm payload run src/seed/run.ts
```

Both variables are optional. The email defaults to `admin@example.com`, and if you leave out the password, the seed generates one and prints it once. Log in at `/admin` with those credentials.

The seed refuses to run if the database already has users, media, categories, pages, or posts. It runs in a single transaction, so if it fails partway, the database stays empty and you can run it again. Files it already uploaded stay in `apps/cms/media/`, and you can delete them.

## Deploy to Cloudways Velocity

Both apps run on one Velocity plan. The Starter plan (2 GB) is enough for both builds. Create two Node.js apps from this repo, one for each folder, and keep the default Velocity domains.

Velocity puts a `PORT` in each app's `.env` and runs the app on it, so neither app needs a port setting from you.

### The CMS app

- Root directory: `apps/cms`
- Build command: `pnpm payload migrate && pnpm build`
- Start command: `pnpm start`
- Add a Postgres database to this app.

Environment variables:

- `DATABASE_URL`: Velocity does not set it for you. Write it by hand with the host `127.0.0.1`, for example `postgres://USER:PASSWORD@127.0.0.1:5432/DATABASE`, with the user, password, and database name of the Postgres database you added.
- `PAYLOAD_SECRET`: a long random string. The web app uses the same value.
- `NEXT_PUBLIC_SERVER_URL`: the web app's Velocity URL. The CMS builds canonical URLs and the SEO preview from it, so they point at the public site.
- `RESEND_API_KEY`: your Resend API key, for the emails the admin panel sends.
- `MEDIA_DIR` (optional): an absolute path for uploads. By default they go to `apps/cms/media`, which a redeploy keeps.

There is no SSH on Velocity, so the build command runs the migrations. The production database starts empty: open `/admin` on the CMS app's URL and create the first user there.

### The web app

- Root directory: `apps/web`
- Build command: `pnpm build`
- Start command: `node ./dist/server/entry.mjs`

Environment variables:

- `HOST`: `0.0.0.0`
- `PAYLOAD_URL`: the CMS app's Velocity URL. The browser loads media from it, and the build reads it, so set it before the first build.
- `DATABASE_URL`: the same value as the CMS. The CMS and the web app run on the same server, so the host `127.0.0.1` reaches the CMS app's Postgres.
- `PAYLOAD_SECRET`: the same value as the CMS.
- `SITE_URL` (optional): the web app's Velocity URL. The sitemap and `og:url` use it. Without it, they use the origin of the request.

The web app needs Node 22.12 or later.

### Change the dependencies

Velocity installs with pnpm 12.9.1, which refuses any package published less than 24 hours before the install. If you add or update a dependency, resolve the lockfile with `npx pnpm@12.9.1 install`, and wait a day before you deploy a version that just came out.
