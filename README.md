# SIZLAND ERP Application (SIZERP2-0)

**Enterprise Resource Planning System with Blockchain Integration**

[![Vue](https://img.shields.io/badge/Vue-3.5.13-green)](https://vuejs.org/)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.7.6-blue)](https://vuetifyjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Algorand](https://img.shields.io/badge/Algorand-Blockchain-00D1B2)](https://www.algorand.com/)

SIZLAND ERP is the core project management application that enables transparent, blockchain-powered team collaboration. Built with Vue 3 and integrated with Algorand blockchain, it provides enterprise-grade project management with automated payment processing through smart contracts.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Payment System](#payment-system)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## Overview

SIZLAND ERP serves as the central hub for project management and team collaboration within the SIZLAND ecosystem. It connects to the backend API for data persistence and directly to the Algorand blockchain for payment processing, creating a transparent and secure environment for distributed teams.

**Primary Functions:**
- Project creation and management
- Department organization and hierarchy
- Task assignment and tracking
- Team member collaboration
- Blockchain-based payment processing
- Real-time updates and notifications
- Role-based access control

**Integration Points:**
- Backend API (SIZERPBACKEND2-0) for business logic
- Algorand blockchain for payments
- Clerk for authentication
- Landing page (web3-landing) for user onboarding

---

## Key Features

### Project Management

**Project Types:**
- **PROGRESSIVE**: Sequential department workflow
- **PARALLEL**: Concurrent department operations

**Project Features:**
- Budget allocation and tracking
- Timeline management with milestones
- Priority levels (LOW, MEDIUM, HIGH, CRITICAL)
- Department hierarchy (MAJOR and MINOR departments)
- Multi-departmental coordination
- Project status monitoring
- Real-time budget consumption tracking

### Department Management

**Department Structure:**
- MAJOR departments: Core project components
- MINOR departments: Support functions
- Department ordering for workflow control
- Manager assignments per department
- Resource allocation tracking
- Inter-department dependencies

### Task Management

**Task Lifecycle:**
1. **PENDING**: Task created, awaiting assignment
2. **IN_PROGRESS**: Actively being worked on
3. **COMPLETED**: Work finished, pending review
4. **APPROVED**: Reviewed and approved, payment released

**Task Features:**
- Role-based task assignment
- Time tracking (estimated vs actual)
- Priority management
- Due date with timezone support
- Progress tracking with checklists
- Payment integration per task
- File attachments and comments
- Activity history and audit trail

### Team Collaboration

**Communication Tools:**
- Real-time messaging
- Task comments and discussions
- File sharing and attachments
- Notification system
- Activity feeds
- Team member profiles

**Invitation System:**
- Email-based project invitations
- Role-specific invitations
- Custom payment terms per invitation
- Invitation tracking and management

### Payment & Escrow System

**Blockchain Integration:**
- Algorand wallet connection (Pera, Defly, Lute)
- Project escrow account management
- Task-based payment allocation
- Automatic payment release on approval
- Transaction history and verification
- Real-time blockchain confirmations

**Payment Models:**
- Per-task compensation
- Recurring salary payments (weekly/biweekly/monthly)
- Milestone-based payments
- Oversight rate compensation
- Hybrid payment structures

### Analytics & Reporting

**Dashboard Metrics:**
- Project budget utilization
- Task completion rates
- Payment timeline tracking
- Team productivity metrics
- Department performance
- Risk indicators

**Visualizations:**
- ApexCharts for data visualization
- Budget scorecards
- Payment timelines
- Workforce heatmaps
- Progress indicators

---

## Technology Stack

### Core Framework
**Vue 3.5.13 with Composition API**
- Modern reactive framework
- TypeScript 5.7.2 for type safety
- Vite 6.0.7 for fast builds and HMR
- ESM module support

### UI Framework
**Vuetify 3.7.6 (Material Design)**
- Complete component library
- Responsive grid system
- Custom theme configuration
- TailwindCSS 4.1.12 utilities
- Custom SCSS design tokens

### State Management
**Pinia 2.3.0**
- Official Vue state management
- TypeScript support
- Modular store architecture
- DevTools integration

### Routing
**Vue Router 4.5.0**
- Navigation guards for auth
- Route meta fields
- Lazy loading support
- Dynamic route matching

### HTTP Client
**Axios 1.7.9**
- Request/response interceptors
- Authentication token handling
- Error handling middleware
- Request cancellation

### Authentication
**Clerk Integration**
- Enterprise-grade authentication
- @clerk/vue 1.10.0
- JWT token management
- SSO support
- Satellite mode for multi-domain
- Custom callback handling

### Blockchain Integration
**Algorand SDK 3.5.2**
- Wallet connectivity
  - @perawallet/connect 1.4.2
  - @blockshake/defly-connect 1.2.1
  - @txnlab/use-wallet-vue 4.3.1
- WalletConnect 2 support
- Transaction signing
- Smart contract interaction
- ARC-0059 atomic transfers

### Data Visualization
**ApexCharts 4.3.0**
- Vue3-ApexCharts 1.8.0 wrapper
- Interactive charts and graphs
- Real-time data updates

### Additional Libraries
- **date-fns 4.1.0**: Date manipulation
- **lodash 4.17.21**: Utility functions
- **yup 1.6.1**: Schema validation
- **vee-validate 4.15.0**: Form validation
- **globe.gl 2.44.0**: 3D globe visualization
- **framer-motion 12.23.22**: Animation library

### Development Tools
- **ESLint 9.17.0**: Code linting
- **Prettier 3.4.2**: Code formatting
- **Vitest 4.0.8**: Unit testing
- **vue-tsc 2.2.0**: TypeScript checking

---

## Prerequisites

**Required Software:**
- Node.js 18+ (ESM and Vite 6 support required)
- npm 9+ or yarn 1.22+
- Git for version control

**Required Services:**
- Backend API (SIZERPBACKEND2-0) running on http://localhost:4000
- PostgreSQL database (via backend)
- Redis cache (via backend)
- Clerk account for authentication

**Optional Services:**
- Algorand wallet (Pera, Defly, or Lute) for payment features
- WalletConnect Project ID for multi-wallet support

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Finteckinfo/SIZERP2-0.git
cd SIZERP2-0
```

### 2. Install Dependencies

```bash
# Using npm (recommended)
npm install --legacy-peer-deps

# Or using yarn
yarn install
```

**Note:** Use `--legacy-peer-deps` flag to avoid peer dependency conflicts with Vue 3 and Vuetify 3.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Or create `.env` manually with the following variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_CLERK_SECRET_KEY=sk_test_xxx
VITE_CLERK_IS_SATELLITE=false
VITE_CLERK_DOMAIN=sizland.com
VITE_CLERK_SIGN_IN_URL=http://localhost:5173/login
VITE_CLERK_SIGN_UP_URL=http://localhost:5173/register

# Backend API
VITE_BACKEND_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000

# WalletConnect (Optional)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Application
VITE_ENVIRONMENT=development
VITE_APP_URL=http://localhost:5173
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` with hot-module replacement enabled.

---

## Configuration

### Environment Variables

**Clerk Authentication:**

| Variable | Purpose | Example |
|----------|---------|----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Public key for Clerk frontend SDK | `pk_test_...` |
| `VITE_CLERK_SECRET_KEY` | Server-side Clerk key (for API routes) | `sk_test_...` |
| `VITE_CLERK_IS_SATELLITE` | Enable satellite mode for multi-domain | `true` or `false` |
| `VITE_CLERK_DOMAIN` | Primary auth domain (satellite mode) | `auth.sizland.com` |
| `VITE_CLERK_SIGN_IN_URL` | Custom sign-in URL | `https://sizland.com/login` |
| `VITE_CLERK_SIGN_UP_URL` | Custom sign-up URL | `https://sizland.com/register` |

**Backend Integration:**

| Variable | Purpose | Example |
|----------|---------|----------|
| `VITE_BACKEND_URL` | Backend API base URL | `http://localhost:4000` |
| `VITE_API_URL` | Alternative API endpoint | `http://localhost:4000` |

**Blockchain Integration:**

| Variable | Purpose | Example |
|----------|---------|----------|
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | `your_project_id` |
| `VITE_ALGORAND_NETWORK` | Algorand network (mainnet/testnet) | `testnet` |

### Satellite Mode Configuration

For multi-domain deployments (e.g., app.sizland.com with auth.sizland.com):

```env
VITE_CLERK_IS_SATELLITE=true
VITE_CLERK_DOMAIN=auth.sizland.com
VITE_CLERK_SIGN_IN_URL=https://auth.sizland.com/sign-in
VITE_CLERK_SIGN_UP_URL=https://auth.sizland.com/sign-up
```

---

## Development

### Available Scripts

```bash
# Development server with HMR
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview

# Build for staging
npm run build-stage

# Build for production with custom base path
npm run build-prod

# Deploy to GitHub Pages
npm run deploy
```

### Development Workflow

1. **Start the backend API first:**
   ```bash
   cd ~/SizLand/SIZERPBACKEND2-0
   npm run dev
   ```

2. **Start the ERP application:**
   ```bash
   cd ~/SizLand/SIZERP2-0
   npm run dev
   ```

3. **Access the application:**
   - ERP: http://localhost:5173
   - Backend API: http://localhost:4000

### Hot Reload

Vite automatically reloads the application when you save changes:
- Vue components: Instant hot module replacement
- TypeScript files: Fast recompilation
- SCSS/CSS: Live style injection

---

## Project Structure

```
SIZERP2-0/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── App.vue                    # Root component
│   │
│   ├── views/                     # Page components
│   │   ├── authentication/        # Login, register, password reset
│   │   ├── dashboards/            # Dashboard views
│   │   │   ├── ProjectDashboard.vue
│   │   │   ├── AnalyticsDashboard.vue
│   │   │   └── PaymentDashboard.vue
│   │   ├── projects/              # Project management
│   │   │   ├── ProjectList.vue
│   │   │   ├── ProjectDetails.vue
│   │   │   └── CreateProject.vue
│   │   ├── tasks/                 # Task management
│   │   │   ├── TaskBoard.vue
│   │   │   ├── TaskCalendar.vue
│   │   │   └── TaskDetails.vue
│   │   ├── payments/              # Payment management
│   │   │   ├── EscrowManagement.vue
│   │   │   ├── PaymentHistory.vue
│   │   │   └── WalletConnection.vue
│   │   └── settings/              # User settings
│   │
│   ├── layouts/                   # Layout components
│   │   ├── full/                  # Authenticated layout
│   │   │   ├── FullLayout.vue
│   │   │   ├── vertical-sidebar/
│   │   │   └── vertical-header/
│   │   └── blank/                 # Public layout
│   │
│   ├── components/                # Reusable components
│   │   ├── shared/                # Shared UI components
│   │   ├── forms/                 # Form components
│   │   ├── charts/                # Chart components
│   │   └── guards/                # Route guards
│   │
│   ├── stores/                    # Pinia state stores
│   │   ├── auth.ts                # Authentication state
│   │   ├── projectStore.ts        # Project management state
│   │   ├── taskStore.ts           # Task management state
│   │   ├── paymentStore.ts        # Payment state
│   │   ├── walletStore.ts         # Wallet connection state
│   │   └── uiStore.ts             # UI state (theme, sidebar)
│   │
│   ├── router/                    # Vue Router configuration
│   │   ├── index.ts               # Router setup
│   │   ├── MainRoutes.ts          # Authenticated routes
│   │   └── PublicRoutes.ts        # Public routes
│   │
│   ├── services/                  # API and business logic
│   │   ├── authService.ts         # Authentication API
│   │   ├── projectApi.ts          # Project API calls
│   │   ├── taskApi.ts             # Task API calls
│   │   ├── paymentService.ts      # Payment processing
│   │   ├── walletService.ts       # Wallet operations
│   │   └── websocketService.ts    # Real-time updates
│   │
│   ├── lib/                       # Utility libraries
│   │   ├── clerk.ts               # Clerk configuration
│   │   ├── algorand/              # Algorand utilities
│   │   │   ├── walletManager.ts
│   │   │   ├── transactionBuilder.ts
│   │   │   └── escrowManager.ts
│   │   ├── walletEncryption.ts    # Wallet security
│   │   └── logger.ts              # Logging utility
│   │
│   ├── utils/                     # Helper functions
│   │   ├── secureStorage.ts       # Encrypted localStorage
│   │   ├── formatters.ts          # Data formatting
│   │   ├── validators.ts          # Input validation
│   │   └── constants.ts           # Application constants
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── index.ts               # Main types
│   │   ├── project.ts             # Project types
│   │   ├── task.ts                # Task types
│   │   ├── payment.ts             # Payment types
│   │   └── user.ts                # User types
│   │
│   ├── assets/                    # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   └── styles/                    # Global styles
│       ├── variables.scss         # SCSS variables
│       ├── mixins.scss            # SCSS mixins
│       └── global.scss            # Global CSS
│
├── public/                        # Public static files
│   ├── _redirects                 # SPA redirect rules
│   ├── favicon.ico
│   └── robots.txt
│
├── api/                           # Serverless API routes (Vercel)
│   ├── wallet/                    # Wallet lookups
│   └── webhooks/                  # Webhook handlers
│
├── tests/                         # Test files
│   └── unit/                      # Unit tests
│
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind configuration
└── README.md                      # This file
```

---

## User Roles

### PROJECT_OWNER
**Full project control**
- Create and configure projects
- Manage departments and structure
- Invite team members with roles
- Fund escrow accounts
- Approve payments
- View all analytics
- Delete projects

### PROJECT_MANAGER
**Department-level management**
- Manage assigned department(s)
- Create and assign tasks within department
- Review and approve task completions
- View department analytics
- Communicate with team members
- Request additional budget

### EMPLOYEE
**Task execution**
- View assigned tasks
- Update task status
- Upload work deliverables
- Track time on tasks
- Receive payments upon approval
- View personal analytics

---

## Payment System

### Escrow Architecture

```
Project Creation
       ↓
Fund Escrow Account (Algorand)
       ↓
Task Creation with Payment Allocation
       ↓
Employee Completes Task
       ↓
Manager Reviews & Approves
       ↓
Automatic Payment Release
       ↓
Blockchain Transaction
       ↓
Employee Receives Payment
       ↓
Transaction Confirmed (4 blocks)
```

### Wallet Integration

**Supported Wallets:**
1. **Pera Wallet**: Mobile and browser extension
2. **Defly Wallet**: Mobile wallet with DeFi features
3. **Lute Connect**: Web-based wallet connection
4. **WalletConnect**: Universal wallet protocol

**Connection Flow:**
```typescript
// Example wallet connection
import { useWallet } from '@txnlab/use-wallet-vue';

const { wallets, activeAccount, connect, disconnect } = useWallet();

// Connect to Pera Wallet
await connect('pera');

// Get active account
const address = activeAccount.value?.address;
```

### Payment Processing

**Task Payment Flow:**
1. Task created with payment amount
2. Funds allocated in escrow
3. Task marked as IN_PROGRESS
4. Employee completes work
5. Manager approves task
6. Backend initiates blockchain transaction
7. Payment sent to employee wallet
8. Transaction confirmed
9. Database updated with transaction hash

---

## Testing

### Unit Tests

```bash
# Run tests with Vitest
npx vitest

# Run tests in watch mode
npx vitest watch

# Run tests with coverage
npx vitest --coverage
```

### Component Testing

Tests are located in `src/tests/unit/` and use Vue Test Utils:

```typescript
import { mount } from '@vue/test-utils';
import ProjectCard from '@/components/ProjectCard.vue';

describe('ProjectCard', () => {
  it('renders project information', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: {
          name: 'Test Project',
          budget: 50000
        }
      }
    });
    expect(wrapper.text()).toContain('Test Project');
  });
});
```

### Type Checking

```bash
# Check TypeScript types
npm run typecheck

# Fix auto-fixable issues
npm run lint
```

---

## Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

Output will be in the `dist/` directory.

### Deployment Platforms

**Vercel (Recommended):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Netlify:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
# Deploy to gh-pages branch
npm run deploy
```

### SPA Routing Configuration

**For Netlify:** `public/_redirects` file included:
```
/*    /index.html   200
```

**For Vercel:** Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables (Production)

**Update for production:**
```env
# Production URLs
VITE_BACKEND_URL=https://api.sizland.com
VITE_APP_URL=https://app.sizland.com

# Production Clerk keys
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx

# Algorand Mainnet
VITE_ALGORAND_NETWORK=mainnet

# Environment
VITE_ENVIRONMENT=production
```

### Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Backend API accessible from frontend
- [ ] Clerk authentication working
- [ ] Wallet connection functional
- [ ] SSL certificate active (HTTPS)
- [ ] DNS records properly configured
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured

---

## Security

### Security Measures

**Authentication:**
- Clerk enterprise authentication
- JWT token validation
- Secure session management
- Auto-logout on inactivity

**Data Protection:**
- Encrypted localStorage for sensitive data
- AES-GCM encryption for wallet keys
- HTTPS enforcement in production
- Input validation and sanitization

**Blockchain Security:**
- Transaction signing on client-side
- Wallet connection verification
- Transaction validation before submission
- Confirmation waiting (4 blocks)

### Security Best Practices

```bash
# Regular dependency audits
npm audit

# Fix vulnerabilities
npm audit fix

# Keep dependencies updated
npm update
```

### Security Documentation

Refer to these documents:
- `SECURITY_AUDIT_REPORT.md` - Security assessment
- `SECURITY_FIXES_SUMMARY.md` - Applied security fixes
- `tests/security.md` - Security testing procedures

---

## Troubleshooting

### Common Issues

**Issue: Application won't start**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Issue: Clerk authentication not working**
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set correctly
- Check Clerk dashboard for domain configuration
- Ensure redirect URLs match your application URL

**Issue: Backend API connection fails**
- Verify backend is running: `curl http://localhost:4000/health`
- Check `VITE_BACKEND_URL` in `.env`
- Review browser console for CORS errors
- Ensure backend CORS settings include frontend URL

**Issue: Wallet connection fails**
- Install wallet browser extension (Pera/Defly)
- Check `VITE_WALLETCONNECT_PROJECT_ID` is valid
- Verify Algorand network configuration
- Clear browser cache and reconnect

**Issue: Build fails**
```bash
# Type check first
npm run typecheck

# Check for linting errors
npm run lint

# Try clean build
rm -rf dist
npm run build
```

**Issue: Hot reload not working**
- Check Vite is running on correct port
- Verify firewall isn't blocking HMR websocket
- Try clearing Vite cache: `rm -rf node_modules/.vite`

### Debug Mode

Enable debug logging:
```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

---

## Related Documentation

**In This Repository:**
- `SECURITY_AUDIT_REPORT.md` - Security assessment
- `SECURITY_FIXES_SUMMARY.md` - Applied security patches
- `tests/security.md` - Security testing

**System-Wide Documentation:**
- [Complete System Guide](../COMPLETE_SIZLAND_SYSTEM_GUIDE.md)
- [Master README](../README.md)
- [Backend API README](../SIZERPBACKEND2-0/README.md)
- [Landing Page README](../web3-landing/README.md)

**Ecosystem Components:**
- **Backend API**: `/SIZERPBACKEND2-0` - Business logic and database
- **Landing Page**: `/web3-landing` - Public gateway and marketing
- **This Repository**: Core ERP application

---

## Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run type check: `npm run typecheck`
4. Run linter: `npm run lint`
5. Commit with conventional commits
6. Push and create pull request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

---

## License

**Proprietary License**

This project is private and proprietary to Finteck Information Systems.

Based on CodedThemes template - MIT License portions retain original copyright.

---

## Support

**Technical Support:**
- Email: dev@sizland.com
- GitHub Issues: Create issue in repository

**Documentation:**
- This README (component overview)
- System Guide (complete ecosystem)
- API Documentation (backend integration)

---

**Built with Vue 3 + Vuetify 3 + TypeScript**

**Made by Finteck Information Systems**

**Last Updated:** November 2025
