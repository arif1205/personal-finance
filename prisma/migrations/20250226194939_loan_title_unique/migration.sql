/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Loan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Loan_title_key" ON "Loan"("title");
