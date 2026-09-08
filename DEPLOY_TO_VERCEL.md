# Life Hub — Vercel Deployment & Setup Guide

This is the production-ready **Next.js 14 (App Router) + Prisma + Tailwind CSS** implementation of **Life Hub**, pre-configured for automated serverless deployment on **Vercel**.

---

## 🏗️ Architecture Stack

- **Framework**: Next.js 14 (App Router, Server Components & Route Handlers)
- **Database ORM**: Prisma ORM (supports Vercel Postgres, Neon, Supabase, or Turso)
- **Authentication**: JWT session tokens via `jose` and `bcryptjs` with HTTP-only cookies
- **Styling**: Tailwind CSS with mobile-first layout and Dark/Light theme tokens
- **Icons**: Lucide React
- **Developer Utilities**: 11 client-side local engineering tools

---

## 🚀 3-Minute Deployment Steps

### Step 1: Initialize Git and Push to GitHub

From your terminal inside the project directory:

```bash
cd lifehub-nextjs
git init
git add .
git commit -m "feat: initial commit of Life Hub Next.js application"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/life-hub.git
git push -u origin main
```

---

### Step 2: Create Project and Database on Vercel

1. Log in to [vercel.com](https://vercel.com) using your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Select your `life-hub` repository and click **Import**.
4. Before deploying, configure your database:
   - In your Vercel Dashboard, go to the **Storage** tab.
   - Click **Create Database** -> select **Postgres** (powered by Neon).
   - Name your store (e.g. `lifehub-db`) and click **Create**.
   - Vercel will automatically attach the `POSTGRES_PRISMA_URL` and `DATABASE_URL` environment variables to your project.

---

### Step 3: Add Environment Variables in Vercel

In your Vercel project settings under **Settings > Environment Variables**, ensure these variables exist:

| Variable | Recommended Value / Description |
|---|---|
| `DATABASE_URL` | Automatically populated by Vercel Postgres / Neon |
| `JWT_SECRET` | Any random 32+ character string (e.g. `your-production-jwt-secret-key-lifehub-2026`) |
| `NEXT_PUBLIC_DEV_TAP_THRESHOLD` | `7` |

---

### Step 4: Deploy & Sync Database Schema

1. Click **Deploy**. Vercel will build the Next.js application.
2. To push the Prisma database tables to your Vercel Postgres database, run locally from your machine:
   ```bash
   npx prisma db push
   ```
   *(Or link via Vercel CLI: `vercel link` then `vercel env pull` then `npx prisma db push`)*
3. Your application is live at `https://<your-project>.vercel.app`!

---

## 📱 How to Unlock Hidden Developer Mode on Vercel
1. Register an account with the **Developer** office role.
2. Navigate to **Settings** (`/settings`).
3. Under **About Life Hub & Build Number**, tap the build number box 7 times.
4. An unlock celebration alert will trigger, and the **Dev Mode** tab will permanently appear in your navigation bar!
