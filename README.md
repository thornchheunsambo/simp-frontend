# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# SIMP Frontend (Nuxt 4)

Single-page app for the SIMP Spring Boot API. Roles: Student, Company, Staff, Admin.

## Run it
Requirements: Node.js 20.19+ or 22+ (check with `node -v`) and the backend running.

1. Create a fresh Nuxt project (this gives you the correct package.json for your Node version):
   ```
   npm create nuxt@latest simp-frontend
   ```
   Choose: package manager **npm**, template **minimal**, modules: **none**, git: your choice.
2. Copy these from this zip into the new `simp-frontend` folder, replacing existing files:
   - the whole `app/` folder (delete the generated `app/app.vue` first - ours replaces it)
   - `nuxt.config.ts`
   - `.env.example` -> rename the copy to `.env`
3. Start it:
   ```
   cd simp-frontend
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

`.env` decides which API is used:
```
NUXT_PUBLIC_API_BASE=http://localhost:8080
```
Use your Render URL instead to talk to the deployed backend (no trailing slash).

## Try the whole flow
1. Register as **company** (Register > "I am a company").
2. Log in as the **admin** (backend ADMIN_EMAIL / ADMIN_PASSWORD) > Users > create a **STAFF** account.
3. Log in as staff > "Review & reports" > **Verify** the company.
4. Log in as the company > post an internship. Log in as staff > **Approve** it.
5. Register as **student** > Profile (major, skills, CV) > Find internships > Apply.
6. Company > Applicants > Shortlist > Schedule interview > Interviewed > Accepted.
7. Staff > mark Completed, check the reports and CSV export. Student sees every step + notifications.

## Deploy on Render (Static Site)
New > **Static Site** > connect the GitHub repo of this frontend.
- Build command: `npm install && npm run generate`
- Publish directory: `.output/public`
- Environment variable: `NUXT_PUBLIC_API_BASE` = your backend URL (set it BEFORE building)
- Redirects/Rewrites: add rule  Source `/*`  Destination `/index.html`  Action **Rewrite**
- If the build complains about the Node version, add `NODE_VERSION` = `22`.
Then, in the backend service, set `CORS_ORIGINS` to the static site URL and redeploy it.

## Structure
```
app/
  app.vue
  assets/css/main.css
  components/StatusBadge.vue
  composables/  useSession.ts  useApi.ts  useAuth.ts  useToast.ts
  layouts/default.vue            top bar, role menu, notification bell
  middleware/auth.global.ts      login + role guard on every page
  pages/
    index.vue  login.vue  register.vue  notifications.vue
    student/   index.vue (search/recommended/saved/apply)  applications.vue  profile.vue
    company/   index.vue (profile, post, listings)  internships/[id].vue (applicants, interviews)
    staff/     index.vue (verify, approve, reports, CSV)
    admin/     index.vue (users)
  utils/helpers.ts
nuxt.config.ts   .env.example
```
