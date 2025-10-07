# Admin Dashboard Feature

## Overview
The Admin Dashboard provides administrators with the ability to:
- View platform statistics (total users, CVs, free CVs, paid CVs)
- Configure dynamic pricing for additional CVs
- Monitor platform usage

## Database Changes

### New Schema Fields
1. **users table**: Added `is_admin` boolean field (default: false)
2. **pricing table**: New table to store pricing configuration
   - `id`: UUID primary key
   - `additional_cv_price`: Integer (price in cents)
   - `created_at`, `updated_at`: Timestamps

### Migration
The migration file `0001_glamorous_phalanx.sql` includes:
- Creation of the pricing table
- Addition of is_admin column to users table

To run the migration:
```bash
cd backend
npm run db:migrate
```

## Backend API Endpoints

### Admin Endpoints (Require admin authentication)

#### GET /admin/stats
Returns platform statistics and current pricing.

**Response:**
```json
{
  "stats": {
    "totalUsers": 10,
    "totalCvs": 25,
    "freeCvs": 10,
    "paidCvs": 15
  },
  "pricing": {
    "id": "uuid",
    "additionalCvPrice": 100,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### GET /admin/pricing
Returns current pricing configuration.

**Response:**
```json
{
  "pricing": {
    "id": "uuid",
    "additionalCvPrice": 100,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### PUT /admin/pricing
Updates the pricing configuration.

**Request:**
```json
{
  "additionalCvPrice": 150
}
```

**Response:**
```json
{
  "pricing": {
    "id": "uuid",
    "additionalCvPrice": 150,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "message": "Pricing updated successfully"
}
```

### Public Endpoints (Require authentication)

#### GET /cv/pricing
Returns the current additional CV price for regular users.

**Response:**
```json
{
  "additionalCvPrice": 100
}
```

## Frontend Components

### AdminDashboard Page
Located at `/admin` route

**Features:**
- Displays 4 statistics cards: Total Users, Total CVs, Free CVs, Paid CVs
- Pricing configuration card with live editing
- Only accessible to users with `isAdmin: true`
- Redirects non-admin users with appropriate message

### Dashboard Updates
- Shows "Admin" button in header for admin users
- Displays dynamic pricing instead of hardcoded "$1"
- Uses `usePricing` hook to fetch current price

### CreateCV Updates
- Shows dynamic pricing in the free CV banner
- Uses dynamic pricing in payment warning messages

## Usage

### Creating an Admin User

To create an admin user, you'll need to update the database directly:

**SQL Query:**
```sql
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
```

Or using a database migration:
```sql
-- Add this to a new migration file
UPDATE users SET is_admin = true WHERE email = 'your-admin-email@example.com';
```

### Accessing Admin Dashboard

1. Log in as an admin user
2. Click the "Admin" button in the main dashboard header
3. Or navigate directly to `/admin`

### Updating Pricing

1. Navigate to Admin Dashboard
2. Scroll to "Pricing Configuration" card
3. Click "Update Price" button
4. Enter new price in dollars (e.g., 2.50)
5. Click "Save"
6. The pricing will be immediately updated across the platform

## Testing

### Manual Testing Steps

1. **Create an admin user:**
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'test@example.com';
   ```

2. **Test admin access:**
   - Log in with admin user
   - Verify "Admin" button appears in dashboard
   - Click admin button and verify dashboard loads
   - Check that statistics are displayed

3. **Test pricing update:**
   - In admin dashboard, click "Update Price"
   - Enter a new price (e.g., 2.50)
   - Click Save
   - Verify success message
   - Go back to main dashboard
   - Verify new price is displayed

4. **Test non-admin access:**
   - Log in with regular user
   - Try to access `/admin` directly
   - Verify "Access Denied" message
   - Verify no "Admin" button in dashboard

5. **Test CV creation with dynamic pricing:**
   - Log in as regular user who already has 1+ CVs
   - Try to create a new CV
   - Verify payment warning shows correct dynamic price

## Technical Implementation

### Frontend Hooks

**usePricing:**
- Fetches current pricing from `/cv/pricing`
- Returns price in cents
- Used by Dashboard and CreateCV pages

**useAdminStats:**
- Fetches admin statistics from `/admin/stats`
- Returns stats and pricing objects
- Used by AdminDashboard page

### Backend Middleware

**requireAdmin:**
- Checks if authenticated user has `isAdmin: true`
- Returns 403 error if not admin
- Applied to all `/admin/*` routes

### Price Storage
- Prices stored in cents (integer) to avoid floating-point issues
- Display prices formatted to 2 decimal places
- Default price: 100 cents ($1.00)

## Security Considerations

1. Admin routes are protected by `requireAdmin` middleware
2. Admin flag is stored in database, not in JWT token
3. Each request validates admin status from database
4. Price validation: 0 to 100000 cents ($0 to $1000)

## Future Enhancements

- Pricing history tracking
- Scheduled price changes
- Regional pricing
- Discount codes
- Bulk pricing tiers
