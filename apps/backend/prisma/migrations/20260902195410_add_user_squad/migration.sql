-- AlterTable
ALTER TABLE "User" ADD COLUMN     "squad" TEXT;

-- CreateIndex
CREATE INDEX "User_squad_idx" ON "User"("squad");
