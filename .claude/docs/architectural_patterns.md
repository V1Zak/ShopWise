# Architectural Patterns & Design Decisions

This document captures the key architectural patterns, design decisions, and conventions planned for ShopWise.

---

## Monorepo Architecture

**Pattern**: Turborepo-based monorepo with separate apps and shared packages

**Structure**:
- `apps/web/` - Frontend React PWA
- `apps/api/` - Backend Node.js API
- `packages/shared/` - Shared TypeScript types and validation schemas

**Rationale**:
- Code sharing between frontend and backend (types, validation)
- Coordinated builds and testing
- Single source of truth for domain models
- Simplified dependency management

**References**: PLAN.md:132-162

---

## Progressive Web App (PWA) Strategy

**Pattern**: Installable, offline-first mobile-web application

**Key capabilities**:
- Install to home screen (manifest.json)
- Offline support via service workers (Workbox)
- Push notifications for shared list updates
- Camera access for barcode scanning (MediaDevices API)
- Graceful degradation on desktop (no camera → manual entry)

**Rationale**:
- No app store friction - accessible via URL
- Cross-platform (iOS, Android, desktop) from single codebase
- Offline capability critical for in-store shopping (poor connectivity)
- Native-like experience without native development

**References**: PLAN.md:19-24, PLAN.md:66

---

## Real-Time Synchronization Pattern

**Pattern**: WebSocket-based bidirectional sync for shared shopping lists

**Implementation**:
- Socket.io for client-server communication
- Event-driven updates (item added, checked off, list updated)
- Optimistic UI updates with server reconciliation
- Push notifications for offline users

**Use cases**:
- Multiple family members editing same list simultaneously
- Immediate feedback when partner adds/removes items
- Shopping session coordination

**Data flow**:
```
User A adds item → Client optimistic update → WebSocket emit
  → Server validates & persists → Broadcast to all connected clients
  → User B receives update → UI updates in real-time
```

**Rationale**:
- Better UX than polling (instant updates)
- Reduces server load vs. frequent HTTP polling
- Enables collaborative shopping experience

**References**: PLAN.md:36-39, PLAN.md:77, PLAN.md:187-191

---

## Community-Driven Product Catalog

**Pattern**: Hybrid product database - seeded + user-contributed

**Implementation**:
- Initial seed from Open Food Facts API (existing product data)
- User scans add new products to shared catalog
- `Product.verified` flag = confirmed by multiple scans
- `Product.createdBy` tracks contributor

**Benefits**:
- Cold-start problem solved (pre-populated catalog)
- Catalog grows organically with real user data
- Local/regional products get added by community
- Network effect - later users benefit from earlier scans

**Rationale**:
- External APIs don't have complete coverage (especially local stores)
- User-generated data is more accurate for local context
- Reduces dependency on third-party data quality

**References**: PLAN.md:42-48, PLAN.md:102-106, PLAN.md:226

---

## Store-Specific Pricing Model

**Pattern**: Many-to-many relationship with pricing at the junction

**Data model**:
```
Product (id, barcode, name)
  ↕ (many-to-many)
StoreProduct (productId, storeId, price, lastUpdated)
  ↕
Store (id, name, logo, location)
```

**Features enabled**:
- Same product, different prices at different stores
- Price history per store (track when milk was £1.20 at Tesco last week)
- Filter products by store ("What can I buy at Aldi?")
- Store-aware price estimates for shopping lists

**Rationale**:
- Real-world accuracy - prices vary significantly by store
- Enables store comparison features later
- Supports smart shopping (find cheapest store for your list)

**References**: PLAN.md:108-110, PLAN.md:228

---

## Layered Backend Architecture

**Pattern**: Three-layer separation - routes, services, data access

**Layers**:
1. **Routes** (`src/routes/`) - HTTP request/response handling, validation
2. **Services** (`src/services/`) - Business logic, orchestration
3. **Data Access** - Prisma ORM (abstracted via services)

