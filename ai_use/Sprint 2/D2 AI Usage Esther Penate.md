Frontend Task D2 - Deliver and verify a deployable frontend build
Team member: Esther Penate
AI tool: Claude (Anthropic)
Dates: October 30, 2026 [adjust if you worked across more days]
Repo: https://github.com/vnnguy30/FA26-CIS3339-Group26-Project.git

This is what I asked the AI in regards to D2. The prompts are in my own words, and the AI's answers are summarized. The code shown is the final version of the files that went into the project.

1. Starting the task

User prompt: Can you help me with this task for Sprint 2? (I pasted the full D2 description and its acceptance criteria from the project guideline. The professor's template zip was already uploaded in the same conversation.) Response: The AI read the template's frontend (package.json, vite.config.js, index.html, the router, and api.js), installed the dependencies, and ran npm run build on the unmodified template before changing anything. The build failed. The router imports ../views/eventdetails.vue, but the file is named eventDetails.vue. Windows and macOS ignore letter case in file names, so this works on our laptops, but a Linux host cannot find the file. The AI searched every relative import in src and confirmed this was the only mismatch.

2. Making the build deployable

Response: The AI changed the template so the criteria in D2 could be met and documented. It fixed the router import (matching the real file name instead of renaming the file, to avoid a case-only rename in Git and merge conflicts with other tasks). It made the router's history base follow Vite's BASE_URL. It rewrote vite.config.js to stop using CommonJS require('path') and to fail the build with a clear message if VITE_ROOT_API is missing. It added public/_redirects for the single-page-app fallback, a preview script, .env and .env.example, and removed package-lock.json from .gitignore so everyone installs the same versions. It also rewrote frontend/README.md with setup, environment variables, build, preview, SPA fallback rules for several hosts, a deployment steps section, CORS notes, and known limitations.

js
// vite.config.js (excerpt)
const env = loadEnv(mode, process.cwd(), '')

// Fail the production build early instead of shipping a site that calls itself.
if (command === 'build' && !env.VITE_ROOT_API) {
  throw new Error('VITE_ROOT_API is not set. Add it to frontend/.env or set it as an environment variable on your host, e.g. VITE_ROOT_API=http://localhost:3000')
}

return {
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  // Same port as the dev server so the backend CORS_ORIGIN works for both
  preview: { port: 5173, strictPort: true }
}
js
// src/router/index.js (two changed lines)
component: () => import('../views/eventDetails.vue')
history: createWebHistory(import.meta.env.BASE_URL),
# public/_redirects
/*    /index.html   200
# .env and .env.example
VITE_ROOT_API=http://localhost:3000

The AI also pointed out two things I would not have noticed on my own. First, npm run preview defaults to port 4173, which would be blocked by the backend once S1 locks CORS to http://localhost:5173, so the port was pinned to 5173. Second, our Sprint 1 specification says the API base URL is read "at runtime", but Vite writes VITE_ROOT_API into the bundle at build time, so changing the backend URL means rebuilding.

3. Verifying the build

Response: The AI checked each D2 acceptance criterion on a Linux environment (Node 22.22.2, npm 10.9.7) and reported the results:

npm run build exited with code 0 and had no unresolved imports.
With no VITE_ROOT_API, the build failed with the clear error message.
npm run preview served the site at http://localhost:5173.
Requesting /clientdetails/<id> and /eventdetails/123 directly returned the app (HTTP 200), while a missing file such as /assets/nope.js correctly returned 404.
The source code has no localhost references. A build with VITE_ROOT_API=https://api.example.com put that URL into the bundle. One localhost string remained in the bundle, and the AI traced it to axios, which uses http://localhost internally as a fallback for parsing URLs. It is not an address of our app, and it is listed under known limitations in the README.
Reaching a deployed backend from a deployed frontend was not tested. The AI could not deploy, and that part is left for the team.

4. Understanding the SPA fallback

User prompt: What does _redirects do? Response: The AI explained that our app is a single-page app, so only index.html exists on the server and Vue Router draws the pages in the browser. Clicking links works without the file, but refreshing on /clientdetails/123 makes the browser ask the host for a file that does not exist, which gives a 404. The rule /*  /index.html  200 tells Netlify or Cloudflare Pages to serve index.html for any path with no matching file, so Vue Router can then show the right page. Real files such as assets are still served normally, the 200 means the address bar does not change, and the file sits in public/ because Vite copies that folder into dist/. Other hosts need an equivalent setting (a rewrite in vercel.json, a dashboard rule on Render, or try_files in nginx), and the preview server does the fallback by itself.

5. Making sure D2 works with F1

User prompt: My group mate already did task F1, how do I make sure my changes work with theirs? Response: The AI said to merge F1 into my branch (preferably after F1 is merged into main), then rebuild and test. It listed the files most likely to conflict and how to resolve each: src/router/index.js (keep their changes plus my two edited lines), package.json (keep both sets of changes), package-lock.json (delete it, run npm install, and commit the regenerated file), and README.md (keep both). After merging, I should run npm install, npm run build, and npm run preview, click through every page with the browser console open to look for Vue warnings and errors, refresh on a nested route, and watch for any new file-name case mismatches, which only fail on Linux hosts. The AI also said that if the build breaks inside F1's code, I should tell the teammate rather than fix it on my branch.

6. What the AI did vs. what I decided

AI helped with: Finding that the template's build fails on Linux because of a file-name case mismatch, writing the Vite config, router, environment, SPA fallback, and README changes, testing each acceptance criterion in its own environment, producing a patch file, and explaining the Git workflow, the _redirects file, and how to combine D2 with F1.
I did / decided: Asked how to connect the changes to our team repository and how to make them work alongside F1, asked what _redirects does so I understand it before submitting it, and [fill in your own decisions, for example: chose the hosting platform, decided how to split my commits, decided whether to keep the build-time setting or switch to a runtime setting, and filled in the deployment steps section of the README after deploying].

What I learned

I learned that a Vite app reads its API address when it is built, not when someone visits the site, so changing the backend means rebuilding. I learned that a single-page app on a static host needs a fallback rule, or refreshing a nested route gives a 404. I learned that file-name case matters on Linux, so a project can build on Windows or macOS and still fail on a host, and that the build is the real test. I also learned how to bring a task into a team repository through a branch, a pull request, and a review, and how to merge another teammate's work into my branch and rebuild before merging.