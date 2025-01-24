/*
  Warnings:

  - You are about to drop the `verificationTokens` table. If the table is not empty, all the data it contains will be lost.

*/

-- DropTable
ALTER TABLE "verificationTokens" RENAME TO "verification_tokens";