**Additional layers**:
- **Middleware** - Cross-cutting concerns (auth, error handling, logging)
- **Sockets** - WebSocket event handlers (parallel to routes for real-time)

**Example flow**:
```
POST /api/lists
  → routes/lists.ts validates request
  → services/listService.ts createList(userId, data)
  → Prisma creates list + broadcasts via Socket.io
  → Response sent
```

**Rationale**:
- Testability - business logic isolated from HTTP layer
- Reusability - services can be called from REST routes or WebSocket handlers
- Maintainability - clear separation of concerns

**References**: PLAN.md:148-156

---

## State Management Strategy

**Pattern**: Zustand for client-side global state

**Stores** (planned):
- `authStore` - Current user, login state
- `listsStore` - Shopping lists, active list
- `productsStore` - Product catalog cache
- `socketStore` - WebSocket connection state

**Rationale**:
- Simpler than Redux (less boilerplate)
- TypeScript-first, good DX
- Small bundle size
- Sufficient for app complexity

**Alternatives considered**: Redux (too heavy), Context API (performance issues for frequent updates)

**References**: PLAN.md:67

---

## Authentication & Authorization

**Pattern**: JWT-based stateless auth with refresh tokens

**Implementation** (planned):
- Access tokens (short-lived, 15min) for API requests
- Refresh tokens (long-lived, 7 days) stored in httpOnly cookies
- Optional: OAuth integration (Google, Apple) for convenience

**Authorization**:
- List ownership (`ShoppingList.ownerId`)
- Share permissions (`ListShare.permission`: view | edit)
- Product verification (multiple users confirming scans)

**Rationale**:
- Stateless - scales horizontally without session store
- Secure - httpOnly cookies prevent XSS token theft
- Flexible - easy to add OAuth later

**References**: PLAN.md:78, PLAN.md:117-118, PLAN.md:231

---

## Mobile-First, Responsive Design

**Pattern**: Progressive enhancement from mobile to desktop

**Approach**:
- Design for mobile screen first (primary use case is in-store)
- Camera scanner: mobile-only feature, fallback to manual entry on desktop
- Touch-optimized UI (large tap targets, swipe gestures)
- Tailwind CSS for responsive breakpoints

**Key mobile features**:
- One-handed operation during shopping
- Large checkboxes for marking items off
- Bottom navigation/actions (thumb zone)

**Rationale**:
- Primary use case is mobile (shopping in-store)
- Better to adapt up (mobile → desktop) than down
- Forces focus on essential features

**References**: PLAN.md:19-24, PLAN.md:175

---

## Offline-First with Background Sync

**Pattern**: Service Worker caching + background sync (Phase 4)

**Strategy**:
- Cache static assets (app shell)
- Cache API responses (lists, products)
- Queue mutations when offline (background sync API)
- Sync when connection restored

**Conflict resolution**:
- Optimistic UI updates
- Last-write-wins for simple conflicts
- User prompt for complex conflicts (e.g., both edited same item)

**Rationale**:
- Grocery stores often have poor connectivity
- Shopping can't wait for network
- Critical for real-world usability

**References**: PLAN.md:197, PLAN.md:175

---

## Database Design Principles

**Principles applied**:

1. **Normalization** - Separate entities (Product, Store, StoreProduct) avoid duplication
2. **Soft ownership** - Lists have owners, but can be shared
3. **Audit trail** - `createdAt`, `updatedAt`, `createdBy` fields for tracking
4. **Flexibility** - Nullable foreign keys (e.g., `ListItem.productId`) allow manual items
5. **History tracking** - `PriceHistory` table for trend analysis

**Key relationships**:
- User → ShoppingLists (one-to-many)
- ShoppingList → ListItems (one-to-many)
- ShoppingList → ListShares → Users (many-to-many with metadata)
- Product → StoreProducts → Stores (many-to-many with pricing)

**References**: PLAN.md:90-128

---

## Error Handling & Resilience

**Strategies** (to be implemented):

1. **Graceful degradation**:
   - Camera unavailable → manual entry
   - Offline → queue actions, show cached data
   - Barcode not found → prompt to add manually

