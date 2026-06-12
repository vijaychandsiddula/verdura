# Verdura 🌿

Plant selling platform — website, mobile app, admin CMS, and backend API.

---

## Folder structure

```
verdura-final/
│
├── backend/          API server (Node.js + Express + PostgreSQL)
├── apps/
│   ├── web/          Website (Next.js — shop, product pages, checkout)
│   └── admin/        Admin CMS (Next.js — add plants, upload images, manage orders)
├── mobile/           iOS & Android app (React Native + Expo)
└── packages/         Shared code used by web and admin
    ├── types/         TypeScript type definitions
    ├── api-client/    API hooks shared across web and admin
    └── config/        Shared Tailwind and TypeScript configs
```

---

## What each part does

| Folder          | What it is                          | URL when running        |
|-----------------|-------------------------------------|-------------------------|
| `backend/`      | REST API, database, reminders cron  | http://localhost:4000   |
| `apps/web/`     | Customer-facing website & shop      | http://localhost:3000   |
| `apps/admin/`   | Admin CMS — add/edit plants & stock | http://localhost:3001   |
| `mobile/`       | iOS + Android app via Expo          | Scan QR with Expo Go    |

---

## How to run

### 1. Set up the database (one time only)

Fill in `backend/.env` with your Neon PostgreSQL URLs, then:

```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 2. Run the backend API

```bash
cd backend
npx tsx watch src/index.ts
```

### 3. Run the website

```bash
cd apps/web
npm install
npx next dev -p 3000
```

### 4. Run the admin CMS

```bash
cd apps/admin
npm install
npx next dev -p 3001
```

Open http://localhost:3001/dashboard to add plants and supplies without touching code.

### 5. Run the mobile app

```bash
cd mobile
npx expo start
```

Scan the QR code with the Expo Go app on your iPhone.

---

## Adding a new plant (no code needed)

1. Open http://localhost:3001/dashboard
2. Click **Plants → Add plant**
3. Fill in name, description, price, upload photos, write care guide
4. Click **Save** — it instantly appears in the website and mobile app

---

## Tech stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | Node.js, Express, TypeScript        |
| Database    | PostgreSQL (Neon), Prisma ORM       |
| Website     | Next.js 14, Tailwind CSS            |
| Admin CMS   | Next.js 14, Tailwind CSS            |
| Mobile      | React Native, Expo SDK 54           |
| Payments    | Razorpay (add keys to backend/.env) |
| Reminders   | node-cron + Expo Push Notifications |
| Image store | Local (dev) → S3/Cloudflare R2 (prod)|
