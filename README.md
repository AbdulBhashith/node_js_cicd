# 🚀 Node.js → Docker → GitHub Actions CI/CD Demo

A complete, step-by-step demo showing how to build a Node.js app, containerize it with Docker, and ship it automatically to Docker Hub using GitHub Actions every time you push code.

---

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── docker-publish.yml   # GitHub Actions CI/CD pipeline
├── server.js                    # Node.js HTTP server
├── package.json
├── Dockerfile                   # Multi-stage production image
├── .dockerignore
├── .gitignore
└── README.md
```

---

## ✅ Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop |
| Git | Any | https://git-scm.com |
| GitHub account | — | https://github.com |
| Docker Hub account | — | https://hub.docker.com |

---

## Step 1 — Run the App Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
# → Server running on http://localhost:3000
```

Open http://localhost:3000 in your browser. You should see the welcome page.

To verify the health endpoint:
```bash
curl http://localhost:3000/health
# → {"status":"ok","version":"1.0.0"}
```

---

## Step 2 — Containerize with Docker

### Build the image
```bash
docker build -t node-cicd-demo:local .
```

### Run the container
```bash
docker run -d \
  --name node-cicd-demo \
  -p 3000:3000 \
  node-cicd-demo:local
```

Open http://localhost:3000 — same app, now running inside Docker.

### Useful Docker commands
```bash
# See running containers
docker ps

# View container logs
docker logs node-cicd-demo

# Stop and remove
docker stop node-cicd-demo && docker rm node-cicd-demo
```

### About the Dockerfile

The image uses a **multi-stage build** to keep the final image small and secure:

```
Stage 1 (deps)     — installs npm packages
Stage 2 (runtime)  — copies only what's needed; runs as a non-root user
```

---

## Step 3 — Push Source Code to GitHub

```bash
# Inside the project directory:
git init
git add .
git commit -m "feat: initial commit"

# Create a new repo on GitHub (github.com → New repository)
# Then connect and push:
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git branch -M main
git push -u origin main
```

---

## Step 4 — Configure Docker Hub Secrets in GitHub

The pipeline needs your Docker Hub credentials. Store them as **GitHub Actions secrets** (never hard-code them).

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

2. Add the following two secrets:

| Secret name | Value |
|-------------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | A Docker Hub **Access Token** (not your password) |

> **How to create a Docker Hub Access Token:**
> Docker Hub → Account Settings → Security → New Access Token → copy the token.

---

## Step 5 — The GitHub Actions Pipeline

The pipeline lives at `.github/workflows/docker-publish.yml` and runs automatically on every push to `main`.

### Pipeline Flow

```
Push to main
     │
     ▼
┌─────────────────────┐
│  Job 1: Build&Test  │   Sets up Node 20 → npm ci → npm test
└────────┬────────────┘
         │  (only if tests pass)
         ▼
┌──────────────────────────┐
│  Job 2: Docker Build&Push│   Login → Buildx → Build → Tag → Push
└──────────────────────────┘
```

### What the pipeline does

1. **Checkout** — clones the repository
2. **Node.js setup & test** — validates the app before touching Docker
3. **Docker login** — authenticates to Docker Hub using your secrets
4. **Build & push** — builds a multi-platform image and pushes two tags:
   - `yourusername/node-cicd-demo:sha-<short-git-sha>` — immutable, traceable tag
   - `yourusername/node-cicd-demo:latest` — always points to the newest build
5. **Layer caching** — uses GitHub Actions cache to speed up repeat builds

---

## Step 6 — Trigger the Pipeline Automatically

Every `git push` to `main` triggers the full pipeline:

```bash
# Make any change, e.g. edit server.js
echo "// updated" >> server.js

git add .
git commit -m "chore: trigger pipeline"
git push
```

Then go to your repo → **Actions** tab to watch the pipeline run in real time.

### Pull the new image after a successful build

```bash
docker pull <YOUR_DOCKERHUB_USERNAME>/node-cicd-demo:latest

docker run -d -p 3000:3000 <YOUR_DOCKERHUB_USERNAME>/node-cicd-demo:latest
```

---

## Pipeline Trigger Rules

| Event | Build & Test | Docker Push |
|-------|-------------|-------------|
| Push to `main` | ✅ | ✅ |
| Pull request to `main` | ✅ | ❌ (safe — no push on PRs) |
| Push to other branches | ❌ | ❌ |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port the server listens on |
| `APP_VERSION` | `1.0.0` | Displayed on the home page; injected as a build-arg in CI |

---

## Troubleshooting

**Pipeline fails at Docker login**
→ Double-check that `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets are set correctly in GitHub → Settings → Secrets.

**`npm test` fails in CI**
→ Run `npm test` locally first. The test starts the server and exits — make sure `server.js` has no syntax errors.

**Port 3000 already in use locally**
```bash
# Run on a different port
PORT=8080 npm start
# or with Docker:
docker run -p 8080:3000 node-cicd-demo:local
```

**Old image still running after update**
```bash
docker stop node-cicd-demo && docker rm node-cicd-demo
docker pull <username>/node-cicd-demo:latest
docker run -d --name node-cicd-demo -p 3000:3000 <username>/node-cicd-demo:latest
```

---

## License

MIT
