# Admin Dashboard Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CareerLift Application                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                            Frontend (React)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Dashboard  │  │   CreateCV   │  │   AdminDashboard (NEW)   │  │
│  │    Page      │  │     Page     │  │         Page             │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────────────────┤  │
│  │ - Show CVs   │  │ - CV Form    │  │ - Statistics Cards       │  │
│  │ - Dynamic $  │  │ - Dynamic $  │  │ - Pricing Config         │  │
│  │ - Admin btn  │  │              │  │ - Update Price           │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                 │                      │                   │
│         └─────────────────┴──────────────────────┘                   │
│                            │                                          │
│                  ┌─────────▼─────────┐                               │
│                  │   Hooks Layer     │                               │
│                  ├───────────────────┤                               │
│                  │ usePricing()      │ ← Fetch /cv/pricing          │
│                  │ useAdminStats()   │ ← Fetch /admin/stats         │
│                  │ useCvs()          │ ← Fetch /cv                  │
│                  │ useAuth()         │ ← Auth state                 │
│                  └─────────┬─────────┘                               │
│                            │                                          │
│                  ┌─────────▼─────────┐                               │
│                  │   API Client      │                               │
│                  ├───────────────────┤                               │
│                  │ getPricing()      │                               │
│                  │ getAdminStats()   │                               │
│                  │ updatePricing()   │                               │
│                  └─────────┬─────────┘                               │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │ HTTP Requests
                             │ (JWT Token in Headers)
┌────────────────────────────▼──────────────────────────────────────────┐
│                      Backend (Express.js)                             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Middleware Layer                          │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  authenticateToken()  │  requireAdmin() (NEW)                │   │
│  │  - Verify JWT         │  - Check user.isAdmin flag           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│  ┌───────────────────┬──────▼──────────┬─────────────────────────┐  │
│  │   Auth Routes     │   CV Routes     │   Admin Routes (NEW)    │  │
│  ├───────────────────┼─────────────────┼─────────────────────────┤  │
│  │ POST /auth/login  │ GET /cv         │ GET /admin/stats        │  │
│  │ POST /auth/signup │ POST /cv        │ GET /admin/pricing      │  │
│  │                   │ GET /cv/pricing │ PUT /admin/pricing      │  │
│  │ Returns:          │                 │                         │  │
│  │ - user (w/ admin) │ Uses dynamic $  │ Requires admin=true     │  │
│  └───────────────────┴─────────────────┴─────────────────────────┘  │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────────┐
│                        Database (PostgreSQL)                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐ │
│  │  users table    │  │   cvs table     │  │  pricing table (NEW) │ │
│  ├─────────────────┤  ├─────────────────┤  ├──────────────────────┤ │
│  │ id              │  │ id              │  │ id                   │ │
│  │ email           │  │ user_id (FK)    │  │ additional_cv_price  │ │
│  │ password        │  │ title           │  │ created_at           │ │
│  │ name            │  │ personal_info   │  │ updated_at           │ │
│  │ is_admin (NEW)  │  │ education       │  └──────────────────────┘ │
│  │ created_at      │  │ experience      │                           │
│  │ updated_at      │  │ skills          │  Default: 100 ($1.00)    │
│  └─────────────────┘  │ is_paid         │                           │
│                       │ created_at      │                           │
│  Admin flag stored    │ updated_at      │                           │
│  in DB, not JWT       └─────────────────┘                           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Update Pricing

```
Admin User                Frontend              Backend              Database
    │                        │                     │                     │
    │ 1. Click "Update Price"│                     │                     │
    │───────────────────────>│                     │                     │
    │                        │                     │                     │
    │ 2. Enter new price     │                     │                     │
    │    ($2.50)             │                     │                     │
    │───────────────────────>│                     │                     │
    │                        │                     │                     │
    │ 3. Click "Save"        │                     │                     │
    │───────────────────────>│ 4. PUT /admin/pricing                    │
    │                        │    { price: 250 }   │                     │
    │                        │────────────────────>│                     │
    │                        │    + JWT Token      │                     │
    │                        │                     │                     │
    │                        │                     │ 5. Authenticate     │
    │                        │                     │    Check admin flag │
    │                        │                     │────────────────────>│
    │                        │                     │<────────────────────│
    │                        │                     │                     │
    │                        │                     │ 6. INSERT INTO pricing
    │                        │                     │────────────────────>│
    │                        │                     │                     │
    │                        │ 7. Return new price │                     │
    │                        │<────────────────────│                     │
    │                        │                     │                     │
    │ 8. Show success        │                     │                     │
    │<───────────────────────│                     │                     │
    │                        │                     │                     │
    │ 9. Refresh data        │                     │                     │
    │───────────────────────>│ 10. GET /admin/stats                     │
    │                        │────────────────────>│                     │
    │                        │                     │ 11. Query pricing   │
    │                        │                     │────────────────────>│
    │                        │ 12. Return updated  │<────────────────────│
    │                        │     stats & pricing │                     │
    │<───────────────────────│<────────────────────│                     │
```

