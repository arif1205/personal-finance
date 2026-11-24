-- DropIndex
DROP INDEX "Loan_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "Loan_userId_title_key" ON "Loan"("userId", "title");

