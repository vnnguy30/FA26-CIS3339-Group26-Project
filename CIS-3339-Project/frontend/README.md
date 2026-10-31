# Data Platform Frontend

Vue 3 single-page application built with [Vite](https://vitejs.dev/), [Pinia](https://pinia.vuejs.org/), [Vue Router](https://router.vuejs.org/) and [Tailwind CSS](https://tailwindcss.com/).

## Prerequisites

- Node.js 18 or newer (build verified on Node 22.22.2 with npm 10.9.7)
- A running backend API (local or deployed)

## Install

    cd frontend
    npm install

## Environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_ROOT_API` | Base URL of the backend API. No trailing slash. | `http://localhost:3000` |

`frontend/.env` is committed with the grading value (`http://localhost:3000`). `frontend/.env.example` is a copy for reference.

**Important: `VITE_ROOT_API` is read when you run `npm run build`, not when a visitor opens the site.** Vite writes the value into the JavaScript bundle. To point the site at a different backend you must rebuild.

- Locally: edit `frontend/.env` and rebuild.
- On a hosting platform: set `VITE_ROOT_API` as an environment variable in the host's dashboard. Values set in the shell or on the host take priority over `.env`, so you do not need to edit the file for a deployment.
- If `VITE_ROOT_API` is missing, `npm run build` stops with an error that says so, instead of producing a site that calls the wrong server.

## Development

    npm run dev

Opens the Vite dev server at http://localhost:5173.

## Production build

    npm run build

Writes the static site to `frontend/dist/`. The build exits with code 0 when every import resolves.

## Serve the production build locally

    npm run preview

(`npm run serve` does the same.) Serves `dist/` at http://localhost:5173, the same origin as the dev server, so the backend's `CORS_ORIGIN=http://localhost:5173` works for both. Stop the dev server before running preview, since both use port 5173.

The preview server already returns `index.html` for unknown paths, so refreshing a nested route such as `/clientdetails/<id>` works locally.

## Static hosting and the SPA fallback

The router uses history mode (`/clientdetails/123`, not `/#/clientdetails/123`). A static host only has real files, so a refresh on a nested URL returns 404 unless the host is told to serve `index.html` for every path that is not a real file. This is called the SPA fallback.

`public/_redirects` is copied into `dist/` by the build and configures this on **Netlify** and **Cloudflare Pages**:

    /*    /index.html   200

Equivalent rules for other hosts:

- **Vercel**, `vercel.json` in `frontend/`:

      { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }

- **Render (Static Site)**: Redirects/Rewrites tab, add a Rewrite from `/*` to `/index.html`.
- **nginx**: `location / { try_files $uri $uri/ /index.html; }`
- **Apache**: enable `mod_rewrite` and rewrite requests for non-files to `/index.html`.

Assets are referenced with absolute paths (`/assets/...`, `base: '/'` in `vite.config.js`), which is required for nested routes to load their scripts. Deploy at the root of a domain. To deploy under a sub-path, build with `npx vite build --base=/sub-path/`; the router already reads `import.meta.env.BASE_URL`.

## Deployment steps used by this team

- Host: `[Netlify / Vercel / Render / other]`
- Deployed frontend URL: `[https://...]`
- Deployed backend URL: `[https://...]`
- Repository connection: `[GitHub repo, branch main]`
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable set on the host: `VITE_ROOT_API=[deployed backend URL]`
- SPA fallback: `[public/_redirects / vercel.json / dashboard rewrite]`
- Backend `CORS_ORIGIN` set to: `[exact deployed frontend origin, e.g. https://example.netlify.app]`

## Connecting the deployed frontend to the deployed backend

1. Build the frontend with `VITE_ROOT_API` set to the backend's public URL.
2. Set the backend's `CORS_ORIGIN` to the frontend's exact origin: scheme, host and port, no trailing slash and no path.
3. Use HTTPS for both. Browsers block an HTTPS page from calling an HTTP API (mixed content).
4. Redeploy the frontend whenever `VITE_ROOT_API` changes.

## Cross-platform notes

- File names are case-sensitive on Linux hosts and case-insensitive on Windows and macOS. An import such as `eventdetails.vue` for a file named `eventDetails.vue` works on a laptop and fails on the host. This was fixed in the router. Always match the exact case of the file name in imports.
- `vite.config.js` resolves the `@` alias with `fileURLToPath`, so it does not depend on path separators or on CommonJS `require`.
- Commit `package-lock.json` so every machine installs the same versions.

## Verification checklist

| Check | Command | Expected |
| --- | --- | --- |
| Clean build | `npm install && npm run build` | exit code 0, no "Could not resolve" errors |
| Missing variable | build with no `VITE_ROOT_API` | build fails with a clear message |
| Preview | `npm run preview` | site at http://localhost:5173 |
| Nested route refresh | open `/clientdetails/<id>` in the preview and press F5 | page loads, not 404 |
| API URL comes from the variable | `VITE_ROOT_API=https://api.example.com npm run build`, then search `dist/` | the new URL is present; the source has no `localhost` |
| Missing file stays 404 | open `/assets/nope.js` | 404, not the app's HTML |

## Known limitations

- The backend URL is fixed at build time (see Environment variables).
- The Material Icons stylesheet is loaded from Google Fonts in `index.html`, so icons need internet access.
- The built bundle contains the string `http://localhost` once. It is inside axios, which uses it internally to parse URLs, not an API address of this app.
- `npm run preview` and `npm run dev` both use port 5173 and cannot run at the same time.
