# Pinyin Talk

A Mandarin memory keeper and practice partner. Learners list the phrases they already know, review them by ear with spaced repetition, and chat with **Mei**, their partner inside Pinyin Talk (powered by Google Gemini). All Chinese is shown in **pinyin only**, never characters.

## Run it (pnpm only)

```
pnpm install
pnpm prisma db push
pnpm prisma generate
pnpm dev
```

After any change to `prisma/schema.prisma`, run `pnpm prisma db push` and then `pnpm prisma generate`.

Open http://localhost:3000. Smoke-test Gemini at `/test-ai`.

## Environment variables (`.env`, never commit)

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Hosted PostgreSQL connection string only. Do not use SQLite in production. Example Neon: `postgresql://<user>:<password>@<host>/<db>?sslmode=require` |
| `NEXTAUTH_SECRET` | Random secret. Generate with `pnpm dlx auth secret` |
| `NEXTAUTH_URL` | App URL for the current environment. Local is `http://localhost:3000`; Vercel uses your production domain |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used for canonical links and metadata. Set it yourself for each environment |
| `GEMINI_API_KEY` | Google Gemini key used on the server for chat, speech recognition, and voice output |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for saved profile images and voice clips |

## Production database for Vercel

Use a hosted PostgreSQL service such as Neon or Supabase. `DATABASE_URL` must point to that external database; do not leave it pointing to a local SQLite file or a local dev DB in production.

Typical Vercel environment values:

- `DATABASE_URL`: `postgresql://postgres:yourpassword@db.<project-ref>.supabase.co:5432/postgres` or the Neon equivalent
- `NEXTAUTH_SECRET`: your generated secret value
- `NEXTAUTH_URL`: `https://your-domain.com`
- `NEXT_PUBLIC_SITE_URL`: `https://your-domain.com`
- `GEMINI_API_KEY`: your Gemini API key
- `BLOB_READ_WRITE_TOKEN`: your Vercel Blob read/write token

## Deploy to Vercel

1. Push the repo to a private GitHub repository.
2. Import the repo in Vercel as a Next.js app.
3. In Project Settings > Environment Variables, add all of the values above.
4. For Neon or Supabase, copy the production connection string into `DATABASE_URL`.
5. Set both `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your production domain.
6. Run `pnpm prisma db push` once against the hosted database.
7. Run `pnpm prisma generate`.
8. Deploy and test the app on a phone or browser.

Checklist after deploy:
- Sign up and sign in
- Add phrase, review, and chat with Mei
- Check History playback still works
- Upload a profile image
- Verify PWA install prompt works
- Confirm legal pages load
- Confirm the Gemini key is not exposed in the browser

## Where things live

- `lib/config.ts`: per-user limits (daily Mei messages etc.). Plans plug in here later.
- `lib/ai/config.ts`: the Gemini model name.
- `lib/mei/prompt.ts`: Mei's system prompt.
- `lib/srs.ts`: spaced repetition (1, 2, 4... up to 30 days; wrong resets to 1).

### Add a hint card
1. Add an entry to `lib/data/hints.ts`.
2. Add a keyword matcher for it in `lib/hints.ts` (`detectHints`).

### Add a starter phrase
Add `{ pinyin, meaning, speechText }` to `lib/data/starterPhrases.ts`. `speechText` is hidden Chinese used only for audio and is never displayed.

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add the four environment variables above (set `NEXTAUTH_URL` to your production domain).
3. Run once against the production database: `pnpm prisma db push`.
4. Set `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` in Vercel to your site URL.

## Phone checklist
Sign up, add phrases, open a hint card, play a phrase, finish a review, chat with Mei, sign out and back in.
