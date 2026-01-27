/*
  Warnings:

  - A unique constraint covering the columns `[society_id,user_id]` on the table `society_members` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "society_members_society_id_user_id_position_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "society_members_society_id_user_id_key" ON "society_members"("society_id", "user_id");
