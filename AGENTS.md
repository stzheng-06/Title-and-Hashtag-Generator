# Repository Guidelines

## Project Structure & Module Organization

This AI title and hashtag generator uses Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, and Zustand.

- `src/app/`: page/layout entry points and API handlers in `api/generate/` and `api/suggest/`.
- `src/components/`: feature folders (`generator`, `config`, `keyword`, `history`, `export`) and shared Radix/shadcn primitives in `ui/`.
- `src/store/`: Zustand stores for configuration, generation, history, and themes.
- `src/types/` and `src/lib/`: shared types, constants, and utilities.
- `src/styles/globals.css`: global styles; `public/`: static assets.
- Root implementation notes, including `HYDRATION_FIX.md` and `ACCESSIBILITY_FIX.md`, explain existing UI decisions.

## Build, Test, and Development Commands

Use npm (the package declares `npm@10.7.0`).

- `npm ci`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Turbopack development server at `http://localhost:3000`.
- `npm run build`: create a production build.
- `npm start`: serve an existing production build; `npm run preview` builds and serves.
- `npm run typecheck`: run TypeScript without emitting files.
- `npm run check`: run Biome lint and import checks.
- `npm run check:write`: apply safe fixes; review the resulting diff.

## Coding Style & Naming Conventions

Use strict TypeScript and `@/` imports for modules under `src/`. Match surrounding formatting: feature code commonly uses two-space indentation, single quotes, and no semicolons; configuration files use tabs. Biome organizes imports and lints, but its formatter is disabled.

Use kebab-case filenames (`generation-panel.tsx`), PascalCase components/types, and camelCase functions. Name Zustand hooks `use...Store`. Reuse UI primitives and keep shared contracts in `src/types/index.ts`.

## Testing Guidelines

No automated test runner, test script, or coverage threshold is configured. Run typechecking, Biome checks, and a production build before submitting code changes. Manually verify affected generation, suggestions, configuration, history, and export flows, including loading/error states. Check persisted state after reload for hydration issues and inspect mobile layouts for UI changes.

## Commit & Pull Request Guidelines

Recent commits use `feat:` and `fix:` prefixes with concise Chinese descriptions. Follow that prefix style and keep commits focused. PRs should explain behavior changes, link relevant issues, report validation results, and include screenshots for visible UI changes.

## Security & Configuration

Never commit API keys or log credential-bearing requests. Keys are entered through the UI, persisted locally, and sent to API routes for upstream requests. When adding environment variables, update both `.env.example` and `src/env.js`; keep real secrets in ignored environment files.
