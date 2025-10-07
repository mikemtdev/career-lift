ALTER TABLE "pricing" DROP CONSTRAINT "pricing_lenco_reference_unique";--> statement-breakpoint
ALTER TABLE "pricing" DROP CONSTRAINT "pricing_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pricing" DROP CONSTRAINT "pricing_cv_id_cvs_id_fk";
--> statement-breakpoint
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "cv_id";--> statement-breakpoint
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "amount";--> statement-breakpoint
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "currency";--> statement-breakpoint
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "payment_method";--> statement-breakpoint
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "lenco_reference";--> statement-breakpoint
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "metadata";