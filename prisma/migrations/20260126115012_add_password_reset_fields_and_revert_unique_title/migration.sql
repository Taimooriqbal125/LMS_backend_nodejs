-- DropIndex
DROP INDEX "courses_title_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN "password_reset_otp" TEXT;
ALTER TABLE "users" ADD COLUMN "password_reset_otp_expires" DATETIME;
