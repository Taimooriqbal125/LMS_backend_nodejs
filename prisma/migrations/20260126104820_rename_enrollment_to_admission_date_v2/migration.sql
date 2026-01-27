/*
  Warnings:

  - You are about to drop the column `enrollment_date` on the `students` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_students" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ag_no" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "admission_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "program_id" INTEGER NOT NULL,
    CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "students_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_students" ("ag_no", "department_id", "program_id", "user_id") SELECT "ag_no", "department_id", "program_id", "user_id" FROM "students";
DROP TABLE "students";
ALTER TABLE "new_students" RENAME TO "students";
CREATE UNIQUE INDEX "students_ag_no_key" ON "students"("ag_no");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
