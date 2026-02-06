# Deployment Guide for LETS_PREP_

This guide will help you deploy the LETS_PREP_ application to the cloud. We will use **Vercel** for the Frontend and **Render** for the Backend.

## Prerequisites
1.  **GitHub Account**: Ensure this project is pushed to your GitHub repository.
    - *Status*: You have already configured the remote origin. Make sure to run `git push` to sync the latest changes.
    - *Note*: **Private Repositories are fully supported** and recommended. Both Vercel and Render will ask for permission to access your repositories securely.
2.  **Vercel Account**: [Sign up here](https://vercel.com/signup).
3.  **Render Account**: [Sign up here](https://render.com/register).

---

## Part 1: Backend Deployment (Render)

We will use **Render** to host the backend because it supports Docker natively, which is required for our code execution environment (even in fallback mode).

1.  **Sign in to Render** and go to your [Dashboard](https://dashboard.render.com).
2.  Click **New +** -> **Blueprint**.
3.  Connect your GitHub repository (`Pantkartik/LETS_PREP_`).
4.  Render will automatically detect the `render.yaml` file we created.
5.  **Configure Environment Variables**:
    You will be prompted to enter values for the "sync: false" variables. Fill them in using your local `.env` values or new secrets:
    - `SUPABASE_URL`: Your Supabase URL.
    - `SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (from Supabase Dashboard > Settings > API).
    - `REDIS_HOST`: You can leave this blank if using the internal Redis created by the Blueprint, OR use an external Redis like Upstash. *Note: Render Free Tier Redis is ephemeral (loses data on restart).*
    - `REDIS_PASSWORD`: (If using external Redis).
    - `CORS_ORIGIN`: Your anticipated frontend URL (e.g., `https://lets-prep-frontend.vercel.app`). You can update this later.
    - `ALLOWED_ORIGINS`: Same as above.

6.  Click **Apply**. Render will start building your backend. 
    - *Note:* It may take a few minutes. Wait for the green "Live" badge.
    - **Copy your Backend URL** (e.g., `https://lets-prep-backend.onrender.com`).

---

## Part 2: Frontend Deployment (Vercel)

1.  **Sign in to Vercel** and go to your [Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository (`LETS_PREP_`).
4.  **Configure Project**:
    - **Framework Preset**: Next.js (Should be auto-detected).
    - **Root Directory**: Click "Edit" and select `Frontend`. **This is crucial.**
5.  **Environment Variables**:
    Add the following variables (copy from your local `.env.local` or create new ones):
    - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    - `NEXT_PUBLIC_API_URL`: The **Backend URL** from Part 1 (e.g., `https://lets-prep-backend.onrender.com/api/v1`).
    - `NEXT_PUBLIC_WS_URL`: The Backend URL but with `wss://` (or `ws://` if no SSL) (e.g., `wss://lets-prep-backend.onrender.com`).
    - `NEXT_PUBLIC_APP_URL`: Your future Vercel URL (e.g., `https://lets-prep.vercel.app`).
6.  Click **Deploy**.

---

## Part 3: Final Configuration

1.  **Update Backend CORS**:
    - Once the Frontend is deployed, copy its URL (e.g., `https://lets-prep-phi.vercel.app`).
    - Go back to Render > Dashboard > your-backend-service > **Environment**.
    - Update `CORS_ORIGIN` and `ALLOWED_ORIGINS` to match your *actual* Frontend URL.
    - Render will redeploy automatically.

2.  **Verify**:
    - Open your Frontend URL.
    - Try logging in (tests Supabase).
    - Try running code (tests Backend `executeLocal` fallback). 
    - *Note*: Initial requests to Render (Free Tier) might be slow as it spins up from sleep.

## Continuous Integration & Updates (CI/CD)

This setup implements a modern, **industry-standard CI/CD pipeline** that ensures your app is easily updated and robust.

### How to Update Your App
To deploy a new feature or fix a bug, you simply follow this Git workflow. You do **not** need to manually touch the servers.

1.  **Develop Locally**: Make your changes and test them on `localhost`.
2.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "feat: Add amazing new feature"
    git push origin main
    ```
3.  **Automatic Deployment**:
    - **Frontend**: Vercel detects the push to `main` and immediately starts a new build. Within minutes, your live site is updated.
    - **Backend**: Render detects the push to `main`, builds your Docker container, and performs a "Zero-Downtime Deployment" (if on a paid plan) or a standard restart.
    - **Checks**: We have added a GitHub Action (`.github/workflows/ci.yml`) that runs on every push to ensure your code builds correctly *before* it even reaches the servers.

### Handling Pull Requests (Best Practice)
For larger teams or safer updates:
1.  Create a branch: `git checkout -b new-feature`
2.  Push the branch.
3.  Open a Pull Request (PR) on GitHub.
4.  **Vercel** will automatically create a **Preview URL** for that specific branch. You can share this URL to test the feature in a live environment *without* affecting the main site.
5.  Once verified, merge the PR to `main`. The production deployment triggers automatically.

## Optional: Advanced Code Execution Worker (Industry Standard)

For a truly scalable "Industry Level" system, you should separate the API from the heavy code execution logic.

1.  **Architecture**:
    - **API Server** (Render): Handles HTTP requests.
    - **Redis** (Upstash/Render): Queues jobs.
    - **Worker Service** (VPS/DigitalOcean/AWS): Listens to Queue and runs Docker commands.

2.  **Deployment Steps**:
    - We have created `Backend/Dockerfile.worker` and `Backend/src/worker.ts`.
    - Deploy this Worker image to a platform that supports **Docker socket mounting** (like DigitalOcean App Platform with a dedicated Worker, or a simple VPS).
    - Set `DOCKER_ENABLED=true` on the Worker.
    - Ensure it connects to the *same* Redis instance as your API.

This setup ensures that if 100 students submit code at once, your API remains responsive while the Worker(s) churn through the queue in the background.

## Important Note on Code Execution
We have configured the Backend to use "Local Execution Mode" (`DOCKER_ENABLED=false`) for this deployment. This runs user code directly in the container's isolated runtime. 
- **Supported**: Python, JavaScript, C++, Java.
- **Safety**: Start with trusted users. For a public production app, you would need a more complex "Docker-in-Docker" setup on a VPS.

