-- AlterTable
ALTER TABLE "accounts" RENAME CONSTRAINT "Account_pkey" TO "accounts_pkey";

-- AlterTable
ALTER TABLE "bases" RENAME CONSTRAINT "Base_pkey" TO "bases_pkey";

-- AlterTable
ALTER TABLE "cells" RENAME CONSTRAINT "Cell_pkey" TO "cells_pkey";

-- AlterTable
ALTER TABLE "columns" RENAME CONSTRAINT "Column_pkey" TO "columns_pkey";

-- AlterTable
ALTER TABLE "rows" RENAME CONSTRAINT "Row_pkey" TO "rows_pkey";

-- AlterTable
ALTER TABLE "sessions" RENAME CONSTRAINT "Session_pkey" TO "sessions_pkey";

-- AlterTable
ALTER TABLE "tables" RENAME CONSTRAINT "Table_pkey" TO "tables_pkey";

-- AlterTable
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

-- AlterTable
ALTER TABLE "views" RENAME CONSTRAINT "View_pkey" TO "views_pkey";

-- RenameForeignKey
ALTER TABLE "accounts" RENAME CONSTRAINT "Account_userId_fkey" TO "accounts_userId_fkey";

-- RenameForeignKey
ALTER TABLE "bases" RENAME CONSTRAINT "Base_userId_fkey" TO "bases_userId_fkey";

-- RenameForeignKey
ALTER TABLE "cells" RENAME CONSTRAINT "Cell_columnId_fkey" TO "cells_columnId_fkey";

-- RenameForeignKey
ALTER TABLE "cells" RENAME CONSTRAINT "Cell_rowId_fkey" TO "cells_rowId_fkey";

-- RenameForeignKey
ALTER TABLE "columns" RENAME CONSTRAINT "Column_tableId_fkey" TO "columns_tableId_fkey";

-- RenameForeignKey
ALTER TABLE "rows" RENAME CONSTRAINT "Row_tableId_fkey" TO "rows_tableId_fkey";

-- RenameForeignKey
ALTER TABLE "sessions" RENAME CONSTRAINT "Session_userId_fkey" TO "sessions_userId_fkey";

-- RenameForeignKey
ALTER TABLE "tables" RENAME CONSTRAINT "Table_baseId_fkey" TO "tables_baseId_fkey";

-- RenameForeignKey
ALTER TABLE "views" RENAME CONSTRAINT "View_tableId_fkey" TO "views_tableId_fkey";

-- RenameIndex
ALTER INDEX "Account_provider_providerAccountId_key" RENAME TO "accounts_provider_providerAccountId_key";

-- RenameIndex
ALTER INDEX "Session_sessionToken_key" RENAME TO "sessions_sessionToken_key";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "users_email_key";

-- RenameIndex
ALTER INDEX "VerificationToken_identifier_token_key" RENAME TO "verification_tokens_identifier_token_key";

-- RenameIndex
ALTER INDEX "VerificationToken_token_key" RENAME TO "verification_tokens_token_key";
