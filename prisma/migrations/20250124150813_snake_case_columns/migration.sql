/*
  Warnings:

  - You are about to drop the column `providerAccountId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `bases` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `bases` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `bases` table. All the data in the column will be lost.
  - You are about to drop the column `columnId` on the `cells` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `cells` table. All the data in the column will be lost.
  - You are about to drop the column `intValue` on the `cells` table. All the data in the column will be lost.
  - You are about to drop the column `rowId` on the `cells` table. All the data in the column will be lost.
  - You are about to drop the column `textValue` on the `cells` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `cells` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `columns` table. All the data in the column will be lost.
  - You are about to drop the column `tableId` on the `columns` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `columns` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `rows` table. All the data in the column will be lost.
  - You are about to drop the column `tableId` on the `rows` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `rows` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `baseId` on the `tables` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tables` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tables` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `columnFilters` on the `views` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `views` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeen` on the `views` table. All the data in the column will be lost.
  - You are about to drop the column `tableId` on the `views` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `views` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,provider_account_id]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session_token]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider_account_id` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `bases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `bases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `column_id` to the `cells` table without a default value. This is not possible if the table is not empty.
  - Added the required column `row_id` to the `cells` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `cells` table without a default value. This is not possible if the table is not empty.
  - Added the required column `table_id` to the `columns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `columns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `rows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_token` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `column_filters` to the `views` table without a default value. This is not possible if the table is not empty.
  - Added the required column `table_id` to the `views` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `views` table without a default value. This is not possible if the table is not empty.

*/


ALTER TABLE "accounts" RENAME COLUMN "providerAccountId" TO "provider_account_id";
ALTER TABLE "accounts" RENAME COLUMN "userId" TO "user_id";

-- AlterTable
ALTER TABLE "bases" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "bases" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "bases" RENAME COLUMN "userId" TO "user_id";

-- AlterTable
ALTER TABLE "cells" RENAME COLUMN "columnId" TO "column_id";
ALTER TABLE "cells" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "cells" RENAME COLUMN "intValue" TO "int_value";
ALTER TABLE "cells" RENAME COLUMN "rowId" TO "row_id";
ALTER TABLE "cells" RENAME COLUMN "textValue" TO "text_value";
ALTER TABLE "cells" RENAME COLUMN "updatedAt" TO "updated_at";

-- AlterTable
ALTER TABLE "columns" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "columns" RENAME COLUMN "tableId" TO "table_id";
ALTER TABLE "columns" RENAME COLUMN "updatedAt" TO "updated_at";


-- AlterTable
ALTER TABLE "rows" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "rows" RENAME COLUMN "tableId" TO "table_id";
ALTER TABLE "rows" RENAME COLUMN "updatedAt" TO "updated_at";

-- AlterTable
ALTER TABLE "sessions" RENAME COLUMN "sessionToken" TO "session_token";
ALTER TABLE "sessions" RENAME COLUMN "userId" TO "user_id";

-- AlterTable
ALTER TABLE "tables" RENAME COLUMN "baseId" TO "base_id";
ALTER TABLE "tables" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "tables" RENAME COLUMN "updatedAt" TO "updated_at";

-- AlterTable
ALTER TABLE "users" RENAME COLUMN "emailVerified" TO "email_verified";

-- AlterTable
ALTER TABLE "views" RENAME COLUMN "columnFilters" TO "column_filters";
ALTER TABLE "views" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "views" RENAME COLUMN "lastSeen" TO "last_seen";
ALTER TABLE "views" RENAME COLUMN "tableId" TO "table_id";
ALTER TABLE "views" RENAME COLUMN "updatedAt" TO "updated_at";
