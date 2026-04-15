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
| patient-app | Expo mobile | 20117 | /patient-app/ |
| doctor-app | Expo mobile | 20119 | /doctor-app/ |
| admin-panel | Web (React+Vite) | 20130 | /admin-panel/ |
| doctor-onboarding | Slides (Vite) | 19222 | /doctor-onboarding/ |
| investor-pitch | Slides (Vite) | 21160 | /investor-pitch/ |
| api-server | API (Express) | 8080 | — |
| mockup-sandbox | Design (Vite) | 8081 | /__mockup |

### Real-time Data Flow
- **Queue Position (Patient App)**: SSE via `GET /api/queues/:doctorId/position/:tokenId/stream` — pushes instant position updates when doctor calls/completes tokens. Fallback: 5s polling.
- **Token Counts (Booking Page)**: SSE via `GET /api/tokens/stream/:doctorId` — real-time booking count per shift.
- **Token Status**: SSE via `GET /api/tokens/stream/single/:tokenId` — real-time single token updates.
- **Doctor Calendar**: Polls `GET /api/doctors/:id` every 10s with 5s stale time.
- **Bookings List**: Polls patient tokens every 10s with 5s stale time.
- All SSE endpoints use `tokenEmitter` (EventEmitter) to broadcast changes whenever tokens are booked/called/completed.

### Icons
Both patient-app and doctor-app use SVG-based Feather icons via `components/FeatherIcon.tsx` (renders inline SVG via `react-native-svg`). This replaces the font-based `@expo/vector-icons/Feather` which failed to render on native Expo Go. The component accepts `name`, `size`, `color` props matching the original Feather API. All 75+ icon SVG paths are hardcoded in the PATHS map. When adding new icon usage, ensure the icon name exists in the PATHS record or add its SVG path from feathericons.com.

### expo-router Base URL Patch
The patient app requires a patch to expo-router's `getPathFromState-forks.js`, `getPathFromState.js`, and `getStateFromPath-forks.js` to enable base URL handling in dev mode. The `postinstall` script (`scripts/patch-expo-router.js`) auto-applies these patches. After patching, Metro cache must be cleared (`rm -rf /tmp/metro-cache /tmp/metro-file-map-*`) and the workflow restarted.

### Admin Panel (artifacts/admin-panel)
React+Vite web app for admin doctor lifecycle management.
- Real-time Firestore `onSnapshot` listener on `doctors` collection (client-side filtering, no composite index needed)
- Stat cards: Total Doctors, Pending Approval, Active & Approved, Hidden
- Filter tabs: All, Pending, Approved, Hidden + search by name/phone/specialty
- Actions: Approve, Hide/Unhide, Delete (with confirmation modal)
- API routes at `/api/admin/doctors/:id/{approve,hide,unhide}` (POST) and `DELETE /api/admin/doctors/:id`
- Vite proxy forwards `/api` requests to api-server on port 8080
- Doctor lifecycle: new doctors start with `isApproved:false, isDeleted:false`; deleted doctors filtered out client-side; `GET /api/doctors` filters by `isApproved !== false`; doctor-app auto-logouts if `isDeleted` detected

### Doctor App (artifacts/doctor-app)
Expo React Native app for doctors. Dark glassmorphic UI with BG=`#070B14`, TEAL=`#0D9488`, TEAL_LT=`#2DD4BF`.
- 7 screens: Login, Dashboard, Master Queue, Earnings, Schedule (within Queue), Settings, Add Walk-in
- No backend — all data is static/mock
- Uses react-native-svg for sparkline charts
- Registered manually (createArtifact "expo" blocked by one-mobile-app limit); artifact.toml written via bash
- PORT hardcoded to 20117 via `${PORT:-20117}` default in package.json dev script
