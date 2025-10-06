# Lenco Payment Integration

This document describes the Lenco payment integration implementation for the CareerLift CV builder application.

## Overview

CareerLift uses Lenco's payment API (https://lenco-api.readme.io/v2.0) to process payments for additional CVs. The first CV is free for each user, and additional CVs cost $1.00 each.

## Payment Methods

The integration supports two payment methods in priority order:

1. **Mobile Money** (Primary) - Users can pay using their mobile money account
2. **Card Payment** (Secondary) - Users can pay with credit/debit cards

## Implementation Details

### Backend

#### Environment Variables

Add these to your `backend/.env` file:

```env
LENCO_API_KEY=your-lenco-api-key
LENCO_SECRET_KEY=your-lenco-secret-key
LENCO_BASE_URL=https://api.lenco.co/v2
```

#### Database Schema

A new `payments` table tracks all payment transactions:

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (FK to users),
  cv_id UUID (FK to cvs, nullable),
  amount INTEGER NOT NULL (in cents),
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL ('mobile_money' or 'card'),
  lenco_reference TEXT UNIQUE,
  status TEXT NOT NULL ('pending', 'success', 'failed'),
  metadata JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### API Endpoints

**POST /payment/initiate**
- Initiates a new payment with Lenco
- Requires authentication
- Body: `{ paymentMethod, phoneNumber?, amount, currency, cvData }`
- Returns: `{ payment, authorization_url, access_code }`

**POST /payment/verify/:reference**
- Verifies a payment with Lenco
- Creates CV if payment is successful
- Requires authentication
- Returns: `{ status, message, cv? }`

**POST /payment/webhook**
- Webhook endpoint for Lenco callbacks
- Handles payment status updates
- No authentication required (public endpoint)

#### Services

**lencoService** (`backend/src/services/lenco.ts`)
- `initiateMobileMoneyPayment()` - Initialize mobile money payment
- `initiateCardPayment()` - Initialize card payment
- `verifyPayment()` - Verify payment status

### Frontend

#### Components

**PaymentDialog** (`frontend/src/components/PaymentDialog.tsx`)
- Modal dialog showing payment options
- Mobile Money option (with phone number input)
- Card Payment option
- Selection state management

#### Payment Flow

1. User attempts to create an additional CV
2. Payment dialog appears with two options
3. User selects payment method:
   - **Mobile Money**: Enters phone number
   - **Card**: Proceeds directly
4. Payment is initiated via `/payment/initiate`
5. User is redirected to Lenco payment page (or stays for verification)
6. Payment is verified via `/payment/verify/:reference`
7. CV is created upon successful payment

## Usage

### Setting Up Lenco

1. Sign up for a Lenco account at https://lenco.co
2. Get your API credentials from the Lenco dashboard
3. Add credentials to `backend/.env`
4. Run database migrations: `npm run db:migrate`

### Testing

For testing, you can use Lenco's sandbox environment:

```env
LENCO_BASE_URL=https://sandbox-api.lenco.co/v2
LENCO_API_KEY=test_your_test_key
```

### Mobile Money Testing

Test phone numbers (Lenco sandbox):
- Success: +2348012345678
- Failed: +2348087654321

### Card Testing

Test cards (Lenco sandbox):
- Success: 5061020000000000094
- Declined: 5061460410120223210

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Webhook Validation**: Implement signature verification for webhooks in production
3. **Payment Verification**: Always verify payments server-side before creating resources
4. **Amount Validation**: Validate payment amounts match expected values
5. **Idempotency**: Use unique references to prevent duplicate charges

## Error Handling

The integration handles various error scenarios:
- Network failures
- Invalid API credentials
- Payment declined
- Verification timeout
- Duplicate payment attempts

All errors are logged and user-friendly messages are shown to users.

## Future Enhancements

- [ ] Add payment retry logic
- [ ] Implement webhook signature verification
- [ ] Add payment history page
- [ ] Support multiple currencies
- [ ] Add refund functionality
- [ ] Email payment receipts

## Support

For issues with Lenco integration:
- Lenco Documentation: https://lenco-api.readme.io/v2.0
- Lenco Support: support@lenco.co
- CareerLift Issues: https://github.com/mikemtdev/career-lift/issues
