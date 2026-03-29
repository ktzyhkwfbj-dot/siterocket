# SiteRocket 🚀

Simple WhatsApp business landing page generator. Fill a form → get a shareable link.

## Deploy to Render.com (free tier)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
```

Create a new repo on GitHub (github.com → New repository), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/siterocket.git
git branch -M main
git push -u origin main
```

### 2. Get your free credentials

**Cloudinary** (image storage):
1. Sign up at [cloudinary.com](https://cloudinary.com) — free tier includes 25 GB
2. Go to Dashboard → copy the **API environment variable** string
   - Looks like: `cloudinary://api_key:api_secret@cloud_name`

**MongoDB Atlas** (database):
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) — free tier includes 512 MB
2. Create a free **M0** cluster (any region)
3. Database Access → Add user with password
4. Network Access → Add IP → **Allow access from anywhere** (`0.0.0.0/0`)
5. Connect → Drivers → copy the connection string
   - Looks like: `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/siterocket`

### 3. Create a Render Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **New → Web Service**
3. Connect your GitHub account and select the `siterocket` repo
4. Render will auto-detect `render.yaml` — confirm the settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Under **Environment Variables**, add:
   - `CLOUDINARY_URL` → paste your Cloudinary API environment variable string
   - `MONGODB_URI` → paste your Atlas connection string
6. Click **Create Web Service**

Your app will be live at `https://siterocket.onrender.com` (or similar) within ~2 minutes.

### Local development with .env

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Then install [dotenv](https://www.npmjs.com/package/dotenv) or use:

```bash
node -e "require('dotenv').config()" server.js
# or simply export vars in your shell:
export CLOUDINARY_URL=cloudinary://...
export MONGODB_URI=mongodb+srv://...
node server.js
```

---

## ⚠️ Ephemeral Storage (solved)

Render's free tier wipes the local filesystem on every restart/redeploy. This project solves that with two free external services:

| What | Where | Free tier |
|---|---|---|
| Uploaded images | Cloudinary | 25 GB storage |
| Site data | MongoDB Atlas | 512 MB (M0 cluster) |

Neither service is affected by Render restarts — your data persists indefinitely.

---

## Local Development

```bash
npm install
node server.js
```

Open http://localhost:3000
