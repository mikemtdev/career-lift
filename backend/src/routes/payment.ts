import { Router } from 'express';
import { db } from '../db/index.js';
import { payments, cvs } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { lencoService } from '../services/lenco.js';
import { z } from 'zod';

const router = Router();

const initiatePaymentSchema = z.object({
  paymentMethod: z.enum(['mobile_money', 'card']),
  phoneNumber: z.string().optional(),
  amount: z.number().min(1),
  currency: z.string().default('USD'),
  cvData: z.object({
    title: z.string(),
    personalInfo: z.any(),
    education: z.any(),
    experience: z.any(),
    skills: z.any(),
  }),
});

// POST initiate payment
router.post('/initiate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const paymentData = initiatePaymentSchema.parse(req.body);
    const userId = req.userId!;

    // Get user info
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate unique payment reference
    const reference = `CV_${Date.now()}_${userId.slice(0, 8)}`;

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        userId,
        amount: paymentData.amount * 100, // Convert to cents
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        lencoReference: reference,
        status: 'pending',
        metadata: paymentData.cvData,
      })
      .returning();

    // Initiate payment with Lenco
    let lencoResponse;
    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-callback`;

    if (paymentData.paymentMethod === 'mobile_money') {
      lencoResponse = await lencoService.initiateMobileMoneyPayment({
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        customerEmail: user.email,
        customerName: user.name || user.email,
        phoneNumber: paymentData.phoneNumber,
        reference,
        callbackUrl,
      });
    } else {
      lencoResponse = await lencoService.initiateCardPayment({
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        customerEmail: user.email,
        customerName: user.name || user.email,
        reference,
        callbackUrl,
      });
    }

    res.status(200).json({
      payment: {
        id: payment.id,
        reference,
        status: payment.status,
      },
      authorization_url: lencoResponse.data.authorization_url,
      access_code: lencoResponse.data.access_code,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Initiate payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to initiate payment' });
  }
});

// POST verify payment
router.post('/verify/:reference', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { reference } = req.params;
    const userId = req.userId!;

    // Get payment record
    const payment = await db.query.payments.findFirst({
      where: (payments, { and, eq }) =>
        and(eq(payments.lencoReference, reference), eq(payments.userId, userId)),
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify with Lenco
    const verification = await lencoService.verifyPayment(reference);

    // Update payment status
    const newStatus = verification.data.status === 'success' ? 'success' : 'failed';
    await db
      .update(payments)
      .set({ status: newStatus })
      .where(eq(payments.id, payment.id));

    // If payment successful, create CV
    if (newStatus === 'success' && payment.metadata) {
      const cvData = payment.metadata as any;
      const [newCv] = await db
        .insert(cvs)
        .values({
          userId,
          title: cvData.title,
          personalInfo: cvData.personalInfo,
          education: cvData.education,
          experience: cvData.experience,
          skills: cvData.skills,
          isPaid: true,
        })
        .returning();

      // Update payment with CV ID
      await db
        .update(payments)
        .set({ cvId: newCv.id })
        .where(eq(payments.id, payment.id));

      return res.status(200).json({
        status: newStatus,
        message: 'Payment successful',
        cv: newCv,
      });
    }

    res.status(200).json({
      status: newStatus,
      message: newStatus === 'success' ? 'Payment successful' : 'Payment failed',
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify payment' });
  }
});

// POST webhook for Lenco callbacks
router.post('/webhook', async (req, res) => {
  try {
    const { reference, status, event } = req.body;

    console.log('Lenco webhook received:', { reference, status, event });

    // Find payment by reference
    const payment = await db.query.payments.findFirst({
      where: (payments, { eq }) => eq(payments.lencoReference, reference),
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status based on webhook
    if (status === 'success' && event === 'charge.success') {
      await db
        .update(payments)
        .set({ status: 'success' })
        .where(eq(payments.id, payment.id));

      // If CV data exists and no CV created yet, create it
      if (payment.metadata && !payment.cvId) {
        const cvData = payment.metadata as any;
        const [newCv] = await db
          .insert(cvs)
          .values({
            userId: payment.userId,
            title: cvData.title,
            personalInfo: cvData.personalInfo,
            education: cvData.education,
            experience: cvData.experience,
            skills: cvData.skills,
            isPaid: true,
          })
          .returning();

        await db
          .update(payments)
          .set({ cvId: newCv.id })
          .where(eq(payments.id, payment.id));
      }
    } else if (status === 'failed' || event === 'charge.failed') {
      await db
        .update(payments)
        .set({ status: 'failed' })
        .where(eq(payments.id, payment.id));
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
