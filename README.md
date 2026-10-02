# Memory Lab

An interactive guide to how AI assistants use memory, built with Next.js and React. Meet five memory types, then follow one memory as it is saved, found, tested, and forgotten, and see how the design changes at scale.

**No API key, model service, or database is required.** Responses are scripted, and the labs run local, deterministic logic. All people, buildings, and measurements are fictional teaching examples.

## Run locally

Requires Node.js 20.9 or later and npm. Use a currently supported Node.js release.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For a production build:

```sh
npm run build
npm start
```

The lockfile is committed for reproducible dependency installation. No environment variables are required.

## Start exploring

1. In **Explore memory**, run an example, then edit a memory or switch memory off and compare.
2. Use **Compare types** to separate what a memory contains from how long it lasts.
3. Open **Learning labs** and follow one memory through four labs: save, find, test, and forget. Each has three “Try this” steps and ends with its main point; extra controls are folded under expandable panels.
4. Try **Design for scale** in three numbered parts, laid out like the labs: **One complaint** (memory on and off, a step-by-step walkthrough, offline handling), **Grow the estate** (one building to 1,000, architecture, and calculations), and **Handle bursts** (a request-queue simulation).
5. Use **Sources** for every reference, what it supports, and where it is used. Each section ends with a link to its own filtered list.

| Learning lab | What you can do | Boundary |
| --- | --- | --- |
| 1. Save | Decide which of four messages should change a saved fact; see the correction kept in history; optionally see why a save is refused when someone else saved first. | Proposals are authored, not automatically extracted. |
| 2. Find | Search by same words, related words, or an exact field; limit how many memories and how many words reach the prompt; see what was included and why. | No learned embeddings, model tokenizer, or generator. The budget counts words. |
| 3. Test | Answer six known questions with memory off, every memory, or only relevant, current memories; inspect precision, recall, and out-of-date evidence. Developers can export a kit and import measured runs. | Local answers use a field reader with a supplied key. Imported answers require manual review. |
| 4. Forget | Delete a memory, watch its search copy leak back without the safety check, then remove the copy; optionally filter by person and date. | Public browser simulation, not server authorization or proof of deletion from external systems. |

The labs share 12 fictional memories, each tagged with its memory type, separate from edited Explore records. The request-queue simulation in Design for scale (arrivals, bursts, workers, service time, deadlines, p95, and misses) uses chosen inputs, not a production load test. Lab state resets when an activity is left. No end-to-end model memory system runs here.

## Persistence and privacy

Explore's semantic, episodic, and procedural records save in this browser when storage is available. Working and short-term records clear on a new chat; reloading seeds temporary examples again. Save failures are shown in the interface. Storage belongs to one origin (scheme, host, and port); it does not sync between devices.

Each record can be deleted on its own, and **Reset example** restores a type’s starting records.

When another tab changes saved records, saving pauses until **Load saved version** or **Keep this tab’s version** is chosen. Web Locks serialize participating tabs where supported. The fallback is not atomic, and other writers can still race.

The application does not send entered memories to a model or application backend. Lab exports are local downloads. Fonts are bundled at build time; following references opens external websites. Hosting providers may keep ordinary request logs. Use fictional data when exploring a shared device or deployment.

## Link to a view

Hash URLs support browser back/forward and reloads:

- `/#explore/semantic` (also `working`, `short`, `episodic`, `procedural`)
- `/#compare`, `/#enterprise`, `/#sources` (the old `/#guide` link opens Explore)
- `/#labs/write`, `/#labs/retrieve`, `/#labs/evaluate`, `/#labs/govern` (the old `/#labs/capacity` link opens Design for scale's bursts part)
- `/#enterprise/case`, `/#enterprise/grow`, `/#enterprise/bursts`

URLs preserve the selected view, not unsaved controls or imported model runs.

## References and scope

**Sources** is the only place references are listed: 20 papers and documentation pages, each with what it supports and the sections that use it. Links were last checked on 1 October 2026. Every section ends with a "Sources for this section" link to its filtered list. Assumptions and limits are stated where they apply. References and their section mapping live in [`lib/sources.ts`](lib/sources.ts).

Memory Lab is an introductory teaching application. It does not establish that memory improves model quality. Automatic extraction, learned semantic search, generated summaries, multi-session reasoning, actual model measurements, and production integrations are outside its scope. Accessibility features include keyboard controls, reduced motion, and chart data alternatives; full screen-reader and cross-browser validation remain outstanding.

## Development and verification

```sh
npm run typecheck
npm run build
npm test
```

Tests require an installed Google Chrome. Playwright starts a production server on port 3107; build first and leave that port free. Set `PLAYWRIGHT_PORT` to use a different port. The suite contains 31 checks covering browser workflows and deterministic logic. Its model-run fixtures are synthetic, not model measurements.

| Files | Purpose |
| --- | --- |
| `app/page.tsx`, `lib/memory.ts`, `app/kind-icons.ts` | Main views, scripted examples, shared memory-type icons, and browser persistence |
| `app/learning-labs.tsx`, `app/lab-*.tsx`, `lib/experiments.ts` | The four labs, shared lab components, fixtures, algorithms, and import validation |
| `app/enterprise.tsx`, `lib/buildings.ts`, `app/visuals.tsx`, `app/queue-simulator.tsx` | Design for scale: building scenarios, diagrams, calculations, and the queue simulation |
| `app/sources.tsx`, `lib/sources.ts` | The reference list and each section's link to it |
| `app/*.css` | Styles; `globals.css` holds the type scale and `theme.css` the color roles |
| `tests/` | Browser and logic checks |

## Deploy to Vercel

Import the GitHub repository into Vercel, choose the **Next.js** framework preset and use the repository root. Use `npm ci` for installation, `npm run build` for the build and the preset's default output settings. No database or secret configuration is needed. See [Vercel's Next.js documentation](https://vercel.com/docs/frameworks/full-stack/nextjs).

`.gitignore` excludes dependencies, generated files, test output, local secrets, editor and OS metadata, and local assistant configuration. Source, tests, documentation, and `package-lock.json` are committed. `.vercelignore` additionally excludes repository-only documentation and tests from deployment uploads while retaining the in-app citations. Ignore files do not remove files already tracked in an existing repository. Publishing the repository alone does not configure GitHub Pages hosting.

## License

[MIT](LICENSE). Referenced publications and third-party dependencies retain their own licenses.
