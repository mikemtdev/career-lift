# Quick Start Guide

## Prerequisites
- Node.js 18 or higher
- PostgreSQL database or Neon DB account
- npm or yarn

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend
Create `.env` file in the `backend/` directory:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/careerlift
JWT_SECRET=your-secure-random-secret-key
```

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Setup Database

#### Option A: Local PostgreSQL
```bash
# Create database
createdb careerlift

# Run migrations
cd backend
npm run db:generate
npm run db:migrate
```

#### Option B: Neon DB (Cloud PostgreSQL)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in backend/.env
5. Run migrations:
```bash
cd backend
npm run db:generate
npm run db:migrate
```

### 4. Start Development Servers

#### Option A: Start Both (Recommended)
```bash
# From root directory
npm run dev
```

This will start:
- Backend on http://localhost:3001
- Frontend on http://localhost:3000

#### Option B: Start Separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## First Steps

1. **Sign Up**: Create a new account at http://localhost:3000/signup
2. **Login**: Use your credentials to log in
3. **Create CV**: Click "Create New CV" on the dashboard
4. **Fill Form**: Complete all sections of the CV form
5. **Download**: Download your CV as a PDF

## API Testing with curl

### Sign Up
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get CVs (requires token)
```bash
curl -X GET http://localhost:3001/cv \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create CV (requires token)
```bash
curl -X POST http://localhost:3001/cv \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer CV",
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "summary": "Experienced software engineer"
    },
    "education": [{
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "startDate": "2015-09-01",
      "endDate": "2019-06-01"
    }],
    "experience": [{
      "company": "Tech Corp",
      "position": "Software Engineer",
      "startDate": "2019-07-01",
      "endDate": "2023-12-31",
      "description": "Developed web applications"
    }],
    "skills": ["JavaScript", "React", "Node.js"]
  }'
```

## Troubleshooting

### Port Already in Use
If ports 3000 or 3001 are already in use:

**Backend:**
Edit `backend/.env` and change `PORT=3001` to another port.

**Frontend:**
Edit `frontend/vite.config.ts` and change the server port.

### Database Connection Errors
1. Verify DATABASE_URL is correct
2. Ensure PostgreSQL is running (local setup)
3. Check network connectivity (Neon DB)
4. Verify database exists

### Module Not Found Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm install
```

### Build Errors
```bash
# Clean build directories
rm -rf backend/dist
rm -rf frontend/dist

# Rebuild
npm run build
```

## Development Tips

### Hot Reload
Both backend (via tsx) and frontend (via Vite) support hot module replacement. Your changes will automatically reflect.

### Database Changes
When you modify the schema:
```bash
cd backend
npm run db:generate
npm run db:migrate
```

### Viewing Database
Use a PostgreSQL client like:
- pgAdmin
- DBeaver
- TablePlus
- Neon's built-in SQL editor

### Backend Logs
The backend logs all requests and errors to the console.

### Frontend Dev Tools
- React Developer Tools
- Redux DevTools (if added)
- Browser console for errors

## Project Structure Navigation

```
Key Files:
- backend/src/index.ts        - Express app entry
- backend/src/routes/         - API endpoints
- frontend/src/App.tsx        - React app entry
- frontend/src/pages/         - Page components
- frontend/src/components/    - Reusable components
```

## Next Steps

1. **Customize Design**: Edit `frontend/src/index.css` for custom styles
2. **Add Features**: Extend the CV form with more fields
3. **Payment Integration**: Implement Stripe for real payments
4. **Deploy**: Follow deployment guides in README.md

## Getting Help

- Check README.md for detailed documentation
- Review IMPLEMENTATION.md for architecture details
- Open an issue on GitHub for bugs
- Check the code comments for implementation details

## Production Build

```bash
# Build both backend and frontend
npm run build

# The output will be in:
# - backend/dist/
# - frontend/dist/
```

## Environment Variables Reference

### Backend Required
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing

### Backend Optional
- `NODE_ENV` - Environment (development/production)
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key

### Frontend Optional
- `VITE_API_URL` - API base URL (empty for local dev)

## Common Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Backend only
cd backend && npm run dev
cd backend && npm run build

# Frontend only
cd frontend && npm run dev
cd frontend && npm run build

# Database migrations
cd backend && npm run db:generate
cd backend && npm run db:migrate
```

Happy coding! 🚀
