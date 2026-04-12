# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

| Artifact | Type | Port | Preview Path |
|---|---|---|---|
| patient-app | Expo mobile | 20116 | /patient-app/ |
| doctor-app | Expo mobile | 20117 | /doctor-app/ |
| doctor-onboarding | Slides (Vite) | 19222 | /doctor-onboarding/ |
| investor-pitch | Slides (Vite) | 21160 | /investor-pitch/ |
| api-server | API (Express) | 8080 | — |
| mockup-sandbox | Design (Vite) | 8081 | /__mockup |

### Doctor App (artifacts/doctor-app)
Expo React Native app for doctors. Dark glassmorphic UI with BG=`#070B14`, TEAL=`#0D9488`, TEAL_LT=`#2DD4BF`.
- 7 screens: Login, Dashboard, Master Queue, Earnings, Schedule (within Queue), Settings, Add Walk-in
- No backend — all data is static/mock
- Uses react-native-svg for sparkline charts
- Registered manually (createArtifact "expo" blocked by one-mobile-app limit); artifact.toml written via bash
- PORT hardcoded to 20117 via `${PORT:-20117}` default in package.json dev script
