import { Router } from 'express';
import { db } from '../db/index.js';
import { cvs } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import PDFDocument from 'pdfkit';

const router = Router();

const personalInfoSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string().optional(),
  summary: z.string().optional(),
});

const educationItemSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const experienceItemSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  current: z.boolean().optional(),
});

const cvSchema = z.object({
  title: z.string(),
  personalInfo: personalInfoSchema,
  education: z.array(educationItemSchema),
  experience: z.array(experienceItemSchema),
  skills: z.array(z.string()),
});

// GET all CVs for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userCvs = await db.query.cvs.findMany({
      where: eq(cvs.userId, req.userId!),
    });

    res.json({ cvs: userCvs });
  } catch (error) {
    console.error('Get CVs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single CV by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cvId = req.params.id;
    
    const cv = await db.query.cvs.findFirst({
      where: and(eq(cvs.id, cvId), eq(cvs.userId, req.userId!)),
    });

    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    res.json({ cv });
  } catch (error) {
    console.error('Get CV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new CV
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cvData = cvSchema.parse(req.body);

    // Check how many CVs the user has
    const userCvs = await db.query.cvs.findMany({
      where: eq(cvs.userId, req.userId!),
    });

    // First CV is free, subsequent ones require payment
    const isFreeCV = userCvs.length === 0;
    const requiresPayment = !isFreeCV;

    // PAYMENT GUARD: Enforce payment requirement for additional CVs
    if (requiresPayment && !req.body.paymentConfirmed) {
      return res.status(402).json({
        error: 'Payment required',
        message: 'Additional CVs cost $1. Please confirm payment.',
        requiresPayment: true,
        cvCount: userCvs.length,
      });
    }

    // TODO: In production, integrate with a payment processor (e.g., Stripe)
    // to verify actual payment before allowing CV creation. The paymentConfirmed
    // flag should be replaced with a verified payment transaction ID.
    // Example:
    // if (requiresPayment) {
    //   const paymentVerified = await verifyStripePayment(req.body.paymentIntentId);
    //   if (!paymentVerified) {
    //     return res.status(402).json({ error: 'Payment verification failed' });
    //   }
    // }

    // Create CV
    const [newCv] = await db
      .insert(cvs)
      .values({
        userId: req.userId!,
        title: cvData.title,
        personalInfo: cvData.personalInfo,
        education: cvData.education,
        experience: cvData.experience,
        skills: cvData.skills,
        isPaid: requiresPayment, // Track whether this CV required payment
      })
      .returning();

    res.status(201).json({
      cv: newCv,
      message: isFreeCV ? 'Free CV created successfully' : 'CV created successfully (paid)',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create CV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update existing CV
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cvId = req.params.id;
    const cvData = cvSchema.parse(req.body);

    // Get existing CV to verify ownership
    const existingCv = await db.query.cvs.findFirst({
      where: and(eq(cvs.id, cvId), eq(cvs.userId, req.userId!)),
    });

    if (!existingCv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // SECURITY: Ensure only the owner can update the CV
    // The and() clause above already enforces this, but we double-check
    if (existingCv.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this CV' });
    }

    // Update CV (editing existing CVs is free - no payment required)
    const [updatedCv] = await db
      .update(cvs)
      .set({
        title: cvData.title,
        personalInfo: cvData.personalInfo,
        education: cvData.education,
        experience: cvData.experience,
        skills: cvData.skills,
        updatedAt: new Date(),
      })
      .where(and(eq(cvs.id, cvId), eq(cvs.userId, req.userId!)))
      .returning();

    res.json({
      cv: updatedCv,
      message: 'CV updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update CV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE CV
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cvId = req.params.id;

    // Get existing CV to verify ownership
    const existingCv = await db.query.cvs.findFirst({
      where: and(eq(cvs.id, cvId), eq(cvs.userId, req.userId!)),
    });

    if (!existingCv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // SECURITY: Ensure only the owner can delete the CV
    if (existingCv.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this CV' });
    }

    // Delete CV
    await db
      .delete(cvs)
      .where(and(eq(cvs.id, cvId), eq(cvs.userId, req.userId!)));

    res.json({
      message: 'CV deleted successfully',
    });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET download CV as PDF
router.get('/download/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cvId = req.params.id;

    // Get CV
    const cv = await db.query.cvs.findFirst({
      where: and(eq(cvs.id, cvId), eq(cvs.userId, req.userId!)),
    });

    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cv.title}.pdf"`);

    doc.pipe(res);

    // Title
    doc.fontSize(24).text(cv.title, { align: 'center' });
    doc.moveDown();

    // Personal Info
    const personalInfo = cv.personalInfo as any;
    doc.fontSize(20).text('Personal Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Name: ${personalInfo.fullName}`);
    doc.text(`Email: ${personalInfo.email}`);
    doc.text(`Phone: ${personalInfo.phone}`);
    if (personalInfo.address) {
      doc.text(`Address: ${personalInfo.address}`);
    }
    if (personalInfo.summary) {
      doc.moveDown(0.5);
      doc.text('Summary:', { continued: false });
      doc.text(personalInfo.summary);
    }
    doc.moveDown();

    // Education
    const education = cv.education as any[];
    if (education.length > 0) {
      doc.fontSize(20).text('Education', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      education.forEach((edu) => {
        doc.font('Helvetica-Bold').text(`${edu.degree} in ${edu.field}`);
        doc.font('Helvetica').text(`${edu.institution}`);
        doc.text(`${edu.startDate} - ${edu.endDate || 'Present'}`);
        if (edu.description) {
          doc.text(edu.description);
        }
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Experience
    const experience = cv.experience as any[];
    if (experience.length > 0) {
      doc.fontSize(20).text('Experience', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      experience.forEach((exp) => {
        doc.font('Helvetica-Bold').text(`${exp.position}`);
        doc.font('Helvetica').text(`${exp.company}`);
        doc.text(`${exp.startDate} - ${exp.endDate || 'Present'}`);
        if (exp.description) {
          doc.text(exp.description);
        }
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Skills
    const skills = cv.skills as string[];
    if (skills.length > 0) {
      doc.fontSize(20).text('Skills', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(skills.join(', '));
    }

    doc.end();
  } catch (error) {
    console.error('Download CV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
