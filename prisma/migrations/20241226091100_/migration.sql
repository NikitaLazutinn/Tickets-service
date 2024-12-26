/*
  Warnings:

  - You are about to drop the column `isSold` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "isSold",
ADD COLUMN     "isValidate" BOOLEAN NOT NULL DEFAULT false;
