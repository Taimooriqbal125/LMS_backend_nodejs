/*
  Warnings:

  - You are about to drop the `academic_term_id` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "academic_term_id";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "academic_term_mappings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "academic_term_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "academic_term_mappings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "academic_term_mappings_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "profile_image_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp" TEXT,
    "otp_expires" DATETIME,
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "email", "first_name", "id", "last_login_at", "last_name", "password_hash", "profile_image_url", "status", "updated_at") SELECT "created_at", "email", "first_name", "id", "last_login_at", "last_name", "password_hash", "profile_image_url", "status", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
