# ShopWise - Smart Shopping Assistant

## Project Overview

ShopWise is a progressive web app (PWA) that helps users manage weekly shopping efficiently. Users can scan items with their phone camera, track recurring purchases, calculate running totals while shopping, and share lists with family/partners in real-time.

**Current Status**: Planning phase - implementation not yet started
**See**: PLAN.md for complete project vision and roadmap

---

## Tech Stack

### Frontend (apps/web/)
- **React 18+** with TypeScript
- **Vite** - build tool
- **Tailwind CSS** - styling
- **Zustand** - state management
- **Workbox** - PWA/offline support
- **ZXing-js** or **QuaggaJS** - barcode scanning

### Backend (apps/api/)
- **Node.js** with Express (or Fastify)
- **PostgreSQL** - database
- **Prisma** - ORM
- **Socket.io** - real-time sync
- **JWT** - authentication

### Infrastructure
- **Docker Compose** - local development
- **Turborepo** - monorepo orchestration
- **Vercel** - frontend hosting (planned)
- **Railway** or **Fly.io** - backend hosting (planned)
- **GitHub Actions** - CI/CD

---

## Project Structure (Planned)

```
ShopWise/
├── apps/
│   ├── web/                    # React PWA frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── features/       # Feature modules (lists, scanner, sharing)
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── store/          # Zustand state stores
│   │   │   ├── services/       # API client, socket client
│   │   │   ├── types/          # TypeScript type definitions
│   │   │   └── utils/          # Helper functions
│   │   ├── public/
│   │   └── index.html
│   └── api/                    # Node.js backend
│       ├── src/
│       │   ├── routes/         # Express route handlers (REST API)
│       │   ├── services/       # Business logic layer
│       │   ├── middleware/     # Auth, validation, error handling
│       │   ├── prisma/         # Database schema & migrations
│       │   ├── sockets/        # Socket.io event handlers (real-time)
│       │   └── utils/          # Helper functions
│       └── Dockerfile
├── packages/
│   └── shared/                 # Shared types & validation schemas
├── .claude/
│   └── docs/                   # Additional documentation
├── docker-compose.yml
├── turbo.json                  # Turborepo configuration
└── package.json                # Root workspace config
```

### Key Directories (When Implemented)

**apps/web/src/features/** - Each shopping feature (lists, scanner, sharing) as isolated modules
**apps/web/src/store/** - Zustand stores for global state (auth, lists, products)
**apps/api/src/routes/** - REST endpoints organized by resource (users, lists, products, stores)
**apps/api/src/services/** - Business logic separated from HTTP layer
**apps/api/src/sockets/** - WebSocket handlers for real-time list sync
**packages/shared/** - Type definitions and validation used by both frontend and backend

---

## Build & Development Commands (Planned)

**Note**: These commands will be available once the project is scaffolded.

```bash
# Install dependencies
npm install

# Start development (all apps)
npm run dev

# Start individual apps
npm run dev --filter=web        # Frontend only
npm run dev --filter=api        # Backend only

# Build for production
npm run build

# Run tests
npm test
npm run test:e2e                # End-to-end tests

# Database operations
npm run db:migrate              # Run migrations
npm run db:seed                 # Seed database
npm run db:studio               # Open Prisma Studio

# Linting & formatting
npm run lint
npm run format

# Docker
docker-compose up               # Start all services
docker-compose down             # Stop all services
```

---

## Database Schema (High-Level)

**Core entities**: User, Store, Category, Product, StoreProduct (pricing), ShoppingList, ListItem, ListShare, PriceHistory

See PLAN.md:90-128 for complete data model with relationships.

---

## Implementation Roadmap

### Phase 1 - Foundation (MVP)
Project scaffolding, auth, CRUD lists, manual items, running totals, basic PWA

### Phase 2 - Scanning & Catalog
Barcode scanner, product catalog, store directory, store-specific pricing, templates

### Phase 3 - Sharing & Real-Time
Share links, permissions, WebSocket sync, push notifications

### Phase 4 - Smart Features
Analytics, smart suggestions, offline-first, accessibility

See PLAN.md:166-199 for detailed task breakdown.

---

## Additional Documentation

When working on specific aspects of ShopWise, consult these files:

- **.claude/docs/architectural_patterns.md** - Design decisions, patterns, and conventions
- **PLAN.md** - Complete project vision, features, and technical decisions

---

## Open Decisions

1. **Auth**: Email/password only, or include social login (Google, Apple)?
2. **Monetization**: Free with ads, freemium, or fully free?
3. **Store locations**: Manual selection or integrate maps API for auto-detection?

See PLAN.md:229-233 for context on these decisions.
