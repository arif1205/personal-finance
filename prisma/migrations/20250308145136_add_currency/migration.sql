-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('BDT', 'USD', 'PKR', 'INR', 'LKR', 'EUR', 'GBP', 'NOK', 'SEK', 'DKK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'BDT',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
