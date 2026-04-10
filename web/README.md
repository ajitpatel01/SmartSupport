# SmartSupport web (Next.js)

The marketing site and authenticated SaaS dashboard for AI-SmartSupport. See the [repository root README](../README.md) for architecture, API setup, and features.

## Local configuration

Copy `.env.local.example` to `.env.local`:

- `NEXT_PUBLIC_API_URL` — Express API base URL (default `http://localhost:3000`).
- `NEXT_PUBLIC_DEMO_MODE` — set to `true` to run the UI against in-memory demo data without the API (see root README).

Run the dev server from this directory: `npm run dev` (port **3001** by default; run the API on **3000**).

## Deploying on Vercel

In the Vercel project, set **Root Directory** to **`web`** (repository root will not work). Production builds use `next build` (Webpack); dev still uses Turbopack. See [DEPLOY.md](../DEPLOY.md) for environment variables and the API.
