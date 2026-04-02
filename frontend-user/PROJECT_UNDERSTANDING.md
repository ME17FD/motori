# Frontend-User Project Documentation (Revised)

## 1. High-level Summary
`frontend-user` is the customer-facing part of the Motori marketplace: a responsive React + TypeScript Single Page Application for browsing, filtering, and purchasing motorcycle parts and accessories. It is built as a modular, API-driven application with a focus on UX, maintainability, and strong typing.

## 2. Key Objectives
- Fast product discovery with search, filter, and compatibility checks
- Shopping cart with persistent state, pricing rules, and checkout readiness
- Secure user authentication and session token handling
- Clear route-based UI for home, product catalog, details, cart, and account pages
- Reusable components, hooks, and service abstractions for scaling features

## 3. Main Technology Stack
- React (with hooks, functional components)
- TypeScript (strict type safety)
- Vite (development server + build)
- React Router DOM (routing)
- Axios (HTTP layer)
- TanStack React Query (data sync, caching, invalidation)
- React Hook Form (form state + validation)
- ESLint (code quality and linting)
- CSS Modules / scoped styles

## 4. App Architecture
### 4.1 Routing
- `/` - Home (hero, featured collections, quick navigation)
- `/login` - Login
- `/signup` - Registration
- `/products/parts` - Product catalog (with pagination and filters)
- `/products/parts/:id` - Product details
- `/cart` - Shopping cart checkout
- `/profile` (or similar) also likely present in broader workspace

### 4.2 Authentication
- `useAuth` hook holds auth state (user, token, status)
- auth service methods: `login`, `signup`, `logout`, `refreshToken`, `getCurrentUser`
- Axios interceptors (set token header, refresh on 401 + retry queue)
- Token stored in memory and local/session storage for persistence (security-aware pattern)

### 4.3 Data Fetching
- Service layer exposes domain APIs (`partsService`, `vehicleService`, `orderService`)
- React Query hooks provide caching, stale handling, and auto refetch on focus
- Generic and specialized data hooks handle pagination, filtering, and detail queries

### 4.4 Cart Logic
- `useCart` + `cartService` handle cart operations:
  - Add item (merge quantity)
  - Update quantity
  - Remove item
  - Clear cart
  - Apply/remove coupon
- Persistence `localStorage` integration
- Pricing: subtotal, tax (20% TVA), shipping rules (standard and free threshold), discount codes

## 5. Feature Set
### 5.1 Home
- Sliders, categories, top products, CTA
- Likely recommends products from backend or static highlights

### 5.2 Product Catalog
- Search by name
- Sort by price/popularity
- Filter by compatibility (vehicle model/year, category, brand)
- Pagination to reduce API and render load

### 5.3 Product Details
- Image carousel
- Specs, descriptions, stock status
- Add to cart with selected quantity
- Suggested or related products

### 5.4 Cart
- Table of line items and controls
- Summary with item total, tax, delivery, coupon discount, grand total
- Checkout button and `create order` call

### 5.5 Auth
- Client validation (required fields, email format)
- Error display from backend for auth errors
- Redirect on success (dashboard/home)

## 6. Code Organization
- `src/api` - Axios clients, request interceptors, response adapters
- `src/services` - Domain-specific API functions (users, products, orders)
- `src/hooks` - Composable logic (auth, cart, data fetching)
- `src/pages` - Screen components mapped to routes
- `src/components` - Shared UI building blocks
- `src/constants` - Magic values (routes, messages, values)
- `src/utils` - Helpers (formatters, validation, storage handlers)
- `src/types` - TypeScript models and API contracts
- `src/mocks` (dev-only sample data / seeded test cases)

## 7. Platform Behavior & Conventions
- Mobile-first responsive design
- Loading states and skeleton UI for async content
- Error messages in components and fallback screens
- Non-blocking UI updates using optimistic UI or controlled behavior
- Testing-focused coding (component and service separation)

## 8. Run & develop (local)
1. `npm install`
2. `npm run dev`
3. `npm run lint`
4. `npm run build`
5. `npm run preview`

## 9. Integration Points (back-end services)
- Authentication: HTTP endpoints for login/signup/logout/token-refresh
- Products: list, detail, availability, compatibility
- Cart/Order: create order, get history, calculate totals
- User profile: fetch and edit details

## 10. What’s next
- Add end-to-end tests (Cypress / Playwright)
- Add i18n support (multi-language)
- Add optimistic updates for cart and wishlist
- Add retry/backoff for API resilience
- Add analytics dashboards (usage, conversion, top parts) with Recharts

---

> This rewritten documentation is now aligned to the actual `frontend-user` structure and behavior in this repository, with clear sections to onboard maintainers quickly while keeping existing details traceable and editable.
</content>
<parameter name="filePath">c:\Users\Mouha\Desktop\motori\frontend-user\PROJECT_UNDERSTANDING.md