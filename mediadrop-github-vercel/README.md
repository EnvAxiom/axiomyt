# MediaDrop — GitHub + Vercel frontend + Docker backend

MediaDrop converts media files you own, or direct media-file URLs you are authorized to use, to MP4 or MP3.

## Architecture

- `frontend/` — static frontend intended for Vercel.
- `backend/` — Python + FFmpeg API intended for a Docker/container host.

The backend intentionally does not support YouTube URLs.

## 1. Push to GitHub

Create an empty GitHub repository, then from this folder:

```bash
git init
git add .
git commit -m "Initial MediaDrop"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 2. Deploy the backend first

Deploy the `backend/` directory on a host that supports Docker and FFmpeg.

Docker locally:

```bash
cd backend
docker build -t mediadrop-backend .
docker run --rm -p 3000:3000 \
  -e ALLOWED_ORIGINS=http://localhost:4173 \
  mediadrop-backend
```

Production environment variables:

```text
PORT=3000
MAX_UPLOAD_MB=500
MAX_REMOTE_MB=500
ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app
```

If you later attach a custom frontend domain, add it to `ALLOWED_ORIGINS` too, comma-separated.

## 3. Deploy the frontend on Vercel

1. Import the GitHub repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. Add environment variable:

```text
MEDIA_BACKEND_URL=https://YOUR-BACKEND-DOMAIN.example
```

4. Deploy.

Vercel will run `npm run build` and inject the backend URL into `dist/config.js`.

## Local frontend test

```bash
cd frontend
MEDIA_BACKEND_URL=http://localhost:3000 npm run build
python3 -m http.server 4173 -d dist
```

Open `http://localhost:4173`.

## Why not run the converter entirely in a normal Vercel Function?

Large media uploads exceed Vercel Function request-body limits, and FFmpeg conversion is compute/storage-heavy. Keeping Vercel as the fast frontend and running the converter on a container host is substantially more reliable.
