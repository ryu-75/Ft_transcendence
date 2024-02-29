/*
  Warnings:

  - You are about to drop the column `score1` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `score2` on the `games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "score1",
DROP COLUMN "score2",
ADD COLUMN     "scoreP1" INTEGER,
ADD COLUMN     "scoreP2" INTEGER;
