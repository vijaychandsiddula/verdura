# Verdura — Setup Guide

## The Neon shadow database error — why it happens & the fix

Neon (and most serverless Postgres providers) **do not allow** creating a shadow
database, which `prisma migrate dev` requires. Use `prisma db push` instead —
it applies your schema directly without needing a shadow DB. This is the
recommended approach for Neon.

---

## Step 1 — Install dependencies

```bash
cd verdura
npm install
```

---

## Step 2 — Set up Neon database

1. Go to **https://neon.tech** → create a free account → New project → name it `verdura`
2. In your project dashboard click **"Connection Details"**
3. From the dropdown select **"Prisma"** — Neon shows you two pre-formatted URLs

Copy both into `backend/.env`:

```env
# Pooled URL (has ?pgbouncer=true — used by the running app)
DATABASE_URL="postgresql://USER:PASS@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"

# Direct URL (no pgbouncer — used by db:push and db:seed)
DIRECT_URL="postgresql://USER:PASS@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
```

> Both URLs are shown on the same Neon page when you select "Prisma" in the dropdown.
> They use the same credentials — only the `pgbouncer=true` param differs.

---

## Step 3 — Generate JWT secrets

Run this twice — once for each secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the output into `backend/.env`:

```env
JWT_SECRET="paste_first_output_here"
JWT_REFRESH_SECRET="paste_second_output_here"
```

---

## Step 4 — Push schema & seed

```bash
# Generate the Prisma client
npm run db:generate

# Push schema to Neon (creates all tables — no shadow DB needed)
npm run db:push

# Seed with sample data
npm run db:seed
```

After seeding you will have:
- Admin: `admin@verdura.in` / `admin123`
- 4 plants (Monstera, Snake plant, Peace lily, Aloe vera)
- 7 supplies (pots, soil, fertilisers, tools)

---

## Step 5 — Run

```bash
npm run dev
```

| Service    | URL                          |
|------------|------------------------------|
| Website    | http://localhost:3000        |
| Admin      | http://localhost:3001        |
| API        | http://localhost:4000        |
| Health     | http://localhost:4000/health |
| DB Studio  | `npm run db:studio` → http://localhost:5555 |

---

## Step 6 — Mobile app

```bash
cd apps/mobile
npx expo start
```

Set your machine's local IP in `apps/mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
```

Scan the QR code with the **Expo Go** app on your phone.

---

## Error reference

| Error | Fix |
|-------|-----|
| `P3014 shadow database` | Use `npm run db:push` instead of `db:migrate` |
| `P1017 server closed connection` | Same — use `db:push`, not `migrate dev` |
| `Environment variable not found: DATABASE_URL` | Fill in `backend/.env` |
| `Environment variable not found: DIRECT_URL` | Add `DIRECT_URL` to `backend/.env` (see Step 2) |
| `Cannot find module '@verdura/types'` | Run `npm install` from root `verdura/` folder |
| `prisma.seed not configured` | Already fixed — `backend/package.json` has the seed config |
| Port in use | Change `PORT=4001` in `backend/.env` |

---

## Production deployment

| Service  | Platform                 | Notes |
|----------|--------------------------|-------|
| API      | Railway / Render         | Set all env vars in dashboard |
| Website  | Vercel                   | Set `NEXT_PUBLIC_API_URL` to your API URL |
| Admin    | Vercel                   | Separate project |
| Database | Neon                     | Already set up — use same URLs |
| Redis    | Upstash (free tier)      | For job queues & caching |
| Images   | Cloudflare R2            | Set S3_* vars |
| Mobile   | Expo EAS Build           | `eas build` for App Store + Play Store |
