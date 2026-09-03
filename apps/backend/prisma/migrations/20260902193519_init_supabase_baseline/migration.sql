-- CreateEnum
CREATE TYPE "StaffType" AS ENUM ('DIRECTOR_TECNICO', 'ADMINISTRATIVO');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "squad" TEXT NOT NULL DEFAULT 'Masculino A';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'GENERAL',
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "staffType" "StaffType" NOT NULL DEFAULT 'ADMINISTRATIVO';

-- CreateIndex
CREATE INDEX "Player_squad_idx" ON "Player"("squad");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_category_idx" ON "Task"("category");
