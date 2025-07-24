/*
  Warnings:

  - You are about to drop the `PasswordResetCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PasswordResetCode" DROP CONSTRAINT "PasswordResetCode_userId_fkey";

-- DropTable
DROP TABLE "PasswordResetCode";
