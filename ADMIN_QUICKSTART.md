# Quick Start Guide: Admin Dashboard

## For Developers

### 1. Run Database Migration
```bash
cd backend
npx drizzle-kit migrate
```

### 2. Create an Admin User
Connect to your database and run:
```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

### 3. Start the Application
```bash
# From project root
npm run dev
```

### 4. Access Admin Dashboard
1. Log in with the admin user credentials
2. Click the "Admin" button in the dashboard header
3. Or navigate to: `http://localhost:5173/admin`

## For Admins

### Viewing Statistics
The admin dashboard shows:
- **Total Users**: Number of registered accounts
- **Total CVs**: All CVs created on the platform
- **Free CVs**: First CV for each user (always free)
- **Paid CVs**: Additional CVs that cost money

### Updating Pricing
1. Navigate to Admin Dashboard (`/admin`)
2. Scroll to "Pricing Configuration" section
3. Click "Update Price" button
4. Enter new price in USD (e.g., `2.50` for $2.50)
5. Click "Save"
6. Verify success message appears
7. New price is now live across the entire platform

### Price Changes Take Effect Immediately
- Dashboard displays: "Additional CVs cost $X.XX"
- CreateCV page shows updated price in messages
- Payment warnings show correct amount
- All users see the new price instantly

## For Regular Users

### Viewing Current Pricing
When you log in to your dashboard, you'll see:
- "Create your first CV for free!" (if you have no CVs)
- "You have X CVs. Additional CVs cost $Y.ZZ." (if you have CVs)

### Creating CVs
- Your first CV is always FREE
- Additional CVs cost the current price set by admin
- Price is shown before you start creating
- Payment warning shows exact amount before creation

## Technical Details

### Default Pricing
- If no pricing is configured, default is $1.00
- First CV is always free regardless of pricing

### Price Format
- Prices stored in cents (integer) in database
- Displayed as dollars with 2 decimal places
- Example: 250 cents = $2.50

### Security
- Only users with `is_admin = true` can access admin dashboard
- Regular users attempting to access `/admin` see "Access Denied"
- Admin button only appears for admin users

## Troubleshooting

### "Access Denied" message
**Problem**: You see "Access Denied" when trying to access admin dashboard

**Solution**: Your account doesn't have admin privileges. Contact database admin to run:
```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

### Price not updating
**Problem**: Changed price but old price still shows

**Solution**: 
1. Refresh the browser page
2. Check browser console for errors
3. Verify database connection
4. Check backend logs for errors

### Admin button not showing
**Problem**: You're an admin but don't see the admin button

**Solution**:
1. Log out and log back in
2. Verify `is_admin = true` in database
3. Check browser console for errors
4. Clear browser cache

## Database Schema

### Users Table
```sql
-- New column added
is_admin BOOLEAN DEFAULT false NOT NULL
```

### Pricing Table (New)
```sql
CREATE TABLE pricing (
  id UUID PRIMARY KEY,
  additional_cv_price INTEGER DEFAULT 100 NOT NULL,  -- in cents
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## API Endpoints

### Public (Authenticated)
- `GET /cv/pricing` - Get current pricing

### Admin Only
- `GET /admin/stats` - Get platform statistics
- `GET /admin/pricing` - Get pricing configuration
- `PUT /admin/pricing` - Update pricing

### Request Example
```bash
# Update pricing (admin only)
curl -X PUT http://localhost:3001/admin/pricing \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"additionalCvPrice": 250}'
```

## Environment Variables

No new environment variables are required for this feature. Existing configuration:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT token secret
- `PORT` - Backend port (default: 3001)

## Backup and Recovery

### Backup Current Pricing
```sql
-- Export pricing history
SELECT * FROM pricing ORDER BY created_at DESC;
```

### Restore Previous Pricing
```sql
-- Find previous price
SELECT * FROM pricing ORDER BY created_at DESC LIMIT 5;

-- Insert old price as new record
INSERT INTO pricing (additional_cv_price) VALUES (100);  -- $1.00
```

## Support

For issues or questions:
1. Check backend logs: `backend/logs` or console output
2. Check frontend console: Browser DevTools → Console
3. Review documentation: `ADMIN_FEATURE.md`, `ADMIN_VISUAL_GUIDE.md`
4. Contact system administrator

## Feature Highlights

✨ **Dynamic Pricing**: Change prices without code deployment
📊 **Real-time Statistics**: Monitor platform usage instantly
🔒 **Secure**: Role-based access control with database validation
💰 **Flexible**: Support any price from $0 to $1000
🚀 **Instant**: Changes take effect immediately across the platform
