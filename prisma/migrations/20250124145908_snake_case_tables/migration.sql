/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Base` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cell` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Column` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Row` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Table` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `View` table. If the table is not empty, all the data it contains will be lost.

*/
ALTER TABLE "Account" RENAME TO "accounts";
ALTER TABLE "Base" RENAME TO "bases";
ALTER TABLE "Cell" RENAME TO "cells";
ALTER TABLE "Column" RENAME TO "columns";
ALTER TABLE "Row" RENAME TO "rows";
ALTER TABLE "Session" RENAME TO "sessions";
ALTER TABLE "Table" RENAME TO "tables";
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "VerificationToken" RENAME TO "verificationTokens";
ALTER TABLE "View" RENAME TO "views";
