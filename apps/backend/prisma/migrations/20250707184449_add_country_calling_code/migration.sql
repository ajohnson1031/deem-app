-- AlterTable
ALTER TABLE "User" ADD COLUMN     "callingCode" TEXT DEFAULT '1',
ADD COLUMN     "countryCode" TEXT DEFAULT 'US';
