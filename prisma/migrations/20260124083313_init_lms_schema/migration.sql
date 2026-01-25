/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Post";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "profile_image_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    PRIMARY KEY ("user_id", "role_id"),
    CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "departments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hod_user_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "departments_hod_user_id_fkey" FOREIGN KEY ("hod_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "programs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "duration_years" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "instructors" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employee_no" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    CONSTRAINT "instructors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "instructors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "students" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ag_no" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "enrollment_date" DATETIME NOT NULL,
    "program_id" INTEGER NOT NULL,
    CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "students_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academic_terms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "courses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "credit_hours" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "academic_term_id" INTEGER,
    CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "courses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "courses_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "academic_term_id" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "academic_term_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "academic_term_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "academic_term_id_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "course_instructors" (
    "course_id" INTEGER NOT NULL,
    "instructor_user_id" INTEGER NOT NULL,

    PRIMARY KEY ("course_id", "instructor_user_id"),
    CONSTRAINT "course_instructors_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "course_instructors_instructor_user_id_fkey" FOREIGN KEY ("instructor_user_id") REFERENCES "instructors" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "course_contents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtube_url" TEXT,
    "uploaded_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "course_contents_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "course_contents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_user_id" INTEGER NOT NULL,
    "enrolled_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_id" INTEGER NOT NULL,
    "status" TEXT DEFAULT 'enrolled',
    "academic_term_id" INTEGER NOT NULL,
    CONSTRAINT "enrollments_student_user_id_fkey" FOREIGN KEY ("student_user_id") REFERENCES "students" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "enrollments_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "societies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "incharge_user_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "societies_incharge_user_id_fkey" FOREIGN KEY ("incharge_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "society_positions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "society_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "society_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "position_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "society_members_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "societies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "society_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "society_members_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "society_positions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "society_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "society_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" DATETIME NOT NULL,
    "event_time" TEXT NOT NULL,
    "poster_url" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "society_events_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "societies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "society_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "programs_code_key" ON "programs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "instructors_employee_no_key" ON "instructors"("employee_no");

-- CreateIndex
CREATE UNIQUE INDEX "students_ag_no_key" ON "students"("ag_no");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_user_id_course_id_key" ON "enrollments"("student_user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "societies_name_key" ON "societies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "society_positions_name_key" ON "society_positions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "society_members_society_id_user_id_position_id_key" ON "society_members"("society_id", "user_id", "position_id");
