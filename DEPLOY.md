# Deploying SmartSupport

You deploy **three pieces**: MongoDB, the **Express API** (with Inngest), and the **Next.js web** app. The Android app is separate (Play Console / Firebase).

## 1. Prerequisites

| Piece | Role |
|--------|------|
| **MongoDB** | [MongoDB Atlas](https://www.mongodb.com/atlas) (or any MongoDB 4.4+ with network access from your API host) |
| **API host** | Any Node 20+ host: [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io), VPS + PM2, etc. |
| **Web host** | [Vercel](https://vercel.com), [Netlify](https://netlify.com), or the same server as the API behind a reverse proxy |
| **Inngest** | [Inngest Cloud](https://app.inngest.com) — sync URL to your deployed `/api/inngest` endpoint |
| **Secrets** | Generate **new** `JWT_SECRET`, `JWT_REFRESH_SECRET`, and use your own `GEMINI_API_KEY`. **Do not** use values from `.env.example` in production. |

## 2. MongoDB Atlas (typical)

1. Create a cluster → **Database** → **Connect** → Drivers → copy URI.
2. **Network Access**: add `0.0.0.0/0` (or your platform’s egress IPs) so the API can connect.
3. Set `MONGODB_URI` to the SRV URI with username/password (URL-encoded if needed).

## 3. API (Express) environment

Set these on your API host (Render/Railway dashboard → **Environment**, or `.env` on a VPS):

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Usually automatic | Render/Railway inject `PORT`; keep default `3000` if your host does not. |
| `MONGODB_URI` | Yes | Atlas connection string |
| `JWT_SECRET` | Yes | Long random string |
| `JWT_REFRESH_SECRET` | Yes | Different long random string |
| `GEMINI_API_KEY` | Yes | [Google AI Studio](https://aistudio.google.com/apikey) |
| `CORS_ORIGIN` | **Yes for browsers** | Your web origin only, e.g. `https://app.yourdomain.com` (comma-separated if multiple). **No trailing slash.** |
| `INNGEST_EVENT_KEY` | For Inngest | From Inngest app settings |
| `INNGEST_SIGNING_KEY` | For Inngest | From Inngest app settings |
| Email | Optional | Use Mailtrap for testing; for production prefer **AWS SES** (`AWS_SES_*` + `EMAIL_FROM`) |

**Install and start (repo root):**

```bash
npm install --omit=dev
npm start
```

There is no compile step for the API; `npm start` runs `node src/server.js`.

**Health check:** `GET https://YOUR_API_HOST/health` should return JSON `{ "status": "ok", ... }`.

## 4. Inngest (background jobs)

1. In [Inngest](https://app.inngest.com), create an app and get **Event Key** and **Signing Key**.
2. Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` on the API.
3. **Sync the serve URL** to your production API:

   `https://YOUR_API_HOST/api/inngest`

   Inngest will call this endpoint to register functions. After deploy, confirm the sync shows green in the Inngest dashboard.

## 5. Web (Next.js) on Vercel

### Required Vercel settings

1. **Project → Settings → General → Root Directory:** set to **`web`** (not the repository root). If this is wrong, Vercel will not detect Next.js and the build will fail or behave oddly.
2. **Framework Preset:** Next.js (auto-detected when Root Directory is `web`).
3. Leave **Build Command** and **Output Directory** empty so Vercel uses defaults (`next build` and `.next`).

The orange **npm deprecation warnings** in the build log (rimraf, glob, etc.) come from transitive dependencies and are usually **not** the reason a build fails. Scroll the log for the first **red `Error:`** line if the deployment still fails.

The UI reads the API base URL from **`NEXT_PUBLIC_API_URL`** at **build time** on Vercel/Netlify.

1. Connect the Git repo; set **Root Directory** to `web` as above.
2. Build command: `npm run build` (or `pnpm build` / `yarn build` if you use those).
3. Output: Next.js default (no custom `output` required for Vercel).
4. **Environment variable:**

   ```bash
   NEXT_PUBLIC_API_URL=https://YOUR_API_HOST
   ```

   Use the **public HTTPS URL** of the API (no trailing slash). Redeploy after changing it.

5. **CORS:** `CORS_ORIGIN` on the API must include your exact web origin, e.g. `https://your-app.vercel.app`.

### Self-hosted Next.js

From `web/`:

```bash
npm install
npm run build
PORT=3001 npm start
```

Put a reverse proxy (Caddy, nginx) in front; set `NEXT_PUBLIC_API_URL` before `npm run build`.

## 6. Android (optional)

See [android/BUILD.txt](android/BUILD.txt). Production builds use Firebase; replace `android/app/google-services.json` with your Firebase Android app config. Point the app at your API with `API_BASE_URL` in `local.properties` (see [android/local.properties.example](android/local.properties.example)).

## 7. Checklist before going live

- [ ] New JWT secrets (not from `.env.example`)
- [ ] `CORS_ORIGIN` matches only your real web origins
- [ ] Atlas can reach your API (network allowlist)
- [ ] Inngest sync URL is the production `https://.../api/inngest`
- [ ] `NEXT_PUBLIC_API_URL` matches production API URL and was set **before** the last web build
- [ ] Email: SES or another real SMTP if you need invites/notifications in production

## 8. Example: Render (API) + Vercel (web)

**Render — Web Service**

- **Root:** repository root (or monorepo root).
- **Build:** `npm install`
- **Start:** `npm start`
- **Health check path:** `/health`

**Vercel**

- **Root Directory:** `web`
- **Env:** `NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com`

**API env on Render:** set all variables from section 3, especially `CORS_ORIGIN=https://<your-vercel-domain>.vercel.app`.

---

If you tell us your preferred host (e.g. only Vercel, or AWS, or a single VPS), we can narrow this to exact clicks and config files (e.g. `vercel.json`, `render.yaml`).