## Data Flow: Regular User Sees Dynamic Pricing

```
Regular User             Frontend              Backend              Database
    │                       │                     │                     │
    │ 1. Load Dashboard     │                     │                     │
    │──────────────────────>│ 2. GET /cv/pricing  │                     │
    │                       │────────────────────>│                     │
    │                       │    + JWT Token      │                     │
    │                       │                     │ 3. Query pricing    │
    │                       │                     │────────────────────>│
    │                       │                     │ SELECT * FROM pricing
    │                       │                     │ ORDER BY created_at DESC
    │                       │                     │ LIMIT 1             │
    │                       │                     │<────────────────────│
    │                       │                     │ (returns 250 cents) │
    │                       │ 4. Return price     │                     │
    │                       │<────────────────────│                     │
    │                       │ { price: 250 }      │                     │
    │                       │                     │                     │
    │ 5. Display: "Additional CVs cost $2.50"    │                     │
    │<──────────────────────│                     │                     │
```

## Security Model

```
┌──────────────────────────────────────────────────────────────────┐
│                        Security Layers                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Layer 1: Authentication (authenticateToken middleware)          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ - Verify JWT token in Authorization header                 │ │
│  │ - Check session exists in database                         │ │
│  │ - Validate session not expired                             │ │
│  │ - Load user from database                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                      │
│  Layer 2: Authorization (requireAdmin middleware)                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ - Check user.isAdmin === true                              │ │
│  │ - Admin flag stored in database, not JWT                   │ │
│  │ - Re-validated on every request                            │ │
│  │ - Return 403 if not admin                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                      │
│  Layer 3: Input Validation                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ - Zod schema validation for price updates                  │ │
│  │ - Price must be: 0 <= price <= 100000 cents                │ │
│  │ - Type checking (integer only)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                      │
│  Layer 4: Frontend Protection                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ - Conditional rendering of admin UI                        │ │
│  │ - Route protection with withAuth HOC                       │ │
│  │ - Access denied UI for non-admins                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Login
├── Signup
├── Dashboard (withAuth HOC)
│   ├── useAuth() → user.isAdmin
│   ├── useCvs() → cv list
│   └── usePricing() → current price
│       └── Shows dynamic pricing: "$2.50"
│       └── Shows "Admin" button if isAdmin=true
│
├── CreateCV (withAuth HOC)
│   ├── useCvs() → cv count
│   └── usePricing() → current price
│       └── Shows payment warning with dynamic price
│
└── AdminDashboard (withAuth HOC) ← NEW
    ├── useAuth() → verify isAdmin
    ├── useAdminStats() → stats & pricing
    │   ├── Stats: users, cvs, free, paid
    │   └── Pricing: current price
    └── apiClient.updateAdminPricing()
        └── Updates price in database
```

## Migration Strategy

```
Step 1: Database Migration
┌─────────────────────────────────────────────┐
│ Run: npx drizzle-kit migrate               │
│ Applies: 0001_glamorous_phalanx.sql        │
│ - Adds users.is_admin column              │
│ - Creates pricing table                   │
│ Default: All users have is_admin=false    │
│ Default: No pricing record (uses $1.00)   │
└─────────────────────────────────────────────┘
                    ↓
Step 2: Create Admin User
┌─────────────────────────────────────────────┐
│ SQL: UPDATE users SET is_admin = true      │
│      WHERE email = 'admin@example.com'     │
└─────────────────────────────────────────────┘
                    ↓
Step 3: Deploy Backend
┌─────────────────────────────────────────────┐
│ - New admin routes available              │
│ - CV creation uses dynamic pricing        │
│ - Auth returns isAdmin flag               │
└─────────────────────────────────────────────┘
                    ↓
Step 4: Deploy Frontend
┌─────────────────────────────────────────────┐
│ - Admin dashboard accessible at /admin    │
│ - Dashboard shows admin button            │
│ - All pages show dynamic pricing          │
└─────────────────────────────────────────────┘
```
