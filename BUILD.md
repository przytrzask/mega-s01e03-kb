# Building the kb

The export came without build files. These were added so the pages render as the desk sees them:
`package.json`, `svelte.config.js`, `vite.config.js`, `src/app.html`, `src/routes/+layout.ts`
(SvelteKit 2 + mdsvex, prerendered with adapter-static).

```sh
npm install
npm run build      # static site in build/, e.g. build/kb/incidents/4471/problems/index.html
npm run preview    # http://localhost:4173/kb/
```

`desk-view/` holds a built copy and a screenshot of the new page.
