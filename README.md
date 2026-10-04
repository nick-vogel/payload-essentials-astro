# Payload Essentials
Learn how to create a fully-functioning website using Next.js, Payload, CSS, and Railway.

Course: https://nlvcodes.com/courses/payload-essentials

One click-deploy to Railway template here: https://github.com/nlvcodes/payload-starter

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/payload-starter?referralCode=Xs8CZU)

## Seed a fresh database

The seed fills an empty database with a working site: four pages that between them use every block, twelve posts across three categories, sample media, the Settings and Nav globals, and an admin user to log in with.

First run `pnpm install`, then copy `apps/cms/.env.example` to `apps/cms/.env` and set `DATABASE_URL` and `PAYLOAD_SECRET`. Point `DATABASE_URL` at a new, empty database.

Then run these from the repo root. The root `payload` script runs inside `apps/cms`, so the script path is relative to that folder:

```sh
pnpm payload migrate
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=choose-a-password pnpm payload run src/seed/run.ts
```

Both variables are optional. The email defaults to `admin@example.com`, and if you leave out the password, the seed generates one and prints it once. Log in at `/admin` with those credentials.

The seed refuses to run if the database already has users, media, categories, pages, or posts. It runs in a single transaction, so if it fails partway, the database stays empty and you can run it again. Files it already uploaded stay in `apps/cms/media/`, and you can delete them.