2. **User feedback**:
   - Toast notifications for async operations
   - Loading states during sync
   - Optimistic UI with rollback on error

3. **Backend resilience**:
   - Input validation middleware (prevent bad data)
   - Transaction wrapping for complex operations
   - Global error handler (log + user-friendly message)

**Rationale**:
- Real-world conditions are messy (poor network, camera permissions, etc.)
- Users should never see cryptic errors
- App should work in degraded mode rather than fail completely

---

## Feature Flag Strategy (Future)

**Not in initial plan, but consider for**:
- Gradual rollout of new features (e.g., smart suggestions)
- A/B testing (e.g., different onboarding flows)
- Per-user beta features

**Potential implementation**: Simple DB flag table or env vars for Phase 1-3, dedicated service (LaunchDarkly) if needed in Phase 4.

---

## Testing Strategy (Planned)

**Levels**:
1. **Unit tests** - Services, utilities, pure functions
2. **Integration tests** - API routes with test database
3. **E2E tests** - Critical user flows (create list, scan, share)

**Tools** (to be confirmed):
- **Vitest** - Unit/integration (fast, Vite-native)
- **Playwright** - E2E browser tests
- **Testing Library** - React component tests

**Rationale**:
- Focus on business logic and critical paths
- E2E tests prevent regressions in key flows
- Integration tests catch DB/API contract issues

**References**: PLAN.md:86 (CI/CD mentions testing)

---

## Performance Considerations

**Frontend**:
- Code splitting by route (React lazy + Suspense)
- Image optimization (product photos)
- Virtual scrolling for long lists (e.g., 100+ items)
- Debounced search inputs

**Backend**:
- Database indexing (barcode, user_id, list_id)
- Pagination for large queries
- Caching frequent queries (product catalog)

**PWA**:
- Service worker caching (instant load)
- Lazy-load camera library (reduce initial bundle)

**Rationale**:
- Mobile users expect fast, smooth experience
- Large product catalogs need efficient queries
- Battery/data usage matters on mobile

---

## Security Considerations

**Threats & mitigations**:
1. **Auth** - JWT with short expiry, refresh tokens in httpOnly cookies
2. **XSS** - React escapes by default, sanitize user input
3. **CSRF** - SameSite cookies, CSRF tokens for state-changing operations
4. **SQL injection** - Prisma parameterized queries (safe by default)
5. **Data privacy** - Share tokens (unguessable UUIDs), permission checks

**Open questions**:
- Rate limiting for API endpoints?
- CAPTCHA for registration to prevent spam accounts?

**Rationale**:
- Users trust app with purchase data and shared lists
- Breaches would erode trust and violate GDPR

---

## Deployment Strategy (Planned)

**Frontend** (apps/web/):
- **Vercel** - auto-deploys from main branch
- Preview deployments for PRs
- Edge CDN for global performance

**Backend** (apps/api/):
- **Railway** or **Fly.io** - containerized deployment
- Auto-scaling based on load
- Managed PostgreSQL instance

**CI/CD**:
- **GitHub Actions** - run tests, build, deploy on push to main
- Environment-based configs (dev, staging, prod)

**Rationale**:
- Vercel optimized for frontend/PWA deployments
- Railway/Fly.io simple for Node.js + PostgreSQL
- GitHub Actions free for public repos, integrated with repo

**References**: PLAN.md:80-87

---

## Notes on Patterns to Establish During Implementation

As code is written, document these patterns:

1. **API endpoint naming** - RESTful conventions, pluralization
2. **Error response format** - Consistent JSON structure
3. **WebSocket event naming** - Namespacing (e.g., `list:item:added`)
4. **Component composition** - Container/presentational split, hooks patterns
5. **File naming** - PascalCase for components, camelCase for utils, etc.
6. **Git commit conventions** - Conventional commits (feat:, fix:, etc.)
7. **Code review checklist** - What to check before merging

These will emerge during Phase 1 and should be added to this file.
