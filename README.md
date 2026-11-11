# ORBIT — AI Productivity Companion

A responsive React + Vite starter for ORBIT, a friendly futuristic productivity companion.

## Run locally

Requirements: Node.js 18.18+ (Node 20+ recommended) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`.

## Deploy to Netlify

### Option A — connect GitHub (recommended)
1. Create a new GitHub repository named `orbit` (or another name).
2. From this project folder, run:

   ```bash
   git init
   git add .
   git commit -m "Build ORBIT productivity companion starter"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/orbit.git
   git push -u origin main
   ```

3. In Netlify, choose **Add new project → Import an existing project**.
4. Connect GitHub and select the repository.
5. Netlify should detect `netlify.toml`. Confirm build command `npm run build` and publish directory `dist`, then deploy.
6. Future pushes to `main` trigger automatic deployments.

### Option B — deploy without GitHub
1. Run `npm install` and `npm run build` locally.
2. In Netlify, open the manual deploy area and drag the generated `dist` folder into it.

## GitHub Pages note

This starter is configured for Netlify. GitHub is used as the source-code repository; Netlify hosts the live website. If you want GitHub Pages hosting too, add a Vite `base` setting and a Pages workflow for your repository name.

## Current functionality

- Add, complete, and delete tasks.
- Tasks persist in the browser using local storage.
- Focus view and daily schedule.
- Local rescheduling suggestions when a task is marked as missed.
- Dashboard progress and a simple companion chat demo.

The companion chat is currently a local demo, not connected to a hosted AI model. To enable real AI safely, add a backend/serverless function and store provider credentials as server-side environment variables in Netlify. Never expose API keys in browser code.
