# SizLand ERP Frontend 2.0

SizLand ERP is the client-side application that powers SizLand’s escrow-backed marketplace for distributed teams. It combines multi-step project orchestration, real-time budgeting, Algorand wallet connectivity, and Clerk-powered authentication into a single Vue 3 experience that keeps remote contributors paid on time.

## Feature Highlights

- **Escrow-aware project delivery**: Create projects, fund escrow milestones, and view pay readiness directly inside each workspace.
- **Remote talent cockpit**: Dashboards consolidate hiring funnels, assignments, kanban boards, task calendars, and communication threads.
- **Wallet-native payouts**: Built-in support for Pera, Defly, WalletConnect/MyAlgo, and Algorand SDK utilities ensures on-chain settlement.
- **Compliance-ready authentication**: Clerk satellite mode, custom SSO callback, and granular route guards protect sensitive data.
- **Insightful analytics**: ApexCharts-powered budget scorecards, payment timelines, and workforce heatmaps track delivery risk early.

## Tech Stack

| Layer | Tooling |
| --- | --- |
| Core framework | Vue 3 + TypeScript, Vite 6 |
| UI system | Vuetify 3, Tailwind utilities, custom SCSS tokens |
| State & routing | Pinia, Vue Router 4 |
| Data & services | Axios, composables in `src/services` and `src/lib` |
| Auth & wallets | Clerk, `@txnlab/use-wallet-vue`, WalletConnect 2, Algorand SDK |
| Charts & UX | ApexCharts, Globe.gl, Framer Motion |

## Project Structure (high level)

- `src/views` – Dashboards, project flows, analytics, calendar, kanban, payments, messaging, invitations.
- `src/layouts` – Authenticated full layout, blank public shell, vertical navigation, sidebar config.
- `src/stores` – Pinia stores for projects, payments, tasks, invitations, global UI state.
- `src/services` / `src/lib` – API clients, wallet helpers, escrow calculators, mocked data sources.
- `api/` – Vercel-style serverless helpers (wallet lookups, webhooks) used in preview deployments.

## Getting Started

### Prerequisites

- Node.js 18+ (ESM + Vite 6 support)
- npm 9+ (use `npm install --legacy-peer-deps` to avoid peer mismatches)

### Installation

```bash
git clone <repo-url>
cd siz-erp-frontend2.0
npm install --legacy-peer-deps
```

### Environment variables

Create `.env.local` (or use Vercel/Netlify secrets) with the following keys:

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Public key for Clerk frontend SDK | `pk_test_...` |
| `VITE_CLERK_SECRET_KEY` | Server-side Clerk key (only when using local API routes) | `sk_test_...` |
| `VITE_CLERK_IS_SATELLITE` | Toggle for satellite auth deployments | `true` |
| `VITE_CLERK_DOMAIN` | Primary auth domain when satellite mode is enabled | `auth.sizland.com` |
| `VITE_CLERK_SIGN_IN_URL` / `VITE_CLERK_SIGN_UP_URL` | Explicit URLs for redirect-based auth flows | `https://auth.sizland.com/sign-in` |
| `VITE_BACKEND_URL` | Base URL for SizLand backend APIs | `https://api.sizland.com` |

### Development

```bash
npm run dev
```

Vite serves the app on `http://localhost:5173` (or the next free port) with hot-module replacement.

### Production build & preview

```bash
npm run build
npm run preview   # serves the generated dist/ bundle on port 5050
```

Results inside `dist/` are static SPA assets ready for Vercel, Netlify, Cloudflare Pages, or any CDN that supports SPA rewrites (see `public/_redirects`).

### Useful scripts

| Script | Description |
| --- | --- |
| `npm run typecheck` | Ensures Vue SFC + TS types pass before deploys |
| `npm run lint` | ESLint for `.vue/.ts` sources (auto-fix enabled) |
| `npm run build-stage` / `build-prod` | Alternate public path builds for CDN releases |
| `npm run deploy` | Publishes the `dist/` folder to GitHub Pages (`gh-pages` branch) |

> Tests are executed via `npx vitest` (add a package script if you prefer a shorthand).

## Testing & Quality

- Component/story checks live under `src/tests` with Vitest for logic and `@vue/test-utils`.
- Automated linting + formatting via ESLint + Prettier (see `eslint.config.js`).
- Type-safety enforced by `vue-tsc`.

## Deployment Notes

- SPA routing requires rewrite rules (`public/_redirects` or Vercel `vercel.json`).
- For auth satellite deployments, ensure the frontend URL matches the domain configured in Clerk, otherwise `/login` and `/register` guards will redirect back to the canonical auth host.
- Wallet connectivity depends on Algorand mainnet/testnet nodes reachable from the client; configure network endpoints in `src/lib/algorand`.

## Security & Compliance

Security reviews and remediation plans live alongside the codebase:

- `SECURITY_AUDIT_REPORT.md`
- `SECURITY_FIXES_SUMMARY.md`
- `tests/security.md`

Review these documents before production launches or compliance reviews.

## License

This project remains under the [MIT License](LICENSE). Please retain the copyright notice from CodedThemes in derivative works.
