# CareerLift

A modern CV builder application with payment integration, built with React, Node.js, and PostgreSQL.

## Features

- 🎨 Modern, minimalist UI built with React, Vite, and shadcn UI
- 🔐 Secure JWT authentication with bcrypt password hashing
- 💳 Payment system (1 free CV per user, $1 for additional CVs)
- 📄 ATS-friendly PDF generation
- 💾 PostgreSQL database with Drizzle ORM (Neon DB compatible)
- 🔄 SWR for efficient data fetching
- 📱 Fully responsive design
- 🎯 TypeScript throughout

## Project Structure

```
career-lift/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── db/          # Database schema and connection
│   │   ├── middleware/  # Authentication middleware
│   │   └── utils/       # Helper functions
│   └── package.json
├── frontend/            # React + Vite SPA
│   ├── src/
│   │   ├── components/  # React components (including shadcn UI)
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── hocs/        # Higher-order components
│   │   ├── lib/         # Utilities and API client
│   │   └── types/       # TypeScript types
│   └── package.json
└── package.json         # Root workspace config
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Neon DB account)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd career-lift
```

2. Install dependencies:
```bash
npm install
```

3. Setup backend environment:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and configure:
- `DATABASE_URL`: Your PostgreSQL/Neon connection string
- `JWT_SECRET`: A secure random string for JWT signing
- Optional: Stripe keys for payment processing

4. Setup frontend environment:
```bash
cd ../frontend
cp .env.example .env
```

The frontend proxies API calls through Vite, so no API URL is needed for local development.

5. Run database migrations:
```bash
cd ../backend
npm run db:generate
npm run db:migrate
```

### Development

Run both frontend and backend concurrently:
```bash
# From root directory
npm run dev
```

Or run them separately:

Backend (runs on port 3001):
```bash
cd backend
npm run dev
```

Frontend (runs on port 3000):
```bash
cd frontend
npm run dev
```

### Building for Production

```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Login and receive JWT token

### CV Management
- `GET /cv` - Get all CVs for authenticated user
- `POST /cv` - Create a new CV (free for first, $1 for additional)
- `GET /cv/download/:id` - Download CV as PDF

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- JWT authentication with bcrypt
- Drizzle ORM
- PostgreSQL (Neon DB)
- PDFKit (PDF generation)
- Zod (validation)

### Frontend
- React 18
- Vite
- TypeScript
- shadcn UI (Radix UI + Tailwind CSS)
- SWR (data fetching)
- React Router
- Lucide Icons

## Features Details

### CV Builder Form
- Personal Information (name, email, phone, address, summary)
- Education (multiple entries with institution, degree, dates)
- Experience (multiple entries with company, position, dates)
- Skills (tag-based input)

### Payment System
- First CV is free for each user
- Additional CVs cost $1 each
- Ready for Stripe integration (demo mode included)

### PDF Export
- ATS-friendly formatting
- Clean, professional layout
- Includes all CV sections

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License