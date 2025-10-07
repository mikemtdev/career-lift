import dotenv from 'dotenv';

// Configure dotenv FIRST, before any other imports
dotenv.config();

// Debug: Check if DATABASE_URL is loaded
console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import cvRoutes from './routes/cv.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/cv', cvRoutes);
app.use('/payment', paymentRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
