import { Router } from 'express';
import { db } from '../db/index.js';
import { users, cvs, pricing } from '../db/schema.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

const router = Router();

// Apply authentication and admin check to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET admin dashboard stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    // Get total users
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalUsers = Number(totalUsersResult[0].count);

    // Get total CVs
    const totalCvsResult = await db.select({ count: sql<number>`count(*)` }).from(cvs);
    const totalCvs = Number(totalCvsResult[0].count);

    // Get paid CVs count
    const paidCvsResult = await db.select({ count: sql<number>`count(*)` }).from(cvs).where(sql`is_paid = true`);
    const paidCvs = Number(paidCvsResult[0].count);

    // Get current pricing
    const currentPricing = await db.query.pricing.findFirst({
      orderBy: (pricing, { desc }) => [desc(pricing.createdAt)],
    });

    res.json({
      stats: {
        totalUsers,
        totalCvs,
        freeCvs: totalCvs - paidCvs,
        paidCvs,
      },
      pricing: currentPricing || { additionalCvPrice: 100 }, // default $1.00
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET current pricing
router.get('/pricing', async (req: AuthRequest, res) => {
  try {
    const currentPricing = await db.query.pricing.findFirst({
      orderBy: (pricing, { desc }) => [desc(pricing.createdAt)],
    });

    res.json({
      pricing: currentPricing || { additionalCvPrice: 100 }, // default $1.00
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update pricing
const pricingSchema = z.object({
  additionalCvPrice: z.number().int().min(0).max(100000), // max $1000
});

router.put('/pricing', async (req: AuthRequest, res) => {
  try {
    const { additionalCvPrice } = pricingSchema.parse(req.body);

    // Insert new pricing record
    const [newPricing] = await db
      .insert(pricing)
      .values({
        additionalCvPrice,
      })
      .returning();

    res.json({
      pricing: newPricing,
      message: 'Pricing updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update pricing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
