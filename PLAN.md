# ShopWise - Smart Shopping Assistant

## Vision

A progressive web app (PWA) that helps people manage their weekly shopping efficiently. Users can scan items with their phone camera, track recurring purchases, calculate running totals while shopping, and share lists with family/partners.

---

## Core Features

### 1. Shopping Lists

- **Create & manage** multiple shopping lists (e.g. "Weekly Groceries", "House Items")
- **Add items** manually by name, or by scanning
- **Mark items** as picked up during a shopping session
- **Running total** — see the estimated cost update live as items are checked off
- **Recurring lists** — save a "template" list of products you buy every week and re-use it with one tap

### 2. Barcode / Product Scanning (Mobile)

- Use the device camera (via `MediaDevices` API) to scan barcodes
- Look up product info (name, typical price) from a product database
- One-tap add scanned item to the current list
- Falls back gracefully on desktop (manual entry only)

### 3. Price Tracking & Budgeting

- Store prices for items the user has bought before
- Auto-suggest last-known price when adding a recurring item
- Show **estimated total** for a list before shopping
- Show **actual total** as items are checked off (user can adjust price at checkout)
- Weekly/monthly spending summaries

### 4. List Sharing

- Generate a **share link** so a partner/family member can view or edit a list
- Real-time sync — when one person adds "paper towels", the other sees it immediately
- Permissions: **view-only** or **can edit**
- Push notifications when a shared list is updated (PWA notification API)

### 5. Smart Suggestions

- Based on purchase history, suggest items the user might have forgotten ("You usually buy milk on Saturdays")
- Auto-categorize items (Produce, Dairy, Household, etc.) to help organize the trip by store aisle

---

## Technical Architecture

### Frontend

| Choice | Rationale |
|---|---|
| **React 18+** with TypeScript | Component model fits the UI well; huge ecosystem |
| **Vite** | Fast dev server & builds |
| **PWA (Workbox)** | Offline support, install-to-home-screen, push notifications |
| **Tailwind CSS** | Rapid UI development, responsive by default |
| **Zustand** | Lightweight state management, simpler than Redux |
| **ZXing-js** or **QuaggaJS** | Client-side barcode scanning via camera |

### Backend

| Choice | Rationale |
|---|---|
| **Node.js + Express** (or Fastify) | JS everywhere, simple REST + WebSocket server |
| **PostgreSQL** | Relational data (users, lists, items, prices) fits well |
| **Prisma** | Type-safe ORM, great DX with TypeScript |
| **Socket.io** | Real-time sync for shared lists |
| **JWT + refresh tokens** | Auth (or OAuth via Google/Apple for convenience) |

### Infrastructure

| Choice | Rationale |
|---|---|
| **Docker Compose** | Local dev environment |
| **Vercel** (frontend) / **Railway or Fly.io** (backend) | Simple deployment |
| **GitHub Actions** | CI/CD pipeline |

---

## Data Model (high-level)

```
User
  id, email, name, passwordHash, createdAt

ShoppingList
  id, ownerId -> User, title, isTemplate, createdAt, updatedAt

ListShare
  id, listId -> ShoppingList, userId -> User, permission (view | edit)

ListItem
  id, listId -> ShoppingList, productId -> Product (nullable),
  name, quantity, unit, estimatedPrice, actualPrice,
  isChecked, sortOrder

Product
  id, barcode (unique, nullable), name, category, defaultPrice, imageUrl

PriceHistory
  id, productId -> Product, userId -> User, price, store, recordedAt
```

---

## Project Structure

```
ShopWise/
├── apps/
│   ├── web/                  # React PWA (Vite)
│   │   ├── src/
│   │   │   ├── components/   # UI components
│   │   │   ├── features/     # Feature modules (lists, scanner, sharing)
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── store/        # Zustand stores
│   │   │   ├── services/     # API client, socket client
│   │   │   ├── types/        # TypeScript types
│   │   │   └── utils/        # Helpers
│   │   ├── public/
│   │   └── index.html
│   └── api/                  # Node.js backend
│       ├── src/
│       │   ├── routes/       # Express route handlers
│       │   ├── services/     # Business logic
│       │   ├── middleware/    # Auth, validation, error handling
│       │   ├── prisma/       # Schema & migrations
│       │   ├── sockets/      # Socket.io event handlers
│       │   └── utils/
│       └── Dockerfile
├── packages/
│   └── shared/               # Shared types & validation (used by both apps)
├── docker-compose.yml
├── turbo.json                # Turborepo config (monorepo orchestration)
└── package.json              # Root workspace
```

---

## Implementation Phases

### Phase 1 — Foundation (MVP)
- [ ] Project scaffolding (monorepo, Vite app, Express API, Prisma, Docker)
- [ ] User auth (register / login / JWT)
- [ ] CRUD shopping lists & items
- [ ] Manual item entry with price
- [ ] Running total calculation
- [ ] Basic responsive UI (mobile-first)
- [ ] PWA manifest & service worker (installable, basic offline)

### Phase 2 — Scanning & Recurring Lists
- [ ] Camera barcode scanner component (ZXing-js)
- [ ] Product database lookup (Open Food Facts API or similar)
- [ ] Save products to local DB after first scan
- [ ] Template lists ("buy again" from previous list)
- [ ] Price auto-suggestion from history

### Phase 3 — Sharing & Real-Time
- [ ] Share link generation (unique tokens)
- [ ] List sharing with permissions (view / edit)
- [ ] Real-time sync via WebSockets (Socket.io)
- [ ] Push notifications for list updates

### Phase 4 — Smart Features & Polish
- [ ] Purchase history analytics (weekly/monthly spend)
- [ ] Smart suggestions ("you usually buy...")
- [ ] Item auto-categorization
- [ ] Offline-first with background sync
- [ ] Onboarding flow & empty states
- [ ] Accessibility audit (a11y)

---

## Key UX Flows

### Shopping Session Flow
```
Open app → Select list → Tap "Start Shopping"
  → See items grouped by category
  → Tap item to check off (running total updates)
  → Scan new item with camera → add to list on the fly
  → Finish → see total spent → save prices to history
```

### Share List Flow
```
Open list → Tap "Share" → Choose permission (view/edit)
  → Copy link / send via native share sheet
  → Partner opens link → sees list in real-time
  → Either person adds/removes items → both see updates
```

---

## Open Questions

1. **Product data source** — Use Open Food Facts (free, community-driven) or build our own product DB over time from user scans?
2. **Store-specific pricing** — Track prices per store, or keep it simple with one price per product?
3. **Auth strategy** — Email/password only, or add social login (Google, Apple) from the start?
4. **Monetization** — Free with ads? Freemium (free for X lists, paid for unlimited)? Fully free?

---

## Next Steps

Once we agree on this plan, we start with **Phase 1**: scaffolding the monorepo, setting up the database schema, building auth, and getting basic list CRUD working with a mobile-first UI.
