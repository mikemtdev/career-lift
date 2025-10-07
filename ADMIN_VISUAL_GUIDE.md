# Admin Dashboard Implementation - Visual Guide

## Overview
This document provides a visual guide to the Admin Dashboard feature implementation for CareerLift.

## Key Features Implemented

### 1. Database Schema Updates
- Added `is_admin` boolean field to the users table
- Created new `pricing` table to store dynamic pricing configuration
- Migration file: `backend/drizzle/0001_glamorous_phalanx.sql`

### 2. Backend API Endpoints

#### Admin Routes (Protected)
- `GET /admin/stats` - Returns platform statistics and pricing
- `GET /admin/pricing` - Returns current pricing configuration
- `PUT /admin/pricing` - Updates pricing configuration

#### Public Routes
- `GET /cv/pricing` - Returns current pricing for regular users

### 3. Frontend Components

#### New Pages
- **AdminDashboard** (`/admin`) - Full admin control panel

#### Updated Pages
- **Dashboard** - Shows "Admin" button for admin users, displays dynamic pricing
- **CreateCV** - Shows dynamic pricing in messages

### 4. New Hooks
- `usePricing()` - Fetches and manages pricing data
- `useAdminStats()` - Fetches and manages admin statistics

## UI Components

### Admin Dashboard

The admin dashboard includes:

1. **Header Section**
   - Back button to return to main dashboard
   - Admin Dashboard title
   - User email and logout button

2. **Statistics Cards** (4 cards in a grid)
   - Total Users: Shows count of registered accounts
   - Total CVs: Shows count of all CVs created
   - Free CVs: Shows count of first CVs (one per user)
   - Paid CVs: Shows count of additional paid CVs

3. **Pricing Configuration Card**
   - Displays current price per additional CV
   - "Update Price" button to edit pricing
   - Edit mode with:
     - Input field for new price (USD)
     - Save and Cancel buttons
     - Success/error messages

### Dashboard (Admin View)

For admin users, the regular dashboard shows:
- "Admin" button with shield icon in the header
- Dynamic pricing display: "Additional CVs cost $X.XX" (where X.XX is the current price)
- All existing CV management features

### Dashboard (Regular User View)

For regular users, the dashboard shows:
- No admin button in header
- Dynamic pricing display: "Additional CVs cost $X.XX"
- All existing CV management features

## Code Examples

### Backend: Admin Routes
```typescript
// GET /admin/stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  // Returns: { stats: {...}, pricing: {...} }
});

// PUT /admin/pricing
router.put('/pricing', authenticateToken, requireAdmin, async (req, res) => {
  const { additionalCvPrice } = req.body; // in cents
  // Updates pricing and returns new configuration
});
```

### Frontend: Admin Dashboard Component
```tsx
const AdminDashboardComponent = () => {
  const { stats, pricing, mutate } = useAdminStats();
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');

  const handleUpdatePrice = async () => {
    const priceInCents = Math.round(parseFloat(newPrice) * 100);
    await apiClient.updateAdminPricing(priceInCents);
    await mutate();
  };

  // Render statistics cards and pricing configuration
};
```

### Frontend: Dashboard with Dynamic Pricing
```tsx
const DashboardComponent = () => {
  const { user } = useAuth();
  const { cvs } = useCvs();
  const { pricing } = usePricing();
  
  const priceInDollars = pricing ? (pricing / 100).toFixed(2) : '1.00';

  return (
    <div>
      <header>
        {user?.isAdmin && (
          <Button onClick={() => navigate('/admin')}>
            <Shield /> Admin
          </Button>
        )}
      </header>
      <main>
        <p>Additional CVs cost ${priceInDollars}.</p>
        {/* CV list */}
      </main>
    </div>
  );
};
```

## User Flows

### Admin User Flow
1. Log in as admin user
2. See "Admin" button in dashboard header
3. Click "Admin" button to access admin dashboard
4. View platform statistics:
   - Total users: 42
   - Total CVs: 87
   - Free CVs: 42
   - Paid CVs: 45
5. See current pricing: $2.50
6. Click "Update Price" to edit
7. Enter new price (e.g., 3.00)
8. Click "Save"
9. See success message
10. Return to main dashboard
11. Verify new price is displayed

### Regular User Flow
1. Log in as regular user
2. Dashboard shows: "Additional CVs cost $2.50"
3. No "Admin" button visible
4. Attempting to access /admin directly shows "Access Denied"
5. Create CV flow shows correct pricing in payment warnings

## Security Features

1. **Admin Authentication**
   - `requireAdmin` middleware checks user.isAdmin flag
   - Flag stored in database, not in JWT
   - Each request validates admin status

2. **Price Validation**
   - Backend validates price is between $0 and $1000
   - Frontend prevents negative values
   - Prices stored as integers (cents) to avoid floating-point issues

3. **Access Control**
   - Admin routes return 403 for non-admin users
   - Frontend conditionally renders admin UI elements
   - Direct navigation to /admin is blocked for non-admins

## Testing Checklist

✅ Database migration runs successfully
✅ Backend builds without TypeScript errors
✅ Frontend builds without TypeScript errors
✅ Admin routes require authentication
✅ Admin routes require admin flag
✅ Regular users cannot access admin endpoints
✅ Pricing updates are reflected immediately
✅ Dashboard displays dynamic pricing
✅ CreateCV page shows dynamic pricing
✅ Price validation works correctly
✅ Admin button only shows for admin users

## File Changes Summary

### Backend Files
- `backend/src/db/schema.ts` - Added isAdmin field and pricing table
- `backend/src/routes/admin.ts` - New admin routes
- `backend/src/routes/cv.ts` - Added pricing endpoint, updated CV creation
- `backend/src/routes/auth.ts` - Added isAdmin to auth responses
- `backend/src/middleware/auth.ts` - Added requireAdmin middleware
- `backend/src/index.ts` - Added admin routes
- `backend/drizzle/0001_glamorous_phalanx.sql` - Database migration

### Frontend Files
- `frontend/src/pages/AdminDashboard.tsx` - New admin dashboard page
- `frontend/src/pages/Dashboard.tsx` - Added admin button and dynamic pricing
- `frontend/src/pages/CreateCV.tsx` - Added dynamic pricing display
- `frontend/src/hooks/usePricing.ts` - New hook for pricing data
- `frontend/src/hooks/useAdminStats.ts` - New hook for admin stats
- `frontend/src/lib/api.ts` - Added admin and pricing API methods
- `frontend/src/types/index.ts` - Added AdminStats, Pricing types
- `frontend/src/App.tsx` - Added admin route

## Deployment Notes

1. **Database Migration**
   ```bash
   cd backend
   npm run db:migrate
   ```

2. **Create Admin User**
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
   ```

3. **Environment Variables**
   No new environment variables required

4. **Default Pricing**
   Default price is $1.00 (100 cents) if no pricing record exists

## Future Enhancements

- Pricing history and audit trail
- Scheduled price changes
- Regional pricing
- Discount codes
- Bulk pricing tiers
- Email notifications on price changes
- Admin user management UI
- Analytics dashboard
- Export statistics to CSV
