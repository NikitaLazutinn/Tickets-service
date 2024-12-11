/*
  Warnings:

  - Added the required column `companyId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posterUrl` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `PromoCode` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `PromoCode` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PromoCode" DROP CONSTRAINT "PromoCode_userId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "companyId" INTEGER NOT NULL,
ADD COLUMN     "isVisitorListPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "posterUrl" TEXT NOT NULL,
ADD COLUMN     "publishDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "eventId" INTEGER NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
